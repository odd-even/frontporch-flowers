export const DEFAULT_FACEBOOK_PAGE_URL =
  "https://www.facebook.com/people/Front-Porch-Flowers/61580626863252/";

const GRAPH_API = "https://graph.facebook.com/v21.0";
const DEFAULT_PAGE_NAME_HINT = "front porch flowers";

export interface FacebookPost {
  id: string;
  message?: string;
  /** First / cover image — kept for simple rendering. */
  mediaUrl: string;
  /** All photos on the post (cover first). */
  mediaUrls: string[];
  permalink: string;
}

export interface FacebookPostsPage {
  posts: FacebookPost[];
  nextCursor: string | null;
}

export function getFacebookPageUrl(override?: string): string {
  return (
    override ||
    process.env.NEXT_PUBLIC_FACEBOOK_PAGE_URL ||
    DEFAULT_FACEBOOK_PAGE_URL
  );
}

export function isFacebookFeedConfigured() {
  return Boolean(process.env.FACEBOOK_PAGE_ACCESS_TOKEN);
}

type GraphFetchOptions = {
  cache?: RequestCache;
  revalidate?: number | false;
};

async function graphGet<T>(
  path: string,
  token: string,
  options: GraphFetchOptions = {}
): Promise<T | null> {
  try {
    const separator = path.includes("?") ? "&" : "?";
    const init: RequestInit & { next?: { revalidate?: number } } = {};

    if (options.cache) init.cache = options.cache;
    if (options.revalidate !== false) {
      init.next = { revalidate: options.revalidate ?? 3600 };
    }

    const res = await fetch(
      `${GRAPH_API}${path}${separator}access_token=${token}`,
      init
    );

    if (!res.ok) {
      console.error("Facebook Graph API error:", res.status, await res.text());
      return null;
    }

    return (await res.json()) as T;
  } catch (error) {
    console.error("Facebook Graph API request failed:", error);
    return null;
  }
}

async function resolvePageAccess(
  token: string
): Promise<{ pageId: string; accessToken: string } | null> {
  if (process.env.FACEBOOK_PAGE_ID) {
    return { pageId: process.env.FACEBOOK_PAGE_ID, accessToken: token };
  }

  const me = await graphGet<{ id?: string; name?: string }>(
    "/me?fields=id,name",
    token
  );
  if (me?.id && me.name) {
    return { pageId: me.id, accessToken: token };
  }

  const accounts = await graphGet<{
    data?: Array<{ id: string; name?: string; access_token: string }>;
  }>("/me/accounts?fields=id,name,access_token&limit=100", token);

  const pages = accounts?.data || [];
  if (!pages.length) return null;

  const match =
    pages.find((page) =>
      page.name?.toLowerCase().includes(DEFAULT_PAGE_NAME_HINT)
    ) || pages[0];

  return {
    pageId: match.id,
    accessToken: match.access_token || token,
  };
}

type GraphAttachment = {
  media?: { image?: { src?: string } };
  type?: string;
  title?: string;
  subattachments?: {
    data?: Array<{
      media?: { image?: { src?: string } };
      type?: string;
    }>;
  };
};

type GraphPost = {
  id: string;
  message?: string;
  story?: string;
  status_type?: string;
  full_picture?: string;
  permalink_url?: string;
  attachments?: { data?: GraphAttachment[] };
};

const SKIPPED_ATTACHMENT_TYPES = new Set([
  "profile_media",
  "cover_photo",
]);

function isSkippedSystemPost(item: GraphPost): boolean {
  const attachmentType = item.attachments?.data?.[0]?.type;
  if (attachmentType && SKIPPED_ATTACHMENT_TYPES.has(attachmentType)) {
    return true;
  }

  const story = item.story?.toLowerCase() || "";
  return (
    story.includes("updated their profile picture") ||
    story.includes("updated their cover photo")
  );
}

function collectMediaUrls(item: GraphPost): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();

  const add = (url?: string) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    urls.push(url);
  };

  for (const attachment of item.attachments?.data || []) {
    const children = attachment.subattachments?.data || [];
    if (children.length) {
      for (const child of children) {
        add(child.media?.image?.src);
      }
    } else {
      add(attachment.media?.image?.src);
    }
  }

  add(item.full_picture);
  return urls;
}

function mapPosts(items: GraphPost[]): FacebookPost[] {
  return items
    .map((item): FacebookPost | null => {
      if (!item.permalink_url) return null;
      if (isSkippedSystemPost(item)) return null;
      const mediaUrls = collectMediaUrls(item);
      if (!mediaUrls.length) return null;

      return {
        id: item.id,
        message: item.message,
        mediaUrl: mediaUrls[0],
        mediaUrls,
        permalink: item.permalink_url,
      };
    })
    .filter((post): post is FacebookPost => post !== null);
}

export async function getFacebookPostsPage({
  limit = 8,
  after,
  dynamic = false,
}: {
  limit?: number;
  after?: string;
  dynamic?: boolean;
} = {}): Promise<FacebookPostsPage> {
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!token) return { posts: [], nextCursor: null };

  const page = await resolvePageAccess(token);
  if (!page) return { posts: [], nextCursor: null };

  const fields = [
    "id",
    "message",
    "story",
    "status_type",
    "full_picture",
    "permalink_url",
    "created_time",
    "attachments{media,type,title,subattachments{media,type}}",
  ].join(",");

  const fetchLimit = Math.min(Math.max(limit * 2, 12), 50);
  const fetchOptions: GraphFetchOptions = dynamic
    ? { cache: "no-store", revalidate: false }
    : { revalidate: 3600 };

  const collected: FacebookPost[] = [];
  let cursor: string | undefined = after;
  let nextCursor: string | null = null;
  let attempts = 0;

  while (collected.length < limit && attempts < 4) {
    attempts += 1;
    const afterPart = cursor ? `&after=${encodeURIComponent(cursor)}` : "";

    const data = await graphGet<{
      data?: GraphPost[];
      paging?: {
        cursors?: { after?: string };
        next?: string;
      };
    }>(
      `/${page.pageId}/published_posts?fields=${fields}&limit=${fetchLimit}${afterPart}`,
      page.accessToken,
      fetchOptions
    );

    if (!data?.data?.length) {
      nextCursor = null;
      break;
    }

    collected.push(...mapPosts(data.data));
    const afterCursor = data.paging?.cursors?.after || null;
    nextCursor = data.paging?.next ? afterCursor : null;
    if (!nextCursor) break;
    cursor = afterCursor || undefined;
  }

  return {
    posts: collected,
    nextCursor,
  };
}

export async function getFacebookPosts(limit = 8): Promise<FacebookPost[]> {
  const page = await getFacebookPostsPage({ limit });
  return page.posts;
}
