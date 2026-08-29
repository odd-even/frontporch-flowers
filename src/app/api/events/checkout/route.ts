import { NextResponse } from "next/server";
import {
  countBookedSpotsForEvent,
  createEventCheckoutLink,
  isSquareConfigured,
} from "@/lib/square";
import { getPickYourOwnEvents } from "@/lib/queries";

export const runtime = "nodejs";

type CheckoutBody = {
  eventId?: string;
  quantity?: number;
  customerName?: string;
  customerEmail?: string;
};

export async function POST(request: Request) {
  if (!isSquareConfigured()) {
    return NextResponse.json(
      {
        error:
          "Online booking isn’t connected yet. Please message Front Porch Flowers on Facebook to reserve.",
      },
      { status: 503 }
    );
  }

  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const eventId = body.eventId?.trim();
  const quantity = Number(body.quantity ?? 1);
  const customerName = body.customerName?.trim() || "";
  const customerEmail = body.customerEmail?.trim() || "";

  if (!eventId) {
    return NextResponse.json({ error: "Missing event." }, { status: 400 });
  }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    return NextResponse.json(
      { error: "Choose between 1 and 10 guests." },
      { status: 400 }
    );
  }
  if (!customerName) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  const events = await getPickYourOwnEvents();
  const event = events.find((item) => item._id === eventId);
  if (!event) {
    return NextResponse.json({ error: "That event isn’t available." }, { status: 404 });
  }
  if (!event.priceCents) {
    return NextResponse.json(
      { error: "This event isn’t open for prepaid booking yet." },
      { status: 400 }
    );
  }
  const capacity = event.spotsAvailable ?? null;
  if (capacity != null) {
    let booked: number;
    try {
      booked = await countBookedSpotsForEvent(event._id);
    } catch (error) {
      console.error("Square capacity lookup error:", error);
      return NextResponse.json(
        {
          error:
            "Could not check remaining spots right now. Please try again in a moment.",
        },
        { status: 503 }
      );
    }

    const remaining = Math.max(0, capacity - booked);
    if (remaining <= 0) {
      return NextResponse.json(
        { error: "This workshop is sold out." },
        { status: 409 }
      );
    }
    if (quantity > remaining) {
      return NextResponse.json(
        {
          error:
            remaining === 1
              ? "Only 1 spot is left."
              : `Only ${remaining} spots are left.`,
        },
        { status: 400 }
      );
    }
  }

  try {
    const checkout = await createEventCheckoutLink({
      event,
      quantity,
      customerName,
      customerEmail,
    });
    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error("Square checkout error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not start checkout. Please try again.",
      },
      { status: 502 }
    );
  }
}
