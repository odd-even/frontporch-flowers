import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Hero } from "@/components/Hero";
import { AboutTeaser, EventsTeaser } from "@/components/AboutTeaser";
import { PaymentOptions } from "@/components/PaymentOptions";
import { FacebookFeed } from "@/components/FacebookFeed";
import { getContactEmail } from "@/lib/email";
import { getHeroPhotos } from "@/lib/photos.server";
import { getSiteSettings } from "@/lib/queries";
import { isSquareConfigured } from "@/lib/square";
import { LOCAL_SEO, SITE_NAME, pageMetadata } from "@/lib/seo";

const FinishRequestPicker = dynamic(
  () =>
    import("@/components/BouquetInquiry").then((mod) => mod.FinishRequestPicker),
  {
    loading: () => (
      <div className="min-h-[320px] animate-pulse rounded-3xl bg-sage/10" aria-hidden="true" />
    ),
  }
);

/** Cache homepage HTML; Facebook posts refresh hourly via fetch revalidate. */
export const revalidate = 3600;

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Cut Flowers & Bouquets in Woodstock, NB",
    description: LOCAL_SEO.description,
    path: "/",
  }),
  title: {
    absolute: `${SITE_NAME} | Cut Flowers & Bouquets in Woodstock, NB`,
  },
  keywords: [
    "cut flowers Woodstock NB",
    "cut flowers Woodstock New Brunswick",
    "flower farm Woodstock NB",
    "local bouquets Woodstock",
    "seasonal flowers New Brunswick",
    "pick your own flowers Woodstock",
    "Front Porch Flowers",
    "Bedell NB flowers",
  ],
};

export default async function HomePage() {
  const settings = await getSiteSettings();
  const heroPhotos = getHeroPhotos();

  const etransferEmail =
    process.env.NEXT_PUBLIC_ETRANSFER_EMAIL || "rhoda@frontporchflowers.ca";
  const phone =
    process.env.NEXT_PUBLIC_CONTACT_PHONE || settings.phone || "+15064253850";

  return (
    <>
      <Hero photos={heroPhotos} />
      <AboutTeaser />
      <section id="bouquets" className="scroll-mt-24 pt-8 pb-10 md:pt-16 md:pb-14">
        <div className="max-w-6xl mx-auto px-6">
          <FinishRequestPicker
            contactEmail={getContactEmail(settings.email)}
            squareReady={isSquareConfigured()}
          />
        </div>
      </section>
      <PaymentOptions etransferEmail={etransferEmail} phone={phone} />
      <EventsTeaser />
      <FacebookFeed pageUrl={settings.facebookPageUrl} />
    </>
  );
}
