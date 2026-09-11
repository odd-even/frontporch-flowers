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
  likeCount: number;
  commentCount: number;
  shareCount: number;
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
      const body = await res.text();
      // Permission / token issues are expected until Meta scopes are granted —
      // keep them out of the Next.js error overlay (console.error).
      const permissionDenied =
        res.status === 400 &&
        /OAuthException|#10|permission|access/i.test(body);
      if (permissionDenied) {
        console.warn("Facebook Graph API unavailable:", res.status);
      } else {
        console.error("Facebook Graph API error:", res.status, body);
      }
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

type GraphEngagement = {
  summary?: { total_count?: number };
};

type GraphPost = {
  id: string;
  message?: string;
  story?: string;
  status_type?: string;
  full_picture?: string;
  permalink_url?: string;
  attachments?: { data?: GraphAttachment[] };
  reactions?: GraphEngagement;
  likes?: GraphEngagement;
  comments?: GraphEngagement;
  shares?: { count?: number };
};

function engagementCount(
  value: GraphEngagement | { count?: number } | undefined
): number {
  if (!value) return 0;
  if ("summary" in value && typeof value.summary?.total_count === "number") {
    return value.summary.total_count;
  }
  if ("count" in value && typeof value.count === "number") {
    return value.count;
  }
  return 0;
}

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
        likeCount:
          engagementCount(item.reactions) || engagementCount(item.likes),
        commentCount: engagementCount(item.comments),
        shareCount: engagementCount(item.shares),
      };
    })
    .filter((post): post is FacebookPost => post !== null);
}

function mediaDedupeKey(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url.split("?")[0] || url;
  }
}

/** Drop near-duplicate photo posts (same media, blank caption) when a captioned twin exists. */
function dedupeFacebookPosts(posts: FacebookPost[]): FacebookPost[] {
  const byMedia = new Map<string, FacebookPost>();
  const order: string[] = [];

  for (const post of posts) {
    const mediaKey = mediaDedupeKey(post.mediaUrl || post.id);
    const existing = byMedia.get(mediaKey);
    if (!existing) {
      byMedia.set(mediaKey, post);
      order.push(mediaKey);
      continue;
    }

    const existingHasMessage = Boolean(existing.message?.trim());
    const nextHasMessage = Boolean(post.message?.trim());

    // Prefer the captioned version over a blank duplicate of the same photo.
    if (!existingHasMessage && nextHasMessage) {
      byMedia.set(mediaKey, post);
    }
  }

  return order.map((key) => byMedia.get(key)!);
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

  const pageFields = [
    "id",
    "message",
    "story",
    "status_type",
    "full_picture",
    "permalink_url",
    "created_time",
    "attachments{media{image,source},type,title,subattachments{media{image,source},type}}",
  ];
  // reactions + shares need pages_read_engagement.
  // comments need pages_read_user_content — omit unless the Page token has it.
  const engagementFields = [
    "reactions.limit(0).summary(true)",
    "shares",
  ];
  let includeEngagement = true;

  const fetchLimit = Math.min(Math.max(limit * 2, 12), 50);
  const fetchOptions: GraphFetchOptions = dynamic
    ? { cache: "no-store", revalidate: false }
    : { revalidate: 3600 };

  const collected: FacebookPost[] = [];
  let cursor: string | undefined = after;
  let nextCursor: string | null = null;
  let attempts = 0;
  // Prefer published_posts; fall back to posts if the app lacks that edge.
  let edge: "published_posts" | "posts" = "published_posts";

  while (dedupeFacebookPosts(collected).length < limit && attempts < 6) {
    attempts += 1;
    const afterPart = cursor ? `&after=${encodeURIComponent(cursor)}` : "";
    const fields = (
      includeEngagement ? [...pageFields, ...engagementFields] : pageFields
    ).join(",");

    const data = await graphGet<{
      data?: GraphPost[];
      paging?: {
        cursors?: { after?: string };
        next?: string;
      };
    }>(
      `/${page.pageId}/${edge}?fields=${fields}&limit=${fetchLimit}${afterPart}`,
      page.accessToken,
      fetchOptions
    );

    if (!data) {
      if (includeEngagement) {
        includeEngagement = false;
        continue;
      }
      if (edge === "published_posts" && !cursor && collected.length === 0) {
        edge = "posts";
        includeEngagement = true;
        continue;
      }
      nextCursor = null;
      break;
    }

    if (!data.data?.length) {
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
    posts: dedupeFacebookPosts(collected).slice(0, limit),
    nextCursor,
  };
}

export async function getFacebookPosts(limit = 8): Promise<FacebookPost[]> {
  const page = await getFacebookPostsPage({ limit });
  return page.posts;
}
