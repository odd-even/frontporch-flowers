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
  "relative w-[min(72vw,18rem)] sm:w-[min(40vw,20rem)] h-[min(72vw,18rem)] sm:h-[min(40vw,20rem)] shrink-0 overflow-hidden flex";

const smoothstep = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};

const lerp = (current: number, target: number, factor: number) =>
  current + (target - current) * factor;

export function AboutTeaserScroll({
  sidePhotos,
  rhodaPhoto,
  facebookUrl,
  instagramUrl,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
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
    let animating = false;
    let baseScroll = 0;
    let manualOffset = 0;
    let syncing = false;
    let smoothedOpen = 0;
    let smoothedScrollLeft: number | null = null;

    const OPEN_LERP = 0.09;
    const SCROLL_LERP = 0.11;

    const meetScrollProgress = () => {
      const rect = meet.getBoundingClientRect();
      const vh = window.innerHeight;
      const meetCenter = rect.top + rect.height / 2;
      const startCenter = vh * 0.8;
      const endCenter = vh * 0.46;
      return Math.min(
        1,
        Math.max(0, (startCenter - meetCenter) / (startCenter - endCenter))
      );
    };

    const meetBaseWidth = () => {
      const vw = window.innerWidth;
      return vw >= 640 ? Math.min(vw * 0.4, 320) : Math.min(vw * 0.72, 288);
    };

    const MAX_EXTRA_RATIO = 1;
    const MEET_RADIUS = "1.5rem";

    let dragPointerId: number | null = null;
    let dragStartX = 0;
    let dragStartScroll = 0;

    const applyMeetCard = (openAmount: number) => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const base = meetBaseWidth();

      if (reduceMotion) {
        meet.style.width = "";
        meet.style.height = "";
        meetTextCol.style.width = "";
        meetTextCol.style.borderRadius = "";
        meetPhoto.style.width = "";
        meetPhoto.style.borderRadius = "";
        delete meet.dataset.open;
        return;
      }

      const eased = smoothstep(openAmount);
      const maxExtra = base * MAX_EXTRA_RATIO;
      const photoWidth = maxExtra * eased;
      const isOpen = photoWidth > 0.5;

      meet.dataset.open = isOpen ? "true" : "false";

      meet.style.width = `${base + photoWidth}px`;
      meet.style.height = `${base}px`;
      meetTextCol.style.width = `${base}px`;
      meetTextCol.style.borderRadius = isOpen
        ? `${MEET_RADIUS} 0 0 ${MEET_RADIUS}`
        : MEET_RADIUS;
      meetPhoto.style.width = `${photoWidth}px`;
      meetPhoto.style.borderRadius = isOpen ? `0 ${MEET_RADIUS} ${MEET_RADIUS} 0` : "0";
    };

    let frozenScrollLeft: number | null = null;

    const isMeetHorizontallyCentered = () => {
      const rect = meet.getBoundingClientRect();
      const meetCenterX = rect.left + rect.width / 2;
      return Math.abs(meetCenterX - window.innerWidth / 2) <= 20;
    };

    const shouldUnfreezeHorizontalScroll = () => {
      const rect = section.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height / 2;
      return sectionCenter > window.innerHeight * 0.72;
    };

    const computeBase = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const sectionCenter = rect.top + rect.height / 2;
      const t = Math.min(1, Math.max(-1, (sectionCenter - vh / 2) / (vh * 0.55)));
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const maxShift = reduceMotion ? 0 : Math.min(window.innerWidth * 0.55, 480);
      const base = meetBaseWidth();
      const meetCenter = meet.offsetLeft + base / 2;
      return meetCenter - scroller.clientWidth / 2 - t * maxShift;
    };

    const isTouchLayout = () =>
      window.matchMedia("(max-width: 639px), (pointer: coarse)").matches;

    const computeTargetScroll = () => {
      if (isTouchLayout()) return scroller.scrollLeft;

      if (frozenScrollLeft !== null && shouldUnfreezeHorizontalScroll()) {
        frozenScrollLeft = null;
        manualOffset = 0;
        smoothedScrollLeft = scroller.scrollLeft;
      }

      if (frozenScrollLeft === null) {
        baseScroll = computeBase();
      } else {
        baseScroll = frozenScrollLeft;
      }

      const max = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
      return Math.min(max, Math.max(0, baseScroll + manualOffset));
    };

    const tick = () => {
      const targetOpen = meetScrollProgress();
      smoothedOpen = lerp(smoothedOpen, targetOpen, OPEN_LERP);
      applyMeetCard(smoothedOpen);

      if (!isTouchLayout()) {
        const targetScroll = computeTargetScroll();

        if (smoothedScrollLeft === null) {
          smoothedScrollLeft = scroller.scrollLeft;
        }

        smoothedScrollLeft = lerp(smoothedScrollLeft, targetScroll, SCROLL_LERP);
        syncing = true;
        scroller.scrollLeft = smoothedScrollLeft;
        syncing = false;

        if (frozenScrollLeft === null && isMeetHorizontallyCentered()) {
          frozenScrollLeft = scroller.scrollLeft;
          manualOffset = 0;
          baseScroll = frozenScrollLeft;
          smoothedScrollLeft = frozenScrollLeft;
        }

        manualOffset = scroller.scrollLeft - baseScroll;
      }

      const openDelta = Math.abs(targetOpen - smoothedOpen);
      const scrollDelta =
        smoothedScrollLeft === null
          ? 0
          : Math.abs(computeTargetScroll() - smoothedScrollLeft);

      if (openDelta > 0.0015 || scrollDelta > 0.75 || dragPointerId !== null) {
        raf = requestAnimationFrame(tick);
      } else {
        animating = false;
        smoothedOpen = targetOpen;
        applyMeetCard(smoothedOpen);
      }
    };

    const requestTick = () => {
      if (animating) return;
      animating = true;
      raf = requestAnimationFrame(tick);
    };

    const onWindowScroll = () => {
      requestTick();
    };

    const onScrollerScroll = () => {
      if (syncing) return;
      manualOffset = scroller.scrollLeft - baseScroll;
      smoothedScrollLeft = scroller.scrollLeft;
    };

    const onPointerDown = (event: PointerEvent) => {
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
      smoothedScrollLeft = scroller.scrollLeft;
      manualOffset = scroller.scrollLeft - baseScroll;
      syncing = false;
      requestTick();
    };

    const onPointerUp = (event: PointerEvent) => {
      if (dragPointerId !== event.pointerId) return;
      dragPointerId = null;
      try {
        scroller.releasePointerCapture(event.pointerId);
      } catch {
        /* already released */
      }
      requestTick();
    };

    requestTick();
    window.addEventListener("scroll", onWindowScroll, { passive: true });
    window.addEventListener("resize", onWindowScroll);
    scroller.addEventListener("scroll", onScrollerScroll, { passive: true });
    scroller.addEventListener("pointerdown", onPointerDown);
    scroller.addEventListener("pointermove", onPointerMove);
    scroller.addEventListener("pointerup", onPointerUp);
    scroller.addEventListener("pointercancel", onPointerUp);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onWindowScroll);
      window.removeEventListener("resize", onWindowScroll);
      scroller.removeEventListener("scroll", onScrollerScroll);
      scroller.removeEventListener("pointerdown", onPointerDown);
      scroller.removeEventListener("pointermove", onPointerMove);
      scroller.removeEventListener("pointerup", onPointerUp);
      scroller.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  return (
    <section id="about" ref={sectionRef} className="scroll-mt-24 pt-10 pb-6 md:pt-14 md:pb-8">
      <p className="px-6 pb-3 text-xs text-warm-brown/60 sm:hidden">
        Swipe to explore
      </p>
      <div
        ref={scrollerRef}
        className="overflow-x-auto overflow-y-hidden overscroll-x-contain touch-pan-x cursor-grab active:cursor-grabbing [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div
          ref={stripRef}
          className="flex w-max items-center gap-4 md:gap-5 px-6"
        >
          {leftPhotos.map((photo) => (
            <ImageCard key={photo.src} photo={photo} />
          ))}

          <div ref={meetRef} data-meet className={`${MEET_CARD} relative z-10`}>
            <div
              ref={meetTextColRef}
              className="relative shrink-0 overflow-hidden rounded-3xl bg-brand-gradient bg-center [background-size:118%] px-6 py-6 sm:px-7 sm:py-7 flex flex-col items-stretch justify-center text-left text-white"
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

            <div ref={meetPhotoRef} className="relative h-full shrink-0 overflow-hidden w-0">
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
