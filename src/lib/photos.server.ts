import "server-only";

import fs from "fs";
import path from "path";
import type { PhotoCategory, SitePhoto } from "./photos.shared";

const FOLDER_CATEGORY: Record<string, PhotoCategory> = {
  boquets: "bouquets",
  bouquets: "bouquets",
  gardening: "gardening",
  rhoda: "gardening",
  "hydrangia workshop": "workshops",
  "wreath workshop": "workshops",
  "bouquet workshop": "workshops",
};

const ALT_BY_CATEGORY: Record<PhotoCategory, string> = {
  bouquets: "Wild whimsical bouquet by Front Porch Flowers",
  gardening: "Backyard garden flowers at Front Porch Flowers",
  workshops: "Flower workshop at Front Porch Flowers",
  general: "Front Porch Flowers",
};

const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;

function encodeSrc(relativePath: string): string {
  return `/photos/${relativePath.split("/").map(encodeURIComponent).join("/")}`;
}

function altForPhoto(relativePath: string, category: PhotoCategory): string {
  const folder = relativePath.includes("/")
    ? relativePath.split("/")[0]
    : "general";

  if (folder === "hydrangia workshop") {
    return "Hydrangea wreath workshop at Front Porch Flowers";
  }
  if (folder === "wreath workshop") {
    return "Wreath making workshop at Front Porch Flowers";
  }
  if (folder === "bouquet workshop") {
    return "Pick and arrange bouquet workshop at Front Porch Flowers";
  }
  if (folder === "rhoda") {
    return "Rhoda of Front Porch Flowers";
  }

  return ALT_BY_CATEGORY[category];
}

export function getAllPhotos(): SitePhoto[] {
  const photosDir = path.join(process.cwd(), "public/photos");
  if (!fs.existsSync(photosDir)) return [];

  const photos: SitePhoto[] = [];

  function walk(dir: string, relativeBase = "") {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;

      const relativePath = relativeBase
        ? `${relativeBase}/${entry.name}`
        : entry.name;

      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), relativePath);
        continue;
      }

      if (!IMAGE_EXT.test(entry.name)) continue;

      const topFolder = relativeBase.split("/")[0] || "";
      const category = topFolder
        ? FOLDER_CATEGORY[topFolder] || "general"
        : "general";

      photos.push({
        src: encodeSrc(relativePath),
        alt: altForPhoto(relativePath, category),
        category,
        subcategory: topFolder || "general",
      });
    }
  }

  walk(photosDir);
  return photos;
}

export function getPhotosByCategory(category: PhotoCategory): SitePhoto[] {
  return getAllPhotos().filter((photo) => photo.category === category);
}

function bouquetPhotoKey(src: string): string {
  return src.replace(/-1(?=\.[^.]+$)/, "");
}

export function getDistinctBouquetPhotoSrcs(count: number): string[] {
  const photos = getPhotosByCategory("bouquets");
  const seen = new Set<string>();
  const result: string[] = [];

  for (const photo of photos) {
    const key = bouquetPhotoKey(photo.src);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(photo.src);
    if (result.length >= count) break;
  }

  return result;
}

export function getPhotoAt(index: number, category?: PhotoCategory): SitePhoto | undefined {
  const pool = category ? getPhotosByCategory(category) : getAllPhotos();
  return pool[index % pool.length];
}

const HERO_PHOTO_SRC = "/photos/cdec773ead7de4f1fdb9fcd798bdd9f8.png";

const PICK_YOUR_OWN_PHOTO_SRC = "/photos/gardening/pick-your-own-cover.jpg";

export function getHeroPhoto(): SitePhoto {
  return (
    getAllPhotos().find((photo) => photo.src === HERO_PHOTO_SRC) || {
      src: HERO_PHOTO_SRC,
      alt: "Wild whimsical bouquet by Front Porch Flowers",
      category: "general",
      subcategory: "general",
    }
  );
}

export function getAboutPhoto(): SitePhoto {
  return (
    getAllPhotos().find((photo) => photo.subcategory === "rhoda") ||
    getPhotosByCategory("gardening")[0] ||
    getPhotoAt(0, "bouquets") ||
    getHeroPhoto()
  );
}

export function getGardenPhoto(): SitePhoto {
  return getPickYourOwnPhoto();
}

export function getPickYourOwnPhoto(): SitePhoto {
  return (
    getAllPhotos().find((photo) => photo.src === PICK_YOUR_OWN_PHOTO_SRC) || {
      src: PICK_YOUR_OWN_PHOTO_SRC,
      alt: "Front Porch Flowers greenhouse and garden in Bedell, NB",
      category: "gardening",
      subcategory: "gardening",
    }
  );
}

export function getWorkshopPhotos(): SitePhoto[] {
  return getPhotosByCategory("workshops");
}

/** Cover + gallery images for the pick-and-arrange bouquet workshop. */
export function getBouquetWorkshopPhotos(): SitePhoto[] {
  return getAllPhotos()
    .filter((photo) => photo.subcategory === "bouquet workshop")
    .sort((a, b) => a.src.localeCompare(b.src));
}

export function getBouquetWorkshopCoverPhoto(): SitePhoto {
  const photos = getBouquetWorkshopPhotos();
  // Prefer the finished vase bouquet as the booking card image
  return (
    photos.find((photo) => photo.src.includes("pick-arrange-1")) ||
    photos[0] ||
    getWorkshopPhotos()[0] ||
    getPickYourOwnPhoto()
  );
}

const INSTAGRAM_ALT_OVERRIDES: Record<string, string> = {
  "/photos/gardening/617960987_122119491603020895_7089043428993150415_n.jpg":
    "Flower seed packets from Olive Seed Company",
  "/photos/706d1a0e22bfb79deb54ddb65fb3f1a4.jpg":
    "Pick-your-own wildflowers in the garden at golden hour",
  "/photos/gardening/718069099_122135379939020895_121722973230796880_n.jpg":
    "Spring garden with broadfork and dandelions",
  "/photos/gardening/684852749_122131780233020895_5762345005324446283_n.jpg":
    "Backyard greenhouse and garden beds at Front Porch Flowers",
  "/photos/gardening/673645159_122131060815020895_5817184588399628538_n.jpg":
    "Seedlings growing in the greenhouse",
  "/photos/gardening/696354920_122132748945020895_5052887044029817087_n.jpg":
    "Young flower seedlings in soil blocks",
  "/photos/gardening/732721084_122137234551020895_5494363713345305957_n.jpg":
    "Honeysuckle blooming on the garden fence",
  "/photos/gardening/734489041_122137234587020895_2543050983266317020_n.jpg":
    "Porch swing tucked among climbing roses",
  "/photos/615466887_122118881559020895_1273262402101944493_n.jpg":
    "Zinnia rows at pick-your-own in the backyard",
};

const INSTAGRAM_FALLBACK_SRCS = [
  "/photos/gardening/617960987_122119491603020895_7089043428993150415_n.jpg",
  "/photos/boquets/547207860_122098033839020895_4924931008274506536_n.jpg",
  "/photos/boquets/548154012_122101069941020895_2761395231491983731_n.jpg",
  "/photos/boquets/549078612_122101069995020895_4047899295859030774_n.jpg",
  "/photos/boquets/557720738_122105077833020895_5943984972730222869_n.jpg",
  "/photos/boquets/729276999_122136899331020895_216954514993060721_n.jpg",
  "/photos/boquets/702847144_122133645861020895_5340008118688049413_n.jpg",
  "/photos/boquets/549421638_122101069953020895_7634103673468493029_n.jpg",
  "/photos/706d1a0e22bfb79deb54ddb65fb3f1a4.jpg",
  "/photos/615466887_122118881559020895_1273262402101944493_n.jpg",
  "/photos/gardening/684852749_122131780233020895_5762345005324446283_n.jpg",
  "/photos/wreath workshop/590752628_122113192107020895_7718133177270323166_n.jpg",
];

export function getInstagramFallbackPhotos(): SitePhoto[] {
  const bySrc = new Map(getAllPhotos().map((photo) => [photo.src, photo]));

  return INSTAGRAM_FALLBACK_SRCS.map((src) => {
    const photo = bySrc.get(src);
    const alt = INSTAGRAM_ALT_OVERRIDES[src] || photo?.alt || "Front Porch Flowers";

    return (
      photo ? { ...photo, alt } : {
        src,
        alt,
        category: "gardening" as const,
        subcategory: "gardening",
      }
    );
  });
}
