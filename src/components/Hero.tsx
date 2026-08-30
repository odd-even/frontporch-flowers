import Image from "next/image";
import Link from "next/link";
import { getHeroPhoto } from "@/lib/photos.server";

interface HeroProps {
  tagline?: string;
}

export function Hero({ tagline }: HeroProps) {
  const photo = getHeroPhoto();

  return (
    <>
      <section className="relative h-svh min-h-svh flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            priority
            className="object-cover object-[center_88%]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-charcoal/15" />
          <div className="absolute inset-0 bg-brand-gradient opacity-15 mix-blend-soft-light" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/92 via-charcoal/45 via-terracotta/8 to-dusty-rose/12" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pb-12 md:pb-16 pt-24 w-full">
          <div className="max-w-2xl">
            <ul className="flex flex-wrap gap-2 mb-6">
              <li className="rounded-full bg-cream/15 backdrop-blur-sm border border-cream/20 px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-cream/90">
                Cut flowers
              </li>
              <li className="rounded-full bg-cream/15 backdrop-blur-sm border border-cream/20 px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-cream/90">
                Bedell, NB
              </li>
            </ul>
            <h1 className="font-display text-5xl md:text-7xl text-cream leading-[1.1] mb-6">
              Wild &amp; whimsical
              <br />
              <span className="font-accent text-6xl md:text-8xl text-sage-light">bouquets</span>
            </h1>
            <p className="font-body text-lg md:text-xl text-cream/85 leading-relaxed mb-8 max-w-xl md:max-w-2xl text-balance">
              I grow flowers in my backyard and make seasonal bouquets for local pickup.
            </p>
            {tagline ? (
              <p className="text-cream/75 text-base md:text-lg leading-relaxed mb-8 max-w-lg">
                {tagline}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-4">
              <Link
                href="#bouquets"
                className="btn bg-terracotta text-cream hover:bg-terracotta-dark"
              >
                Order a bouquet
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 right-8 animate-bounce hidden md:block">
          <svg className="w-6 h-6 text-cream/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>
    </>
  );
}
