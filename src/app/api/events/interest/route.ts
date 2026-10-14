import { NextResponse } from "next/server";
import {
  buildWorkshopInterestEmailHtml,
  buildWorkshopInterestReceiptHtml,
  isValidCustomerEmail,
  sendCustomerReceiptEmail,
  sendSiteNotificationEmail,
} from "@/lib/bouquet-request.server";
import { getPickYourOwnEvents } from "@/lib/queries";
import { fallbackEvents } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export const runtime = "nodejs";

type InterestBody = {
  eventId?: string;
  customerName?: string;
  customerEmail?: string;
  quantity?: number;
  website?: string;
};

function isWreathEvent(title: string, description?: string) {
  return /wreath/i.test(title) || /wreath/i.test(description || "");
}

export async function POST(request: Request) {
  let body: InterestBody;
  try {
    body = (await request.json()) as InterestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (body.website?.trim()) {
    return NextResponse.json({ ok: true });
  }

  const eventId = body.eventId?.trim();
  const customerName = body.customerName?.trim() || "";
  const customerEmail = body.customerEmail?.trim() || "";
  const quantity = Number(body.quantity ?? 1);

  if (!eventId) {
    return NextResponse.json({ error: "Missing event." }, { status: 400 });
  }
  if (!customerName) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (!isValidCustomerEmail(customerEmail)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 6) {
    return NextResponse.json(
      { error: "Choose between 1 and 6 people." },
      { status: 400 }
    );
  }

  const events = await getPickYourOwnEvents();
  const event =
    events.find((item) => item._id === eventId) ||
    fallbackEvents.find((item) => item._id === eventId);
  if (!event || !isWreathEvent(event.title, event.description)) {
    return NextResponse.json({ error: "That workshop isn’t available." }, { status: 404 });
  }

  const eventDateLabel = formatDate(event.date);
  const guestLabel = quantity === 1 ? "1 guest" : `${quantity} guests`;
  const message = [
    `${customerName} wants a spot if you add another wreath workshop.`,
    "",
    `People: ${guestLabel}`,
    `Full workshop: ${event.title}`,
    eventDateLabel,
    "",
    "This is not a booking.",
  ].join("\n");

  try {
    await sendSiteNotificationEmail({
      subject: `Wreath interest · ${guestLabel} · ${customerName}`,
      message,
      html: buildWorkshopInterestEmailHtml({
        eventTitle: event.title,
        eventDateLabel,
        customerName,
        quantity,
      }),
      customerName,
      customerEmail,
    });
  } catch (error) {
    console.error("Workshop interest email failed:", error);
    return NextResponse.json(
      { error: "Could not send that just now. Please try again in a moment." },
      { status: 502 }
    );
  }

  try {
    const firstName = customerName.split(/\s+/)[0] || "there";
    await sendCustomerReceiptEmail({
      subject: "We'll let you know if another wreath workshop is added",
      message: [
        `Hi ${firstName},`,
        "",
        "Thanks for letting Rhoda know you'd like another wreath workshop.",
        `People: ${guestLabel}`,
        "",
        "This doesn't hold a spot. She'll email you if she adds another date.",
        "",
        "Rhoda",
      ].join("\n"),
      html: buildWorkshopInterestReceiptHtml({ customerName, quantity }),
      customerName,
      customerEmail,
    });
  } catch (error) {
    console.error("Workshop interest receipt failed:", error);
  }

  return NextResponse.json({ ok: true });
}
