"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  HOME_SECTIONS,
  type HomeSectionId,
} from "@/lib/home-sections";

const SPRING_EASE = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const SCROLL_OFFSET = 100;

interface SectionNavProps {
  isHome: boolean;
  onHero: boolean;
  onNavigate?: () => void;
  variant?: "desktop" | "mobile";
}

function getActiveSection(): HomeSectionId | null {
  const scrollPos = window.scrollY + SCROLL_OFFSET;
  let current: HomeSectionId | null = null;

  for (const section of [...HOME_SECTIONS].reverse()) {
    const el = document.getElementById(section.id);
    if (el && el.offsetTop <= scrollPos) {
      current = section.id;
      break;
    }
  }

  return current;
}

export function SectionNav({
  isHome,
  onHero,
  onNavigate,
  variant = "desktop",
}: SectionNavProps) {
  const [activeId, setActiveId] = useState<HomeSectionId | null>(null);
  const [pill, setPill] = useState({ left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<HomeSectionId, HTMLElement>());

  const updateActive = useCallback(() => {
    if (!isHome) return;
    setActiveId(getActiveSection());
  }, [isHome]);

  const updatePill = useCallback(() => {
    if (!isHome || variant !== "desktop" || !activeId) {
      setPill({ left: 0, width: 0 });
      return;
    }

    const container = containerRef.current;
    const item = itemRefs.current.get(activeId);
    if (!container || !item) return;

    const containerRect = container.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    setPill({
      left: itemRect.left - containerRect.left,
      width: itemRect.width,
    });
  }, [activeId, isHome, variant]);

  useEffect(() => {
    if (!isHome) return;

    updateActive();

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateActive);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updatePill);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updatePill);
    };
  }, [isHome, updateActive, updatePill]);

  useEffect(() => {
    updatePill();
  }, [activeId, onHero, updatePill]);

  const scrollTo = (id: HomeSectionId) => {
    setActiveId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    onNavigate?.();
  };

  if (variant === "mobile") {
    return (
      <>
        {HOME_SECTIONS.map((section) => {
          const isActive = isHome && activeId === section.id;
          const href = isHome ? `#${section.id}` : `/#${section.id}`;

          if (isHome) {
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => scrollTo(section.id)}
                className={`font-display text-4xl sm:text-5xl py-3 text-left transition-colors ${
                  isActive ? "text-terracotta" : "text-charcoal hover:text-terracotta"
                }`}
              >
                {section.label}
              </button>
            );
          }

          return (
            <Link
              key={section.id}
              href={href}
              onClick={onNavigate}
              className="font-display text-4xl sm:text-5xl py-3 text-charcoal hover:text-terracotta transition-colors"
            >
              {section.label}
            </Link>
          );
        })}
      </>
    );
  }

  return (
    <div ref={containerRef} className="relative flex items-center">
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 rounded-full pointer-events-none ${
          onHero ? "bg-cream/22" : "bg-sage/15"
        }`}
        style={{
          left: pill.left,
          width: pill.width,
          opacity: pill.width > 0 ? 1 : 0,
          transition: `left 320ms ${SPRING_EASE}, width 320ms ${SPRING_EASE}, opacity 180ms ease`,
        }}
      />
      {HOME_SECTIONS.map((section) => {
        const isActive = isHome && activeId === section.id;
        const href = isHome ? `#${section.id}` : `/#${section.id}`;

        return (
          <Link
            key={section.id}
            ref={(node) => {
              if (node) itemRefs.current.set(section.id, node);
              else itemRefs.current.delete(section.id);
            }}
            href={href}
            onClick={(event) => {
              if (isHome) {
                event.preventDefault();
                scrollTo(section.id);
              } else {
                onNavigate?.();
              }
            }}
            className={`relative z-10 px-3 py-1.5 text-sm font-medium tracking-wide rounded-full whitespace-nowrap transition-colors duration-200 ${
              onHero
                ? isActive
                  ? "text-cream"
                  : "text-cream/70 hover:text-cream"
                : isActive
                  ? "text-charcoal"
                  : "text-warm-brown hover:text-terracotta"
            }`}
          >
            {section.label}
          </Link>
        );
      })}
    </div>
  );
}
