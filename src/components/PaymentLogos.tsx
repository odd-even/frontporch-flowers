/** Payment brand marks for the homepage checkout popup. */

import type { ReactNode } from "react";

function LogoShell({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex h-12 min-w-[4.5rem] items-center justify-center rounded-lg border border-sage/15 bg-white px-3 shadow-sm ${className}`}
      role="img"
      aria-label={label}
      title={label}
    >
      {children}
    </div>
  );
}

export function VisaLogo() {
  return (
    <LogoShell label="Visa">
      <svg viewBox="0 0 48 16" className="h-5 w-auto" aria-hidden="true">
        <path
          fill="#1A1F71"
          d="M20.2 1.2 17.1 14.8h-3.2L16.9 1.2h3.3Zm14.3 8.8.9-2.4.5 2.4h-1.4Zm1.8 4.8h2.9L36.7 1.2h-2.7c-.6 0-1.1.3-1.3.9l-4.7 12.7h3.3l.7-1.8h4zm-7.8-4.4c0-3.3-4.6-3.5-4.6-5 0-.5.5-.9 1.4-.9 1.2 0 2.4.4 3.2.9l.6-2.6A10 10 0 0 0 24.4.6c-3.5 0-6 1.9-6 4.5 0 2 1.8 3.1 3.2 3.7 1.4.7 1.9 1.1 1.9 1.7 0 .9-1.1 1.3-2.1 1.3-1.4 0-2.7-.4-3.7-1l-.7 2.7c1.1.5 2.7.8 4.3.8 3.8.1 6.3-1.8 6.3-4.7Zm-13-9.2-5.1 12.8H6.9L4.4 4.3c-.2-.6-.3-.8-.9-1.1C2.5 2.7 1.2 2.3.3 2L.4 1.2h5.5c.7 0 1.3.5 1.5 1.3l1.3 7.1 3.3-8.4h3.3Z"
        />
      </svg>
    </LogoShell>
  );
}

export function MastercardLogo() {
  return (
    <LogoShell label="Mastercard">
      <svg viewBox="0 0 40 24" className="h-7 w-auto" aria-hidden="true">
        <circle cx="15" cy="12" r="8" fill="#EB001B" />
        <circle cx="25" cy="12" r="8" fill="#F79E1B" />
        <path
          fill="#FF5F00"
          d="M20 5.7a8 8 0 0 1 0 12.6 8 8 0 0 1 0-12.6Z"
        />
      </svg>
    </LogoShell>
  );
}

export function InteracLogo() {
  return (
    <LogoShell label="Interac e-Transfer" className="min-w-[5.5rem]">
      <svg viewBox="0 0 72 20" className="h-5 w-auto" aria-hidden="true">
        <rect x="0" y="2" width="3.5" height="16" fill="#FDB913" />
        <rect x="5" y="2" width="3.5" height="16" fill="#E31837" />
        <rect x="10" y="2" width="3.5" height="16" fill="#007A33" />
        <text
          x="18"
          y="14.5"
          fill="#1a1a1a"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="11"
          fontWeight="700"
          letterSpacing="-0.3"
        >
          Interac
        </text>
      </svg>
    </LogoShell>
  );
}

export function CashLogo() {
  return (
    <LogoShell label="Cash">
      <svg viewBox="0 0 40 24" className="h-6 w-auto" aria-hidden="true">
        <rect
          x="1"
          y="3"
          width="38"
          height="18"
          rx="2.5"
          fill="#E8F0E4"
          stroke="#6B8F71"
          strokeWidth="1.5"
        />
        <circle cx="20" cy="12" r="5" fill="none" stroke="#6B8F71" strokeWidth="1.4" />
        <text
          x="20"
          y="15.5"
          textAnchor="middle"
          fill="#4A6B52"
          fontFamily="Georgia, serif"
          fontSize="8"
          fontWeight="700"
        >
          $
        </text>
        <circle cx="6.5" cy="12" r="1.4" fill="#6B8F71" />
        <circle cx="33.5" cy="12" r="1.4" fill="#6B8F71" />
      </svg>
    </LogoShell>
  );
}

export function AcceptedPaymentLogos() {
  return (
    <div className="flex flex-wrap gap-2.5">
      <VisaLogo />
      <MastercardLogo />
      <InteracLogo />
      <CashLogo />
    </div>
  );
}
