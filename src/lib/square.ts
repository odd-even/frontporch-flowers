import "server-only";

import { randomUUID } from "crypto";
import { unstable_noStore as noStore } from "next/cache";
import { SquareClient, SquareEnvironment, SquareError, type Order } from "square";
import { SITE_URL } from "@/lib/seo";
import {
  bouquetOrderTotalCents,
  canCheckoutBouquet,
  getPresentationPriceCents,
  PRESENTATION_LABELS,
} from "@/lib/bouquet-pricing";
import type { PickYourOwnEvent } from "@/lib/types";

export type BouquetCheckoutInput = {
  presentationId: string;
  quantity: number;
  colorLabel: string;
  pickupLabel: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  note?: string;
};

/** Unpaid payment-link orders count toward capacity for this long (in-progress checkouts). */
const OPEN_HOLD_MS = 30 * 60 * 1000;
/** How far back to scan Square orders when tallying event bookings. */
const ORDER_LOOKBACK_MS = 180 * 24 * 60 * 60 * 1000;

export function isSquareConfigured() {
  return Boolean(process.env.SQUARE_ACCESS_TOKEN && process.env.SQUARE_LOCATION_ID);
}

/** Ready to take payment: fixed Square link and/or API credentials. */
export function isEventCheckoutReady(event: PickYourOwnEvent) {
  return Boolean(event.priceCents && (event.squarePaymentLinkUrl || isSquareConfigured()));
}

export function getSiteOrigin() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.NODE_ENV === "development") return "http://localhost:3000";
  return SITE_URL;
}

/** Square referenceId max length is 40 — keep checkout + capacity tally in sync. */
export function eventOrderReferenceId(eventId: string) {
  return eventId.slice(0, 40);
}

export function bouquetOrderReferenceId(presentationId: string) {
  return `bouq-${presentationId}`.slice(0, 40);
}

export function isBouquetCheckoutReady(presentationId: string, quantity: string) {
  return canCheckoutBouquet(presentationId, quantity) && isSquareConfigured();
}

function resolveSquareEnvironment() {
  const configured = process.env.SQUARE_ENVIRONMENT?.trim().toLowerCase();
  if (configured === "production" || configured === "prod") {
    return SquareEnvironment.Production;
  }
  if (configured === "sandbox") {
    return SquareEnvironment.Sandbox;
  }
  // Vercel production should use Square production unless explicitly sandbox.
  if (process.env.VERCEL_ENV === "production") {
    return SquareEnvironment.Production;
  }
  return SquareEnvironment.Sandbox;
}

function getSquareClient() {
  const token = process.env.SQUARE_ACCESS_TOKEN?.trim();
  if (!token) throw new Error("SQUARE_ACCESS_TOKEN is not set");

  return new SquareClient({ token, environment: resolveSquareEnvironment() });
}

function getSquareLocationId() {
  const locationId = process.env.SQUARE_LOCATION_ID?.trim();
  if (!locationId) throw new Error("SQUARE_LOCATION_ID is not set");
  return locationId;
}

function formatSquareError(error: SquareError): string {
  const detail =
    error.errors?.map((item) => item.detail || item.code).filter(Boolean).join("; ") ||
    error.message;

  if (
    error.errors?.some(
      (item) =>
        item.category === "AUTHENTICATION_ERROR" &&
        (item.code === "UNAUTHORIZED" || item.code === "ACCESS_TOKEN_EXPIRED")
    )
  ) {
    const env = resolveSquareEnvironment() === SquareEnvironment.Production ? "production" : "sandbox";
    return (
      `${detail} Check that SQUARE_ACCESS_TOKEN is the Production access token (not the application secret) ` +
      `and SQUARE_ENVIRONMENT matches (${env}).`
    );
  }

  return detail || "Square checkout failed.";
}

export function formatMoneyFromCents(cents: number, currency: string = "CAD") {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function lineItemQuantity(order: Order) {
  return (order.lineItems ?? []).reduce((sum, item) => {
    const qty = Number.parseInt(item.quantity || "0", 10);
    return sum + (Number.isFinite(qty) ? qty : 0);
  }, 0);
}

/**
 * Counts prepaid spots already taken for an event from Square orders:
 * completed (paid) + recent open orders (active checkouts).
 */
export async function countBookedSpotsForEvent(eventId: string): Promise<number> {
  noStore();
  if (!isSquareConfigured()) return 0;

  const client = getSquareClient();
  const locationId = getSquareLocationId();
  const referenceId = eventOrderReferenceId(eventId);
  const lookbackStart = new Date(Date.now() - ORDER_LOOKBACK_MS).toISOString();
  const holdCutoff = Date.now() - OPEN_HOLD_MS;

  let booked = 0;
  let cursor: string | undefined;

  do {
    const response = await client.orders.search({
      locationIds: [locationId],
      cursor,
      limit: 100,
      query: {
        filter: {
          dateTimeFilter: {
            createdAt: { startAt: lookbackStart },
          },
        },
        sort: {
          sortField: "CREATED_AT",
          sortOrder: "DESC",
        },
      },
    });

    for (const order of response.orders ?? []) {
      if (order.referenceId !== referenceId) continue;

      if (order.state === "COMPLETED") {
        booked += lineItemQuantity(order);
        continue;
      }

      // Soft-hold seats while someone is mid-checkout (not abandoned links).
      if (order.state === "OPEN" && order.createdAt) {
        const created = Date.parse(order.createdAt);
        if (Number.isFinite(created) && created >= holdCutoff) {
          booked += lineItemQuantity(order);
        }
      }
    }

    cursor = response.cursor ?? undefined;
  } while (cursor);

  return booked;
}

export async function getEventCapacity(event: PickYourOwnEvent) {
  const capacity = Math.max(0, event.spotsAvailable ?? 0);
  if (!capacity) {
    return { capacity: 0, booked: 0, remaining: 0, soldOut: false };
  }

  let booked = 0;
  try {
    booked = await countBookedSpotsForEvent(event._id);
  } catch (error) {
    console.error("Square capacity lookup failed:", error);
    // Fail open on the public page so a Square blip doesn't hide the event.
  }

  const remaining = Math.max(0, capacity - booked);
  return {
    capacity,
    booked,
    remaining,
    soldOut: remaining <= 0,
  };
}

export async function createEventCheckoutLink({
  event,
  quantity,
  customerName,
  customerEmail,
}: {
  event: PickYourOwnEvent;
  quantity: number;
  customerName?: string;
  customerEmail?: string;
}): Promise<{ url: string; paymentLinkId?: string }> {
  if (event.squarePaymentLinkUrl) {
    return { url: event.squarePaymentLinkUrl };
  }

  if (!isSquareConfigured()) {
    throw new Error("Square payments are not configured yet.");
  }

  const priceCents = event.priceCents;
  if (!priceCents || priceCents <= 0) {
    throw new Error("This event does not have a prepaid price set.");
  }

  const locationId = getSquareLocationId();
  const currency = event.currency || "CAD";
  const origin = getSiteOrigin();
  const client = getSquareClient();

  const lineName = `${event.title} (prepaid)`;
  const whenNote = `${event.date} · ${event.startTime} – ${event.endTime}`;
  const guestNote = customerName?.trim()
    ? `Guest: ${customerName.trim()}`
    : undefined;

  try {
    const response = await client.checkout.paymentLinks.create({
      idempotencyKey: randomUUID(),
      description: `${lineName} · ${whenNote}`,
      order: {
        locationId,
        referenceId: eventOrderReferenceId(event._id),
        lineItems: [
          {
            name: lineName,
            quantity: String(quantity),
            note: [whenNote, guestNote].filter(Boolean).join(" · "),
            basePriceMoney: {
              amount: BigInt(priceCents),
              currency,
            },
          },
        ],
      },
      checkoutOptions: {
        allowTipping: false,
        askForShippingAddress: false,
        redirectUrl: `${origin}/events/booked?event=${encodeURIComponent(event._id)}`,
      },
      paymentNote: `Front Porch Flowers · ${lineName} × ${quantity}`,
      prePopulatedData: {
        ...(customerEmail ? { buyerEmail: customerEmail.trim() } : {}),
        // Nudge Square Checkout toward Canada for phone/address defaults
        buyerAddress: {
          country: "CA",
          administrativeDistrictLevel1: "NB",
          locality: "Bedell",
        },
      },
    });

    const url = response.paymentLink?.url;
    if (!url) {
      throw new Error("Square did not return a checkout URL.");
    }

    return {
      url,
      paymentLinkId: response.paymentLink?.id,
    };
  } catch (error) {
    if (error instanceof SquareError) {
      throw new Error(formatSquareError(error));
    }
    throw error;
  }
}

export async function createBouquetCheckoutLink(
  input: BouquetCheckoutInput
): Promise<{ url: string; paymentLinkId?: string }> {
  if (!isSquareConfigured()) {
    throw new Error("Square payments are not configured yet.");
  }

  const unitCents = getPresentationPriceCents(input.presentationId);
  if (!unitCents || unitCents <= 0) {
    throw new Error("This arrangement does not have a prepaid price set.");
  }

  const quantityLabel = String(input.quantity);
  const totalCents = bouquetOrderTotalCents(input.presentationId, quantityLabel);
  if (totalCents == null || totalCents <= 0) {
    throw new Error("Could not calculate order total.");
  }

  const locationId = getSquareLocationId();
  const currency = "CAD";
  const origin = getSiteOrigin();
  const client = getSquareClient();
  const presentationLabel =
    PRESENTATION_LABELS[input.presentationId] || input.presentationId;
  const lineName = `${presentationLabel} bouquet (prepaid)`;

  const detailNote = [
    `Pickup: ${input.pickupLabel}`,
    `Colour: ${input.colorLabel}`,
    input.customerPhone?.trim() ? `Phone: ${input.customerPhone.trim()}` : null,
    input.note?.trim() ? input.note.trim() : null,
  ]
    .filter(Boolean)
    .join(" · ");

  try {
    const response = await client.checkout.paymentLinks.create({
      idempotencyKey: randomUUID(),
      description: `${lineName} × ${input.quantity}`,
      order: {
        locationId,
        referenceId: bouquetOrderReferenceId(input.presentationId),
        lineItems: [
          {
            name: lineName,
            quantity: quantityLabel,
            note: detailNote,
            basePriceMoney: {
              amount: BigInt(unitCents),
              currency,
            },
          },
        ],
      },
      checkoutOptions: {
        allowTipping: false,
        askForShippingAddress: false,
        redirectUrl: `${origin}/bouquets/thanks?presentation=${encodeURIComponent(input.presentationId)}&quantity=${encodeURIComponent(quantityLabel)}`,
      },
      paymentNote: `Front Porch Flowers · ${lineName} × ${input.quantity}`,
      prePopulatedData: {
        buyerEmail: input.customerEmail.trim(),
        buyerAddress: {
          country: "CA",
          administrativeDistrictLevel1: "NB",
          locality: "Bedell",
        },
      },
    });

    const url = response.paymentLink?.url;
    if (!url) {
      throw new Error("Square did not return a checkout URL.");
    }

    return {
      url,
      paymentLinkId: response.paymentLink?.id,
    };
  } catch (error) {
    if (error instanceof SquareError) {
      throw new Error(formatSquareError(error));
    }
    throw error;
  }
}
