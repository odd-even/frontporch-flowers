import { NextResponse } from "next/server";
import { sendBouquetRequestEmail } from "@/lib/bouquet-request.server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      subject?: string;
      message?: string;
      customerName?: string;
      customerEmail?: string;
      customerPhone?: string;
    };

    await sendBouquetRequestEmail({
      subject: body.subject?.trim() ?? "",
      message: body.message?.trim() ?? "",
      customerName: body.customerName?.trim() ?? "",
      customerEmail: body.customerEmail?.trim() ?? "",
      customerPhone: body.customerPhone?.trim(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Bouquet request error:", error);
    const message =
      error instanceof Error ? error.message : "Could not send the request. Please try again.";
    const status = message.includes("not configured") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
