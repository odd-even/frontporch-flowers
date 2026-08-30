"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { SitePhoto } from "@/lib/photos.shared";

type Props = {
  sidePhotos: SitePhoto[];
};

const CARD =
  "relative w-[min(72vw,18rem)] sm:w-[min(40vw,20rem)] aspect-square shrink-0 rounded-3xl overflow-hidden";

export function AboutTeaserScroll({ sidePhotos }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const meetRef = useRef<HTMLDivElement>(null);
  const leftCount = Math.ceil(sidePhotos.length / 2);
  const leftPhotos = sidePhotos.slice(0, leftCount);
  const rightPhotos = sidePhotos.slice(leftCount);

  useEffect(() => {
    const section = sectionRef.current;
    const scroller = scrollerRef.current;
    const meet = meetRef.current;
    if (!section || !scroller || !meet) return;

    let raf = 0;
    let baseScroll = 0;
    let manualOffset = 0;
    let syncing = false;

    const computeBase = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const sectionCenter = rect.top + rect.height / 2;
      const t = Math.min(1, Math.max(-1, (sectionCenter - vh / 2) / (vh * 0.55)));
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const maxShift = reduceMotion ? 0 : Math.min(window.innerWidth * 0.55, 480);
      const meetCenter = meet.offsetLeft + meet.offsetWidth / 2;
      return meetCenter - scroller.clientWidth / 2 - t * maxShift;
    };

    const applyScroll = () => {
      baseScroll = computeBase();
      const max = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
      const next = Math.min(max, Math.max(0, baseScroll + manualOffset));
      syncing = true;
      scroller.scrollLeft = next;
      // Keep manual offset coherent if we clamped
      manualOffset = scroller.scrollLeft - baseScroll;
      syncing = false;
    };

    const onWindowScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(applyScroll);
    };

    const onScrollerScroll = () => {
      if (syncing) return;
      manualOffset = scroller.scrollLeft - baseScroll;
    };

    let dragPointerId: number | null = null;
    let dragStartX = 0;
    let dragStartScroll = 0;

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
      manualOffset = scroller.scrollLeft - baseScroll;
      syncing = false;
    };

    const onPointerUp = (event: PointerEvent) => {
      if (dragPointerId !== event.pointerId) return;
      dragPointerId = null;
      try {
        scroller.releasePointerCapture(event.pointerId);
      } catch {
        /* already released */
      }
    };

    applyScroll();
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
    <section id="about" ref={sectionRef} className="scroll-mt-24 py-10 md:py-14">
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

          <div
            ref={meetRef}
            data-meet
            className={`${CARD} bg-brand-gradient [background-size:100%_100%] px-6 py-6 sm:px-7 sm:py-7 flex flex-col items-stretch justify-center text-left text-white`}
          >
            <p className="w-full text-center text-sm text-white/80 mb-2">Hello, I&apos;m</p>
            <p className="w-full text-center font-accent text-5xl sm:text-6xl leading-none mb-2">
              Rhoda
            </p>
            <span className="block w-full h-px bg-white/45 mb-2.5" aria-hidden />
            <p className="w-full text-center text-white/85 leading-snug text-[0.8rem] sm:text-[0.85rem]">
              I love sharing beauty with the world. Each bouquet is cut from
              what&apos;s blooming that week. I also host pick-your-own days and
              seasonal workshops when the garden has enough to share.
            </p>
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
    <div className={CARD}>
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
