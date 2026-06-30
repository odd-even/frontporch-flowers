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
}

export interface Bouquet {
  _id: string;
  title: string;
  description: string;
  price?: string;
  image?: { asset: { _ref: string } };
  available?: boolean;
  featured?: boolean;
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

export const fallbackWorkshops: Workshop[] = [
  {
    _id: "hydrangea-wreath",
    title: "Hydrangea Wreath Workshop",
    slug: { current: "hydrangea-wreath-workshop" },
    description:
      "Gather with friends and learn to craft a lush, seasonal hydrangea wreath using blooms from the garden. All materials included — just bring your creativity and a willingness to get your hands a little dirty.",
    date: "2026-09-22",
    time: "10:00 AM – 12:30 PM",
    price: "$65",
    spotsAvailable: 8,
    featured: true,
  },
  {
    _id: "wild-bouquet",
    title: "Wild Bouquet Arranging",
    slug: { current: "wild-bouquet-arranging" },
    description:
      "Discover the art of loose, garden-gathered arrangements. We'll forage from the backyard and weave in local grasses, seed heads, and whatever wild things catch our eye.",
    date: "2026-08-09",
    time: "2:00 PM – 4:00 PM",
    price: "$55",
    spotsAvailable: 10,
    featured: false,
  },
  {
    _id: "christmas-wreath",
    title: "Christmas Wreath Workshop",
    slug: { current: "christmas-wreath-workshop" },
    description:
      "Get into the holiday spirit and craft a lush evergreen wreath for your front door. We'll work with fresh greens, pinecones, dried oranges, ribbon, and other festive touches — all materials included. Perfect for gifting or keeping.",
    date: "2026-12-05",
    time: "10:00 AM – 1:00 PM",
    price: "$75",
    spotsAvailable: 12,
    featured: true,
  },
];

export const fallbackEvents: PickYourOwnEvent[] = [
  {
    _id: "pyo-summer-1",
    title: "Summer Pick-Your-Own",
    date: "2026-07-12",
    startTime: "9:00 AM",
    endTime: "12:00 PM",
    description:
      "Wander the garden rows and fill a bucket with whatever speaks to you — zinnias, cosmos, dahlias, and more.",
    spotsAvailable: 15,
  },
  {
    _id: "pyo-summer-2",
    title: "Late Summer Harvest",
    date: "2026-08-23",
    startTime: "9:00 AM",
    endTime: "12:00 PM",
    description:
      "The garden is at its peak. Come clip your own stems and take home a bundle of backyard beauty.",
    spotsAvailable: 15,
  },
];

export const fallbackBouquets: Bouquet[] = [
  {
    _id: "front-porch-classic",
    title: "Front Porch Classic",
    description:
      "Rhoda's signature mix — seasonal flowers with a touch of the unexpected. Perfect for laid-back celebrations.",
    price: "From $55",
    available: true,
    featured: true,
  },
  {
    _id: "garden-posy",
    title: "Garden Posy",
    description:
      "A sweet, hand-tied bundle of whatever's blooming. Ideal for gifting or brightening your kitchen table.",
    price: "From $35",
    available: true,
    featured: false,
  },
  {
    _id: "porch-swing",
    title: "Porch Swing",
    description:
      "A relaxed, airy mix meant for slow afternoons — soft pastels, trailing greenery, and whatever caught Rhoda's eye on the way in from the garden.",
    price: "From $50",
    available: true,
    featured: true,
  },
  {
    _id: "late-summer-glow",
    title: "Late Summer Glow",
    description:
      "Dahlias, zinnias, and golden tones in a generous gathering. Bold, warm, and a little bit wild — like the garden at its peak.",
    price: "From $60",
    available: true,
    featured: true,
  },
  {
    _id: "meadow-jar",
    title: "Meadow Jar",
    description:
      "A casual mason-jar bundle of backyard blooms and wispy grasses. Unfussy, charming, and perfect for a windowsill or bedside table.",
    price: "From $40",
    available: true,
    featured: false,
  },
];

export const fallbackSettings: SiteSettings = {
  tagline: "Wild & whimsical bouquets, grown with love in the backyard.",
  aboutText:
    "Hi, I'm Rhoda. I grow flowers in my own backyard and turn them into bouquets that feel like you wandered through a meadow and gathered whatever caught your eye. I love incorporating local grasses, seed heads, and other wild things — nothing too fussy, just beautiful blooms for laid-back occasions.",
  instagramHandle: "front_porchflowers",
  facebookPageUrl: "https://www.facebook.com/FrontPorchFlowers",
  email: "hello@frontporchflowers.ca",
  location: "Local pickup available",
};
