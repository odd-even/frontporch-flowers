import { buildWorkshopCustomerReceiptHtml } from "@/lib/bouquet-request.server";

const sample = {
  eventTitle: "Dried Floral Pumpkin Arrangements",
  eventId: "workshop-pumpkin-oct-4-2026",
  eventDateLabel: "Sunday, October 4, 2026",
  eventTimeLabel: "2:00 PM – 4:00 PM",
  quantity: 2,
  totalLabel: "$110",
  currency: "CAD",
  squarePaymentLinkId: "sample-payment-id",
  customerName: "Jane Smith",
  customerEmail: "jane@example.com",
};

export function GET() {
  const html = buildWorkshopCustomerReceiptHtml(sample, {
    absoluteImages: false,
  });
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex",
    },
  });
}
