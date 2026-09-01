"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { gradientColorAtProgress, scrollColorProgress } from "@/lib/brand-gradient";
import { BRAND_GRADIENT } from "@/lib/brand-colors";
import type { HeaderSurface } from "@/lib/header-surface";
import {
  HOME_SECTIONS,
  type HomeSectionId,
} from "@/lib/home-sections";

const SPRING_EASE = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const SCROLL_OFFSET = 100;

function pillBackground(color: string, navTheme: HeaderSurface, solid = false) {
  const mix = solid
    ? 82
    : navTheme === "hero" || navTheme === "gradient" || navTheme === "dark" || navTheme === "follow"
      ? 44
      : 28;
  return `color-mix(in srgb, ${color} ${mix}%, transparent)`;
}

function navLinkClass(
  isActive: boolean,
  lightNavText: boolean,
  sectionId: HomeSectionId,
  navTheme: HeaderSurface
) {
  if (isActive && navTheme === "follow" && sectionId === "follow") {
    return "text-charcoal";
  }
  if (lightNavText) {
    return isActive ? "text-cream" : "text-cream/70 hover:text-cream";
  }
  return isActive ? "text-charcoal" : "text-warm-brown hover:text-terracotta";
}

interface SectionNavProps {
  isHome: boolean;
  navTheme: HeaderSurface;
  lightNavText?: boolean;
  surfaceAccent?: string;
  onNavigate?: () => void;
  variant?: "desktop" | "mobile";
}

function sectionActivationLine(sectionId: HomeSectionId): number {
  if (sectionId === "about") return window.innerHeight;
  return SCROLL_OFFSET;
}

function isSectionActive(sectionId: HomeSectionId, top: number): boolean {
  const line = sectionActivationLine(sectionId);
  if (sectionId === "about") return top < line;
  return top <= line;
}

function getActiveSection(): HomeSectionId | null {
  let current: HomeSectionId | null = null;

  for (const section of HOME_SECTIONS) {
    const el = document.getElementById(section.id);
    if (!el) continue;

    const top = el.getBoundingClientRect().top;
    if (isSectionActive(section.id, top)) {
      current = section.id;
    }
  }

  return current;
}

export function SectionNav({
  isHome,
  navTheme,
  lightNavText = false,
  surfaceAccent,
  onNavigate,
  variant = "desktop",
}: SectionNavProps) {
  const [activeId, setActiveId] = useState<HomeSectionId | null>(null);
  const [pill, setPill] = useState({ left: 0, width: 0 });
  const [scrollAccent, setScrollAccent] = useState(gradientColorAtProgress(0));
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<HomeSectionId, HTMLElement>());

  const followActiveOnDark = navTheme === "follow" && activeId === "follow";

  const pillColor =
    navTheme === "gradient" && surfaceAccent
      ? surfaceAccent
      : followActiveOnDark
        ? BRAND_GRADIENT.teal
        : navTheme === "dark" || navTheme === "follow"
          ? "#faf6f0"
          : scrollAccent;

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

  const updateScrollAccent = useCallback(() => {
    if (!isHome || navTheme === "gradient" || navTheme === "dark" || navTheme === "follow") return;
    setScrollAccent(gradientColorAtProgress(scrollColorProgress()));
  }, [isHome, navTheme]);

  useEffect(() => {
    if (!isHome) return;

    updateActive();
    updateScrollAccent();

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        updateActive();
        updateScrollAccent();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updatePill);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updatePill);
    };
  }, [isHome, updateActive, updateScrollAccent, updatePill]);

  useEffect(() => {
    updatePill();
  }, [activeId, navTheme, updatePill]);

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
        className="absolute inset-y-0 rounded-button pointer-events-none"
        style={{
          left: pill.left,
          width: pill.width,
          opacity: pill.width > 0 ? 1 : 0,
          backgroundColor: pillBackground(pillColor, navTheme, followActiveOnDark),
          transition: `left 320ms ${SPRING_EASE}, width 320ms ${SPRING_EASE}, opacity 180ms ease, background-color 120ms linear`,
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
            className={`relative z-10 px-3 py-1.5 text-sm font-medium tracking-wide rounded-button whitespace-nowrap transition-colors duration-200 ${navLinkClass(isActive, lightNavText, section.id, navTheme)}`}
          >
            {section.label}
          </Link>
        );
      })}
    </div>
  );
}
