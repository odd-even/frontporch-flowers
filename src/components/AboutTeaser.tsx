import Image from "next/image";
import { getAboutPhoto, getPickYourOwnPhoto, getWorkshopPhotos } from "@/lib/photos.server";

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
              Meet Rhoda · Woodstock, NB
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
                "Each bouquet is cut from what's blooming that week in Woodstock, New Brunswick. I also host pick-your-own days and seasonal workshops when the garden has enough to share."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function EventsTeaser() {
  const pyoPhoto = getPickYourOwnPhoto();
  const workshopPhoto =
    getWorkshopPhotos().find((photo) =>
      photo.src.includes("588451772_122112928383020895_1658016211688851875_n.jpg")
    ) ||
    getWorkshopPhotos().find((photo) => photo.subcategory === "wreath workshop") ||
    getWorkshopPhotos()[0] ||
    pyoPhoto;

  const cards = [
    {
      title: "Pick Your Own",
      hint: "Announcements coming soon",
      image: pyoPhoto,
    },
    {
      title: "Workshops",
      hint: "Announcements coming soon",
      image: workshopPhoto,
    },
  ] as const;

  return (
    <section className="py-20 md:py-28 bg-sage/10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-10">
          <p className="text-sage-dark text-sm uppercase tracking-[0.2em] mb-3">
            In the garden
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-charcoal">Events</h2>
          <p className="text-warm-brown/80 max-w-xl mt-3">
            Pick-your-own days and seasonal workshops — dates are announced on social.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
          {cards.map((card) => (
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
