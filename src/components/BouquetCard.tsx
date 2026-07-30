import Image from "next/image";
import { BouquetInquiry, FinishRequestPicker } from "@/components/BouquetInquiry";
import type { Bouquet } from "@/lib/types";
import { getDistinctBouquetPhotoSrcs, getPhotosByCategory } from "@/lib/photos.server";
import { getContactEmail } from "@/lib/email";

interface BouquetCardProps {
  bouquet: Bouquet;
  imageSrc: string;
  contactEmail?: string;
}

export function BouquetCard({ bouquet, imageSrc, contactEmail }: BouquetCardProps) {
  return (
    <article className="group">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl mb-4 bg-cream-dark">
        <Image
          src={imageSrc}
          alt={bouquet.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {(bouquet.featured || (bouquet.tags && bouquet.tags.length > 0)) && (
          <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2">
            {bouquet.featured && (
              <span className="px-3 py-1 bg-cream/90 text-xs font-medium uppercase tracking-wider text-warm-brown rounded-full">
                Flowers in season
              </span>
            )}
            {bouquet.tags?.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-sage text-cream text-xs font-medium uppercase tracking-wider rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <h3 className="font-display text-2xl text-charcoal mb-2 group-hover:text-terracotta transition-colors">
        {bouquet.title}
      </h3>
      <p className="text-warm-brown/80 text-sm leading-relaxed mb-3">
        {bouquet.description}
      </p>
      {bouquet.price && (
        <p className="text-terracotta font-medium mb-1">{bouquet.price}</p>
      )}
      <BouquetInquiry
        bouquetId={bouquet._id}
        bouquetTitle={bouquet.title}
        bouquetPrice={bouquet.price}
        contactEmail={contactEmail}
      />
    </article>
  );
}

interface BouquetGridProps {
  bouquets: Bouquet[];
  showAll?: boolean;
  contactEmail?: string;
}

export function BouquetGrid({ bouquets, showAll = false, contactEmail }: BouquetGridProps) {
  const seasonal = bouquets.filter((b) => b._id !== "for-your-event");
  const display = showAll
    ? seasonal
    : seasonal.filter((b) => b.featured).slice(0, 3);
  const bouquetPhotos = getPhotosByCategory("bouquets");
  const distinctPhotoSrcs = getDistinctBouquetPhotoSrcs(display.length);
  const fallbackSrc =
    distinctPhotoSrcs[0] ||
    bouquetPhotos[0]?.src ||
    "/photos/615466887_122118881559020895_1273262402101944493_n.jpg";
  const resolvedContactEmail = getContactEmail(contactEmail);

  return (
    <section id="bouquets" className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="font-display text-4xl md:text-5xl text-charcoal">
              Bouquets for laid-back occasions
            </h2>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-10">
          {display.map((bouquet, i) => (
            <BouquetCard
              key={bouquet._id}
              bouquet={bouquet}
              imageSrc={distinctPhotoSrcs[i] || fallbackSrc}
              contactEmail={resolvedContactEmail}
            />
          ))}
        </div>

        {!showAll && <FinishRequestPicker contactEmail={resolvedContactEmail} />}
      </div>
    </section>
  );
}
