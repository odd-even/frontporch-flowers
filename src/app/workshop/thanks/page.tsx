import Link from "next/link";
import { getPickYourOwnEvents } from "@/lib/queries";
import { SITE_URL } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Thank you",
  description: "Thanks for booking your Front Porch Flowers workshop.",
  robots: { index: false, follow: false },
  alternates: { canonical: `${SITE_URL}/workshop/thanks` },
};

const VENUE_NAME = "Front Porch Flowers";
const VENUE_ADDRESS_LINES = ["115 Bull Rd", "Bedell, NB"];
const VENUE_ADDRESS_ONE_LINE = "115 Bull Rd, Bedell, NB";
const VENUE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent("115 Bull Rd, Bedell, NB");
const FACEBOOK_URL =
  "https://www.facebook.com/people/Front-Porch-Flowers/61580626863252/";

export default async function WorkshopThanksPage() {
  const events = await getPickYourOwnEvents();
  const event = events[0];

  const priceLabel = event?.priceCents
    ? new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: event.currency || "CAD",
        maximumFractionDigits: 0,
      }).format(event.priceCents / 100)
    : null;

  return (
    <main className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(143,163,130,0.18),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(196,114,84,0.10),_transparent_45%)]"
        aria-hidden="true"
      />

      <section className="relative py-16 md:py-24">
        <div className="max-w-xl mx-auto px-6">
          <p className="text-sage text-xs uppercase tracking-[0.22em] mb-3">
            You’re booked
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-charcoal leading-[1.05] mb-4 text-balance">
            Thank you
          </h1>
          <p className="text-warm-brown/80 text-lg leading-relaxed mb-10 max-w-md">
            Your payment went through — we can’t wait to see you in the garden.
            Keep your Square receipt handy.
          </p>

          {event ? (
            <div className="mb-8 border-y border-sage/20 py-8">
              <p className="text-sage-dark text-xs uppercase tracking-[0.2em] mb-2">
                Workshop details
              </p>
              <h2 className="font-display text-2xl md:text-3xl text-charcoal mb-6 leading-[1.1]">
                {event.title}
              </h2>

              <dl className="space-y-5 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-sage-dark mb-1">
                    Date
                  </dt>
                  <dd className="font-medium text-charcoal text-base">
                    {formatDate(event.date)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-sage-dark mb-1">
                    Time
                  </dt>
                  <dd className="font-medium text-charcoal text-base">
                    {event.startTime} – {event.endTime}
                  </dd>
                </div>
                {priceLabel ? (
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-sage-dark mb-1">
                      Prepaid
                    </dt>
                    <dd className="font-medium text-charcoal text-base">
                      {priceLabel} per person
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-xs uppercase tracking-wider text-sage-dark mb-1">
                    Included
                  </dt>
                  <dd className="font-medium text-charcoal text-base leading-relaxed">
                    {event.description ||
                      "Pick and arrange your own bouquet · vase and floral tea included"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-sage-dark mb-1">
                    Address
                  </dt>
                  <dd>
                    <a
                      href={VENUE_MAPS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-start gap-3 font-medium text-charcoal hover:text-terracotta transition-colors"
                    >
                      <svg
                        className="mt-0.5 h-5 w-5 shrink-0 text-terracotta"
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
                      <span className="text-base leading-snug">
                        <span className="block">{VENUE_NAME}</span>
                        {VENUE_ADDRESS_LINES.map((line) => (
                          <span key={line} className="block">
                            {line}
                          </span>
                        ))}
                        <span className="mt-1 block text-sm font-normal text-terracotta group-hover:text-terracotta-dark">
                          Open in Google Maps →
                        </span>
                      </span>
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="mb-8 border-y border-sage/20 py-8">
              <p className="text-sage-dark text-xs uppercase tracking-[0.2em] mb-2">
                Address
              </p>
              <p className="font-medium text-charcoal text-base mb-1">{VENUE_NAME}</p>
              <p className="text-charcoal">{VENUE_ADDRESS_ONE_LINE}</p>
            </div>
          )}

          <div className="mb-10 text-sm text-warm-brown/85 leading-relaxed space-y-3">
            <p className="font-medium text-charcoal">What to know</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Arrive a few minutes early so we can settle in before{" "}
                {event?.startTime || "start time"}.
              </li>
              <li>
                Wear comfortable shoes — you’ll be in the garden and arranging
                stems.
              </li>
              <li>Bring your Square receipt or confirmation email.</li>
              <li>
                Questions or need to change your booking? Message Rhoda on{" "}
                <a
                  href={FACEBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-terracotta hover:text-terracotta-dark transition-colors"
                >
                  Facebook
                </a>
                .
              </li>
            </ul>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={VENUE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-3.5 bg-terracotta text-cream rounded-full font-medium hover:bg-terracotta-dark transition-colors"
            >
              Get directions
            </a>
            <Link
              href="/#events"
              className="inline-flex items-center px-8 py-3.5 border border-sage/30 text-sage-dark rounded-full font-medium hover:bg-sage/5 transition-colors"
            >
              Back to events
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
