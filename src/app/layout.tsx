import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const laborUnion = localFont({
  src: "../fonts/LaborUnion-Regular.woff",
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
  metadataBase: new URL("https://www.frontporchflowers.ca"),
  title: "Front Porch Flowers | Wild & Whimsical Bouquets",
  description:
    "Locally grown, backyard blooms by Rhoda. Wild and whimsical bouquets, pick-your-own flower days, and seasonal workshops in a laid-back garden setting.",
  openGraph: {
    title: "Front Porch Flowers",
    description:
      "Wild & whimsical bouquets grown with love in Rhoda's backyard.",
    type: "website",
    url: "https://www.frontporchflowers.ca",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${laborUnion.variable} ${alwaysInMyHeart.variable} ${poppins.variable}`}
    >
      <body className="min-h-screen flex flex-col grain">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
