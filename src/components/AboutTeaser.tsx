import Image from "next/image";
import dynamic from "next/dynamic";
import { PickYourOwnFeatured } from "@/components/PickYourOwnFeatured";
import { Reveal } from "@/components/Reveal";
import { getFacebookPageUrl } from "@/lib/facebook";
import {
  getAboutStripPhotos,
  getBouquetWorkshopPhotos,
  getMeetRhodaPhoto,
  getPickYourOwnPhoto,
  getPumpkinWorkshopPhotos,
} from "@/lib/photos.server";
import { getPickYourOwnEvents, getSiteSettings } from "@/lib/queries";

const AboutTeaserScroll = dynamic(
  () =>
    import("@/components/AboutTeaserScroll").then((mod) => mod.AboutTeaserScroll),
  {
    loading: () => (
      <div
        className="h-[min(72vw,18rem)] sm:h-[min(40vw,20rem)] w-full animate-pulse bg-cream-dark/40"
        aria-hidden="true"
      />
    ),
  }
);

export async function AboutTeaser() {
  const settings = await getSiteSettings();
  const facebookUrl = getFacebookPageUrl(settings.facebookPageUrl);
  const instagramHandle = settings.instagramHandle || "front_porchflowers";
  const instagramUrl = `https://www.instagram.com/${instagramHandle}`;

  return (
    <Reveal variant="up" className="w-full">
      <AboutTeaserScroll
        sidePhotos={getAboutStripPhotos()}
        rhodaPhoto={getMeetRhodaPhoto()}
        facebookUrl={facebookUrl}
        instagramUrl={instagramUrl}
      />
    </Reveal>
  );
}

export async function EventsTeaser() {
  const [events, settings] = await Promise.all([
    getPickYourOwnEvents(),
    getSiteSettings(),
  ]);
  const pyoPhoto = getPickYourOwnPhoto();
  const facebookUrl = getFacebookPageUrl(settings.facebookPageUrl);
  const pumpkinPhotos = getPumpkinWorkshopPhotos();
  const bouquetPhotos = getBouquetWorkshopPhotos();
  const fallbackCover = bouquetPhotos[0] || pumpkinPhotos[0] || pyoPhoto;

  function photosForEvent(event: (typeof events)[number]) {
    const isPumpkin =
      /pumpkin/i.test(event.title) || /pumpkin/i.test(event.description || "");
    if (isPumpkin && pumpkinPhotos.length) return pumpkinPhotos;
    if (bouquetPhotos.length) return bouquetPhotos;
    if (pumpkinPhotos.length) return pumpkinPhotos;
    return [fallbackCover];
  }

  return (
    <section id="events" className="scroll-mt-24 pt-10 pb-20 md:pt-14 md:pb-28 bg-brand-wash">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal variant="up" className="mb-10">
          <p className="text-sage-dark text-sm uppercase tracking-[0.2em] mb-3">
            Events
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-charcoal">Workshops</h2>
          {!events.length ? (
            <p className="text-warm-brown/80 max-w-xl mt-3">
              Pick-your-own days and seasonal workshops — dates are announced on social.
            </p>
          ) : null}
        </Reveal>

        {events.length ? (
          <div className="flex flex-col gap-8 md:gap-10">
            {events.map((event, index) => (
              <Reveal key={event._id} variant="scale" delay={80 + index * 60}>
                <PickYourOwnFeatured
                  event={event}
                  photos={photosForEvent(event)}
                  facebookUrl={facebookUrl}
                />
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal stagger variant="up" className="grid sm:grid-cols-2 gap-4 md:gap-6">
            {[
              { title: "Pick Your Own", hint: "Announcements coming soon", image: pyoPhoto },
              { title: "Workshops", hint: "Announcements coming soon", image: fallbackCover },
            ].map((card) => (
              <article
                key={card.title}
                className="rounded-2xl border border-sage/15 bg-cream overflow-hidden"
              >
                <span className="relative block aspect-[4/3] overflow-hidden bg-cream-dark">
                  <Image
                    src={card.image.src}
                    alt={card.image.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                </span>
                <span className="block px-5 py-4">
                  <span className="block font-display text-2xl text-charcoal mb-1">
                    {card.title}
                  </span>
                  <span className="block text-sm text-warm-brown/70">{card.hint}</span>
                </span>
              </article>
            ))}
          </Reveal>
        )}
      </div>
    </section>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="bg-brand-wash-header border-b border-sage/15 py-16 md:py-24">
      <Reveal variant="up" className="max-w-6xl mx-auto px-6">
        {eyebrow && (
          <p className="text-sage text-sm uppercase tracking-[0.2em] mb-3">{eyebrow}</p>
        )}
        <h1 className="font-display text-4xl md:text-6xl text-charcoal mb-4">
          {title}
        </h1>
        {description && (
          <p className="text-warm-brown/80 text-lg max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </Reveal>
    </div>
  );
}
