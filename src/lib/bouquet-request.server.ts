import "server-only";

import { Resend } from "resend";
import { DEFAULT_CONTACT_EMAIL } from "@/lib/email";
import {
  bouquetEmailImageSrc,
  buildNotificationEmailHtml,
  escapeHtml,
  workshopEmailImageSrc,
} from "@/lib/notification-email";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type BouquetRequestEmailInput = {
  subject: string;
  message: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  /** Optional rich HTML body. When omitted, message is rendered as simple HTML. */
  html?: string;
};

export type BouquetOrderEmailDetails = {
  presentationLabel: string;
  presentationId?: string;
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
      `Payment: prepaid via Square — ${details.payment.totalLabel} CAD (paid).`
    );
    if (details.payment.squarePaymentLinkId) {
      lines.push(`Square payment ID: ${details.payment.squarePaymentLinkId}`);
    }
  }

  if (details.note?.trim()) {
    lines.push("", `A few more details: ${details.note.trim()}`);
  }

  lines.push("", "Thanks!");
  return lines.join("\n");
}

const VENUE_LINES = ["Front Porch Flowers", "115 Bull Rd", "Bedell, NB"];

function venueFooterHtml(label = "Pickup") {
  return `<p style="margin:14px 0 0;font-size:13px;line-height:1.55;color:#6b5e52;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <strong style="color:#2c2a26;">${escapeHtml(label)}</strong><br />
    ${VENUE_LINES.map(escapeHtml).join("<br />")}
  </p>`;
}

export function buildBouquetPaidEmailHtml(
  details: BouquetOrderEmailDetails & {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
  },
  options?: { absoluteImages?: boolean }
): string {
  const quantityLabel = QUANTITY_LABELS[details.quantity] ?? details.quantity;
  const imageUrl = bouquetEmailImageSrc(details.presentationId || "", {
    absolute: options?.absoluteImages !== false,
  });

  const rows = [
    { label: "Guest", value: details.customerName },
    { label: "Email", value: details.customerEmail },
    {
      label: "Phone",
      value: details.customerPhone?.trim() || "Not provided",
    },
    { label: "Arrangement", value: details.presentationLabel },
    { label: "Quantity", value: quantityLabel },
    { label: "Colour", value: details.colorLabel },
    { label: "Pickup", value: details.pickupLabel },
  ];

  if (details.payment) {
    rows.push({
      label: "Paid",
      value: `${details.payment.totalLabel} CAD via Square`,
    });
  }
  if (details.note?.trim()) {
    rows.push({ label: "Note", value: details.note.trim() });
  }
  if (details.payment?.squarePaymentLinkId) {
    rows.push({
      label: "Square ID",
      value: details.payment.squarePaymentLinkId,
    });
  }

  return buildNotificationEmailHtml({
    eyebrow: "Bouquet order",
    title: details.presentationLabel,
    subtitle: "A prepaid bouquet order just came through.",
    imageUrl,
    imageAlt: details.presentationLabel,
    badge: "Paid",
    details: rows,
    footerNote: "Reply to this email to reach the guest.",
  });
}

export function buildBouquetCustomerReceiptHtml(
  details: BouquetOrderEmailDetails & { customerName: string },
  options?: { absoluteImages?: boolean }
): string {
  const quantityLabel = QUANTITY_LABELS[details.quantity] ?? details.quantity;
  const imageUrl = bouquetEmailImageSrc(details.presentationId || "", {
    absolute: options?.absoluteImages !== false,
  });
  const firstName = details.customerName.trim().split(/\s+/)[0] || "there";
  const paidLabel = details.payment
    ? `${details.payment.totalLabel} CAD`
    : "Prepaid";

  const rows = [
    { label: "Arrangement", value: details.presentationLabel },
    { label: "Quantity", value: quantityLabel },
    { label: "Colour", value: details.colorLabel },
    { label: "Ready by", value: details.pickupLabel },
    { label: "Paid", value: paidLabel },
    { label: "Name on order", value: details.customerName },
  ];
  if (details.note?.trim()) {
    rows.push({ label: "Your note", value: details.note.trim() });
  }

  return buildNotificationEmailHtml({
    eyebrow: "Order confirmed",
    title: details.presentationLabel,
    subtitle: `Hi ${firstName} — thank you for your bouquet order.`,
    imageUrl,
    imageAlt: details.presentationLabel,
    badge: "Paid",
    details: rows,
    footerNote:
      "Rhoda will have your flowers ready for pickup. Questions? Reply to this email anytime.",
    footerExtraHtml: venueFooterHtml(),
  });
}

export function buildBouquetCustomerReceiptMessage(
  details: BouquetOrderEmailDetails & { customerName: string }
): string {
  const quantityLabel = QUANTITY_LABELS[details.quantity] ?? details.quantity;
  const firstName = details.customerName.trim().split(/\s+/)[0] || "there";
  const paidLabel = details.payment
    ? `${details.payment.totalLabel} CAD`
    : "Prepaid";

  return [
    `Hi ${firstName},`,
    "",
    "Thank you for your Front Porch Flowers order!",
    "",
    `Arrangement: ${details.presentationLabel}`,
    `Quantity: ${quantityLabel}`,
    `Colour: ${details.colorLabel}`,
    `Ready by: ${details.pickupLabel}`,
    `Paid: ${paidLabel}`,
    "",
    "Pickup:",
    ...VENUE_LINES,
    "",
    "See you soon — Rhoda",
  ].join("\n");
}

function getRecipientEmails(): string[] {
  const primary =
    process.env.CONTACT_EMAIL ||
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
    DEFAULT_CONTACT_EMAIL;
  const extras = process.env.NOTIFICATION_EMAILS || "ernest@darrowdesign.ca";

  const emails = [...primary.split(","), ...extras.split(",")]
    .map((email) => email.trim())
    .filter(Boolean);

  return [...new Set(emails)];
}

function getFromAddress(): string {
  return (
    process.env.RESEND_FROM_EMAIL ||
    "Front Porch Flowers <onboarding@resend.dev>"
  );
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
  const html =
    input.html ||
    `<div style="font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; line-height: 1.6; color: #2c2a26;">${plainTextToHtml(fullMessage)}</div>`;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: getFromAddress(),
    to: getRecipientEmails(),
    replyTo: customerEmail,
    subject,
    text: fullMessage,
    html,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error("Could not send the request. Please try again.");
  }
}

export type WorkshopBookingEmailDetails = {
  eventTitle: string;
  eventId?: string;
  eventDateLabel: string;
  eventTimeLabel: string;
  quantity: number;
  totalLabel: string;
  currency?: string;
  squarePaymentLinkId?: string;
};

export function buildWorkshopBookingEmailMessage(
  details: WorkshopBookingEmailDetails
): string {
  const guestLabel = details.quantity === 1 ? "1 guest" : `${details.quantity} guests`;
  const currency = details.currency || "CAD";

  const lines = [
    "Hi Rhoda — a workshop booking was paid.",
    "",
    "Workshop:",
    details.eventTitle,
    details.eventDateLabel,
    details.eventTimeLabel,
    "",
    "Booking:",
    `Guests: ${guestLabel}`,
    `Total: ${details.totalLabel} ${currency} prepaid via Square (paid)`,
  ];

  if (details.squarePaymentLinkId) {
    lines.push(`Square payment ID: ${details.squarePaymentLinkId}`);
  }

  lines.push("", "Reply to this email to reach the guest.");
  return lines.join("\n");
}

export function buildWorkshopPaidEmailHtml(
  details: WorkshopBookingEmailDetails & {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
  },
  options?: { absoluteImages?: boolean }
): string {
  const guestLabel =
    details.quantity === 1 ? "1 guest" : `${details.quantity} guests`;
  const currency = details.currency || "CAD";
  const imageKey = `${details.eventId || ""} ${details.eventTitle}`;
  const imageUrl = workshopEmailImageSrc(imageKey, {
    absolute: options?.absoluteImages !== false,
  });

  const rows = [
    { label: "Guest", value: details.customerName },
    { label: "Email", value: details.customerEmail },
    {
      label: "Phone",
      value: details.customerPhone?.trim() || "Not provided",
    },
    { label: "Workshop", value: details.eventTitle },
    { label: "Date", value: details.eventDateLabel },
    { label: "Time", value: details.eventTimeLabel },
    { label: "Guests", value: guestLabel },
    {
      label: "Paid",
      value: `${details.totalLabel} ${currency} via Square`,
    },
  ];

  if (details.squarePaymentLinkId) {
    rows.push({ label: "Square ID", value: details.squarePaymentLinkId });
  }

  return buildNotificationEmailHtml({
    eyebrow: "Workshop booking",
    title: details.eventTitle,
    subtitle: `${details.eventDateLabel} · ${details.eventTimeLabel}`,
    imageUrl,
    imageAlt: details.eventTitle,
    badge: "Paid",
    details: rows,
    footerNote: "Reply to this email to reach the guest.",
  });
}

export function buildWorkshopCustomerReceiptHtml(
  details: WorkshopBookingEmailDetails & {
    customerName: string;
  },
  options?: { absoluteImages?: boolean }
): string {
  const guestLabel =
    details.quantity === 1 ? "1 guest" : `${details.quantity} guests`;
  const currency = details.currency || "CAD";
  const imageKey = `${details.eventId || ""} ${details.eventTitle}`;
  const imageUrl = workshopEmailImageSrc(imageKey, {
    absolute: options?.absoluteImages !== false,
  });
  const firstName = details.customerName.trim().split(/\s+/)[0] || "there";

  return buildNotificationEmailHtml({
    eyebrow: "You're booked",
    title: details.eventTitle,
    subtitle: `Hi ${firstName} — thanks for booking with Front Porch Flowers.`,
    imageUrl,
    imageAlt: details.eventTitle,
    badge: "Confirmed",
    details: [
      { label: "Date", value: details.eventDateLabel },
      { label: "Time", value: details.eventTimeLabel },
      { label: "Guests", value: guestLabel },
      {
        label: "Paid",
        value: `${details.totalLabel} ${currency}`,
      },
      { label: "Name on booking", value: details.customerName },
    ],
    footerNote: /wreath/i.test(details.eventTitle)
      ? "Keep this email for your records. All supplies are included, and you'll take home a finished wreath. Questions? Reply here or message Rhoda on Facebook."
      : "Keep this email for your records. Wear comfortable shoes — you'll be arranging in the garden. Questions? Reply here or message Rhoda on Facebook.",
    footerExtraHtml: venueFooterHtml("Where to go"),
  });
}

export function buildWorkshopCustomerReceiptMessage(
  details: WorkshopBookingEmailDetails & { customerName: string }
): string {
  const guestLabel =
    details.quantity === 1 ? "1 guest" : `${details.quantity} guests`;
  const currency = details.currency || "CAD";
  const firstName = details.customerName.trim().split(/\s+/)[0] || "there";

  return [
    `Hi ${firstName},`,
    "",
    "You're booked for a Front Porch Flowers workshop!",
    "",
    details.eventTitle,
    details.eventDateLabel,
    details.eventTimeLabel,
    `Guests: ${guestLabel}`,
    `Paid: ${details.totalLabel} ${currency}`,
    "",
    "Address:",
    ...VENUE_LINES,
    "",
    "See you soon — Rhoda",
  ].join("\n");
}

/** Alias for workshop / general site notifications to Rhoda. */
export const sendSiteNotificationEmail = sendBouquetRequestEmail;

/** Send a styled receipt to the customer (not Rhoda). */
export async function sendCustomerReceiptEmail(input: {
  subject: string;
  message: string;
  html: string;
  customerName: string;
  customerEmail: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Email sending is not configured yet.");
  }

  const subject = input.subject.trim();
  const message = input.message.trim();
  const customerName = input.customerName.trim();
  const customerEmail = input.customerEmail.trim();

  if (!subject || !message || !customerName || !customerEmail) {
    throw new Error("Name, email, and receipt details are required.");
  }
  if (!isValidCustomerEmail(customerEmail)) {
    throw new Error("Please enter a valid email address.");
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: getFromAddress(),
    to: [customerEmail],
    replyTo: getRecipientEmails()[0],
    subject,
    text: message,
    html: input.html,
  });

  if (error) {
    console.error("Resend customer receipt error:", error);
    throw new Error("Could not send the customer receipt.");
  }
}
