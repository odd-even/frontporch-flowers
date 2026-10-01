import { NextResponse } from "next/server";
import { WebhooksHelper, type Payment } from "square";
import { notifyPaidSquareOrder } from "@/lib/square-paid-notify";
import { getSiteOrigin, isSquareConfigured } from "@/lib/square";

export const runtime = "nodejs";

type SquareWebhookPayload = {
  type?: string;
  data?: {
    type?: string;
    id?: string;
    object?: {
      // SDK camelCase (rare) + webhook snake_case (actual)
      payment?: Payment & {
        order_id?: string;
        buyer_email_address?: string;
      };
      order_updated?: {
        order_id?: string;
        orderId?: string;
        state?: string;
      };
      orderUpdated?: {
        orderId?: string;
        state?: string;
      };
    };
  };
};

function webhookNotificationUrl() {
  return (
    process.env.SQUARE_WEBHOOK_NOTIFICATION_URL?.trim() ||
    `${getSiteOrigin()}/api/square/webhook`
  );
}

function webhookSignatureKey() {
  return (
    process.env.SQUARE_WEBHOOK_SIGNATURE_KEY?.trim() ||
    process.env.SQUARE_WEBHOOK_SIGNATURE?.trim() ||
    ""
  );
}

function normalizePayment(payment: unknown): Payment | null {
  if (!payment || typeof payment !== "object") return null;
  const raw = payment as Payment & {
    order_id?: string;
    buyer_email_address?: string;
  };
  return {
    ...raw,
    orderId: raw.orderId || raw.order_id,
    buyerEmailAddress: raw.buyerEmailAddress || raw.buyer_email_address,
  };
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-square-hmacsha256-signature") || "";
  const signatureKey = webhookSignatureKey();
  const notificationUrl = webhookNotificationUrl();

  if (!signatureKey) {
    console.error("Square webhook rejected: SQUARE_WEBHOOK_SIGNATURE_KEY is not set");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  let valid = false;
  try {
    valid = await WebhooksHelper.verifySignature({
      requestBody: rawBody,
      signatureHeader: signature,
      signatureKey,
      notificationUrl,
    });
  } catch (error) {
    console.error("Square webhook signature check failed:", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 403 });
  }

  if (!valid) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 403 });
  }

  let payload: SquareWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as SquareWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const type = payload.type || "";

  try {
    if (type === "payment.updated" || type === "payment.created") {
      const payment = normalizePayment(payload.data?.object?.payment);
      if (
        payment &&
        (payment.status === "COMPLETED" || payment.status === "APPROVED")
      ) {
        if (!isSquareConfigured()) {
          return NextResponse.json({ ok: true, skipped: "square_not_configured" });
        }
        const result = await notifyPaidSquareOrder({ payment });
        return NextResponse.json({ ok: true, ...result });
      }
    }

    if (type === "order.updated") {
      const orderId =
        payload.data?.object?.order_updated?.order_id ||
        payload.data?.object?.order_updated?.orderId ||
        payload.data?.object?.orderUpdated?.orderId ||
        payload.data?.id;
      if (orderId && isSquareConfigured()) {
        const result = await notifyPaidSquareOrder({ orderId });
        return NextResponse.json({ ok: true, ...result });
      }
    }

    return NextResponse.json({ ok: true, skipped: "unhandled_event" });
  } catch (error) {
    console.error("Square webhook handler error:", error);
    // Return 500 so Square retries — better a delayed email than a missed booking.
    return NextResponse.json({ error: "Handler failed." }, { status: 500 });
  }
}
