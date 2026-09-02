"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { SectionNav } from "@/components/SectionNav";
import { FacebookIcon, InstagramIcon } from "@/components/SocialIcons";
import { getFacebookPageUrl } from "@/lib/facebook";
import type { HomeSectionId } from "@/lib/home-sections";
import {
  headerBorderClass,
  headerOpaqueBackgroundStyle,
  headerUsesLightText,
  resolveHeaderSurface,
  type HeaderSurfaceState,
} from "@/lib/header-surface";

const navLinks: { href: string; label: string }[] = [];
const INSTAGRAM_URL = "https://www.instagram.com/front_porchflowers";
const FACEBOOK_URL = getFacebookPageUrl();

const DEFAULT_SURFACE: HeaderSurfaceState = {
  surface: "hero",
  accentColor: "#faf6f0",
  overImage: true,
  solidMix: 0,
  imageTintMix: 0,
};

const HERO_BLUR_IN_PX = 28;

function smoothstep(value: number) {
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
}

function heroScrollBlurStyle(blend: number): CSSProperties {
  if (blend <= 0) {
    return {};
  }

  return {
    backgroundColor: `color-mix(in srgb, var(--color-charcoal) ${Math.round(28 + blend * 14)}%, transparent)`,
  };
}

const socialPillClass = (lightText: boolean) =>
  lightText
    ? "flex items-center gap-0.5 rounded-full border border-cream/30 bg-cream/10 p-0.5 text-cream backdrop-blur-sm"
    : "flex items-center gap-0.5 rounded-full bg-sage p-0.5 text-cream";

const socialIconClass = (lightText: boolean) =>
  `flex items-center justify-center rounded-full p-1.5 transition-colors ${
    lightText ? "hover:bg-cream/20" : "hover:bg-sage-dark"
  }`;

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [surfaceState, setSurfaceState] = useState<HeaderSurfaceState>(DEFAULT_SURFACE);
  const headerRef = useRef<HTMLElement>(null);
  const pendingSectionRef = useRef<HomeSectionId | null>(null);

  useEffect(() => {
    if (!isHome) return;

    const updateSurface = () => {
      const probeY = (headerRef.current?.offsetHeight ?? 56) * 0.55;
      setSurfaceState(resolveHeaderSurface(probeY));
    };

    const onScroll = () => {
      setScrollY(window.scrollY);
      updateSurface();
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateSurface);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateSurface);
    };
  }, [isHome]);

  const onHero = isHome && surfaceState.surface === "hero" && !open;
  const heroBlurBlend =
    onHero && scrollY > 0
      ? smoothstep(Math.min(1, scrollY / HERO_BLUR_IN_PX))
      : 0;
  const heroScrimOpacity = onHero ? Math.max(0, 1 - heroBlurBlend * 1.35) : 0;
  const onHeroTop = onHero && scrollY < 1;
  const navTheme = open || !isHome ? "dark" : surfaceState.surface;
  const lightText =
    open || (!open && isHome && headerUsesLightText(surfaceState.surface, surfaceState.solidMix));
  const showSurfaceBg = isHome && !open;
  const showHeroBlurBar = showSurfaceBg && onHero && heroBlurBlend > 0;
  const solidOpacity = showSurfaceBg && surfaceState.surface !== "hero" ? 1 : 0;
  const headerBorder = open
    ? "border-cream/15"
    : onHeroTop
      ? "border-transparent"
      : headerBorderClass(surfaceState.surface, surfaceState.solidMix, surfaceState.imageTintMix);

  const mobileIconClass = lightText ? "text-cream" : "text-charcoal";

  const handleMobileNavigate = (sectionId?: HomeSectionId) => {
    if (sectionId) pendingSectionRef.current = sectionId;
    setOpen(false);
  };

  useEffect(() => {
    const root = document.createElement("div");
    root.id = "mobile-nav-portal";
    document.documentElement.appendChild(root);
    setMounted(true);
    return () => {
      root.remove();
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const scrollLockY = window.scrollY;
    const html = document.documentElement;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollLockY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.touchAction = "none";

    window.addEventListener("keydown", onKeyDown);
    return () => {
      html.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.touchAction = "";
      const pendingSection = pendingSectionRef.current;
      pendingSectionRef.current = null;
      if (pendingSection) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            document.getElementById(pendingSection)?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          });
        });
      } else {
        window.scrollTo(0, scrollLockY);
      }
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <header
        ref={headerRef}
        className={`w-full z-[110] top-[var(--workshop-banner-h,0px)] ${isHome ? "fixed" : "sticky"} ${
          open ? "max-md:hidden" : ""
        } ${
          showHeroBlurBar ? "backdrop-blur-xl backdrop-saturate-150" : ""
        } border-b bg-transparent ${headerBorder}`}
        style={showHeroBlurBar ? heroScrollBlurStyle(heroBlurBlend) : undefined}
      >
        {!open && isHome ? (
          <>
            {onHero ? (
              <>
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-40 md:h-48 backdrop-blur-sm bg-gradient-to-b from-charcoal/40 via-charcoal/16 to-transparent [mask-image:linear-gradient(to_bottom,black_0%,black_35%,transparent_100%)]"
                  style={{ opacity: heroScrimOpacity }}
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-40 md:h-48 bg-dusty-rose/6 mix-blend-soft-light [mask-image:linear-gradient(to_bottom,black_0%,black_35%,transparent_100%)]"
                  style={{ opacity: heroScrimOpacity }}
                  aria-hidden="true"
                />
              </>
            ) : null}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                ...headerOpaqueBackgroundStyle(surfaceState),
                opacity: solidOpacity,
              }}
              aria-hidden="true"
            />
          </>
        ) : null}
        {!open && !isHome ? (
          <div
            className="pointer-events-none absolute inset-0 bg-cream border-b border-sage/20"
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
              className={`h-8 md:h-10 w-auto transition-[filter,opacity] duration-150 ease-out group-hover:opacity-80 ${
                lightText ? "brightness-0 invert" : ""
              }`}
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <div className="flex items-center">
              <SectionNav
                isHome={isHome}
                navTheme={navTheme}
                lightNavText={lightText}
                surfaceAccent={surfaceState.accentColor}
              />
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative z-10 px-3 py-1.5 text-sm font-medium tracking-wide rounded-full whitespace-nowrap transition-colors duration-200 ${
                    lightText
                      ? "text-cream/70 hover:text-cream"
                      : "text-warm-brown hover:text-terracotta"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className={socialPillClass(lightText)}>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow on Facebook"
                className={socialIconClass(lightText)}
              >
                <FacebookIcon />
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow on Instagram"
                className={socialIconClass(lightText)}
              >
                <InstagramIcon />
              </a>
            </div>
          </nav>

          <button
            type="button"
            className={`md:hidden p-3 -mr-1 transition-colors ${mobileIconClass}`}
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav-panel"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {mounted
        ? createPortal(
            <nav
              id="mobile-nav-panel"
              className={`md:hidden mobile-nav-overlay transition-[opacity,visibility] duration-300 ease-out ${
                open
                  ? "opacity-100 visible pointer-events-auto"
                  : "opacity-0 invisible pointer-events-none"
              }`}
              aria-label="Mobile"
              aria-hidden={!open}
            >
              <div className="shrink-0 flex items-center justify-between px-6 py-2.5 border-b border-cream/15 pt-[max(0.625rem,env(safe-area-inset-top))]">
                <Link href="/" className="group shrink-0" onClick={() => setOpen(false)}>
                  <Image
                    src="/logo-header.svg"
                    alt="Front Porch Flowers"
                    width={3072}
                    height={745}
                    priority
                    className="h-8 w-auto brightness-0 invert transition-opacity group-hover:opacity-80"
                  />
                </Link>
                <button
                  type="button"
                  className="p-3 -mr-1 text-cream transition-colors hover:text-cream/80"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-8 py-6 overflow-y-auto overscroll-contain">
                  <div className="flex w-full max-w-md flex-col items-center text-center">
                    <div className="flex w-full flex-col items-center gap-1">
                      <SectionNav
                        isHome={isHome}
                        navTheme="dark"
                        lightNavText
                        variant="mobile"
                        onNavigate={handleMobileNavigate}
                      />
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="font-display text-4xl sm:text-5xl text-cream/75 hover:text-cream transition-colors py-3 text-center"
                          onClick={() => setOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex justify-center px-8 pt-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
                  <div className="inline-flex items-center gap-3">
                    <a
                      href={FACEBOOK_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Follow on Facebook"
                      className="flex h-11 w-11 items-center justify-center rounded-full text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream"
                      onClick={() => setOpen(false)}
                    >
                      <FacebookIcon className="w-5 h-5" />
                    </a>
                    <a
                      href={INSTAGRAM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Follow on Instagram"
                      className="flex h-11 w-11 items-center justify-center rounded-full text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream"
                      onClick={() => setOpen(false)}
                    >
                      <InstagramIcon className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            </nav>,
            document.getElementById("mobile-nav-portal") ?? document.documentElement
          )
        : null}
    </>
  );
}
