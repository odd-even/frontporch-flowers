import { BouquetGrid } from "@/components/BouquetCard";
import { PageHeader } from "@/components/AboutTeaser";
import { getBouquets, getSiteSettings } from "@/lib/queries";
import { getContactEmail } from "@/lib/email";
import { isSquareConfigured } from "@/lib/square";

import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Bouquets & Cut Flowers",
  description:
    "Order locally grown cut flowers and wild whimsical bouquets in Woodstock, NB. Seasonal backyard blooms for local pickup from Front Porch Flowers.",
  path: "/bouquets",
});

export default async function BouquetsPage() {
  const [bouquets, settings] = await Promise.all([getBouquets(), getSiteSettings()]);
  const contactEmail = getContactEmail(settings.email);

  return (
    <>
      <PageHeader
        title="Bouquets"
        description="Each bouquet is a one-of-a-kind gathering of backyard blooms grown in Woodstock, NB — loose, whimsical, and woven with local grasses and whatever wild things are calling that day. Perfect for laid-back celebrations, kitchen tables, and gifting."
      />
      <BouquetGrid
        bouquets={bouquets}
        showAll
        contactEmail={contactEmail}
        squareReady={isSquareConfigured()}
      />

      <section className="py-16 bg-cream-dark/30">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-display text-2xl text-charcoal mb-4">
            Closed for the season
          </h2>
          <p className="text-warm-brown/80">
            Everyday bouquets are closed until next spring. Wedding and event requests for next
            year are still open on the home page.
          </p>
        </div>
      </section>
    </>
  );
}
