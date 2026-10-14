import { NextResponse } from "next/server";
import { getPickYourOwnEvents } from "@/lib/queries";
import { getEventCapacity } from "@/lib/square";
import { fallbackEvents } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const eventId = new URL(request.url).searchParams.get("eventId")?.trim();
  if (!eventId) {
    return NextResponse.json({ error: "Missing event." }, { status: 400 });
  }

  const events = await getPickYourOwnEvents();
  const event =
    events.find((item) => item._id === eventId) ||
    fallbackEvents.find((item) => item._id === eventId);
  if (!event) {
    return NextResponse.json({ error: "That event isn’t available." }, { status: 404 });
  }

  const capacity = await getEventCapacity(event);
  return NextResponse.json(capacity, {
    headers: { "Cache-Control": "no-store" },
  });
}
