import { absoluteUrl } from "@/lib/seo";

const CHARCOAL = "#2c2a26";
const WARM_BROWN = "#6b5e52";
const TERRACOTTA = "#c97a6b";
const SAGE = "#a8c1af";
const CREAM = "#f7f3ec";
const WHITE = "#ffffff";
const PINK = "#e99695";
const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function encodePhotoPath(path: string) {
  return path
    .split("/")
    .map((segment) => (segment ? encodeURIComponent(segment) : ""))
    .join("/");
}

function photoUrl(path: string, absolute = true) {
  const encoded = encodePhotoPath(
    path.startsWith("/") ? path : `/${path}`
  );
  return absolute ? absoluteUrl(encoded) : encoded;
}

/** Small email-safe JPG thumbs for each bookable offering. */
export function workshopEmailImageSrc(
  eventIdOrTitle: string,
  options?: { absolute?: boolean }
) {
  const absolute = options?.absolute !== false;
  const key = eventIdOrTitle.toLowerCase();
  if (key.includes("pumpkin")) {
    return photoUrl("/photos/pumpkin workshop/dried-pumpkin-1.jpg", absolute);
  }
  if (key.includes("wreath")) {
    return photoUrl(
      "/photos/wreath workshop/579181303_122111904303020895_6124998152200369731_n.jpg",
      absolute
    );
  }
  return photoUrl("/photos/bouquet workshop/pick-arrange-1.jpg", absolute);
}

export function bouquetEmailImageSrc(
  presentationId: string,
  options?: { absolute?: boolean }
) {
  const absolute = options?.absolute !== false;
  const byId: Record<string, string> = {
    sleeve: "/photos/boquets/sleeve-arrangement.jpg",
    vase: "/photos/boquets/vase-arrangement.png",
    "mason-jar": "/photos/boquets/mason-jar-arrangement.jpg",
    "gift-bag-posie": "/photos/boquets/gift-bag-posie.jpg",
    bucket: "/photos/boquets/bucket-arrangement.jpg",
    custom: "/photos/boquets/custom-arrangement.jpg",
  };
  return photoUrl(byId[presentationId] || "/photos/boquets/hero-evi4.jpg", absolute);
}

type DetailRow = { label: string; value: string };

export type NotificationEmailCard = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  imageAlt: string;
  badge?: string;
  details: DetailRow[];
  footerNote?: string;
  /** Optional second footer block (e.g. address). */
  footerExtraHtml?: string;
};

/** Table-based HTML email — works in most clients. */
export function buildNotificationEmailHtml(card: NotificationEmailCard): string {
  const detailsHtml = card.details
    .map(
      (row, index) => `
        <tr>
          <td style="padding:12px 0;${index === 0 ? "" : `border-top:1px solid ${SAGE}33;`}">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${SAGE};font-family:${FONT};">
              ${escapeHtml(row.label)}
            </p>
            <p style="margin:0;font-size:16px;line-height:1.4;color:${CHARCOAL};font-family:${FONT};">
              ${escapeHtml(row.value)}
            </p>
          </td>
        </tr>`
    )
    .join("");

  const badgeHtml = card.badge
    ? `<span style="display:inline-block;margin-top:10px;padding:6px 12px;border-radius:999px;background:${TERRACOTTA};color:${WHITE};font-size:12px;letter-spacing:0.08em;text-transform:uppercase;font-family:${FONT};">${escapeHtml(card.badge)}</span>`
    : "";

  const subtitleHtml = card.subtitle
    ? `<p style="margin:8px 0 0;font-size:15px;line-height:1.5;color:${WARM_BROWN};font-family:${FONT};">${escapeHtml(card.subtitle)}</p>`
    : "";

  const footerHtml = card.footerNote
    ? `<p style="margin:0;font-size:13px;line-height:1.5;color:${WARM_BROWN};font-family:${FONT};">${escapeHtml(card.footerNote)}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(card.title)}</title>
</head>
<body style="margin:0;padding:0;background:${WHITE};font-family:${FONT};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${WHITE};padding:28px 12px;font-family:${FONT};">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${WHITE};border-radius:20px;overflow:hidden;border:1px solid ${SAGE}40;">
          <tr>
            <td style="height:6px;background:linear-gradient(90deg, ${PINK}, ${TERRACOTTA}, ${SAGE});font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:28px 28px 8px;font-family:${FONT};">
              <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${TERRACOTTA};">
                Front Porch Flowers
              </p>
              <p style="margin:0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${SAGE};">
                ${escapeHtml(card.eyebrow)}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="112" valign="top" style="padding-right:18px;">
                    <img
                      src="${escapeHtml(card.imageUrl)}"
                      alt="${escapeHtml(card.imageAlt)}"
                      width="112"
                      height="112"
                      style="display:block;width:112px;height:112px;object-fit:cover;border-radius:16px;border:1px solid ${SAGE}55;"
                    />
                  </td>
                  <td valign="top" style="font-family:${FONT};">
                    <h1 style="margin:0;font-size:26px;line-height:1.15;font-weight:600;color:${CHARCOAL};font-family:${FONT};">
                      ${escapeHtml(card.title)}
                    </h1>
                    ${subtitleHtml}
                    ${badgeHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};border-radius:16px;padding:4px 18px;">
                ${detailsHtml}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px 28px;font-family:${FONT};">
              ${footerHtml}
              ${card.footerExtraHtml || ""}
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-size:12px;color:${WARM_BROWN};font-family:${FONT};">
          Woodstock, NB · frontporchflowers.ca
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
