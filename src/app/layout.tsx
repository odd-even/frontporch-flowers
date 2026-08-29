import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  LOCAL_SEO,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  getLocalBusinessJsonLd,
} from "@/lib/seo";

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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Cut Flowers & Bouquets in Bedell, NB`,
    template: `%s | ${SITE_NAME} Bedell NB`,
  },
  description: LOCAL_SEO.description,
  keywords: [
    "cut flowers Bedell NB",
    "cut flowers Bedell New Brunswick",
    "flower farm Bedell NB",
    "local bouquets Bedell",
    "seasonal flowers New Brunswick",
    "pick your own flowers Bedell",
    "Front Porch Flowers",
  ],
  authors: [{ name: "Rhoda", url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${SITE_NAME} | Cut Flowers in Bedell, NB`,
    description: LOCAL_SEO.shortDescription,
    type: "website",
    locale: "en_CA",
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: absoluteUrl("/photos/cdec773ead7de4f1fdb9fcd798bdd9f8.png"),
        width: 1200,
        height: 630,
        alt: "Wild whimsical cut flower bouquets by Front Porch Flowers in Bedell, NB",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Cut Flowers in Bedell, NB`,
    description: LOCAL_SEO.shortDescription,
    images: [absoluteUrl("/photos/cdec773ead7de4f1fdb9fcd798bdd9f8.png")],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = getLocalBusinessJsonLd();

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
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
