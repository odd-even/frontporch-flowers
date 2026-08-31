/** Fixed arrangement prices (CAD cents) — source of truth for Square checkout. */
export const PRESENTATION_PRICES_CENTS: Record<string, number> = {
  sleeve: 2500,
  vase: 4500,
  "mason-jar": 1800,
  "gift-bag-posie": 2000,
};

export const QUOTE_ONLY_PRESENTATIONS = new Set(["bucket", "custom"]);

export const PRESENTATION_LABELS: Record<string, string> = {
  sleeve: "In a sleeve",
  vase: "In a vase",
  "mason-jar": "In a mason jar",
  "gift-bag-posie": "Gift bag posie",
  bucket: "In a bucket",
  custom: "Custom",
};

export function getPresentationPriceCents(presentationId: string): number | null {
  return PRESENTATION_PRICES_CENTS[presentationId] ?? null;
}

export function parseBouquetQuantity(quantity: string): number | null {
  if (quantity === "4+") return null;
  const parsed = Number.parseInt(quantity, 10);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 3) return null;
  return parsed;
}

export function canCheckoutBouquet(presentationId: string, quantity: string): boolean {
  if (QUOTE_ONLY_PRESENTATIONS.has(presentationId)) return false;
  if (!getPresentationPriceCents(presentationId)) return false;
  return parseBouquetQuantity(quantity) !== null;
}

export function bouquetOrderTotalCents(
  presentationId: string,
  quantity: string
): number | null {
  const unitCents = getPresentationPriceCents(presentationId);
  const qty = parseBouquetQuantity(quantity);
  if (unitCents == null || qty == null) return null;
  return unitCents * qty;
}

export function formatCents(cents: number, currency = "CAD"): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(cents / 100);
}
