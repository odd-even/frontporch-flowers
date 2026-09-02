"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { SitePhoto } from "@/lib/photos.shared";

const ROTATE_MS = 4000;
const FADE_MS = 1200;

interface HeroProps {
  tagline?: string;
  photos: SitePhoto[];
}

export function Hero({ tagline, photos }: HeroProps) {
  const slides = photos.length > 0 ? photos : [];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [slides.length]);

  function goToSlide(next: number) {
    setIndex(next);
  }

  function heroImageClass(src: string) {
    if (src.includes("hero-evi")) {
      return "object-cover object-[62%_32%] md:object-center";
    }
    return "object-cover object-[center_32%] md:object-center";
  }

  return (
    <>
      <section
        data-header-zone="hero"
        className="relative flex h-[100dvh] max-h-[100dvh] items-end overflow-hidden md:h-svh md:max-h-none"
      >
        <div className="absolute inset-0">
          {slides.map((photo, i) => (
            <div
              key={photo.src}
              className={`absolute inset-0 transition-opacity ease-in-out ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
              style={{ transitionDuration: `${FADE_MS}ms` }}
              aria-hidden={i !== index}
            >
              <Image
                src={photo.src}
                alt={i === index ? photo.alt : ""}
                fill
                priority={i === 0}
                loading={i === 0 ? undefined : "lazy"}
                quality={90}
                className={heroImageClass(photo.src)}
                sizes="100vw"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-charcoal/15" />
          <div className="absolute inset-0 bg-brand-gradient opacity-15 mix-blend-soft-light" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/92 via-charcoal/45 via-terracotta/8 to-dusty-rose/12" />
        </div>

        <div className="relative w-full px-6 md:px-8 lg:px-10 pb-12 md:pb-16 pt-24">
          <div className="max-w-2xl flex flex-col items-start">
            <p className="hero-copy-in mb-6 rounded-full bg-cream/15 backdrop-blur-sm border border-cream/20 px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-cream/90">
              Woodstock, NB
            </p>
            <h1 className="hero-copy-in hero-copy-in-delay-1 font-display text-5xl md:text-7xl text-cream leading-[1.1] mb-6">
              <span className="block">Wild &amp; whimsical</span>
              <span className="font-accent text-6xl md:text-8xl text-sage-light block -ml-[0.24em]">
                bouquets
              </span>
            </h1>
            <p className="hero-copy-in hero-copy-in-delay-2 font-body text-lg md:text-xl text-cream/85 leading-relaxed mb-8 max-w-xl md:max-w-2xl text-balance">
              I grow flowers in my backyard and make seasonal bouquets for local pickup.
            </p>
            {tagline ? (
              <p className="hero-copy-in hero-copy-in-delay-3 text-cream/75 text-base md:text-lg leading-relaxed mb-8 max-w-lg">
                {tagline}
              </p>
            ) : null}
            <div className="hero-copy-in hero-copy-in-delay-4 flex flex-wrap items-center gap-3">
              <Link
                href="#bouquets"
                className="btn bg-terracotta text-cream hover:bg-terracotta-dark"
              >
                Order a bouquet
              </Link>
              <Link
                href="#events"
                className="btn border border-cream/35 bg-transparent text-cream hover:border-cream/55"
              >
                Workshops
              </Link>
            </div>
          </div>
        </div>

        {slides.length > 1 ? (
          <div className="absolute bottom-8 right-6 z-10 flex gap-1.5 md:bottom-10 md:right-8 lg:right-10">
            {slides.map((photo, i) => (
              <button
                key={photo.src}
                type="button"
                aria-label={`Show banner photo ${i + 1}`}
                aria-pressed={i === index}
                onClick={() => goToSlide(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index
                    ? "w-5 bg-cream"
                    : "w-1.5 bg-cream/45 hover:bg-cream/75"
                }`}
              />
            ))}
          </div>
        ) : null}
      </section>
    </>
  );
}
