"use client";

import { useState } from "react";
import type { GalleryFilter, SitePhoto } from "@/lib/photos.shared";
import { GALLERY_FILTERS } from "@/lib/photos.shared";
import { PhotoGallery } from "./PhotoGallery";

interface GalleryGridProps {
  photos: SitePhoto[];
}

export function GalleryGrid({ photos }: GalleryGridProps) {
  const [filter, setFilter] = useState<GalleryFilter>("all");

  const filtered =
    filter === "all" ? photos : photos.filter((photo) => photo.category === filter);

  return (
    <>
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {GALLERY_FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`btn px-4 py-1.5 transition-colors ${
              filter === item.id
                ? "bg-sage text-cream"
                : "bg-cream-dark text-warm-brown hover:bg-sage/20"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <PhotoGallery key={filter} photos={filtered} layout="masonry" />
    </>
  );
}
