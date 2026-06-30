export type PhotoCategory =
  | "bouquets"
  | "gardening"
  | "workshops"
  | "general";

export type GalleryFilter = PhotoCategory | "all";

export interface SitePhoto {
  src: string;
  alt: string;
  category: PhotoCategory;
  subcategory: string;
}

export const GALLERY_FILTERS: { id: GalleryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "bouquets", label: "Bouquets" },
  { id: "gardening", label: "Garden" },
  { id: "workshops", label: "Workshops" },
];
