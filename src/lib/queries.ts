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

const bouquetsQuery = `*[_type == "bouquet"] | order(_createdAt desc) {
  _id, title, description, price, image, available, featured
}`;

const settingsQuery = `*[_type == "siteSettings"][0] {
  tagline, aboutText, instagramHandle, email, phone, location
}`;

export async function getWorkshops(): Promise<Workshop[]> {
  if (!isSanityConfigured) return fallbackWorkshops;
  try {
    const data = await client.fetch<Workshop[]>(workshopsQuery);
    return data?.length ? data : fallbackWorkshops;
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
    return data?.length ? data : fallbackBouquets;
  } catch {
    return fallbackBouquets;
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!isSanityConfigured) return fallbackSettings;
  try {
    const data = await client.fetch<SiteSettings>(settingsQuery);
    return data || fallbackSettings;
  } catch {
    return fallbackSettings;
  }
}
