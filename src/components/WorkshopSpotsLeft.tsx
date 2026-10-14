"use client";

import { useEffect, useState } from "react";

interface WorkshopSpotsLeftProps {
  eventId: string;
  heading: string;
  detail: string;
  initialRemaining: number;
  initialSoldOut: boolean;
}

export function WorkshopSpotsLeft({
  eventId,
  heading,
  detail,
  initialRemaining,
  initialSoldOut,
}: WorkshopSpotsLeftProps) {
  const [remaining, setRemaining] = useState(initialRemaining);
  const [soldOut, setSoldOut] = useState(initialSoldOut);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(
          `/api/events/capacity?eventId=${encodeURIComponent(eventId)}`,
          { cache: "no-store" }
        );
        if (!response.ok) return;
        const data = (await response.json()) as {
          remaining?: number;
          soldOut?: boolean;
          fresh?: boolean;
        };
        if (cancelled || data.fresh !== true || typeof data.remaining !== "number") return;
        setRemaining(data.remaining);
        setSoldOut(Boolean(data.soldOut));
      } catch {
        // Keep the server-rendered count if Square is unreachable.
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const leftLabel = remaining === 1 ? "1 left" : `${remaining} left`;

  return (
    <li className="rounded-xl bg-sage/10 px-4 py-3">
      <span className="mb-1 flex items-center justify-between gap-2">
        <span className="text-xs uppercase tracking-wider text-sage-dark">
          {soldOut ? "Spots" : heading}
        </span>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider tabular-nums ${
            remaining <= 2
              ? "bg-terracotta/15 text-terracotta"
              : "bg-sage/20 text-sage-dark"
          }`}
        >
          {leftLabel}
        </span>
      </span>
      <span className="font-medium text-charcoal">{soldOut ? "Sold out" : detail}</span>
    </li>
  );
}
