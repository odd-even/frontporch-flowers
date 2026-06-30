import Image from "next/image";
import Link from "next/link";

interface HeroProps {
  tagline?: string;
}

export function Hero({ tagline }: HeroProps) {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1920&q=80"
          alt="Wild garden flowers in soft morning light"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/70 via-charcoal/40 to-transparent" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-24 w-full">
        <div className="max-w-2xl">
          <p className="text-sage-light text-sm uppercase tracking-[0.3em] mb-6 font-medium">
            Backyard grown &middot; Locally loved
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-semibold text-cream leading-[1.1] mb-6">
            Wild &amp; whimsical
            <br />
            <span className="italic font-normal">bouquets</span>
          </h1>
          <p className="text-cream/85 text-lg md:text-xl leading-relaxed mb-10 max-w-lg">
            {tagline ||
              "Rhoda grows flowers in her own backyard and crafts laid-back bouquets with local grasses and whatever wild things catch her eye."}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/bouquets"
              className="px-8 py-3.5 bg-terracotta text-cream rounded-full font-medium hover:bg-terracotta-dark transition-colors"
            >
              Shop Bouquets
            </Link>
            <Link
              href="/workshops"
              className="px-8 py-3.5 border border-cream/40 text-cream rounded-full font-medium hover:bg-cream/10 transition-colors"
            >
              Upcoming Workshops
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
        <svg className="w-6 h-6 text-cream/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
