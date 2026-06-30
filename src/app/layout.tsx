import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const body = Jost({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Front Porch Flowers | Wild & Whimsical Bouquets",
  description:
    "Locally grown, backyard blooms by Rhoda. Wild and whimsical bouquets, pick-your-own flower days, and seasonal workshops in a laid-back garden setting.",
  openGraph: {
    title: "Front Porch Flowers",
    description:
      "Wild & whimsical bouquets grown with love in Rhoda's backyard.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen flex flex-col grain">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
