import { GalleryGrid } from "@/components/GalleryGrid";
import { PageHeader } from "@/components/AboutTeaser";
import { getAllPhotos } from "@/lib/photos.server";

export const metadata = {
  title: "Gallery | Front Porch Flowers",
  description:
    "Photos from Rhoda's backyard — wild bouquets, garden blooms, wreath workshops, and pick-your-own days.",
};

export default function GalleryPage() {
  const photos = getAllPhotos();

  return (
    <>
      <PageHeader
        eyebrow="From the garden"
        title="Gallery"
        description="A peek at what's blooming — backyard bouquets, garden days, wreath workshops, and the wild whimsical magic Rhoda creates."
      />

      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <GalleryGrid photos={photos} />
        </div>
      </section>
    </>
  );
}
