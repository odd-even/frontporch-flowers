import { PageHeader } from "@/components/AboutTeaser";
import { PhotoGallery } from "@/components/PhotoGallery";
import { getSiteSettings } from "@/lib/queries";
import { getWorkshopPhotos } from "@/lib/photos.server";
import { getFacebookPageUrl } from "@/lib/facebook";

export const metadata = {
  title: "Workshops | Front Porch Flowers",
  description:
    "Seasonal workshops in the garden — check Facebook and Instagram for announcements, dates, and how to reserve a spot.",
};

export default async function WorkshopsPage() {
  const settings = await getSiteSettings();
  const workshopPhotos = getWorkshopPhotos();
  const facebookUrl = getFacebookPageUrl(settings.facebookPageUrl);
  const instagramHandle = settings.instagramHandle || "front_porchflowers";
  const instagramUrl = `https://www.instagram.com/${instagramHandle}`;

  return (
    <>
      <PageHeader
        eyebrow="Gather & create"
        title="Workshops"
        description="Occasional hands-on workshops in the garden — wreath making, bouquet arranging, and similar days when the garden has enough to share. All materials included."
      />

      <section className="pb-20 md:pb-28">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="bg-cream rounded-2xl px-8 py-10 border border-sage/15">
            <p className="text-sm text-sage-dark uppercase tracking-wider mb-2">Stay tuned</p>
            <h2 className="font-display text-2xl md:text-3xl text-charcoal mb-3">
              Check for announcements on social
            </h2>
            <p className="text-warm-brown/70 text-sm mb-6 leading-relaxed">
              Workshop dates are shared on Facebook and Instagram when they&apos;re ready —
              including details and how to reserve a spot.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-sage text-cream rounded-full font-medium hover:bg-sage-dark transition-colors"
              >
                Facebook
                <span aria-hidden="true">&rarr;</span>
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3.5 border border-sage/30 text-sage-dark rounded-full font-medium hover:border-sage hover:bg-sage/5 transition-colors"
              >
                Instagram
                <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {workshopPhotos.length > 0 && (
        <section className="py-16 md:py-24 bg-cream-dark/30">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-sage text-sm uppercase tracking-[0.2em] mb-3 text-center">
              Past workshops
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-charcoal text-center mb-10">
              Wreaths, stems &amp;{" "}
              <span className="font-accent text-terracotta">good company</span>
            </h2>
            <PhotoGallery photos={workshopPhotos} layout="square" />
          </div>
        </section>
      )}
    </>
  );
}
