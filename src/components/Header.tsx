"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/bouquets", label: "Bouquets" },
  { href: "/workshops", label: "Workshops" },
  { href: "/pick-your-own", label: "Pick Your Own" },
  { href: "/about", label: "About" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md border-b border-sage/20">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/logo.svg"
            alt="Front Porch Flowers"
            width={48}
            height={48}
            className="w-10 h-10 md:w-12 md:h-12 transition-transform group-hover:scale-105"
          />
          <span className="font-display text-xl md:text-2xl text-charcoal hidden sm:block">
            Front Porch Flowers
          </span>
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
          <a
            href="https://www.instagram.com/front_porchflowers"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium px-4 py-2 bg-sage text-cream rounded-full hover:bg-sage-dark transition-colors"
          >
            Follow Along
          </a>
        </nav>

        <button
          type="button"
          className="md:hidden p-2 text-charcoal"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
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
        <nav className="md:hidden border-t border-sage/20 bg-cream px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-warm-brown hover:text-terracotta transition-colors py-2"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://www.instagram.com/front_porchflowers"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sage-dark font-medium"
          >
            @front_porchflowers
          </a>
        </nav>
      )}
    </header>
  );
}
