import "server-only";

import { notifyPaidSquareOrder } from "@/lib/square-paid-notify";
import { firstQueryValue } from "@/lib/utils";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * After Square redirects the buyer here with ?orderId=, confirm the order is paid
 * via the Square Orders API and email Rhoda. Retries briefly while payment settles.
 */
export async function notifyPaidOrderFromThanks(searchParams: {
  orderId?: string | string[];
  order_id?: string | string[];
}) {
  const orderId =
    firstQueryValue(searchParams.orderId) ||
    firstQueryValue(searchParams.order_id);
  if (!orderId) return;

  // Payment can lag a moment behind the redirect.
  const attempts = [0, 1200, 2500];
  for (const delay of attempts) {
    if (delay) await sleep(delay);
    try {
      const result = await notifyPaidSquareOrder({ orderId });
      if (result.notified || result.reason === "already_notified") return;
      if (result.reason !== "not_paid_yet") return;
    } catch (error) {
      console.error("Thanks-page paid notify failed:", error);
      return;
    }
  }
}
