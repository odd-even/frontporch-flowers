import "server-only";

import { randomUUID } from "crypto";
import { unstable_noStore as noStore } from "next/cache";
import { SquareClient, SquareEnvironment, SquareError, type Order } from "square";
import { SITE_URL } from "@/lib/seo";
import type { PickYourOwnEvent } from "@/lib/types";

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

function getSquareClient() {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  if (!token) throw new Error("SQUARE_ACCESS_TOKEN is not set");

  const environment =
    process.env.SQUARE_ENVIRONMENT === "production"
      ? SquareEnvironment.Production
      : SquareEnvironment.Sandbox;

  return new SquareClient({ token, environment });
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
  const locationId = process.env.SQUARE_LOCATION_ID!;
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

  const locationId = process.env.SQUARE_LOCATION_ID!;
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
      const detail =
        error.errors?.map((item) => item.detail || item.code).filter(Boolean).join("; ") ||
        error.message;
      throw new Error(detail || "Square checkout failed.");
    }
    throw error;
  }
}
