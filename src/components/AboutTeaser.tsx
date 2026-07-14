import Image from "next/image";
import Link from "next/link";
import { getAboutPhoto } from "@/lib/photos.server";

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
            <p className="text-sage text-sm uppercase tracking-[0.2em] mb-3">
              Meet Rhoda
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-charcoal mb-6 leading-tight">
              Grown in the backyard,
              <br />
              <span className="font-accent text-5xl md:text-6xl text-terracotta">arranged with whimsy</span>
            </h2>
            <p className="text-warm-brown/80 leading-relaxed mb-6">
              {aboutText ||
                "Hi, I'm Rhoda. I grow flowers in my backyard and make seasonal bouquets for local pickup. Each one is cut from what's blooming that week."}
            </p>
            <p className="text-warm-brown/80 leading-relaxed">
              I also host pick-your-own days and a few seasonal workshops when the garden
              has enough to share — wreath making, bouquet arranging, and similar days in
              the yard.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PickYourOwnTeaser({
  nextEvent,
  facebookUrl,
}: {
  nextEvent?: { title: string; date: string; startTime: string; endTime: string };
  facebookUrl?: string;
}) {
  const facebookHref = facebookUrl || "https://www.facebook.com/people/Front-Porch-Flowers/61580626863252/";

  return (
    <section className="py-20 md:py-28 bg-sage/10">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p className="text-sage-dark text-sm uppercase tracking-[0.2em] mb-3">
          In the garden
        </p>
        <h2 className="font-display text-4xl md:text-5xl text-charcoal mb-4">
          Pick your own flowers
        </h2>
        <p className="text-warm-brown/80 max-w-xl mx-auto mb-8">
          On select dates, wander the rows and fill a bucket with whatever speaks to you.
        </p>

        {nextEvent ? (
          <div className="inline-block bg-cream rounded-2xl px-8 py-6 mb-8 border border-sage/15">
            <p className="text-sm text-sage-dark uppercase tracking-wider mb-1">Next date</p>
            <p className="font-display text-2xl text-charcoal">{nextEvent.title}</p>
            <p className="text-warm-brown/70 text-sm mt-1">
              {new Date(nextEvent.date + "T12:00:00").toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}{" "}
              &middot; {nextEvent.startTime} – {nextEvent.endTime}
            </p>
          </div>
        ) : (
          <div className="inline-block bg-cream rounded-2xl px-8 py-6 mb-8 border border-sage/15">
            <p className="text-sm text-sage-dark uppercase tracking-wider mb-1">
              Dates coming soon
            </p>
            <p className="font-display text-2xl text-charcoal">No date announced yet</p>
            <p className="text-warm-brown/70 text-sm mt-1">
              Pick-your-own days are posted on Facebook when they&apos;re scheduled.
            </p>
          </div>
        )}

        <div>
          {nextEvent ? (
            <Link
              href="/pick-your-own"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-sage text-cream rounded-full font-medium hover:bg-sage-dark transition-colors"
            >
              See all dates
              <span aria-hidden="true">&rarr;</span>
            </Link>
          ) : (
            <a
              href={facebookHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-sage text-cream rounded-full font-medium hover:bg-sage-dark transition-colors"
            >
              Check Facebook for dates
              <span aria-hidden="true">&rarr;</span>
            </a>
          )}
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
