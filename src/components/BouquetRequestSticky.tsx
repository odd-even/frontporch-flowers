"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { OrderBouquetControls } from "@/components/BouquetInquiry";

type BouquetRequestStickyProps = {
  rhodaSrc: string;
  squareReady?: boolean;
};

export function BouquetRequestSticky({
  rhodaSrc,
  squareReady = false,
}: BouquetRequestStickyProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [footerVisible, setFooterVisible] = useState(false);
  const [pastIntro, setPastIntro] = useState(false);

  useEffect(() => {
    if (!isHome) return;

    const footer = document.querySelector("footer");
    const about = document.getElementById("about");

    const footerObserver = footer
      ? new IntersectionObserver(
          ([entry]) => setFooterVisible(entry.isIntersecting),
          { threshold: 0, rootMargin: "0px 0px -10% 0px" }
        )
      : null;

    if (footer && footerObserver) footerObserver.observe(footer);

    if (!about) {
      setPastIntro(true);
      return () => footerObserver?.disconnect();
    }

    const introObserver = new IntersectionObserver(
      ([entry]) => {
        const scrolledPast =
          !entry.isIntersecting && entry.boundingClientRect.top < 0;
        setPastIntro(scrolledPast);
      },
      { threshold: 0 }
    );

    introObserver.observe(about);

    return () => {
      footerObserver?.disconnect();
      introObserver.disconnect();
    };
  }, [isHome]);

  const visible = isHome && pastIntro && !footerVisible;

  return (
    <OrderBouquetControls squareReady={squareReady}>
      {(openOrder) => (
        <div
          className={`fixed right-5 z-50 md:right-6 bottom-[max(1.25rem,env(safe-area-inset-bottom))] md:bottom-6 transition-all duration-300 ease-out ${
            visible
              ? "translate-y-0 scale-100 opacity-100"
              : "pointer-events-none translate-y-3 scale-95 opacity-0"
          }`}
        >
          <button
            type="button"
            onClick={() => openOrder()}
            className="group relative flex items-center gap-2.5 rounded-full bg-cream py-1.5 pl-1.5 pr-5 shadow-lg shadow-charcoal/15 ring-1 ring-sage/25 transition-colors hover:bg-cream-dark hover:ring-sage/40"
            aria-label="Request a bouquet"
          >
            <span
              className="bouquet-request-ring pointer-events-none absolute inset-0 rounded-full"
              aria-hidden="true"
            />
            <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-white/90">
              <Image
                src={rhodaSrc}
                alt=""
                fill
                quality={90}
                className="scale-[1.2] object-cover object-[center_30%]"
                sizes="128px"
              />
            </span>
            <span className="relative pr-0.5 text-sm font-medium text-charcoal whitespace-nowrap">
              Request a bouquet
            </span>
          </button>
        </div>
      )}
    </OrderBouquetControls>
  );
}
