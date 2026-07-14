import { WorkshopsSection } from "@/components/WorkshopCard";
import { PageHeader } from "@/components/AboutTeaser";
import { PhotoGallery } from "@/components/PhotoGallery";
import { getWorkshops, getSiteSettings } from "@/lib/queries";
import { getWorkshopPhotos } from "@/lib/photos.server";
import { getFacebookPageUrl } from "@/lib/facebook";

export const metadata = {
  title: "Workshops | Front Porch Flowers",
  description:
    "Seasonal workshops — wreath making, wild bouquet arranging, and more. Gather with friends in the garden.",
};

export default async function WorkshopsPage() {
  const [workshops, settings] = await Promise.all([getWorkshops(), getSiteSettings()]);
  const workshopPhotos = getWorkshopPhotos();
  const facebookUrl = getFacebookPageUrl(settings.facebookPageUrl);

  return (
    <>
      <PageHeader
        eyebrow="Gather & create"
        title="Workshops"
        description="Occasional hands-on workshops in the garden — wreath making, bouquet arranging, and similar days when the garden has enough to share. All materials included. Just bring your creativity and a willingness to get your hands a little dirty."
      />
      <WorkshopsSection
        workshops={workshops}
        showAll
        facebookUrl={facebookUrl}
      />

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

      <section className="py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-display text-2xl text-charcoal mb-4">
            How to sign up
          </h2>
          <p className="text-warm-brown/80 mb-6">
            Workshop dates are announced on Facebook when they&apos;re ready. Message Rhoda
            there to reserve a spot — she&apos;ll share location and what to bring.
          </p>
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-sage text-cream rounded-full font-medium hover:bg-sage-dark transition-colors"
          >
            See Facebook page
            <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </section>
    </>
  );
}
