"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { InPersonPaymentLogos, InteracPaymentLogo } from "@/components/PaymentLogos";

const PAY_HASH = "pay";

function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits ? `tel:+${digits.startsWith("1") ? digits : `1${digits}`}` : `tel:${phone}`;
}

function shouldOpenFromUrl(): boolean {
  if (typeof window === "undefined") return false;
  const hash = window.location.hash.replace(/^#/, "").toLowerCase();
  if (hash === PAY_HASH) return true;
  const params = new URLSearchParams(window.location.search);
  return params.has(PAY_HASH) || params.get("payments") === "open";
}

function writePayHash() {
  const url = new URL(window.location.href);
  url.searchParams.delete(PAY_HASH);
  url.searchParams.delete("payments");
  url.hash = PAY_HASH;
  window.history.replaceState(null, "", `${url.pathname}${url.search}#${PAY_HASH}`);
}

function clearPayHash() {
  if (window.location.hash.replace(/^#/, "").toLowerCase() !== PAY_HASH) return;
  const url = new URL(window.location.href);
  window.history.replaceState(null, "", `${url.pathname}${url.search}`);
}

interface PaymentOptionsProps {
  etransferEmail?: string;
  phone?: string;
}

export function PaymentOptions({
  etransferEmail = "rhoda@frontporchflowers.ca",
  phone = "+15064253850",
}: PaymentOptionsProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const phoneDisplay = formatPhoneDisplay(phone);

  useEffect(() => {
    if (shouldOpenFromUrl()) {
      setOpen(true);
      writePayHash();
    }

    const onHashChange = () => {
      if (shouldOpenFromUrl()) {
        setOpen(true);
        return;
      }
      setOpen(false);
      setCopied(false);
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setCopied(false);
        clearPayHash();
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function close() {
    setOpen(false);
    setCopied(false);
    clearPayHash();
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(etransferEmail);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const modal =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-charcoal/60"
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-options-title"
          >
            <div
              className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-cream rounded-t-3xl sm:rounded-3xl shadow-xl pb-[max(1rem,env(safe-area-inset-bottom))]"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={close}
                className="absolute top-4 right-4 z-10 flex h-11 w-11 items-center justify-center text-warm-brown/60 hover:text-charcoal transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="p-6 sm:p-8 text-left">
                <p className="text-sage text-xs uppercase tracking-[0.2em] mb-2">
                  Front Porch Flowers
                </p>
                <h2
                  id="payment-options-title"
                  className="font-display text-2xl text-charcoal mb-2 pr-8"
                >
                  How to pay
                </h2>
                <p className="text-warm-brown/75 text-sm leading-relaxed mb-6">
                  Send an e-Transfer anytime, or pay with card or cash in person.
                </p>

                <div className="grid gap-3 sm:gap-4">
                  <article className="rounded-2xl border border-sage/15 bg-[color-mix(in_srgb,var(--color-brand-green)_12%,var(--color-cream))] p-5 flex flex-col">
                    <p className="text-xs uppercase tracking-widest text-sage-dark mb-3">
                      Interac e-Transfer
                    </p>
                    <div className="mb-4">
                      <InteracPaymentLogo />
                    </div>
                    <p className="text-sm text-warm-brown/75 leading-relaxed mb-3">
                      Send payment anytime to the email below.
                    </p>
                    <div className="mt-auto flex flex-wrap items-center gap-3">
                      <a
                        href={`mailto:${etransferEmail}`}
                        className="font-medium text-charcoal break-all hover:text-terracotta transition-colors"
                      >
                        {etransferEmail}
                      </a>
                      <button
                        type="button"
                        onClick={copyEmail}
                        className="text-sm text-sage-dark hover:text-terracotta transition-colors"
                      >
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </article>

                  <article className="rounded-2xl border border-sage/15 bg-[color-mix(in_srgb,var(--color-brand-green)_12%,var(--color-cream))] p-5">
                    <p className="text-xs uppercase tracking-widest text-sage-dark mb-3">
                      In person
                    </p>
                    <InPersonPaymentLogos />
                  </article>
                </div>

                <p className="mt-5 text-sm text-warm-brown/70">
                  Questions?{" "}
                  <a
                    href={telHref(phone)}
                    className="font-medium text-charcoal hover:text-terracotta transition-colors"
                  >
                    {phoneDisplay}
                  </a>
                </p>

                <button
                  type="button"
                  onClick={close}
                  className="mt-6 btn w-full bg-sage text-cream hover:bg-sage-dark"
                >
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div id="pay" className="sr-only" aria-hidden="true" />
      {modal}
    </>
  );
}
