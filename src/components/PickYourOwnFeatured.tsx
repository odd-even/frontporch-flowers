import { EventBookingForm } from "@/components/EventBookingForm";
import { EventCountdown } from "@/components/EventCountdown";
import { EventImageRotator } from "@/components/EventImageRotator";
import type { SitePhoto } from "@/lib/photos.shared";
import { getEventCapacity, isEventCheckoutReady } from "@/lib/square";
import type { PickYourOwnEvent } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface PickYourOwnFeaturedProps {
  event: PickYourOwnEvent;
  photos: SitePhoto[];
  facebookUrl: string;
}

export async function PickYourOwnFeatured({
  event,
  photos,
  facebookUrl,
}: PickYourOwnFeaturedProps) {
  const eventDate = new Date(event.date + "T12:00:00");
  const weekday = eventDate.toLocaleDateString("en-CA", { weekday: "short" });
  const month = eventDate.toLocaleDateString("en-CA", { month: "short" });
  const day = eventDate.getDate();
  const squareReady = isEventCheckoutReady(event);
  const paymentLinkUrl = event.squarePaymentLinkUrl;
  const capacity = await getEventCapacity(event);
  const maxQuantity = Math.min(
    capacity.remaining > 0 ? capacity.remaining : capacity.capacity || 8,
    capacity.capacity || 8,
    8
  );
  const spotsLabel = capacity.soldOut
    ? "Sold out"
    : capacity.remaining === capacity.capacity
      ? `Limited to ${capacity.capacity} · prepaid`
      : `${capacity.remaining} of ${capacity.capacity} left · prepaid`;

  const includes = ["Vase included"];

  return (
    <article className="overflow-hidden rounded-3xl border border-sage/15 bg-cream shadow-[0_20px_60px_-40px_rgba(60,50,40,0.45)]">
      <div className="grid md:grid-cols-2">
        <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[380px]">
          <EventImageRotator photos={photos} />
          <div className="absolute inset-0 z-[1] bg-gradient-to-t from-charcoal/35 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-charcoal/10 pointer-events-none" />
          <div className="absolute left-5 bottom-5 z-[2] md:left-6 md:bottom-6">
            <time
              dateTime={event.date}
              className="flex items-center gap-3 rounded-2xl bg-cream/95 px-4 py-3 text-charcoal shadow-sm backdrop-blur-sm"
            >
              <span className="text-center leading-none">
                <span className="block text-[10px] uppercase tracking-[0.18em] text-terracotta">
                  {weekday}
                </span>
                <span className="mt-1 block font-display text-3xl leading-none">{day}</span>
                <span className="mt-0.5 block text-xs uppercase tracking-wider text-warm-brown/70">
                  {month}
                </span>
              </span>
              <span className="h-10 w-px bg-sage/25" aria-hidden="true" />
              <span className="text-sm leading-snug">
                <span className="block font-medium text-charcoal">
                  {event.startTime} – {event.endTime}
                </span>
                <span className="block text-warm-brown/70">2-hour workshop</span>
              </span>
            </time>
          </div>
        </div>

        <div className="flex flex-col justify-center px-6 py-7 sm:px-8 md:px-10 md:py-10">
          <div className="flex flex-wrap items-center gap-2.5 mb-2">
            <EventCountdown date={event.date} startTime={event.startTime} />
            <p className="text-sage-dark text-sm uppercase tracking-[0.2em]">
              Workshop
            </p>
          </div>
          <h3 className="font-display text-3xl md:text-[2.5rem] text-charcoal mb-3 leading-[1.05]">
            {event.title}
          </h3>

          <div className="mb-4 flex flex-col gap-1.5">
            <time
              dateTime={event.date}
              className="inline-flex items-center gap-2 font-medium text-charcoal"
            >
              <svg
                className="h-4 w-4 shrink-0 text-sage-dark"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 3v2m8-2v2M4 9h16M6 5h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z"
                />
              </svg>
              <span className="text-base">{formatDate(event.date)}</span>
            </time>
            <span className="inline-flex items-center gap-2 text-warm-brown/80">
              <svg
                className="h-4 w-4 shrink-0 text-sage-dark"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11z"
                />
                <circle cx="12" cy="10" r="2.5" strokeWidth={1.5} />
              </svg>
              <span className="text-base">Bedell, NB</span>
            </span>
          </div>

          {event.description ? (
            <p className="text-warm-brown/85 text-sm leading-relaxed mb-4">
              {event.description}
            </p>
          ) : null}

          <ul className="flex flex-wrap gap-2 mb-4">
            {includes.map((item) => (
              <li
                key={item}
                className="rounded-full bg-sage/10 px-3 py-1.5 text-xs font-medium text-sage-dark"
              >
                {item}
              </li>
            ))}
          </ul>

          <ul className="grid grid-cols-2 gap-3 mb-5 text-sm">
            <li className="rounded-xl bg-sage/10 px-4 py-3">
              <span className="block text-xs uppercase tracking-wider text-sage-dark mb-1">
                When
              </span>
              <span className="font-medium text-charcoal">
                {event.startTime} – {event.endTime}
              </span>
            </li>
            {capacity.capacity > 0 ? (
              <li className="rounded-xl bg-sage/10 px-4 py-3">
                <span className="block text-xs uppercase tracking-wider text-sage-dark mb-1">
                  Spots
                </span>
                <span className="font-medium text-charcoal">{spotsLabel}</span>
              </li>
            ) : null}
            <li className="rounded-xl bg-sage/10 px-4 py-3">
              <span className="block text-xs uppercase tracking-wider text-sage-dark mb-1">
                Refreshment
              </span>
              <span className="font-medium text-charcoal">Floral tea</span>
            </li>
            {event.priceCents ? (
              <li className="rounded-xl bg-terracotta/10 px-4 py-3">
                <span className="block text-xs uppercase tracking-wider text-terracotta mb-1">
                  Price
                </span>
                <span className="font-display text-2xl leading-none text-charcoal">
                  {new Intl.NumberFormat("en-CA", {
                    style: "currency",
                    currency: event.currency || "CAD",
                    maximumFractionDigits: 0,
                  }).format(event.priceCents / 100)}
                </span>
                <span className="ml-1.5 text-sm font-medium text-charcoal/70">
                  per person
                </span>
              </li>
            ) : null}
          </ul>

          {event.priceCents ? (
            capacity.soldOut && squareReady && !paymentLinkUrl ? (
              <div className="rounded-2xl bg-sage/10 px-5 py-4">
                <p className="font-medium text-charcoal">Sold out</p>
                <p className="mt-1 text-sm text-warm-brown/75 leading-relaxed">
                  All {capacity.capacity} spots are booked. Message Rhoda on{" "}
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-terracotta hover:text-terracotta-dark transition-colors"
                  >
                    Facebook
                  </a>{" "}
                  if you’d like to join a waitlist.
                </p>
              </div>
            ) : paymentLinkUrl ? (
              <a
                href={paymentLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full sm:w-fit items-center justify-center px-8 py-3.5 bg-terracotta text-cream rounded-full font-medium hover:bg-terracotta-dark transition-colors"
              >
                Reserve your spot
              </a>
            ) : (
              <EventBookingForm
                eventId={event._id}
                eventSummary={`${event.startTime} – ${event.endTime} · Bedell, NB`}
                priceCents={event.priceCents}
                currency={event.currency || "CAD"}
                maxQuantity={Math.max(1, maxQuantity)}
                facebookUrl={facebookUrl}
                squareReady={squareReady}
              />
            )
          ) : (
            <p className="text-sm text-warm-brown/70">Booking details coming soon.</p>
          )}
        </div>
      </div>
    </article>
  );
}
