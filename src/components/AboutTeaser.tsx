import Image from "next/image";
import Link from "next/link";
import { getAboutPhoto, getAllPhotos, getPickYourOwnPhoto, getWorkshopPhotos } from "@/lib/photos.server";

export function AboutTeaser({ aboutText }: { aboutText?: string }) {
  const photo = getAboutPhoto();

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          <div>
            <p className="text-sage text-sm uppercase tracking-[0.2em] mb-4">
              Meet Rhoda
            </p>
            <h2 className="font-accent text-4xl md:text-5xl text-terracotta leading-[1.15] mb-6 text-balance">
              I grow flowers in my backyard
              <br />
              and make seasonal bouquets
              <br />
              for local pickup.
            </h2>
            <p className="text-warm-brown/80 leading-relaxed">
              {aboutText ||
                "Each bouquet is cut from what's blooming that week. I also host pick-your-own days and seasonal workshops when the garden has enough to share."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function EventsTeaser() {
  const pyoPhoto =
    getAllPhotos().find(
      (photo) => photo.src === "/photos/615466887_122118881559020895_1273262402101944493_n.jpg"
    ) ||
    getPickYourOwnPhoto();

  const workshopPhoto =
    getAllPhotos().find(
      (photo) =>
        photo.src ===
        "/photos/wreath workshop/590752628_122113192107020895_7718133177270323166_n.jpg"
    ) ||
    getWorkshopPhotos()[0] ||
    pyoPhoto;

  const cards = [
    {
      href: "/events#pick-your-own",
      title: "Pick Your Own",
      hint: "Announcements coming soon",
      image: pyoPhoto,
    },
    {
      href: "/events#workshops",
      title: "Workshops",
      hint: "Announcements coming soon",
      image: workshopPhoto,
    },
  ] as const;

  return (
    <section className="py-20 md:py-28 bg-sage/10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-sage-dark text-sm uppercase tracking-[0.2em] mb-3">
              In the garden
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-charcoal">Events</h2>
            <p className="text-warm-brown/80 max-w-xl mt-3">
              Pick-your-own days and seasonal workshops — dates are announced on social.
            </p>
          </div>
          <Link
            href="/events"
            className="text-terracotta font-medium hover:text-terracotta-dark transition-colors inline-flex items-center gap-2 shrink-0"
          >
            All events
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group text-left rounded-2xl border border-sage/15 bg-cream overflow-hidden hover:border-sage/40 transition-colors"
            >
              <span className="relative block aspect-[4/3] overflow-hidden bg-cream-dark">
                <Image
                  src={card.image.src}
                  alt={card.image.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </span>
              <span className="block px-5 py-4">
                <span className="block font-display text-2xl text-charcoal mb-1">
                  {card.title}
                </span>
                <span className="block text-sm text-warm-brown/70">{card.hint}</span>
              </span>
            </Link>
          ))}
        </div>
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
    <div className="bg-cream-dark/40 border-b border-sage/15 py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6">
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
      </div>
    </div>
  );
}
