export interface InstagramPost {
  id: string;
  caption?: string;
  mediaUrl: string;
  permalink: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
}

const GRAPH_API = "https://graph.instagram.com";

export function getInstagramProfileUrl(handle = "front_porchflowers") {
  return `https://www.instagram.com/${handle.replace(/^@/, "")}`;
}

export function isInstagramConfigured() {
  return Boolean(
    process.env.INSTAGRAM_ACCESS_TOKEN && process.env.INSTAGRAM_USER_ID
  );
}

export async function getInstagramPosts(limit = 8): Promise<InstagramPost[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;

  if (!token || !userId) return [];

  const fields = [
    "id",
    "caption",
    "media_type",
    "media_url",
    "thumbnail_url",
    "permalink",
    "timestamp",
  ].join(",");

  const url = `${GRAPH_API}/${userId}/media?fields=${fields}&limit=${limit}&access_token=${token}`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
      console.error("Instagram API error:", res.status, await res.text());
      return [];
    }

    const data = (await res.json()) as {
      data?: Array<{
        id: string;
        caption?: string;
        media_type: InstagramPost["mediaType"];
        media_url?: string;
        thumbnail_url?: string;
        permalink: string;
      }>;
    };

    if (!data.data?.length) return [];

    return data.data
      .map((item): InstagramPost | null => {
        const mediaUrl =
          item.media_type === "VIDEO"
            ? item.thumbnail_url
            : item.media_url;

        if (!mediaUrl) return null;

        return {
          id: item.id,
          caption: item.caption,
          mediaUrl,
          permalink: item.permalink,
          mediaType: item.media_type,
        };
      })
      .filter((post): post is InstagramPost => post !== null);
  } catch (error) {
    console.error("Failed to fetch Instagram feed:", error);
    return [];
  }
}
