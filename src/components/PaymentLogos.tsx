const BADGES = [
  { src: "/payments/visa.svg", label: "Visa" },
  { src: "/payments/mastercard.svg", label: "Mastercard" },
  { src: "/payments/interac.svg", label: "Interac e-Transfer" },
  { src: "/payments/cash.svg", label: "Cash" },
] as const;

export function AcceptedPaymentLogos() {
  return (
    <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 list-none p-0 m-0">
      {BADGES.map((badge) => (
        <li key={badge.src} className="min-w-0">
          <div className="aspect-[750/471] w-full overflow-hidden rounded-lg ring-1 ring-sage/15 bg-white">
            {/* Native img keeps SVG crisp; next/image is awkward with local SVGs */}
            <img
              src={badge.src}
              alt={badge.label}
              width={750}
              height={471}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
