import { BouquetGrid } from "@/components/BouquetCard";
import { PageHeader } from "@/components/AboutTeaser";
import { getBouquets } from "@/lib/queries";

export const metadata = {
  title: "Bouquets | Front Porch Flowers",
  description:
    "Wild and whimsical bouquets grown in Rhoda's backyard. Local grasses, seed heads, and seasonal blooms for laid-back occasions.",
};

export default async function BouquetsPage() {
  const bouquets = await getBouquets();

  return (
    <>
      <PageHeader
        eyebrow="Seasonal offerings"
        title="Bouquets"
        description="Each bouquet is a one-of-a-kind gathering of backyard blooms — loose, whimsical, and woven with local grasses and whatever wild things are calling that day. Perfect for laid-back celebrations, kitchen tables, and gifting."
      />
      <BouquetGrid bouquets={bouquets} showAll />

      <section className="py-16 bg-cream-dark/30">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-display text-2xl font-semibold text-charcoal mb-4">
            Ready to order?
          </h2>
          <p className="text-warm-brown/80 mb-6">
            Send Rhoda a message on Instagram with your occasion, preferred colors, and
            pickup date. She&apos;ll craft something beautiful just for you.
          </p>
          <a
            href="https://www.instagram.com/front_porchflowers"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-terracotta text-cream rounded-full font-medium hover:bg-terracotta-dark transition-colors"
          >
            Order via Instagram
            <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </section>
    </>
  );
}
