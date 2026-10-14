"use client";

import { useState, type FormEvent } from "react";

interface WorkshopInterestFormProps {
  eventId: string;
}

export function WorkshopInterestForm({ eventId }: WorkshopInterestFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/events/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          customerName: name,
          customerEmail: email,
          quantity,
          website,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(data.error || "Could not save your interest. Please try again.");
        return;
      }
      setDone(true);
    } catch {
      setError("Could not save your interest. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-sage/10 px-5 py-4">
        <p className="font-medium text-charcoal">You&apos;re on the list</p>
        <p className="mt-1 text-sm text-warm-brown/75 leading-relaxed">
          Rhoda has your interest for {quantity === 1 ? "1 guest" : `${quantity} guests`}.
          She&apos;ll email you if she adds another wreath workshop. This doesn&apos;t hold a
          spot.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-sage/10 px-5 py-4">
      <p className="font-medium text-charcoal">This date is full</p>
      <p className="mt-1 text-sm text-warm-brown/75 leading-relaxed">
        If Rhoda adds another wreath workshop, leave your name and how many people.
        She&apos;ll use this list to decide. It doesn&apos;t reserve a spot.
      </p>

      <div className="mt-4 space-y-3">
        <input
          type="text"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name"
          autoComplete="name"
          className="w-full rounded-xl border border-sage/20 bg-white px-4 py-3 text-base text-charcoal placeholder:text-warm-brown/40 focus:outline-none focus:border-sage/50"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          autoComplete="email"
          className="w-full rounded-xl border border-sage/20 bg-white px-4 py-3 text-base text-charcoal placeholder:text-warm-brown/40 focus:outline-none focus:border-sage/50"
        />
        <input
          type="text"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />
        <div className="flex items-center justify-between gap-3 rounded-xl border border-sage/20 bg-white px-4 py-2.5">
          <span className="text-sm text-charcoal">How many people?</span>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              disabled={quantity <= 1}
              aria-label="Fewer people"
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
              onClick={() => setQuantity((current) => Math.min(6, current + 1))}
              disabled={quantity >= 6}
              aria-label="More people"
              className="flex h-8 w-8 items-center justify-center rounded-button text-charcoal hover:bg-sage/10 transition-colors disabled:opacity-30"
            >
              <span className="text-lg leading-none" aria-hidden="true">
                +
              </span>
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <p className="mt-3 text-sm text-terracotta" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="btn mt-4 w-full sm:w-fit bg-terracotta text-cream hover:bg-terracotta-dark disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Count me in"}
      </button>
    </form>
  );
}
