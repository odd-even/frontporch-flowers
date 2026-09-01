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

/** Full-resolution source for the Meet Rhoda opening card. */
export const MEET_RHODA_PHOTO_SRC =
  "/photos/rhoda/615545458_122118878721020895_4898530068187201591_n.jpg";

/** Square crop for the sticky request button avatar. */
export const BUTTON_RHODA_PHOTO_SRC = "/photos/rhoda/button-portrait.png";
