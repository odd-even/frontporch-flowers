import { BRAND_GRADIENT } from "@/lib/brand-colors";

export const BRAND_GRADIENT_STOPS = [
  BRAND_GRADIENT.pink,
  BRAND_GRADIENT.yellow,
  BRAND_GRADIENT.blue,
  BRAND_GRADIENT.teal,
  BRAND_GRADIENT.green,
] as const;

function hexToRgb(hex: string) {
  const value = parseInt(hex.slice(1), 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function lerpChannel(start: number, end: number, amount: number) {
  return Math.round(start + (end - start) * amount);
}

export function gradientColorAtProgress(progress: number) {
  const scaled = progress * (BRAND_GRADIENT_STOPS.length - 1);
  const index = Math.min(BRAND_GRADIENT_STOPS.length - 2, Math.floor(scaled));
  const amount = scaled - index;
  const from = hexToRgb(BRAND_GRADIENT_STOPS[index]);
  const to = hexToRgb(BRAND_GRADIENT_STOPS[index + 1]);

  return `rgb(${lerpChannel(from.r, to.r, amount)} ${lerpChannel(from.g, to.g, amount)} ${lerpChannel(from.b, to.b, amount)})`;
}

export function scrollColorProgress() {
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  return Math.min(1, Math.max(0, window.scrollY / max));
}

export function sectionScrollProgress(section: HTMLElement) {
  const rect = section.getBoundingClientRect();
  const travel = section.offsetHeight + window.innerHeight;
  if (travel <= 0) return 0;
  return Math.min(1, Math.max(0, (window.innerHeight - rect.top) / travel));
}
