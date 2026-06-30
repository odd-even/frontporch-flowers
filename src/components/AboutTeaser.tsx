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
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-charcoal mb-6 leading-tight">
              Grown in the backyard,
              <br />
              <span className="italic font-normal">arranged with whimsy</span>
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

export function InstagramFeed() {
  return (
    <section className="py-20 md:py-28 bg-charcoal text-cream">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p className="text-sage-light text-sm uppercase tracking-[0.2em] mb-3">
          From the garden
        </p>
        <h2 className="font-display text-4xl md:text-5xl font-semibold mb-4">
          Follow along on Instagram
        </h2>
        <p className="text-cream/70 max-w-lg mx-auto mb-10">
          See what&apos;s blooming, get a peek at recent bouquets, and be the first to know
          about workshops and pick-your-own days.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            "https://images.unsplash.com/photo-1455659814943-ff9fe1c875eb?w=400&q=80",
            "https://images.unsplash.com/photo-1462277899769-7e7d2a7f2f2f?w=400&q=80",
            "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=400&q=80",
            "https://images.unsplash.com/photo-1470058869952-7a8d7daf08e1?w=400&q=80",
          ].map((src, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
              <Image
                src={src}
                alt={`Garden flowers ${i + 1}`}
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
          ))}
        </div>

        <a
          href="https://www.instagram.com/front_porchflowers"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-8 py-3.5 bg-cream text-charcoal rounded-full font-medium hover:bg-cream-dark transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
          @front_porchflowers
        </a>
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
        <h2 className="font-display text-4xl md:text-5xl font-semibold text-charcoal mb-4">
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
            <p className="font-display text-2xl font-semibold text-charcoal">
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
        <h1 className="font-display text-4xl md:text-6xl font-semibold text-charcoal mb-4">
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
