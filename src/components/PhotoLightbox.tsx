"use client";

import Image from "next/image";
import { useEffect } from "react";
import type { SitePhoto } from "@/lib/photos.shared";

interface PhotoLightboxProps {
  photos: SitePhoto[];
  activeIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function PhotoLightbox({
  photos,
  activeIndex,
  onClose,
  onNavigate,
}: PhotoLightboxProps) {
  const photo = activeIndex !== null ? photos[activeIndex] : null;

  useEffect(() => {
    if (activeIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && activeIndex > 0) onNavigate(activeIndex - 1);
      if (event.key === "ArrowRight" && activeIndex < photos.length - 1) {
        onNavigate(activeIndex + 1);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, photos.length, onClose, onNavigate]);

  if (!photo || activeIndex === null) return null;

  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < photos.length - 1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/95 p-4 md:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 md:top-6 md:right-6 p-2 text-cream/70 hover:text-cream transition-colors z-10"
        aria-label="Close"
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {hasPrev && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onNavigate(activeIndex - 1);
          }}
          className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 p-3 text-cream/70 hover:text-cream transition-colors z-10"
          aria-label="Previous photo"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {hasNext && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onNavigate(activeIndex + 1);
          }}
          className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 p-3 text-cream/70 hover:text-cream transition-colors z-10"
          aria-label="Next photo"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      <div
        className="relative flex flex-col items-center max-h-full max-w-5xl w-full"
        onClick={(event) => event.stopPropagation()}
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          width={1400}
          height={1800}
          className="max-h-[80vh] w-auto h-auto object-contain"
          sizes="100vw"
          priority
        />
        <p className="text-cream/80 text-sm text-center mt-4 max-w-lg">{photo.alt}</p>
        <p className="text-cream/40 text-xs mt-1">
          {activeIndex + 1} of {photos.length}
        </p>
      </div>
    </div>
  );
}
