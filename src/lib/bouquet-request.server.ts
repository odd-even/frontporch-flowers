import "server-only";

import { Resend } from "resend";
import { DEFAULT_CONTACT_EMAIL } from "@/lib/email";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type BouquetRequestEmailInput = {
  subject: string;
  message: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
};

export type BouquetOrderEmailDetails = {
  presentationLabel: string;
  unitPriceLabel?: string;
  quantity: string;
  colorLabel: string;
  pickupLabel: string;
  note?: string;
  payment?: {
    totalLabel: string;
    squarePaymentLinkId?: string;
  };
};

const QUANTITY_LABELS: Record<string, string> = {
  "1": "1",
  "2": "2",
  "3": "3",
  "4+": "4+",
};

export function buildBouquetOrderEmailMessage(details: BouquetOrderEmailDetails): string {
  const quantityLabel = QUANTITY_LABELS[details.quantity] ?? details.quantity;
  const priceSuffix = details.unitPriceLabel ? ` (${details.unitPriceLabel} each)` : "";

  const lines = [
    `Hi Rhoda! I'd like a bouquet finished ${details.presentationLabel.toLowerCase()}.`,
    "",
    "Order details:",
    `Quantity: ${quantityLabel}`,
    `Color scheme: ${details.colorLabel}`,
    `Presentation: ${details.presentationLabel}${priceSuffix}`,
    `Pickup / ready by: ${details.pickupLabel}`,
  ];

  if (details.payment) {
    lines.push(
      "",
      `Payment: customer is paying now via Square — ${details.payment.totalLabel} CAD prepaid.`,
      "Square checkout has been started; confirm payment in your Square dashboard."
    );
    if (details.payment.squarePaymentLinkId) {
      lines.push(`Square payment link ID: ${details.payment.squarePaymentLinkId}`);
    }
  }

  if (details.note?.trim()) {
    lines.push("", `A few more details: ${details.note.trim()}`);
  }

  lines.push("", "Thanks!");
  return lines.join("\n");
}

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

export function isValidCustomerEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export async function sendBouquetRequestEmail(input: BouquetRequestEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Email sending is not configured yet.");
  }

  const subject = input.subject.trim();
  const message = input.message.trim();
  const customerName = input.customerName.trim();
  const customerEmail = input.customerEmail.trim();
  const customerPhone = input.customerPhone?.trim() ?? "";

  if (!subject || !message || !customerName || !customerEmail) {
    throw new Error("Name, email, and request details are required.");
  }

  if (!isValidCustomerEmail(customerEmail)) {
    throw new Error("Please enter a valid email address.");
  }

  const contactLines = [
    "Contact:",
    `Customer name: ${customerName}`,
    `Customer email: ${customerEmail}`,
    `Customer phone: ${customerPhone || "(not provided)"}`,
    "",
  ];

  const fullMessage = [...contactLines, message].join("\n");

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
    throw new Error("Could not send the request. Please try again.");
  }
}
