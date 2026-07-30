import { client, isSanityConfigured } from "./sanity";
import {
  fallbackBouquets,
  fallbackEvents,
  fallbackSettings,
  type Bouquet,
  type PickYourOwnEvent,
  type SiteSettings,
  type Workshop,
} from "./types";

const eventsQuery = `*[_type == "pickYourOwnEvent"] | order(date asc) {
  _id, title, date, startTime, endTime, description, spotsAvailable
}`;

const bouquetsQuery = `*[_type == "bouquet" && _id != "wild-meadow"] | order(_createdAt desc) {
  _id, title, description, price, image, available, featured, tags
}`;

const settingsQuery = `*[_type == "siteSettings"][0] {
  tagline, aboutText, instagramHandle, facebookPageUrl, email, phone, location
}`;

export async function getWorkshops(): Promise<Workshop[]> {
  // Workshop dates are announced on social for now — don't list CMS dates.
  return [];
}

export async function getPickYourOwnEvents(): Promise<PickYourOwnEvent[]> {
  const today = new Date().toISOString().slice(0, 10);

  function upcomingOnly(events: PickYourOwnEvent[]) {
    return events
      .filter((event) => event.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  if (!isSanityConfigured) return upcomingOnly(fallbackEvents);
  try {
    const data = await client.fetch<PickYourOwnEvent[]>(eventsQuery);
    return upcomingOnly(data?.length ? data : fallbackEvents);
  } catch {
    return upcomingOnly(fallbackEvents);
  }
}

export async function getBouquets(): Promise<Bouquet[]> {
  if (!isSanityConfigured) return fallbackBouquets;
  try {
    const data = await client.fetch<Bouquet[]>(bouquetsQuery);
    if (!data?.length) return fallbackBouquets;

    const fallbackById = new Map(fallbackBouquets.map((bouquet) => [bouquet._id, bouquet]));

    const merged = data.map((bouquet) => {
      const fallback = fallbackById.get(bouquet._id);
      return fallback ? { ...bouquet, ...fallback } : bouquet;
    });

    const sanityIds = new Set(merged.map((bouquet) => bouquet._id));
    return [...merged, ...fallbackBouquets.filter((bouquet) => !sanityIds.has(bouquet._id))];
  } catch {
    return fallbackBouquets;
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!isSanityConfigured) return fallbackSettings;
  try {
    const data = await client.fetch<SiteSettings>(settingsQuery);
    return { ...fallbackSettings, ...data };
  } catch {
    return fallbackSettings;
  }
}
