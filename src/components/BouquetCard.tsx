import Image from "next/image";
import Link from "next/link";
import type { Bouquet } from "@/lib/types";

const bouquetImages = [
  "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&q=80",
  "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&q=80",
  "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&q=80",
];

interface BouquetCardProps {
  bouquet: Bouquet;
  index?: number;
}

export function BouquetCard({ bouquet, index = 0 }: BouquetCardProps) {
  const imageUrl = bouquetImages[index % bouquetImages.length];

  return (
    <article className="group">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl mb-4 bg-cream-dark">
        <Image
          src={imageUrl}
          alt={bouquet.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {bouquet.featured && (
          <span className="absolute top-4 left-4 px-3 py-1 bg-cream/90 text-xs font-medium uppercase tracking-wider text-warm-brown rounded-full">
            Seasonal favorite
          </span>
        )}
      </div>
      <h3 className="font-display text-2xl text-charcoal mb-2 group-hover:text-terracotta transition-colors">
        {bouquet.title}
      </h3>
      <p className="text-warm-brown/80 text-sm leading-relaxed mb-3">
        {bouquet.description}
      </p>
      {bouquet.price && (
        <p className="text-terracotta font-medium">{bouquet.price}</p>
      )}
    </article>
  );
}

interface BouquetGridProps {
  bouquets: Bouquet[];
  showAll?: boolean;
}

export function BouquetGrid({ bouquets, showAll = false }: BouquetGridProps) {
  const display = showAll ? bouquets : bouquets.filter((b) => b.featured).slice(0, 3);

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-sage text-sm uppercase tracking-[0.2em] mb-3">
              Seasonal offerings
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-charcoal">
              Bouquets for laid-back occasions
            </h2>
          </div>
          {!showAll && (
            <Link
              href="/bouquets"
              className="text-terracotta font-medium hover:text-terracotta-dark transition-colors flex items-center gap-2"
            >
              View all bouquets
              <span aria-hidden="true">&rarr;</span>
            </Link>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-10">
          {display.map((bouquet, i) => (
            <BouquetCard key={bouquet._id} bouquet={bouquet} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
