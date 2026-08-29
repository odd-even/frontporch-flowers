"use client";

import { useEffect, useMemo, useState } from "react";

function parseEventStart(date: string, startTime: string): number {
  const match = startTime.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  let hours = 13;
  let minutes = 0;

  if (match) {
    hours = Number(match[1]);
    minutes = Number(match[2]);
    const period = match[3].toUpperCase();
    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
  }

  const next = new Date(`${date}T00:00:00`);
  next.setHours(hours, minutes, 0, 0);
  return next.getTime();
}

function daysRemaining(targetMs: number) {
  const diff = Math.max(0, targetMs - Date.now());
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function EventCountdown({
  date,
  startTime,
}: {
  date: string;
  startTime: string;
}) {
  const targetMs = useMemo(
    () => parseEventStart(date, startTime),
    [date, startTime]
  );
  const [days, setDays] = useState(() => daysRemaining(targetMs));

  useEffect(() => {
    function tick() {
      setDays(daysRemaining(targetMs));
    }

    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [targetMs]);

  if (days <= 0) {
    return (
      <span className="rounded-full bg-sage-dark px-3 py-1 text-xs font-medium text-cream">
        Today
      </span>
    );
  }

  return (
    <span className="rounded-full bg-sage-dark px-3 py-1 text-xs font-medium text-cream tabular-nums">
      {days} {days === 1 ? "day" : "days"} until event
    </span>
  );
}
