import Link from "next/link";
import type { Workshop } from "@/lib/types";
import { formatShortDate } from "@/lib/utils";
import { getFacebookPageUrl } from "@/lib/facebook";

interface WorkshopCardProps {
  workshop: Workshop;
}

export function WorkshopCard({ workshop }: WorkshopCardProps) {
  return (
    <article className="bg-cream-dark/50 rounded-2xl p-8 border border-sage/10 hover:border-sage/30 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-4">
        <time
          dateTime={workshop.date}
          className="text-center bg-sage text-cream rounded-xl px-4 py-2 min-w-[4.5rem]"
        >
          <span className="block text-xs uppercase tracking-wider opacity-80">
            {new Date(workshop.date + "T12:00:00").toLocaleDateString("en-US", { month: "short" })}
          </span>
          <span className="block text-2xl font-display leading-none">
            {new Date(workshop.date + "T12:00:00").getDate()}
          </span>
        </time>
        {workshop.price && (
          <span className="text-terracotta font-medium">{workshop.price}</span>
        )}
      </div>

      <h3 className="font-display text-2xl text-charcoal mb-3">
        {workshop.title}
      </h3>
      <p className="text-warm-brown/80 text-sm leading-relaxed mb-4">
        {workshop.description}
      </p>

      <div className="flex flex-wrap gap-3 text-xs text-warm-brown/70 mb-6">
        {workshop.time && (
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {workshop.time}
          </span>
        )}
        {workshop.spotsAvailable && (
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {workshop.spotsAvailable} spots left
          </span>
        )}
      </div>

      <a
        href={getFacebookPageUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm font-medium text-sage-dark hover:text-terracotta transition-colors"
      >
        Reserve via Facebook
        <span aria-hidden="true">&rarr;</span>
      </a>
    </article>
  );
}

interface WorkshopsSectionProps {
  workshops: Workshop[];
  showAll?: boolean;
  facebookUrl?: string;
}

export function WorkshopsSection({
  workshops,
  showAll = false,
  facebookUrl,
}: WorkshopsSectionProps) {
  const facebookHref = facebookUrl || getFacebookPageUrl();
  const display = showAll
    ? workshops
    : [...workshops]
        .sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return a.date.localeCompare(b.date);
        })
        .slice(0, 2);

  return (
    <section className="py-20 md:py-28 bg-cream-dark/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-sage text-sm uppercase tracking-[0.2em] mb-3">
              Gather &amp; create
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-charcoal">
              Seasonal workshops
            </h2>
          </div>
          {!showAll && display.length > 0 && (
            <Link
              href="/events"
              className="text-terracotta font-medium hover:text-terracotta-dark transition-colors flex items-center gap-2"
            >
              All events
              <span aria-hidden="true">&rarr;</span>
            </Link>
          )}
        </div>

        {display.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {display.map((workshop) => (
              <WorkshopCard key={workshop._id} workshop={workshop} />
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto text-center bg-cream rounded-2xl px-8 py-10 border border-sage/15">
            <p className="text-sm text-sage-dark uppercase tracking-wider mb-2">
              Stay tuned
            </p>
            <p className="font-display text-2xl md:text-3xl text-charcoal mb-3">
              Check for announcements on social
            </p>
            <p className="text-warm-brown/70 text-sm mb-6">
              Workshop dates are shared on Facebook and Instagram when they&apos;re ready —
              including details and how to reserve a spot.
            </p>
            <a
              href={facebookHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-sage text-cream rounded-full font-medium hover:bg-sage-dark transition-colors"
            >
              See Facebook page
              <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

export function EventCard({ event }: { event: import("@/lib/types").PickYourOwnEvent }) {
  return (
    <article className="flex gap-6 items-start p-6 rounded-2xl border border-sage/15 hover:border-sage/30 transition-colors bg-cream">
      <time
        dateTime={event.date}
        className="text-center bg-terracotta/10 text-terracotta rounded-xl px-4 py-3 min-w-[4.5rem] shrink-0"
      >
        <span className="block text-xs uppercase tracking-wider">
          {formatShortDate(event.date).split(" ")[0]}
        </span>
        <span className="block text-2xl font-display leading-none">
          {new Date(event.date + "T12:00:00").getDate()}
        </span>
      </time>

      <div className="flex-1">
        <h3 className="font-display text-xl text-charcoal mb-1">
          {event.title}
        </h3>
        <p className="text-sm text-warm-brown/70 mb-2">
          {event.startTime} – {event.endTime}
        </p>
        {event.description && (
          <p className="text-sm text-warm-brown/80 leading-relaxed">
            {event.description}
          </p>
        )}
      </div>
    </article>
  );
}
