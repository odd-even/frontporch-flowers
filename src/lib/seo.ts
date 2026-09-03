export const SITE_URL = "https://www.frontporchflowers.ca";
export const SITE_NAME = "Front Porch Flowers";
export const DEFAULT_OG_IMAGE = "/photos/boquets/hero-evi4.webp";

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
    "Locally grown cut flowers and bouquets serving Woodstock, New Brunswick.",
} as const;

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

type PageMetadataInput = {
  title: string;
  description: string;
  path: `/${string}`;
};

/** Shared metadata for indexable pages — canonical URL, Open Graph, and Twitter. */
export function pageMetadata({ title, description, path }: PageMetadataInput) {
  const url = absoluteUrl(path);
  const ogImage = absoluteUrl(DEFAULT_OG_IMAGE);

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: `${title} | ${SITE_NAME} Woodstock NB`,
      description,
      type: "website" as const,
      locale: "en_CA",
      url,
      siteName: SITE_NAME,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `Wild whimsical cut flower bouquets by ${SITE_NAME} in Woodstock, NB`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${title} | ${SITE_NAME} Woodstock NB`,
      description,
      images: [ogImage],
    },
  };
}

export function getWebSiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: LOCAL_SEO.shortDescription,
    inLanguage: "en-CA",
    publisher: { "@id": `${SITE_URL}/#business` },
  };
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
    "@type": ["Florist", "LocalBusiness"],
    "@id": `${SITE_URL}/#business`,
    name: SITE_NAME,
    description: LOCAL_SEO.description,
    url: SITE_URL,
    image: [
      absoluteUrl(DEFAULT_OG_IMAGE),
      absoluteUrl("/logo.svg"),
    ],
    telephone: phone,
    email,
    priceRange: "$$",
    founder: {
      "@type": "Person",
      name: "Rhoda",
    },
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
        "@type": "Place",
        name: "Bedell",
        containedInPlace: {
          "@type": "City",
          name: "Woodstock",
        },
      },
      {
        "@type": "AdministrativeArea",
        name: "Carleton County",
      },
    ],
    geo: {
      "@type": "GeoCoordinates",
      latitude: 46.1528,
      longitude: -67.5986,
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
      "Bedell NB",
    ],
    makesOffer: {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Cut flower bouquets",
        areaServed: "Woodstock, New Brunswick",
      },
    },
  };
}

export function getSiteJsonLd(options?: Parameters<typeof getLocalBusinessJsonLd>[0]) {
  return {
    "@context": "https://schema.org",
    "@graph": [getWebSiteJsonLd(), getLocalBusinessJsonLd(options)],
  };
}
