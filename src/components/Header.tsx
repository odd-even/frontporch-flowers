"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { OrderBouquetControls } from "@/components/BouquetInquiry";
import { InstagramIcon } from "@/components/SocialIcons";

const navLinks = [{ href: "/gallery", label: "Gallery" }];

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <OrderBouquetControls>
      {(openOrder) => (
        <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md border-b border-sage/20">
          <div className="relative z-[60] max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="group shrink-0" onClick={() => setOpen(false)}>
              <Image
                src="/logo-header.svg"
                alt="Front Porch Flowers"
                width={3072}
                height={745}
                priority
                className="h-10 md:h-12 w-auto transition-opacity duration-300 group-hover:opacity-80"
              />
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-warm-brown hover:text-terracotta transition-colors tracking-wide"
                >
                  {link.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={openOrder}
                className="text-sm font-medium text-warm-brown hover:text-terracotta transition-colors tracking-wide"
              >
                Order a bouquet
              </button>
              <a
                href="https://www.instagram.com/front_porchflowers"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 bg-sage text-cream rounded-full hover:bg-sage-dark transition-colors"
              >
                <InstagramIcon />
                Follow Along
              </a>
            </nav>

            <button
              type="button"
              className="md:hidden p-2 text-charcoal"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {open && (
            <nav
              className="md:hidden fixed inset-0 z-50 bg-cream flex flex-col"
              aria-label="Mobile"
            >
              <div className="h-[73px] shrink-0" aria-hidden="true" />
              <div className="flex-1 flex flex-col justify-center px-8 pb-16 gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="font-display text-4xl sm:text-5xl text-charcoal hover:text-terracotta transition-colors py-3"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    openOrder();
                  }}
                  className="font-display text-4xl sm:text-5xl text-charcoal hover:text-terracotta transition-colors py-3 text-left"
                >
                  Order a bouquet
                </button>
                <a
                  href="https://www.instagram.com/front_porchflowers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-10 inline-flex w-fit items-center gap-2 text-sm font-medium px-8 py-3.5 bg-sage text-cream rounded-full hover:bg-sage-dark transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <InstagramIcon />
                  Follow Along
                </a>
              </div>
            </nav>
          )}
        </header>
      )}
    </OrderBouquetControls>
  );
}
