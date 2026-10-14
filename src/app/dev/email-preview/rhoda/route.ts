import { buildWorkshopPaidEmailHtml } from "@/lib/bouquet-request.server";

const sample = {
  eventTitle: "Winter Wreath Workshop",
  eventId: "workshop-winter-wreath-nov-21-2026",
  eventDateLabel: "Saturday, November 21, 2026",
  eventTimeLabel: "2:00 PM – 4:00 PM",
  quantity: 2,
  totalLabel: "$150",
  currency: "CAD",
  squarePaymentLinkId: "sample-payment-id",
  customerName: "Jane Smith",
  customerEmail: "jane@example.com",
  customerPhone: "+1 506 555 0142",
};

export function GET() {
  const html = buildWorkshopPaidEmailHtml(sample, { absoluteImages: false });
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex",
    },
  });
}
