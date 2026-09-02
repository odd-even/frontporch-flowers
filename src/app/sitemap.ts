import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const PUBLIC_PAGES = [
  { path: "", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/bouquets", changeFrequency: "weekly" as const, priority: 0.9 },
  { path: "/events", changeFrequency: "weekly" as const, priority: 0.85 },
  { path: "/gallery", changeFrequency: "monthly" as const, priority: 0.75 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_PAGES.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
