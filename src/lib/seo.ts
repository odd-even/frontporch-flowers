export const SITE_URL = "https://www.frontporchflowers.ca";
export const SITE_NAME = "Front Porch Flowers";

export const LOCAL_SEO = {
  city: "Woodstock",
  region: "New Brunswick",
  regionCode: "NB",
  country: "CA",
  countryName: "Canada",
  phone: "+15064253850",
  email: "hello@frontporchflowers.ca",
  description:
    "Locally grown cut flowers and wild whimsical bouquets in Woodstock, NB. Backyard blooms by Rhoda for local pickup, plus seasonal workshops and pick-your-own garden days.",
  shortDescription:
    "Cut flowers and seasonal bouquets grown in Woodstock, New Brunswick — local pickup available.",
} as const;

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Local florist / cut-flower business schema for Google. */
export function getLocalBusinessJsonLd(options?: {
  facebookUrl?: string;
  instagramHandle?: string;
  email?: string;
  phone?: string;
}) {
  const email = options?.email || LOCAL_SEO.email;
  const phone = options?.phone || LOCAL_SEO.phone;
  const instagramHandle = options?.instagramHandle || "front_porchflowers";
  const facebookUrl =
    options?.facebookUrl ||
    "https://www.facebook.com/people/Front-Porch-Flowers/61580626863252/";

  return {
    "@context": "https://schema.org",
    "@type": ["Florist", "LocalBusiness"],
    "@id": `${SITE_URL}/#business`,
    name: SITE_NAME,
    description: LOCAL_SEO.description,
    url: SITE_URL,
    image: absoluteUrl("/logo.svg"),
    telephone: phone,
    email,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      addressLocality: LOCAL_SEO.city,
      addressRegion: LOCAL_SEO.regionCode,
      addressCountry: LOCAL_SEO.country,
    },
    areaServed: [
      {
        "@type": "City",
        name: "Woodstock",
        containedInPlace: {
          "@type": "AdministrativeArea",
          name: "New Brunswick",
        },
      },
      {
        "@type": "AdministrativeArea",
        name: "Carleton County",
      },
    ],
    geo: {
      "@type": "GeoCoordinates",
      latitude: 46.1522,
      longitude: -67.5983,
    },
    sameAs: [
      facebookUrl,
      `https://www.instagram.com/${instagramHandle}`,
    ],
    knowsAbout: [
      "cut flowers",
      "seasonal bouquets",
      "locally grown flowers",
      "pick your own flowers",
      "flower workshops",
      "Woodstock NB",
    ],
  };
}
