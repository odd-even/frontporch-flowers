export interface Workshop {
  _id: string;
  title: string;
  slug: { current: string };
  description: string;
  date: string;
  time?: string;
  price?: string;
  spotsAvailable?: number;
  image?: { asset: { _ref: string } };
  featured?: boolean;
}

export interface PickYourOwnEvent {
  _id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
  spotsAvailable?: number;
  /** Price per person in the smallest currency unit (e.g. cents). */
  priceCents?: number;
  /** Display currency for Square checkout (CAD for NB). */
  currency?: "CAD" | "USD";
  /** Optional override: fixed Square payment link (no quantity). */
  squarePaymentLinkUrl?: string;
}

export interface Bouquet {
  _id: string;
  title: string;
  description: string;
  price?: string;
  image?: { asset: { _ref: string } };
  available?: boolean;
  featured?: boolean;
  tags?: string[];
}

export interface SiteSettings {
  tagline?: string;
  aboutText?: string;
  instagramHandle?: string;
  facebookPageUrl?: string;
  email?: string;
  phone?: string;
  location?: string;
}

export const fallbackWorkshops: Workshop[] = [];

export const fallbackEvents: PickYourOwnEvent[] = [
  {
    _id: "pyo-sept-12-2026",
    title: "Stem & Style",
    date: "2026-09-12",
    startTime: "4:00 PM",
    endTime: "6:00 PM",
    description:
      "I'm hosting an in-person gathering in the garden on September 12. Come join me to pick and arrange your own beautiful bouquet in the backyard while sipping homemade floral lemonade. I can't wait to see you there! Limited spots are available.",
    spotsAvailable: 8,
    priceCents: 6500,
    currency: "CAD",
    squarePaymentLinkUrl: "https://square.link/u/CrXwEatf",
  },
];

export const fallbackBouquets: Bouquet[] = [
  {
    _id: "for-your-event",
    title: "For Your Event",
    description:
      "Tell me what you need for your specific occasion — photo shoots, celebrations, and more. Share a few details and Rhoda will create a bouquet that fits.",
    price: "From $57",
    available: true,
    featured: false,
  },
  {
    _id: "front-porch-classic",
    title: "Front Porch Classic",
    description:
      "Rhoda's signature mix — seasonal flowers with a touch of the unexpected. Perfect for laid-back celebrations.",
    price: "From $57",
    available: true,
    featured: true,
  },
  {
    _id: "garden-posy",
    title: "Garden Posy",
    description:
      "A sweet, hand-tied bundle of whatever's blooming. Ideal for gifting or brightening your kitchen table.",
    price: "From $36",
    available: true,
    featured: false,
  },
  {
    _id: "porch-swing",
    title: "Anniversary Bouquet",
    description:
      "A romantic Soft mix for anniversaries — seasonal blooms arranged in a vase ready to gift.",
    price: "From $52",
    available: true,
    featured: true,
    tags: ["Includes vase"],
  },
  {
    _id: "late-summer-glow",
    title: "Late Summer Glow",
    description:
      "A generous Bright gathering from peak-season blooms — bold, a little wild, and cut from whatever's at its best in the garden.",
    price: "From $62",
    available: true,
    featured: true,
  },
  {
    _id: "meadow-jar",
    title: "Meadow Jar",
    description:
      "A casual mason-jar bundle of backyard blooms and wispy grasses. Unfussy, charming, and perfect for a windowsill or bedside table.",
    price: "From $41",
    available: true,
    featured: false,
  },
];

export const fallbackSettings: SiteSettings = {
  tagline: "",
  aboutText:
    "Each bouquet is cut from what's blooming that week. I also host pick-your-own days and seasonal workshops when the garden has enough to share.",
  instagramHandle: "front_porchflowers",
  facebookPageUrl: "https://www.facebook.com/people/Front-Porch-Flowers/61580626863252/",
  email: "hello@frontporchflowers.ca",
  phone: "+15064253850",
  location: "Woodstock, New Brunswick — local pickup",
};
