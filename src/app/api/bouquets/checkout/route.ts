import { NextResponse } from "next/server";
import {
  bouquetOrderTotalCents,
  canCheckoutBouquet,
  formatCents,
  getPresentationPriceCents,
  PRESENTATION_LABELS,
  parseBouquetQuantity,
} from "@/lib/bouquet-pricing";
import {
  buildBouquetOrderEmailMessage,
  sendBouquetRequestEmail,
} from "@/lib/bouquet-request.server";
import { createBouquetCheckoutLink, isSquareConfigured } from "@/lib/square";

export const runtime = "nodejs";

type CheckoutBody = {
  presentationId?: string;
  quantity?: string;
  color?: string;
  pickupDate?: string;
  customDateNote?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  note?: string;
};

const COLOR_LABELS: Record<string, string> = {
  soft: "Soft",
  bright: "Bright",
  surprise: "Surprise me",
};

function formatPickupLabel(
  pickupDate: string,
  customDateNote: string
): string {
  if (pickupDate === "custom") {
    const detail = customDateNote.trim();
    return detail
      ? `Custom date (to discuss): ${detail}`
      : "Custom date — discuss timing with Rhoda";
  }

  const date = new Date(`${pickupDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return pickupDate;
  return date.toLocaleDateString("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export async function POST(request: Request) {
  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const presentationId = body.presentationId?.trim() || "";
  const quantity = body.quantity?.trim() || "1";
  const color = body.color?.trim() || "soft";
  const pickupDate = body.pickupDate?.trim() || "";
  const customDateNote = body.customDateNote?.trim() || "";
  const customerName = body.customerName?.trim() || "";
  const customerEmail = body.customerEmail?.trim() || "";
  const customerPhone = body.customerPhone?.trim() || "";
  const note = body.note?.trim() || "";

  if (!presentationId || !PRESENTATION_LABELS[presentationId]) {
    return NextResponse.json({ error: "Choose a valid arrangement." }, { status: 400 });
  }
  if (!canCheckoutBouquet(presentationId, quantity)) {
    return NextResponse.json(
      {
        error:
          "This order needs a custom quote. Send a bouquet request instead and Rhoda will follow up.",
      },
      { status: 400 }
    );
  }
  if (!pickupDate) {
    return NextResponse.json({ error: "Choose a pickup date." }, { status: 400 });
  }
  if (!isSquareConfigured()) {
    return NextResponse.json(
      { error: "Online payment isn't connected yet. Send a bouquet request instead." },
      { status: 503 }
    );
  }
  if (!customerName) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  const parsedQuantity = parseBouquetQuantity(quantity);
  const unitCents = getPresentationPriceCents(presentationId);
  const totalCents = bouquetOrderTotalCents(presentationId, quantity);
  if (parsedQuantity == null || unitCents == null || totalCents == null) {
    return NextResponse.json({ error: "Could not calculate order total." }, { status: 400 });
  }

  const presentationLabel = PRESENTATION_LABELS[presentationId] || presentationId;
  const colorLabel = COLOR_LABELS[color] || color;
  const pickupLabel = formatPickupLabel(pickupDate, customDateNote);
  const totalLabel = formatCents(totalCents);
  const unitPriceLabel = formatCents(unitCents);

  try {
    const checkout = await createBouquetCheckoutLink({
      presentationId,
      quantity: parsedQuantity,
      colorLabel,
      pickupLabel,
      customerName,
      customerEmail,
      customerPhone,
      note,
    });

    const message = buildBouquetOrderEmailMessage({
      presentationLabel,
      unitPriceLabel,
      quantity,
      colorLabel,
      pickupLabel,
      note,
      payment: {
        totalLabel,
        squarePaymentLinkId: checkout.paymentLinkId,
      },
    });

    await sendBouquetRequestEmail({
      subject: `Bouquet order (pay now): ${presentationLabel} — ${totalLabel}`,
      message,
      customerName,
      customerEmail,
      customerPhone,
    });

    return NextResponse.json({ url: checkout.url, totalCents });
  } catch (error) {
    console.error("Square bouquet checkout error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Could not start checkout. Please try again.";
    const status = message.includes("not configured") ? 503 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
