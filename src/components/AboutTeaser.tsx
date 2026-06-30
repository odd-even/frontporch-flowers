import Image from "next/image";
import Link from "next/link";

export function AboutTeaser({ aboutText }: { aboutText?: string }) {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80"
              alt="Hands arranging wildflowers in a garden"
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
                "Hi, I'm Rhoda. I grow flowers in my own backyard and turn them into bouquets that feel like you wandered through a meadow and gathered whatever caught your eye."}
            </p>
            <p className="text-warm-brown/80 leading-relaxed mb-8">
              I love incorporating local grasses, seed heads, and other wild things into my
              arrangements — nothing too fussy, just beautiful blooms for laid-back occasions.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-terracotta font-medium hover:text-terracotta-dark transition-colors"
            >
              Read Rhoda&apos;s story
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PickYourOwnTeaser({
  nextEvent,
}: {
  nextEvent?: { title: string; date: string; startTime: string; endTime: string };
}) {
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
          A laid-back morning in the garden — clip your own stems and take home a bundle of
          backyard beauty.
        </p>

        {nextEvent && (
          <div className="inline-block bg-cream rounded-2xl px-8 py-6 mb-8 border border-sage/15">
            <p className="text-sm text-sage-dark uppercase tracking-wider mb-1">Next date</p>
            <p className="font-display text-2xl text-charcoal">
              {nextEvent.title}
            </p>
            <p className="text-warm-brown/70 text-sm mt-1">
              {new Date(nextEvent.date + "T12:00:00").toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}{" "}
              &middot; {nextEvent.startTime} – {nextEvent.endTime}
            </p>
          </div>
        )}

        <div>
          <Link
            href="/pick-your-own"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-sage text-cream rounded-full font-medium hover:bg-sage-dark transition-colors"
          >
            See all dates
            <span aria-hidden="true">&rarr;</span>
          </Link>
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
