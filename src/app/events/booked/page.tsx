import Link from "next/link";
import { PageHeader } from "@/components/AboutTeaser";
import { getPickYourOwnEvents } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Booking confirmed",
  description: "Thanks for booking your Front Porch Flowers garden visit.",
  robots: { index: false, follow: false },
};

const VENUE_ADDRESS = "115 Bull Rd, Bedell, NB";
const VENUE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent("115 Bull Rd, Bedell, NB");

export default async function EventBookedPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  const params = await searchParams;
  const events = await getPickYourOwnEvents();
  const event = events.find((item) => item._id === params.event) || events[0];

  return (
    <>
      <PageHeader
        eyebrow="You’re booked"
        title="Payment received"
        description="Thanks for prepaying — your workshop spot is confirmed. Keep an eye on your email for the Square receipt."
      />

      <section className="py-16 md:py-24">
        <div className="max-w-xl mx-auto px-6">
          {event ? (
            <div className="rounded-3xl border border-sage/15 bg-cream px-6 py-8 mb-8">
              <p className="text-sage-dark text-xs uppercase tracking-[0.2em] mb-2">
                Your workshop
              </p>
              <h2 className="font-display text-2xl md:text-3xl text-charcoal mb-5 leading-[1.1]">
                {event.title}
              </h2>

              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-sage-dark mb-1">
                    Date
                  </dt>
                  <dd className="font-medium text-charcoal">{formatDate(event.date)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-sage-dark mb-1">
                    Time
                  </dt>
                  <dd className="font-medium text-charcoal">
                    {event.startTime} – {event.endTime}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-sage-dark mb-1">
                    Location
                  </dt>
                  <dd>
                    <a
                      href={VENUE_MAPS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-start gap-2 font-medium text-terracotta hover:text-terracotta-dark transition-colors"
                    >
                      <svg
                        className="mt-0.5 h-4 w-4 shrink-0"
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
                      <span>
                        {VENUE_ADDRESS}
                        <span className="mt-0.5 block text-xs font-normal text-warm-brown/70">
                          Open in Google Maps →
                        </span>
                      </span>
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-sage-dark mb-1">
                    Included
                  </dt>
                  <dd className="font-medium text-charcoal">
                    Vase and floral tea · pick &amp; arrange your own bouquet
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}

          <div className="rounded-3xl border border-sage/15 bg-sage/5 px-6 py-6 mb-8 text-sm text-warm-brown/85 leading-relaxed space-y-3">
            <p className="font-medium text-charcoal">What to know</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Arrive a few minutes early so we can settle in before 1:00 PM.</li>
              <li>Wear comfortable shoes — you’ll be in the garden and arranging stems.</li>
              <li>Bring your Square receipt or confirmation email.</li>
              <li>
                Questions or need to change your booking? Message Rhoda on{" "}
                <a
                  href="https://www.facebook.com/people/Front-Porch-Flowers/61580626863252/"
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

          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={VENUE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-3.5 bg-terracotta text-cream rounded-full font-medium hover:bg-terracotta-dark transition-colors"
            >
              Get directions
            </a>
            <Link
              href="/"
              className="inline-flex items-center px-8 py-3.5 border border-sage/30 text-sage-dark rounded-full font-medium hover:bg-sage/5 transition-colors"
            >
              Home
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
