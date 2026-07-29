export const DEFAULT_FACEBOOK_PAGE_URL =
  "https://www.facebook.com/people/Front-Porch-Flowers/61580626863252/";

const GRAPH_API = "https://graph.facebook.com/v21.0";
const DEFAULT_PAGE_NAME_HINT = "front porch flowers";

export type FacebookMediaItem = {
  type: "image" | "video";
  /** Image URL, or MP4 source for videos. */
  url: string;
  /** Poster frame for videos. */
  poster?: string;
};

export interface FacebookPost {
  id: string;
  message?: string;
  /** First / cover image (or video poster) — kept for simple rendering. */
  mediaUrl: string;
  /** All media preview URLs (images / video posters). */
  mediaUrls: string[];
  /** Ordered images and videos for the post. */
  media: FacebookMediaItem[];
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
  media?: {
    image?: { src?: string };
    source?: string;
  };
  type?: string;
  title?: string;
  url?: string;
  target?: { id?: string; url?: string };
  subattachments?: {
    data?: Array<{
      media?: {
        image?: { src?: string };
        source?: string;
      };
      type?: string;
      url?: string;
      target?: { id?: string; url?: string };
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

const VIDEO_ATTACHMENT_TYPES = new Set([
  "video",
  "video_inline",
  "video_autoplay",
  "video_direct_response",
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

function isVideoAttachmentType(type?: string): boolean {
  if (!type) return false;
  return VIDEO_ATTACHMENT_TYPES.has(type) || type.includes("video");
}

function collectMedia(item: GraphPost): FacebookMediaItem[] {
  const items: FacebookMediaItem[] = [];
  const seen = new Set<string>();

  const add = (opts: {
    type?: string;
    image?: string;
    source?: string;
  }) => {
    const isVideo = Boolean(opts.source) || isVideoAttachmentType(opts.type);

    if (isVideo && opts.source) {
      if (seen.has(opts.source)) return;
      seen.add(opts.source);
      if (opts.image) seen.add(opts.image);
      items.push({
        type: "video",
        url: opts.source,
        poster: opts.image,
      });
      return;
    }

    if (opts.image) {
      if (seen.has(opts.image)) return;
      seen.add(opts.image);
      items.push({ type: "image", url: opts.image });
    }
  };

  for (const attachment of item.attachments?.data || []) {
    const children = attachment.subattachments?.data || [];
    if (children.length) {
      for (const child of children) {
        add({
          type: child.type,
          image: child.media?.image?.src,
          source: child.media?.source,
        });
      }
    } else {
      add({
        type: attachment.type,
        image: attachment.media?.image?.src,
        source: attachment.media?.source,
      });
    }
  }

  if (!items.length && item.full_picture) {
    add({ image: item.full_picture });
  }

  return items;
}

function mapPosts(items: GraphPost[]): FacebookPost[] {
  return items
    .map((item): FacebookPost | null => {
      if (!item.permalink_url) return null;
      if (isSkippedSystemPost(item)) return null;
      const media = collectMedia(item);
      if (!media.length) return null;

      const mediaUrls = media.map((entry) =>
        entry.type === "video" ? entry.poster || entry.url : entry.url
      );

      return {
        id: item.id,
        message: item.message,
        mediaUrl: mediaUrls[0],
        mediaUrls,
        media,
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
    "attachments{media{image,source},type,title,subattachments{media{image,source},type}}",
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
