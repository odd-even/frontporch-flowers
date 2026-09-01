"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { FacebookIcon } from "@/components/SocialIcons";

interface EventBookingFormProps {
  eventId: string;
  eventTitle?: string;
  eventSummary?: string;
  priceCents: number;
  currency?: string;
  maxQuantity?: number;
  facebookUrl: string;
  squareReady: boolean;
}

function formatMoney(cents: number, currency = "CAD") {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function EventBookingForm({
  eventId,
  eventSummary,
  priceCents,
  currency = "CAD",
  maxQuantity = 6,
  facebookUrl,
  squareReady,
}: EventBookingFormProps) {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalLabel = useMemo(
    () => formatMoney(priceCents * quantity, currency),
    [priceCents, quantity, currency]
  );
  const unitLabel = formatMoney(priceCents, currency);
  const qtyMax = Math.min(Math.max(maxQuantity, 1), 10);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function close() {
    setOpen(false);
    setError(null);
    setSubmitting(false);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!squareReady) return;

    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/events/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          quantity,
          customerName,
          customerEmail,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !data.url) {
        setError(data.error || "Could not start checkout. Please try again.");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Could not start checkout. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!squareReady) {
    return (
      <a
        href={facebookUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn w-full sm:w-fit bg-terracotta text-cream hover:bg-terracotta-dark"
      >
        <FacebookIcon className="w-5 h-5" />
        Reserve your spot
      </a>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn w-full sm:w-fit bg-terracotta text-cream hover:bg-terracotta-dark"
      >
        Reserve your spot
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-charcoal/60"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-booking-title"
        >
          <div
            className="relative w-full sm:max-w-md max-h-[92vh] overflow-y-auto bg-cream rounded-t-3xl sm:rounded-3xl shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              className="absolute top-4 right-4 p-2 text-warm-brown/60 hover:text-charcoal transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              <div>
                <p className="text-sage text-xs uppercase tracking-[0.2em] mb-2">
                  Stem &amp; Style
                </p>
                <h2
                  id="event-booking-title"
                  className="font-display text-2xl md:text-[1.75rem] text-charcoal mb-2 pr-8 leading-[1.1]"
                >
                  Reserve your spot
                </h2>
                <p className="text-sm text-warm-brown/75 leading-relaxed">
                  {unitLabel} per person
                  {eventSummary ? ` · ${eventSummary}` : null}
                </p>
              </div>

              <div className="rounded-2xl bg-sage/10 px-4 py-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-charcoal text-balance">
                      How many guests are you booking for?
                    </p>
                    <p className="mt-0.5 text-xs text-warm-brown/65">
                      {quantity === 1
                        ? `1 guest · ${totalLabel}`
                        : `${quantity} guests · ${totalLabel}`}
                      {qtyMax < 10 ? ` · ${qtyMax} left` : null}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 rounded-button bg-cream ring-1 ring-sage/20 p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      aria-label="Fewer guests"
                      className="flex h-8 w-8 items-center justify-center rounded-button text-charcoal hover:bg-sage/10 transition-colors disabled:opacity-30"
                    >
                      <span className="text-lg leading-none" aria-hidden="true">
                        −
                      </span>
                    </button>
                    <span className="min-w-7 text-center font-medium tabular-nums text-charcoal">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(qtyMax, q + 1))}
                      disabled={quantity >= qtyMax}
                      aria-label="More guests"
                      className="flex h-8 w-8 items-center justify-center rounded-button text-charcoal hover:bg-sage/10 transition-colors disabled:opacity-30"
                    >
                      <span className="text-lg leading-none" aria-hidden="true">
                        +
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-charcoal">Your details</p>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  className="w-full rounded-xl border border-sage/20 bg-white px-4 py-3 text-sm text-charcoal placeholder:text-warm-brown/40 focus:outline-none focus:border-sage/50"
                />
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Email for your receipt"
                  autoComplete="email"
                  className="w-full rounded-xl border border-sage/20 bg-white px-4 py-3 text-sm text-charcoal placeholder:text-warm-brown/40 focus:outline-none focus:border-sage/50"
                />
              </div>

              {error ? (
                <p className="text-sm text-terracotta" role="alert">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="btn w-full bg-terracotta text-cream hover:bg-terracotta-dark disabled:opacity-60"
              >
                {submitting ? "Starting checkout…" : `Pay ${totalLabel}`}
              </button>
              <p className="text-center text-xs text-warm-brown/55">
                Secure checkout with Square
              </p>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
