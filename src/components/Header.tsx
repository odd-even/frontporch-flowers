"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SectionNav } from "@/components/SectionNav";
import { InstagramIcon } from "@/components/SocialIcons";

const navLinks = [{ href: "/gallery", label: "Gallery" }];

const HOME_FADE_DISTANCE = 140;

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (!isHome) return;

    const onScroll = () => setScrollY(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const scrollProgress = isHome
    ? Math.min(1, scrollY / HOME_FADE_DISTANCE)
    : 1;
  const onHero = isHome && scrollProgress < 0.65 && !open;

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
    <>
      <header
            className={`top-0 z-[110] w-full ${
              isHome ? "fixed" : "sticky"
            } ${open ? "bg-cream border-b border-sage/20" : "border-b border-transparent bg-transparent"}`}
          >
            {open ? (
              <div
                className="pointer-events-none absolute inset-0 bg-dusty-rose/8"
                aria-hidden="true"
              />
            ) : null}
            {!open && isHome ? (
              <>
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-40 md:h-48 backdrop-blur-sm bg-gradient-to-b from-charcoal/32 via-charcoal/12 to-transparent [mask-image:linear-gradient(to_bottom,black_0%,black_35%,transparent_100%)] transition-opacity duration-150"
                  style={{ opacity: 1 - scrollProgress }}
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-40 md:h-48 bg-dusty-rose/6 mix-blend-soft-light [mask-image:linear-gradient(to_bottom,black_0%,black_35%,transparent_100%)] transition-opacity duration-150"
                  style={{ opacity: 1 - scrollProgress }}
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-cream backdrop-blur-xl border-b border-sage/20 transition-opacity duration-150"
                  style={{ opacity: scrollProgress }}
                  aria-hidden="true"
                />
              </>
            ) : null}
            {!open && !isHome ? (
              <div
                className="pointer-events-none absolute inset-0 bg-cream backdrop-blur-xl border-b border-sage/20"
                aria-hidden="true"
              />
            ) : null}

            <div className="relative w-full px-6 md:px-8 lg:px-10 py-2.5 md:py-3 flex items-center justify-between">
              <Link href="/" className="group shrink-0" onClick={() => setOpen(false)}>
                <Image
                  src="/logo-header.svg"
                  alt="Front Porch Flowers"
                  width={3072}
                  height={745}
                  priority
                  className={`h-8 md:h-10 w-auto transition-all duration-300 group-hover:opacity-80 ${
                    onHero ? "brightness-0 invert" : ""
                  }`}
                />
              </Link>

              <nav className="hidden md:flex items-center gap-6">
                <div className="flex items-center">
                  <SectionNav isHome={isHome} onHero={onHero} />
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`relative z-10 px-3 py-1.5 text-sm font-medium tracking-wide rounded-full whitespace-nowrap transition-colors duration-200 ${
                        onHero
                          ? "text-cream/70 hover:text-cream"
                          : "text-warm-brown hover:text-terracotta"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                <a
                  href="https://www.instagram.com/front_porchflowers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    onHero
                      ? "btn gap-2 px-3 py-1 border border-cream/30 bg-cream/10 text-cream backdrop-blur-sm hover:bg-cream/20"
                      : "btn gap-2 px-3 py-1 bg-sage text-cream hover:bg-sage-dark"
                  }
                >
                  <InstagramIcon />
                  Follow Along
                </a>
              </nav>

              <button
                type="button"
                className={`md:hidden p-2 transition-colors ${
                  onHero ? "text-cream" : "text-charcoal"
                }`}
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
          </header>

          {open && (
            <nav
              className="md:hidden fixed inset-0 z-[100] bg-cream flex flex-col"
              aria-label="Mobile"
            >
              <div className="h-[60px] shrink-0" aria-hidden="true" />
              <div className="flex-1 flex flex-col justify-center px-8 pb-16 gap-2">
                <SectionNav
                  isHome={isHome}
                  onHero={false}
                  variant="mobile"
                  onNavigate={() => setOpen(false)}
                />
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
                <a
                  href="https://www.instagram.com/front_porchflowers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-10 btn w-fit bg-sage text-cream hover:bg-sage-dark"
                  onClick={() => setOpen(false)}
                >
                  <InstagramIcon />
                  Follow Along
                </a>
              </div>
            </nav>
          )}
    </>
  );
}
