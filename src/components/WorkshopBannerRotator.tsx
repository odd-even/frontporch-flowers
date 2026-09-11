"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type BannerItem = {
  id: string;
  href: string;
  title: string;
  detail: string;
};

const ROTATE_MS = 4500;

export function WorkshopBannerRotator({ items }: { items: BannerItem[] }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (items.length < 2) return;

    const id = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((current) => (current + 1) % items.length);
        setVisible(true);
      }, 220);
    }, ROTATE_MS);

    return () => window.clearInterval(id);
  }, [items.length]);

  const item = items[index] || items[0];
  if (!item) return null;

  return (
    <div
      data-workshop-banner
      className="fixed inset-x-0 top-0 z-[120] h-8 border-b border-cream/10 bg-[#182126] text-cream"
    >
      <Link
        href={item.href}
        className="flex h-full w-full items-center gap-2 px-6 md:px-8 lg:px-10 transition-colors hover:bg-[#1f2c33]"
        aria-live="polite"
      >
        <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.16em] text-cream/70">
          Workshop
        </span>
        <span className="hidden h-2.5 w-px shrink-0 bg-cream/25 sm:block" aria-hidden="true" />
        <span
          className={`min-w-0 truncate text-xs font-medium text-cream sm:text-[13px] transition-opacity duration-200 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          {item.title}
          <span className="font-normal text-cream/75"> {item.detail}</span>
        </span>
        <span className="ml-auto hidden shrink-0 items-center gap-0.5 text-xs font-medium text-cream sm:inline-flex">
          Details
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 6l6 6-6 6" />
          </svg>
        </span>
      </Link>
    </div>
  );
}
