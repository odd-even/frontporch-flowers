import "server-only";

import type { Order, Payment } from "square";
import {
  buildBouquetCustomerReceiptHtml,
  buildBouquetCustomerReceiptMessage,
  buildBouquetOrderEmailMessage,
  buildBouquetPaidEmailHtml,
  buildWorkshopBookingEmailMessage,
  buildWorkshopCustomerReceiptHtml,
  buildWorkshopCustomerReceiptMessage,
  buildWorkshopPaidEmailHtml,
  sendCustomerReceiptEmail,
  sendSiteNotificationEmail,
} from "@/lib/bouquet-request.server";
import { formatCents, PRESENTATION_LABELS } from "@/lib/bouquet-pricing";
import { getPickYourOwnEvents } from "@/lib/queries";
import {
  bouquetOrderReferenceId,
  eventOrderReferenceId,
  formatMoneyFromCents,
  getSquareClient,
  isSquareConfigured,
} from "@/lib/square";
import { fallbackEvents } from "@/lib/types";
import { formatDate } from "@/lib/utils";

/** Avoid duplicate emails within a warm serverless instance. */
const notifiedKeys = new Set<string>();

function lineItemQuantity(order: Order) {
  return (order.lineItems ?? []).reduce((sum, item) => {
    const qty = Number.parseInt(item.quantity || "0", 10);
    return sum + (Number.isFinite(qty) ? qty : 0);
  }, 0);
}

function meta(order: Order, key: string) {
  const value = order.metadata?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function guestFromLineNote(order: Order) {
  for (const item of order.lineItems ?? []) {
    const match = item.note?.match(/Guest:\s*([^·]+)/i);
    if (match?.[1]?.trim()) return match[1].trim();
  }
  return "";
}

function orderIsPaid(order: Order) {
  if (order.state === "COMPLETED") return true;
  if (order.state === "OPEN" && (order.tenders?.length ?? 0) > 0) return true;
  return false;
}

async function retrieveOrder(orderId: string): Promise<Order | null> {
  const client = getSquareClient();
  const response = await client.orders.get({ orderId });
  return response.order ?? null;
}

async function markOrderNotified(order: Order, paymentId?: string) {
  if (!order.id || !order.locationId || order.version == null) return;
  try {
    const client = getSquareClient();
    await client.orders.update({
      orderId: order.id,
      order: {
        locationId: order.locationId,
        version: order.version,
        metadata: {
          ...(order.metadata || {}),
          fp_notified: "1",
          ...(paymentId ? { fp_pay_id: paymentId.slice(0, 40) } : {}),
        },
      },
    });
  } catch (error) {
    // Non-fatal — in-memory dedupe still covers most retries.
    console.error("Could not mark Square order notified:", error);
  }
}

async function notifyWorkshopPaid(
  order: Order,
  payment?: Payment | null,
  paymentId?: string
) {
  const upcoming = await getPickYourOwnEvents();
  const events = [...upcoming, ...fallbackEvents];
  const eventId = meta(order, "fp_event") || order.referenceId || "";
  const event =
    events.find((item) => item._id === eventId) ||
    events.find((item) => eventOrderReferenceId(item._id) === order.referenceId);

  const quantity = Math.max(1, lineItemQuantity(order));
  const totalCents = Number(order.totalMoney?.amount ?? 0);
  const currency = order.totalMoney?.currency || event?.currency || "CAD";
  const totalLabel =
    totalCents > 0
      ? formatMoneyFromCents(totalCents, currency)
      : event?.priceCents
        ? formatMoneyFromCents(event.priceCents * quantity, currency)
        : "paid";

  const customerName =
    meta(order, "fp_name") || guestFromLineNote(order) || "Workshop guest";
  const customerEmail =
    meta(order, "fp_email") ||
    payment?.buyerEmailAddress?.trim() ||
    "";

  if (!customerEmail) {
    console.error("Paid workshop order missing customer email:", order.id);
    return;
  }

  const eventTitle =
    meta(order, "fp_title") || event?.title || "Workshop booking";
  const eventDateLabel = event ? formatDate(event.date) : meta(order, "fp_when");
  const eventTimeLabel = event
    ? `${event.startTime} – ${event.endTime}`
    : "See Square receipt";

  const booking = {
    eventTitle,
    eventId: event?._id || eventId,
    eventDateLabel: eventDateLabel || "See Square receipt",
    eventTimeLabel,
    quantity,
    totalLabel,
    currency,
    squarePaymentLinkId: paymentId || order.id,
  };

  const guest = { ...booking, customerName, customerEmail };

  await sendSiteNotificationEmail({
    subject: `Workshop booked (paid): ${eventTitle} — ${totalLabel}`,
    message: buildWorkshopBookingEmailMessage(booking),
    html: buildWorkshopPaidEmailHtml(guest),
    customerName,
    customerEmail,
  });

  try {
    await sendCustomerReceiptEmail({
      subject: `You're booked: ${eventTitle}`,
      message: buildWorkshopCustomerReceiptMessage(guest),
      html: buildWorkshopCustomerReceiptHtml(guest),
      customerName,
      customerEmail,
    });
  } catch (error) {
    console.error("Customer workshop receipt failed:", error);
  }
}

async function notifyBouquetPaid(
  order: Order,
  payment?: Payment | null,
  paymentId?: string
) {
  const presentationId =
    meta(order, "fp_pres") ||
    (order.referenceId?.startsWith("bouq-")
      ? order.referenceId.replace(/^bouq-/, "")
      : "");
  const presentationLabel =
    PRESENTATION_LABELS[presentationId] ||
    order.lineItems?.[0]?.name?.replace(/\s*\(prepaid\)\s*$/i, "") ||
    "Bouquet";

  const quantity = String(Math.max(1, lineItemQuantity(order)));
  const totalCents = Number(order.totalMoney?.amount ?? 0);
  const totalLabel =
    totalCents > 0 ? formatCents(totalCents) : formatCents(0);
  const unitCents =
    totalCents > 0 ? Math.round(totalCents / Math.max(1, Number(quantity))) : 0;

  const customerName = meta(order, "fp_name") || "Bouquet customer";
  const customerEmail =
    meta(order, "fp_email") || payment?.buyerEmailAddress?.trim() || "";
  const customerPhone = meta(order, "fp_phone");
  const colorLabel = meta(order, "fp_color") || "Surprise me";
  const pickupLabel = meta(order, "fp_pickup") || "See order note";
  const note = meta(order, "fp_note");

  if (!customerEmail) {
    console.error("Paid bouquet order missing customer email:", order.id);
    return;
  }

  const orderDetails = {
    presentationLabel,
    presentationId,
    unitPriceLabel: unitCents > 0 ? formatCents(unitCents) : undefined,
    quantity,
    colorLabel,
    pickupLabel,
    note,
    payment: {
      totalLabel,
      squarePaymentLinkId: paymentId || order.id,
    },
  };

  const guestOrder = {
    ...orderDetails,
    customerName,
    customerEmail,
    customerPhone,
  };

  await sendSiteNotificationEmail({
    subject: `Bouquet order (paid): ${presentationLabel} — ${totalLabel}`,
    message: buildBouquetOrderEmailMessage(orderDetails),
    html: buildBouquetPaidEmailHtml(guestOrder),
    customerName,
    customerEmail,
    customerPhone,
  });

  try {
    await sendCustomerReceiptEmail({
      subject: `Order confirmed: ${presentationLabel}`,
      message: buildBouquetCustomerReceiptMessage(guestOrder),
      html: buildBouquetCustomerReceiptHtml(guestOrder),
      customerName,
      customerEmail,
    });
  } catch (error) {
    console.error("Customer bouquet receipt failed:", error);
  }
}

/**
 * Send Rhoda a notification for a paid Square order (workshop or bouquet).
 * Idempotent across webhook retries via order metadata + in-memory keys.
 */
export async function notifyPaidSquareOrder(options: {
  orderId?: string | null;
  payment?: Payment | null;
}): Promise<{ notified: boolean; reason?: string }> {
  if (!isSquareConfigured()) {
    return { notified: false, reason: "square_not_configured" };
  }

  const payment = options.payment ?? null;
  const paymentId = payment?.id || undefined;
  const orderId = options.orderId || payment?.orderId || undefined;
  if (!orderId) {
    return { notified: false, reason: "missing_order_id" };
  }

  const dedupeKey = paymentId || orderId;
  if (notifiedKeys.has(dedupeKey)) {
    return { notified: false, reason: "already_notified" };
  }

  const order = await retrieveOrder(orderId);
  if (!order) {
    return { notified: false, reason: "order_not_found" };
  }

  if (meta(order, "fp_notified") === "1") {
    notifiedKeys.add(dedupeKey);
    return { notified: false, reason: "already_notified" };
  }

  const paymentCompleted =
    !payment || payment.status === "COMPLETED" || payment.status === "APPROVED";
  if (!paymentCompleted || !orderIsPaid(order)) {
    return { notified: false, reason: "not_paid_yet" };
  }

  const kind = meta(order, "fp_kind");
  const referenceId = order.referenceId || "";
  const isWorkshop =
    kind === "workshop" ||
    (!kind &&
      !referenceId.startsWith("bouq-") &&
      Boolean(referenceId));
  const isBouquet =
    kind === "bouquet" || referenceId.startsWith("bouq-");

  if (!isWorkshop && !isBouquet) {
    return { notified: false, reason: "unrelated_order" };
  }

  // Reserve the key before sending so parallel webhooks don't double-send.
  notifiedKeys.add(dedupeKey);

  try {
    if (isBouquet) {
      await notifyBouquetPaid(order, payment, paymentId);
    } else {
      await notifyWorkshopPaid(order, payment, paymentId);
    }
    await markOrderNotified(order, paymentId);
    return { notified: true };
  } catch (error) {
    notifiedKeys.delete(dedupeKey);
    throw error;
  }
}

export function isWorkshopReferenceId(referenceId: string | undefined | null) {
  if (!referenceId) return false;
  if (referenceId.startsWith("bouq-")) return false;
  return true;
}

export function matchesBouquetPresentation(
  referenceId: string | undefined | null,
  presentationId: string
) {
  return referenceId === bouquetOrderReferenceId(presentationId);
}
