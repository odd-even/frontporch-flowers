"use client";

import Image from "next/image";
import { useState } from "react";
import type { SitePhoto } from "@/lib/photos.shared";
import { PhotoLightbox } from "./PhotoLightbox";

interface PhotoGalleryProps {
  photos: SitePhoto[];
  layout?: "masonry" | "square";
  gridClassName?: string;
}

export function PhotoGallery({
  photos,
  layout = "masonry",
  gridClassName: gridClassNameProp,
}: PhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (photos.length === 0) return null;

  const gridClassName =
    gridClassNameProp ??
    (layout === "square"
      ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
      : "columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3");

  const itemClassName =
    layout === "square"
      ? "relative aspect-square rounded-xl overflow-hidden group"
      : "break-inside-avoid relative rounded-xl overflow-hidden group";

  return (
    <>
      <div className={gridClassName}>
        {photos.map((photo, index) => (
          <button
            key={photo.src}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`${itemClassName} cursor-zoom-in w-full text-left`}
            aria-label={`View ${photo.alt}`}
          >
            {layout === "square" ? (
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            ) : (
              <Image
                src={photo.src}
                alt={photo.alt}
                width={600}
                height={800}
                className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            )}
          </button>
        ))}
      </div>

      <PhotoLightbox
        photos={photos}
        activeIndex={activeIndex}
        onClose={() => setActiveIndex(null)}
        onNavigate={setActiveIndex}
      />
    </>
  );
}
