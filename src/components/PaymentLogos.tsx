const IN_PERSON_BADGES = [
  { src: "/payments/visa.svg", label: "Visa" },
  { src: "/payments/mastercard.svg", label: "Mastercard" },
  { src: "/payments/debit.svg", label: "Debit" },
  { src: "/payments/cash.svg", label: "Cash" },
] as const;

const INTERAC_BADGE = {
  src: "/payments/interac.svg",
  label: "Interac e-Transfer",
} as const;

function Badge({ src, label }: { src: string; label: string }) {
  return (
    <div className="aspect-[750/471] w-full overflow-hidden rounded-lg ring-1 ring-sage/15 bg-white">
      <img
        src={src}
        alt={label}
        width={750}
        height={471}
        className="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

export function InteracPaymentLogo() {
  return (
    <div className="w-28 sm:w-32">
      <Badge src={INTERAC_BADGE.src} label={INTERAC_BADGE.label} />
    </div>
  );
}

export function InPersonPaymentLogos() {
  return (
    <div>
      <ul className="grid grid-cols-4 gap-2.5 list-none p-0 m-0">
        {IN_PERSON_BADGES.map((badge) => (
          <li key={badge.src} className="min-w-0">
            <Badge src={badge.src} label={badge.label} />
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-warm-brown/75 leading-relaxed">
        Visa, Mastercard, debit, and cash are accepted in person.
      </p>
    </div>
  );
}

/** @deprecated Prefer InPersonPaymentLogos + InteracPaymentLogo */
export function AcceptedPaymentLogos() {
  return <InPersonPaymentLogos />;
}
