"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { FacebookIcon, InstagramIcon } from "@/components/SocialIcons";
import type { SitePhoto } from "@/lib/photos.shared";

type Props = {
  sidePhotos: SitePhoto[];
  rhodaPhoto: SitePhoto;
  facebookUrl: string;
  instagramUrl: string;
};

const PHOTO_CARD =
  "relative w-[min(72vw,18rem)] sm:w-[min(40vw,20rem)] aspect-square shrink-0 rounded-3xl overflow-hidden";

const MEET_CARD =
  "relative w-[min(72vw,18rem)] sm:w-[min(40vw,20rem)] h-[min(72vw,18rem)] sm:h-[min(40vw,20rem)] shrink-0 overflow-hidden flex will-change-[width]";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Soft ease-in-out with gentle starts and stops. */
function easeInOutSmooth(t: number) {
  const x = clamp(t, 0, 1);
  return x * x * x * (x * (x * 6 - 15) + 10);
}

function isTouchLayout() {
  return window.matchMedia("(max-width: 639px), (pointer: coarse)").matches;
}

export function AboutTeaserScroll({
  sidePhotos,
  rhodaPhoto,
  facebookUrl,
  instagramUrl,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const meetRef = useRef<HTMLDivElement>(null);
  const meetTextColRef = useRef<HTMLDivElement>(null);
  const meetPhotoRef = useRef<HTMLDivElement>(null);
  const leftCount = Math.ceil(sidePhotos.length / 2);
  const leftPhotos = sidePhotos.slice(0, leftCount);
  const rightPhotos = sidePhotos.slice(leftCount);

  useEffect(() => {
    const section = sectionRef.current;
    const scroller = scrollerRef.current;
    const meet = meetRef.current;
    const meetTextCol = meetTextColRef.current;
    const meetPhoto = meetPhotoRef.current;
    if (!section || !scroller || !meet || !meetTextCol || !meetPhoto) return;

    let raf = 0;
    let baseScroll = 0;
    let manualOffset = 0;
    let syncing = false;
    let smoothedProgress = 0;

    const PROGRESS_LERP = 0.1;
    const SECTION_VIEW_BUFFER = 48;
    /** Reset only after the section is fully off-screen below — never while still visible. */
    const resetPastBelowPx = () => Math.max(window.innerHeight, 700);

    const isSectionInView = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      return rect.bottom > -SECTION_VIEW_BUFFER && rect.top < vh + SECTION_VIEW_BUFFER;
    };

    const isSectionWellPastBelow = () => {
      const rect = section.getBoundingClientRect();
      return rect.bottom < -resetPastBelowPx();
    };

    const meetScrollProgress = () => {
      const rect = meet.getBoundingClientRect();
      const vh = window.innerHeight;
      const meetCenter = rect.top + rect.height / 2;
      const startCenter = vh * 0.92;
      const endCenter = vh * 0.5;
      return clamp(
        (startCenter - meetCenter) / (startCenter - endCenter),
        0,
        1
      );
    };

    const meetBaseWidth = () => {
      const vw = window.innerWidth;
      return vw >= 640 ? Math.min(vw * 0.4, 320) : Math.min(vw * 0.72, 288);
    };

    const MAX_EXTRA_RATIO = 1;
    const MEET_RADIUS = "1.5rem";
    const MEET_RADIUS_PX = 24;
    /** How far the photo tucks under the gradient panel (at full open). */
    const MEET_OVERLAP_RATIO = 0.17;

    /** Keep the photo tucked far enough under the gradient's rounding as it opens. */
    const meetPhotoOverlap = (base: number, eased: number) => {
      if (eased <= 0) return 0;
      const tuck = base * MEET_OVERLAP_RATIO * eased;
      const forRoundedRight = MEET_RADIUS_PX * Math.max(0, 1 - eased);
      return Math.round(Math.max(tuck, forRoundedRight) + 1);
    };

    const meetCornerRadii = (eased: number) => {
      // Lerp often stops just shy of 1 — snap so the gradient seam stays square when open.
      if (eased >= 0.992) {
        return { text: `${MEET_RADIUS} 0 0 ${MEET_RADIUS}` };
      }

      const right = Math.max(0, 1 - eased);
      const rightRadius =
        right <= 0.008 ? "0" : `calc(${MEET_RADIUS} * ${right})`;

      return {
        text: `${MEET_RADIUS} ${rightRadius} ${rightRadius} ${MEET_RADIUS}`,
      };
    };

    const updateMeetCard = (eased: number) => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const base = meetBaseWidth();

      if (reduceMotion || isTouchLayout()) {
        meet.style.width = "";
        meet.style.height = "";
        meet.style.borderRadius = "";
        meetTextCol.style.width = "";
        meetTextCol.style.height = "";
        meetTextCol.style.borderRadius = "";
        meetPhoto.style.width = "";
        meetPhoto.style.marginLeft = "";
        delete meet.dataset.open;
        return;
      }

      const maxExtra = base * MAX_EXTRA_RATIO;
      const photoWidth = maxExtra * eased;
      const overlap = meetPhotoOverlap(base, eased);
      const corners = meetCornerRadii(eased);
      const isOpen = photoWidth > 0.5;

      meet.dataset.open = isOpen ? "true" : "false";

      meet.style.width = `${base + photoWidth}px`;
      meet.style.height = `${base}px`;
      meet.style.borderRadius = MEET_RADIUS;
      meetTextCol.style.width = `${base}px`;
      meetTextCol.style.height = `${base}px`;
      meetTextCol.style.borderRadius = corners.text;
      meetPhoto.style.marginLeft = overlap > 0 ? `${-overlap}px` : "";
      meetPhoto.style.width = `${photoWidth + overlap}px`;
    };

    /** Center the Rhoda card so outer flex gutters stay matched on both sides. */
    const centeredScrollForMeet = () => {
      const max = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
      const meetCenter = meet.offsetLeft + meet.offsetWidth / 2;
      return clamp(meetCenter - scroller.clientWidth / 2, 0, max);
    };

    const applyCenteredScroll = () => {
      baseScroll = centeredScrollForMeet();
      syncing = true;
      scroller.scrollLeft = clamp(
        baseScroll + manualOffset,
        0,
        Math.max(0, scroller.scrollWidth - scroller.clientWidth)
      );
      syncing = false;
    };

    let dragPointerId: number | null = null;

    const resetRhodaStrip = () => {
      smoothedProgress = 0;
      manualOffset = 0;
      updateMeetCard(0);
      if (dragPointerId == null) {
        applyCenteredScroll();
      }
    };

    const tick = () => {
      if (isTouchLayout()) return;

      if (isSectionWellPastBelow()) {
        resetRhodaStrip();
        return;
      }

      if (!isSectionInView()) {
        return;
      }

      const rawProgress = meetScrollProgress();
      smoothedProgress += (rawProgress - smoothedProgress) * PROGRESS_LERP;
      const eased = easeInOutSmooth(smoothedProgress);

      updateMeetCard(eased);

      // Keep Rhoda centered as it opens/closes, but never wipe a user horizontal offset
      // until resetRhodaStrip runs (only when well past below).
      if (dragPointerId == null) {
        applyCenteredScroll();
      } else {
        // Card width is changing under an active drag — keep offset relative to the new center.
        baseScroll = centeredScrollForMeet();
        manualOffset = scroller.scrollLeft - baseScroll;
      }

      const settling = Math.abs(smoothedProgress - rawProgress) > 0.0015;
      const animatingOpen = smoothedProgress > 0.001 && smoothedProgress < 0.999;

      if (settling || animatingOpen) {
        raf = requestAnimationFrame(tick);
      } else if (rawProgress >= 0.99 && smoothedProgress !== 1) {
        smoothedProgress = 1;
        updateMeetCard(1);
        if (dragPointerId == null) applyCenteredScroll();
      } else if (rawProgress <= 0.01 && smoothedProgress !== 0) {
        smoothedProgress = 0;
        updateMeetCard(0);
        if (dragPointerId == null) applyCenteredScroll();
      }
    };

    const applyScroll = () => {
      if (isTouchLayout()) {
        updateMeetCard(1);
        return;
      }

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };

    const onResize = () => {
      if (isTouchLayout()) return;
      if (isSectionWellPastBelow()) {
        resetRhodaStrip();
        return;
      }
      if (!isSectionInView()) {
        return;
      }
      smoothedProgress = meetScrollProgress();
      updateMeetCard(easeInOutSmooth(smoothedProgress));
      if (dragPointerId == null) {
        applyCenteredScroll();
      }
      applyScroll();
    };

    const onWindowScroll = () => {
      applyScroll();
    };

    const onScrollerScroll = () => {
      if (syncing) return;
      manualOffset = scroller.scrollLeft - baseScroll;
    };

    let dragStartX = 0;
    let dragStartScroll = 0;

    const onPointerDown = (event: PointerEvent) => {
      if (isTouchLayout()) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      dragPointerId = event.pointerId;
      dragStartX = event.clientX;
      dragStartScroll = scroller.scrollLeft;
      scroller.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (dragPointerId !== event.pointerId) return;
      const dx = event.clientX - dragStartX;
      syncing = true;
      scroller.scrollLeft = dragStartScroll - dx;
      manualOffset = scroller.scrollLeft - baseScroll;
      syncing = false;
    };

    const onPointerUp = (event: PointerEvent) => {
      if (dragPointerId !== event.pointerId) return;
      dragPointerId = null;
      baseScroll = centeredScrollForMeet();
      manualOffset = scroller.scrollLeft - baseScroll;
      try {
        scroller.releasePointerCapture(event.pointerId);
      } catch {
        /* already released */
      }
    };

    smoothedProgress = meetScrollProgress();
    updateMeetCard(easeInOutSmooth(smoothedProgress));
    applyCenteredScroll();
    applyScroll();
    window.addEventListener("scroll", onWindowScroll, { passive: true });
    window.addEventListener("resize", onResize);
    scroller.addEventListener("scroll", onScrollerScroll, { passive: true });
    scroller.addEventListener("pointerdown", onPointerDown);
    scroller.addEventListener("pointermove", onPointerMove);
    scroller.addEventListener("pointerup", onPointerUp);
    scroller.addEventListener("pointercancel", onPointerUp);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onWindowScroll);
      window.removeEventListener("resize", onResize);
      scroller.removeEventListener("scroll", onScrollerScroll);
      scroller.removeEventListener("pointerdown", onPointerDown);
      scroller.removeEventListener("pointermove", onPointerMove);
      scroller.removeEventListener("pointerup", onPointerUp);
      scroller.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  return (
    <section id="about" ref={sectionRef} className="scroll-mt-24 pt-10 pb-4 md:pt-14 md:pb-8">
      {/* Mobile: brand gradient intro + photo (static, no scroll trap) */}
      <div className="sm:hidden px-6">
        <article className="overflow-hidden rounded-3xl ring-1 ring-charcoal/8">
          <div className="relative overflow-hidden bg-brand-gradient bg-center [background-size:118%] px-7 py-9 text-center text-white">
            <p className="text-sm text-white/80 mb-2 tracking-wide">Hello, I&apos;m</p>
            <p className="font-display text-[clamp(2.75rem,11vw,3.5rem)] leading-none mb-4">
              Rhoda
            </p>
            <p className="text-white/88 leading-relaxed text-[0.95rem] max-w-[18rem] mx-auto text-balance">
              I love sharing beauty with the world. Each bouquet is cut from what&apos;s
              blooming that week. I also host pick-your-own days and seasonal workshops
              when the garden has enough to share.
            </p>
          </div>

          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src={rhodaPhoto.src}
              alt={rhodaPhoto.alt || "Rhoda among the flowers at Front Porch Flowers"}
              fill
              quality={90}
              className="object-cover object-[72%_38%]"
              sizes="92vw"
              priority
            />
            <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-end gap-2.5 p-4">
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Front Porch Flowers on Facebook"
                className="flex h-11 w-11 items-center justify-center rounded-button bg-white/92 text-charcoal transition-transform active:scale-95"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Front Porch Flowers on Instagram"
                className="flex h-11 w-11 items-center justify-center rounded-button bg-white/92 text-charcoal transition-transform active:scale-95"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
        </article>
      </div>

      {/* Desktop: horizontal photo strip */}
      <div
        ref={scrollerRef}
        className="hidden sm:block overflow-x-auto overflow-y-hidden overscroll-x-contain touch-pan-x cursor-grab active:cursor-grabbing [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex w-max items-center gap-4 md:gap-5 px-6">
          {leftPhotos.map((photo) => (
            <ImageCard key={photo.src} photo={photo} />
          ))}

          <div ref={meetRef} data-meet className={`${MEET_CARD} relative z-10 rounded-3xl`}>
            <div
              ref={meetTextColRef}
              className="relative z-10 h-full shrink-0 overflow-hidden bg-brand-pink bg-brand-gradient bg-center [background-size:118%] px-6 py-6 sm:px-7 sm:py-7 flex flex-col items-stretch justify-center text-left text-white isolate"
            >
                <p className="w-full text-center text-sm text-white/80 mb-2 whitespace-nowrap">
                  Hello, I&apos;m
                </p>
                <p className="w-full text-center font-display text-3xl sm:text-4xl leading-none mb-2.5 whitespace-nowrap">
                  Rhoda
                </p>
                <p className="w-full text-center text-white/85 leading-snug text-sm sm:text-[0.85rem]">
                  I love sharing beauty with the world. Each bouquet is cut from
                  what&apos;s blooming that week. I also host pick-your-own days and
                  seasonal workshops when the garden has enough to share.
                </p>
              </div>

              <div ref={meetPhotoRef} className="relative z-0 h-full shrink-0 overflow-hidden">
                <Image
                  src={rhodaPhoto.src}
                  alt=""
                  fill
                  quality={90}
                  className="object-cover object-[72%_38%]"
                  sizes="(max-width: 640px) 80vw, 400px"
                  draggable={false}
                />
                <div className="absolute inset-y-0 right-0 z-10 flex flex-col items-end justify-end gap-2.5 p-3">
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Front Porch Flowers on Facebook"
                    className="flex h-11 w-11 items-center justify-center rounded-button bg-white/92 text-charcoal shadow-sm transition-transform hover:scale-105"
                  >
                    <FacebookIcon className="w-4 h-4" />
                  </a>
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Front Porch Flowers on Instagram"
                    className="flex h-11 w-11 items-center justify-center rounded-button bg-white/92 text-charcoal shadow-sm transition-transform hover:scale-105"
                  >
                    <InstagramIcon className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

          {rightPhotos.map((photo) => (
            <ImageCard key={photo.src} photo={photo} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ImageCard({ photo }: { photo: SitePhoto }) {
  return (
    <div className={PHOTO_CARD}>
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 72vw, 320px"
        draggable={false}
      />
    </div>
  );
}
