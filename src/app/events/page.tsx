import Image from "next/image";
import { PageHeader } from "@/components/AboutTeaser";
import { EventCard } from "@/components/WorkshopCard";
import { PhotoGallery } from "@/components/PhotoGallery";
import { getFacebookPageUrl } from "@/lib/facebook";
import { getPickYourOwnEvents, getSiteSettings } from "@/lib/queries";
import { getPickYourOwnPhoto, getWorkshopPhotos } from "@/lib/photos.server";

export const metadata = {
  title: "Events | Front Porch Flowers",
  description:
    "Workshops and pick-your-own garden days — check Facebook and Instagram for announcements, dates, and how to join.",
};

export default async function EventsPage() {
  const [events, settings] = await Promise.all([
    getPickYourOwnEvents(),
    getSiteSettings(),
  ]);
  const workshopPhotos = getWorkshopPhotos();
  const gardenPhoto = getPickYourOwnPhoto();
  const facebookUrl = getFacebookPageUrl(settings.facebookPageUrl);
  const instagramHandle = settings.instagramHandle || "front_porchflowers";
  const instagramUrl = `https://www.instagram.com/${instagramHandle}`;

  return (
    <>
      <PageHeader
        eyebrow="In the garden"
        title="Events"
        description="Seasonal workshops and pick-your-own days in Rhoda's backyard — announced on social when the garden is ready to share."
      />

      <section className="pb-16 md:pb-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="bg-cream rounded-2xl px-8 py-10 border border-sage/15">
            <p className="text-sm text-sage-dark uppercase tracking-wider mb-2">Stay tuned</p>
            <h2 className="font-display text-2xl md:text-3xl text-charcoal mb-3">
              Check for announcements on social
            </h2>
            <p className="text-warm-brown/70 text-sm mb-6 leading-relaxed">
              Workshop and pick-your-own dates are shared on Facebook and Instagram when
              they&apos;re ready — including details and how to join.
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

      <section id="workshops" className="py-16 md:py-24 bg-cream-dark/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-10">
            <p className="text-sage text-sm uppercase tracking-[0.2em] mb-3">Gather &amp; create</p>
            <h2 className="font-display text-3xl md:text-4xl text-charcoal mb-3">Workshops</h2>
            <p className="text-warm-brown/80 text-sm leading-relaxed">
              Occasional hands-on days in the garden — wreath making, bouquet arranging, and
              similar gatherings when there&apos;s enough to share. All materials included.
            </p>
          </div>

          {workshopPhotos.length > 0 && (
            <>
              <p className="text-sage text-sm uppercase tracking-[0.2em] mb-3">Past workshops</p>
              <h3 className="font-display text-2xl md:text-3xl text-charcoal mb-8">
                Wreaths, stems &amp;{" "}
                <span className="font-accent text-terracotta">good company</span>
              </h3>
              <PhotoGallery photos={workshopPhotos} layout="square" />
            </>
          )}
        </div>
      </section>

      <section id="pick-your-own" className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-10">
            <p className="text-sage text-sm uppercase tracking-[0.2em] mb-3">In the garden</p>
            <h2 className="font-display text-3xl md:text-4xl text-charcoal mb-3">
              Pick Your Own
            </h2>
            <p className="text-warm-brown/80 text-sm leading-relaxed">
              On select dates, the garden opens for pick-your-own. Wander the rows, clip your
              own stems, and take home whatever&apos;s blooming that day.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-4">
              {events.length > 0 ? (
                events.map((event) => <EventCard key={event._id} event={event} />)
              ) : (
                <div className="bg-cream-dark/50 rounded-2xl p-8 border border-sage/10">
                  <p className="text-sm text-sage-dark uppercase tracking-wider mb-2">
                    Dates coming soon
                  </p>
                  <h3 className="font-display text-2xl text-charcoal mb-3">
                    No pick-your-own date announced yet
                  </h3>
                  <p className="text-warm-brown/80 text-sm leading-relaxed mb-6">
                    New garden days get posted on social when they&apos;re scheduled. Follow
                    along for the next open date and hours.
                  </p>
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-sage text-cream rounded-full font-medium hover:bg-sage-dark transition-colors"
                  >
                    Check Facebook for dates
                    <span aria-hidden="true">&rarr;</span>
                  </a>
                </div>
              )}
            </div>

            <div>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-8">
                <Image
                  src={gardenPhoto.src}
                  alt={gardenPhoto.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              <div className="bg-cream-dark/50 rounded-2xl p-8 border border-sage/10">
                <h3 className="font-display text-2xl text-charcoal mb-4">What to expect</h3>
                <ul className="space-y-3 text-warm-brown/80 text-sm">
                  <li className="flex gap-3">
                    <span className="text-sage shrink-0">&#10003;</span>
                    Buckets and clippers provided
                  </li>
                  <li className="flex gap-3">
                    <span className="text-sage shrink-0">&#10003;</span>
                    Pay by the stem or bundle — prices posted in the garden
                  </li>
                  <li className="flex gap-3">
                    <span className="text-sage shrink-0">&#10003;</span>
                    Kids welcome (with supervision)
                  </li>
                  <li className="flex gap-3">
                    <span className="text-sage shrink-0">&#10003;</span>
                    Rain or shine — dress for the garden
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
