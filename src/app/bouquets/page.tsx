import { BouquetGrid } from "@/components/BouquetCard";
import { PageHeader } from "@/components/AboutTeaser";
import { getBouquets, getSiteSettings } from "@/lib/queries";
import { buildMailtoUrl, getContactEmail } from "@/lib/email";

export const metadata = {
  title: "Bouquets | Front Porch Flowers",
  description:
    "Wild and whimsical bouquets grown in Rhoda's backyard. Local grasses, seed heads, and seasonal blooms for laid-back occasions.",
};

export default async function BouquetsPage() {
  const [bouquets, settings] = await Promise.all([getBouquets(), getSiteSettings()]);
  const contactEmail = getContactEmail(settings.email);
  const orderMailto = buildMailtoUrl(
    contactEmail,
    "Bouquet order inquiry",
    "Hi Rhoda!\n\nI'd love to order a bouquet. Here are a few details:\n\nOccasion:\nColor (Soft / Bright / Surprise me):\nPickup date:\n\nThanks!"
  );

  return (
    <>
      <PageHeader
        title="Bouquets"
        description="Each bouquet is a one-of-a-kind gathering of backyard blooms — loose, whimsical, and woven with local grasses and whatever wild things are calling that day. Perfect for laid-back celebrations, kitchen tables, and gifting."
      />
      <BouquetGrid bouquets={bouquets} showAll contactEmail={contactEmail} />

      <section className="py-16 bg-cream-dark/30">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-display text-2xl text-charcoal mb-4">
            Ready to order?
          </h2>
          <p className="text-warm-brown/80 mb-6">
            Email Rhoda with your occasion, Soft or Bright preference, and pickup date.
            She&apos;ll arrange whatever&apos;s blooming for you.
          </p>
          <a
            href={orderMailto}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-terracotta text-cream rounded-full font-medium hover:bg-terracotta-dark transition-colors"
          >
            Order by email
            <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </section>
    </>
  );
}
