import { client, isSanityConfigured } from "./sanity";
import {
  fallbackBouquets,
  fallbackEvents,
  fallbackSettings,
  fallbackWorkshops,
  type Bouquet,
  type PickYourOwnEvent,
  type SiteSettings,
  type Workshop,
} from "./types";

const workshopsQuery = `*[_type == "workshop"] | order(date asc) {
  _id, title, slug, description, date, time, price, spotsAvailable, image, featured
}`;

const eventsQuery = `*[_type == "pickYourOwnEvent"] | order(date asc) {
  _id, title, date, startTime, endTime, description, spotsAvailable
}`;

const bouquetsQuery = `*[_type == "bouquet" && _id != "wild-meadow"] | order(_createdAt desc) {
  _id, title, description, price, image, available, featured
}`;

const settingsQuery = `*[_type == "siteSettings"][0] {
  tagline, aboutText, instagramHandle, facebookPageUrl, email, phone, location
}`;

export async function getWorkshops(): Promise<Workshop[]> {
  if (!isSanityConfigured) return fallbackWorkshops;
  try {
    const data = await client.fetch<Workshop[]>(workshopsQuery);
    if (!data?.length) return fallbackWorkshops;

    const fallbackById = new Map(fallbackWorkshops.map((workshop) => [workshop._id, workshop]));

    const merged = data.map((workshop) => {
      const fallback = fallbackById.get(workshop._id);
      return fallback ? { ...workshop, ...fallback } : workshop;
    });

    const sanityIds = new Set(merged.map((workshop) => workshop._id));
    return [...merged, ...fallbackWorkshops.filter((workshop) => !sanityIds.has(workshop._id))].sort(
      (a, b) => a.date.localeCompare(b.date)
    );
  } catch {
    return fallbackWorkshops;
  }
}

export async function getPickYourOwnEvents(): Promise<PickYourOwnEvent[]> {
  if (!isSanityConfigured) return fallbackEvents;
  try {
    const data = await client.fetch<PickYourOwnEvent[]>(eventsQuery);
    return data?.length ? data : fallbackEvents;
  } catch {
    return fallbackEvents;
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
