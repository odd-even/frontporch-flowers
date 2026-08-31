import Link from "next/link";
import {
  bouquetOrderTotalCents,
  formatCents,
  PRESENTATION_LABELS,
} from "@/lib/bouquet-pricing";
import { SITE_URL } from "@/lib/seo";

export const metadata = {
  title: "Thank you",
  description: "Thanks for your Front Porch Flowers bouquet order.",
  robots: { index: false, follow: false },
  alternates: { canonical: `${SITE_URL}/bouquets/thanks` },
};

const PICKUP_ADDRESS = "115 Bull Rd, Bedell, NB";
const PICKUP_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent(PICKUP_ADDRESS);
const FACEBOOK_URL =
  "https://www.facebook.com/people/Front-Porch-Flowers/61580626863252/";

export default async function BouquetThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ presentation?: string; quantity?: string }>;
}) {
  const params = await searchParams;
  const presentationId = params.presentation?.trim() || "";
  const quantity = params.quantity?.trim() || "1";
  const presentationLabel = PRESENTATION_LABELS[presentationId];
  const totalCents = presentationLabel
    ? bouquetOrderTotalCents(presentationId, quantity)
    : null;

  return (
    <main className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-brand-wash"
        aria-hidden="true"
      />

      <section className="relative py-16 md:py-24">
        <div className="max-w-xl mx-auto px-6">
          <p className="text-sage text-xs uppercase tracking-[0.22em] mb-3">
            Order confirmed
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-charcoal leading-[1.05] mb-4 text-balance">
            Thank you
          </h1>
          <p className="text-warm-brown/80 text-lg leading-relaxed mb-10 max-w-md">
            Your payment went through — Rhoda will have your bouquet ready for
            pickup. Keep your Square receipt handy.
          </p>

          {presentationLabel ? (
            <div className="mb-8 border-y border-sage/20 py-8">
              <p className="text-sage-dark text-xs uppercase tracking-[0.2em] mb-2">
                Order details
              </p>
              <h2 className="font-display text-2xl md:text-3xl text-charcoal mb-6 leading-[1.1]">
                {presentationLabel}
              </h2>

              <dl className="space-y-5 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-sage-dark mb-1">
                    Quantity
                  </dt>
                  <dd className="font-medium text-charcoal text-base">
                    {quantity === "1" ? "1 bouquet" : `${quantity} bouquets`}
                  </dd>
                </div>
                {totalCents ? (
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-sage-dark mb-1">
                      Prepaid
                    </dt>
                    <dd className="font-medium text-charcoal text-base">
                      {formatCents(totalCents)}
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-xs uppercase tracking-wider text-sage-dark mb-1">
                    Pickup
                  </dt>
                  <dd>
                    <a
                      href={PICKUP_MAPS_URL}
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
                        <span className="block">Front Porch Flowers</span>
                        <span className="block">{PICKUP_ADDRESS}</span>
                        <span className="mt-1 block text-sm font-normal text-terracotta group-hover:text-terracotta-dark">
                          Open in Google Maps →
                        </span>
                      </span>
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}

          <div className="mb-10 text-sm text-warm-brown/85 leading-relaxed space-y-3">
            <p className="font-medium text-charcoal">What to know</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Rhoda will email you if she needs any details about colour or
                timing.
              </li>
              <li>
                Pick up at the address above — local pickup only, no delivery.
              </li>
              <li>Bring your Square receipt or confirmation email.</li>
              <li>
                Questions? Message Rhoda on{" "}
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
              href={PICKUP_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn bg-terracotta text-cream hover:bg-terracotta-dark"
            >
              Get directions
            </a>
            <Link
              href="/#bouquets"
              className="btn border border-sage/30 text-sage-dark hover:bg-sage/5"
            >
              Back to bouquets
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
