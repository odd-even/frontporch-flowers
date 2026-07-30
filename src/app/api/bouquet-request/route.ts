import { NextResponse } from "next/server";
import { Resend } from "resend";
import { DEFAULT_CONTACT_EMAIL } from "@/lib/email";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getRecipientEmail(): string {
  return (
    process.env.CONTACT_EMAIL ||
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
    DEFAULT_CONTACT_EMAIL
  );
}

function getFromAddress(): string {
  return (
    process.env.RESEND_FROM_EMAIL ||
    "Front Porch Flowers <onboarding@resend.dev>"
  );
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function plainTextToHtml(text: string): string {
  return escapeHtml(text).replaceAll("\n", "<br />");
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Email sending is not configured yet." },
        { status: 503 }
      );
    }

    const body = (await request.json()) as {
      subject?: string;
      message?: string;
      customerName?: string;
      customerEmail?: string;
      customerPhone?: string;
    };

    const subject = body.subject?.trim() ?? "";
    const message = body.message?.trim() ?? "";
    const customerName = body.customerName?.trim() ?? "";
    const customerEmail = body.customerEmail?.trim() ?? "";
    const customerPhone = body.customerPhone?.trim() ?? "";

    if (!subject || !message || !customerEmail) {
      return NextResponse.json(
        { error: "Name is optional, but email and request details are required." },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(customerEmail)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const contactLines = [
      customerName ? `Customer name: ${customerName}` : null,
      `Customer email: ${customerEmail}`,
      customerPhone ? `Customer phone: ${customerPhone}` : null,
    ].filter(Boolean);

    const fullMessage = [...contactLines, "", message].join("\n");

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: getFromAddress(),
      to: [getRecipientEmail()],
      replyTo: customerEmail,
      subject,
      text: fullMessage,
      html: `<div style="font-family: Georgia, serif; line-height: 1.6; color: #2c2a26;">${plainTextToHtml(fullMessage)}</div>`,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Could not send the request. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Bouquet request error:", error);
    return NextResponse.json(
      { error: "Could not send the request. Please try again." },
      { status: 500 }
    );
  }
}
