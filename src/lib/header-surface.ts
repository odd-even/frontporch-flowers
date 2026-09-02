import type { CSSProperties } from "react";
import { BRAND_COLORS } from "@/lib/brand-colors";
import { gradientColorAtProgress, sectionScrollProgress } from "@/lib/brand-gradient";

export type HeaderSurface = "hero" | "light" | "dark" | "follow" | "gradient";

export type HeaderSurfaceState = {
  surface: HeaderSurface;
  accentColor: string;
  overImage: boolean;
  /** 0 = frosted over image, 1 = solid opaque color */
  solidMix: number;
  /** 0 = hero dark tint, 1 = cream tint (image zones only) */
  imageTintMix: number;
};

const HOME_SURFACE_BY_SELECTOR: Record<string, HeaderSurface> = {
  '[data-header-zone="hero"]': "hero",
  "#about": "light",
  "#bouquets": "light",
  "#events": "light",
  "#follow": "follow",
  footer: "dark",
};

const IMAGE_ZONE_SELECTORS = new Set(['[data-header-zone="hero"]']);

const HOME_ZONE_SELECTORS = Object.keys(HOME_SURFACE_BY_SELECTOR);

const ZONE_BLEND_PX = 14;

function adjacentZoneSelector(selector: string, direction: "next" | "prev"): string | null {
  const index = HOME_ZONE_SELECTORS.indexOf(selector);
  if (index < 0) return null;
  const nextIndex = direction === "next" ? index + 1 : index - 1;
  return HOME_ZONE_SELECTORS[nextIndex] ?? null;
}

function zoneAtProbe(probeViewportY: number): { selector: string; element: Element } | null {
  for (const selector of HOME_ZONE_SELECTORS) {
    const element = document.querySelector(selector);
    if (!element) continue;

    const rect = element.getBoundingClientRect();
    if (rect.top <= probeViewportY && rect.bottom > probeViewportY) {
      return { selector, element };
    }
  }

  return null;
}

function computeSolidMix(
  probeViewportY: number,
  zone: { selector: string; element: Element } | null
): number {
  if (!zone) return 1;

  const rect = zone.element.getBoundingClientRect();

  if (IMAGE_ZONE_SELECTORS.has(zone.selector)) {
    return 0;
  }

  const prevSelector = adjacentZoneSelector(zone.selector, "prev");
  if (prevSelector && IMAGE_ZONE_SELECTORS.has(prevSelector)) {
    const distanceFromTop = probeViewportY - rect.top;
    if (distanceFromTop < ZONE_BLEND_PX) {
      return distanceFromTop / ZONE_BLEND_PX;
    }
  }

  return 1;
}

function computeImageTintMix(
  probeViewportY: number,
  zone: { selector: string; element: Element } | null
): number {
  if (!zone) return 1;

  const rect = zone.element.getBoundingClientRect();

  if (zone.selector === '[data-header-zone="hero"]') {
    const nextSelector = adjacentZoneSelector(zone.selector, "next");
    if (nextSelector === "#about") {
      const distanceToBottom = rect.bottom - probeViewportY;
      if (distanceToBottom < ZONE_BLEND_PX) {
        return 1 - distanceToBottom / ZONE_BLEND_PX;
      }
    }
    return 0;
  }

  if (zone.selector === "#about") {
    return 1;
  }

  return 1;
}

export function resolveHeaderSurface(probeViewportY: number): HeaderSurfaceState {
  const zone = zoneAtProbe(probeViewportY);
  const solidMix = computeSolidMix(probeViewportY, zone);
  const imageTintMix = computeImageTintMix(probeViewportY, zone);

  if (!zone) {
    return {
      surface: "light",
      accentColor: BRAND_COLORS.cream,
      overImage: false,
      solidMix: 1,
      imageTintMix: 1,
    };
  }

  const surface = HOME_SURFACE_BY_SELECTOR[zone.selector] ?? "light";
  const overImage = IMAGE_ZONE_SELECTORS.has(zone.selector);

  if (surface === "gradient" && zone.element instanceof HTMLElement) {
    return {
      surface,
      overImage: false,
      solidMix,
      imageTintMix,
      accentColor: gradientColorAtProgress(sectionScrollProgress(zone.element)),
    };
  }

  if (surface === "dark" || surface === "follow") {
    return {
      surface,
      overImage: false,
      solidMix,
      imageTintMix,
      accentColor: BRAND_COLORS.cream,
    };
  }

  if (surface === "hero") {
    return {
      surface,
      overImage: true,
      solidMix,
      imageTintMix,
      accentColor: BRAND_COLORS.cream,
    };
  }

  return {
    surface,
    overImage,
    solidMix,
    imageTintMix,
    accentColor: gradientColorAtProgress(
      Math.min(1, Math.max(0, window.scrollY / Math.max(1, document.documentElement.scrollHeight)))
    ),
  };
}

export function headerUsesLightText(surface: HeaderSurface, solidMix = 0) {
  if (surface === "hero") return true;
  if (surface === "dark" || surface === "follow" || surface === "gradient") return true;
  if (solidMix < 0.35) return true;
  return false;
}

export function headerImageBackgroundStyle(
  state: HeaderSurfaceState
): CSSProperties {
  const mix = Math.min(1, Math.max(0, state.imageTintMix));
  const overlayStrength = 32 + mix * 56;

  return {
    backgroundColor: `color-mix(in srgb, color-mix(in srgb, var(--color-charcoal) ${Math.round((1 - mix) * 100)}%, var(--color-cream)) ${Math.round(overlayStrength)}%, transparent)`,
  };
}

export function headerOpaqueBackgroundStyle(state: HeaderSurfaceState): CSSProperties {
  switch (state.surface) {
    case "hero":
    case "light":
      return { backgroundColor: "var(--color-cream)" };
    case "dark":
      return { backgroundColor: "var(--color-deep-blue-green)" };
    case "follow":
      return { backgroundColor: "var(--color-follow-band)" };
    case "gradient":
      return {
        backgroundColor: `color-mix(in srgb, ${state.accentColor} 36%, var(--color-deep-blue-green) 64%)`,
      };
  }
}

export function headerBorderClass(
  surface: HeaderSurface,
  solidMix: number,
  imageTintMix: number
) {
  if (surface === "dark" || surface === "follow" || surface === "gradient") {
    return "border-cream/15";
  }
  if (solidMix < 0.35) {
    return imageTintMix < 0.5 ? "border-cream/10" : "border-sage/10";
  }
  return "border-sage/20";
}
