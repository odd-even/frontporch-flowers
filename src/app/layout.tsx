import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BouquetRequestStickyLoader } from "@/components/BouquetRequestStickyLoader";
import { WorkshopBanner } from "@/components/WorkshopBanner";
import {
  LOCAL_SEO,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  getSiteJsonLd,
} from "@/lib/seo";
import { getContactEmail } from "@/lib/email";
import { getFacebookPageUrl } from "@/lib/facebook";
import { getSiteSettings } from "@/lib/queries";

const laborUnion = localFont({
  src: "../fonts/LaborUnion-Small.otf",
  variable: "--font-labor-union",
  display: "swap",
});

const alwaysInMyHeart = localFont({
  src: "../fonts/AlwaysInMyHeart.woff",
  variable: "--font-script",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600"],
});

export const viewport = {
  viewportFit: "cover" as const,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Cut Flowers & Bouquets in Woodstock, NB`,
    template: `%s | ${SITE_NAME} Woodstock NB`,
  },
  description: LOCAL_SEO.description,
  keywords: [
    "cut flowers Woodstock NB",
    "cut flowers Woodstock New Brunswick",
    "flower farm Woodstock NB",
    "local bouquets Woodstock",
    "seasonal flowers New Brunswick",
    "pick your own flowers Woodstock",
    "Front Porch Flowers",
  ],
  authors: [{ name: "Rhoda", url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
  openGraph: {
    title: `${SITE_NAME} | Cut Flowers in Woodstock, NB`,
    description: LOCAL_SEO.shortDescription,
    type: "website",
    locale: "en_CA",
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: absoluteUrl("/photos/boquets/hero-evi5.webp"),
        width: 1200,
        height: 630,
        alt: "Wild whimsical cut flower bouquets by Front Porch Flowers in Woodstock, NB",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Cut Flowers in Woodstock, NB`,
    description: LOCAL_SEO.shortDescription,
    images: [absoluteUrl("/photos/boquets/hero-evi5.webp")],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();
  const jsonLd = getSiteJsonLd({
    email: getContactEmail(settings.email),
    phone: settings.phone || LOCAL_SEO.phone,
    facebookUrl: getFacebookPageUrl(settings.facebookPageUrl),
    instagramHandle: settings.instagramHandle || "front_porchflowers",
  });

  return (
    <html
      lang="en-CA"
      className={`${laborUnion.variable} ${alwaysInMyHeart.variable} ${poppins.variable}`}
    >
      <body className="min-h-screen flex flex-col grain">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <WorkshopBanner />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <BouquetRequestStickyLoader />
      </body>
    </html>
  );
}
