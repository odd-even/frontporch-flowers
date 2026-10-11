"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { SitePhoto } from "@/lib/photos.shared";

const ROTATE_MS = 5000;

export function EventImageRotator({ photos }: { photos: SitePhoto[] }) {
  const slides = photos.length > 0 ? photos : [];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [slides.length, index]);

  function showNext() {
    if (slides.length < 2) return;
    setIndex((current) => (current + 1) % slides.length);
  }

  if (slides.length === 0) return null;

  return (
    <div className="absolute inset-0">
      <button
        type="button"
        onClick={showNext}
        disabled={slides.length < 2}
        aria-label={slides.length > 1 ? "Show next photo" : slides[0]?.alt}
        className="absolute inset-0 cursor-pointer disabled:cursor-default"
      >
        {slides.map((photo, i) => (
          <Image
            key={photo.src}
            src={photo.src}
            alt={i === index ? photo.alt : ""}
            fill
            className={`object-cover transition-opacity duration-1000 ease-in-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            sizes="(max-width: 768px) 100vw, 50vw"
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))}
      </button>
      {slides.length > 1 ? (
        <div className="absolute bottom-5 right-5 z-10 flex gap-1.5 md:bottom-6 md:right-6">
          {slides.map((photo, i) => (
            <button
              key={photo.src}
              type="button"
              aria-label={`Show photo ${i + 1}`}
              aria-pressed={i === index}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-5 bg-cream" : "w-1.5 bg-cream/45 hover:bg-cream/70"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
