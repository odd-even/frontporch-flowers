/**
 * Front Porch Flowers brand palette — sampled from public/brand/gradient.png.
 * Semantic tokens in globals.css map to these; keep values in sync when editing.
 */
export const BRAND_GRADIENT = {
  /** Top-left — soft coral */
  pink: "#e99695",
  /** Top-right — pale butter */
  yellow: "#e8e2b0",
  /** Bottom-left — powder sky blue */
  blue: "#9fc4d8",
  /** Bottom-center — powder teal */
  teal: "#b2d2d0",
  /** Bottom-right — muted sage */
  green: "#a8c1af",
} as const;

/** Semantic colors derived from the gradient mesh */
export const BRAND_COLORS = {
  cream: "#faf6f0",
  creamDark: "#f0ebe0",

  sage: "#8fa896",
  sageDark: "#6d8574",
  sageLight: BRAND_GRADIENT.green,

  terracotta: "#c97a6b",
  terracottaDark: "#a86255",

  dustyRose: "#dba8a6",

  warmBrown: "#5c4a3d",
  charcoal: "#2d2926",
  moss: "#5c7564",
} as const;

export type BrandGradientKey = keyof typeof BRAND_GRADIENT;
export type BrandColorKey = keyof typeof BRAND_COLORS;

/** CSS custom property names (Tailwind theme tokens) */
export const BRAND_CSS_VARS = {
  cream: "--color-cream",
  creamDark: "--color-cream-dark",
  sage: "--color-sage",
  sageDark: "--color-sage-dark",
  sageLight: "--color-sage-light",
  terracotta: "--color-terracotta",
  terracottaDark: "--color-terracotta-dark",
  dustyRose: "--color-dusty-rose",
  warmBrown: "--color-warm-brown",
  charcoal: "--color-charcoal",
  moss: "--color-moss",
  brandPink: "--color-brand-pink",
  brandYellow: "--color-brand-yellow",
  brandBlue: "--color-brand-blue",
  brandTeal: "--color-brand-teal",
  brandGreen: "--color-brand-green",
} as const;
