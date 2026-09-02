"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ArrowIcon } from "@/components/ArrowIcon";
import { FacebookIcon, InstagramIcon } from "@/components/SocialIcons";
import type { FacebookMediaItem, FacebookPost } from "@/lib/facebook";

interface FacebookFeedGridProps {
  initialPosts: FacebookPost[];
  initialCursor: string | null;
  facebookUrl: string;
  instagramUrl?: string;
}

function getMediaItems(post: FacebookPost): FacebookMediaItem[] {
  if (post.media?.length) return post.media;
  if (post.mediaUrls?.length) {
    return post.mediaUrls.map((url) => ({ type: "image" as const, url }));
  }
  return post.mediaUrl ? [{ type: "image", url: post.mediaUrl }] : [];
}

function PostMedia({
  post,
  index,
  onIndexChange,
  linked = false,
  playable = false,
  counterClassName = "absolute top-2 right-2",
}: {
  post: FacebookPost;
  index: number;
  onIndexChange: (index: number) => void;
  linked?: boolean;
  /** When true, show native video controls (modal). Feed cards open the modal instead. */
  playable?: boolean;
  /** Position for the carousel counter (override when a close button shares the corner). */
  counterClassName?: string;
}) {
  const mediaItems = getMediaItems(post);
  const current =
    mediaItems[Math.min(index, mediaItems.length - 1)] ||
    (post.mediaUrl ? { type: "image" as const, url: post.mediaUrl } : null);
  const hasCarousel = mediaItems.length > 1;
  const message = post.message?.trim() || "";

  if (!current) return null;

  function showPrevious(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    onIndexChange((index - 1 + mediaItems.length) % mediaItems.length);
  }

  function showNext(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    onIndexChange((index + 1) % mediaItems.length);
  }

  const media =
    current.type === "video" ? (
      playable ? (
        <video
          key={current.url}
          src={current.url}
          poster={current.poster || undefined}
          controls
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          playsInline
          preload="metadata"
          className="feed-video absolute inset-0 h-full w-full object-cover bg-[#121c22]"
          onClick={(event) => event.stopPropagation()}
        >
          Your browser does not support video playback.
        </video>
      ) : (
        <>
          <video
            key={current.url}
            src={current.url}
            poster={current.poster || undefined}
            playsInline
            muted
            preload="metadata"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover bg-[#121c22]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#121c22]/55 text-cream shadow-sm ring-1 ring-cream/25 backdrop-blur-[2px]">
              <svg className="ml-0.5 h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.14v13.72L19 12 8 5.14z" />
              </svg>
            </span>
          </div>
        </>
      )
    ) : (
      <Image
        src={current.url}
        alt={message.slice(0, 100) || "Front Porch Flowers on Facebook"}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    );

  const wrapWithLink = linked && !message && current.type === "image";

  return (
    <div className="relative aspect-square overflow-hidden bg-[#121c22]">
      {wrapWithLink ? (
        <a
          href={post.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0"
          aria-label="View on Facebook"
        >
          {media}
        </a>
      ) : (
        media
      )}

      {hasCarousel ? (
        <>
          <button
            type="button"
            onClick={showPrevious}
            aria-label="Previous media"
            className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-button bg-transparent text-cream drop-shadow-[0_0_10px_rgba(0,0,0,0.65)] hover:bg-cream/10 transition-colors"
          >
            <ArrowIcon className="w-7 h-7 drop-shadow-[0_0_8px_rgba(0,0,0,0.9)]" direction="left" />
          </button>
          <button
            type="button"
            onClick={showNext}
            aria-label="Next media"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-button bg-transparent text-cream drop-shadow-[0_0_10px_rgba(0,0,0,0.65)] hover:bg-cream/10 transition-colors"
          >
            <ArrowIcon className="w-7 h-7 drop-shadow-[0_0_8px_rgba(0,0,0,0.9)]" />
          </button>
          <p className={`${counterClassName} z-10 rounded-full bg-transparent px-2.5 py-1 text-xs text-cream tabular-nums drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]`}>
            {index + 1} / {mediaItems.length}
          </p>
        </>
      ) : null}
    </div>
  );
}

function FacebookPostCard({
  post,
  onReadMore,
}: {
  post: FacebookPost;
  onReadMore: (post: FacebookPost, mediaIndex: number) => void;
}) {
  const [index, setIndex] = useState(0);
  const message = post.message?.trim() || "";
  const overlayMessage = message.replace(/^\s+/, "").replace(/\n{3,}/g, "\n\n");

  function openModal() {
    onReadMore(post, index);
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={openModal}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openModal();
        }
      }}
      aria-label={message ? `Open post: ${message.slice(0, 80)}` : "Open Facebook post"}
      className="group relative isolate cursor-pointer overflow-hidden rounded-xl bg-[#121c22] ring-1 ring-cream/10 hover:ring-cream/25 transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/40"
    >
      <PostMedia
        post={post}
        index={index}
        onIndexChange={setIndex}
      />

      {overlayMessage ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] overflow-hidden rounded-b-xl px-5 pb-5 pt-24">
          {/* Solid fade under blur so soft edges never sample cream/white */}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#121c22]/80 via-[#1a2830]/40 to-transparent transition-opacity duration-500 ease-out group-hover:opacity-0"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1a2830]/90 via-[#243840]/55 to-transparent opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -inset-x-1 inset-y-0 origin-bottom backdrop-blur-xl bg-[#121c22]/15 transition-[background-color] duration-500 ease-out group-hover:bg-[#1a2830]/40"
            style={{
              WebkitMaskImage:
                "linear-gradient(to top, black 0%, black 40%, transparent 100%)",
              maskImage:
                "linear-gradient(to top, black 0%, black 40%, transparent 100%)",
            }}
            aria-hidden="true"
          />
          {/* Caption low at rest; on hover lifts to clear space for Read more */}
          <div
            className={`relative flex min-h-[2.75em] flex-col justify-end transition-[margin] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              overlayMessage.length > 110 ? "mb-0 group-hover:mb-7" : "mb-0"
            }`}
          >
            <p className="text-cream text-sm leading-snug whitespace-pre-line line-clamp-2 group-hover:line-clamp-5">
              {overlayMessage}
            </p>
            {overlayMessage.length > 110 ? (
              <span className="pointer-events-none absolute left-0 top-full mt-1.5 text-xs text-cream/75 opacity-0 translate-y-1.5 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] delay-75 group-hover:opacity-100 group-hover:translate-y-0">
                Read more
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function ModalPostCard({
  post,
  initialMediaIndex = 0,
  cardRef,
}: {
  post: FacebookPost;
  initialMediaIndex?: number;
  cardRef?: (node: HTMLElement | null) => void;
}) {
  const [mediaIndex, setMediaIndex] = useState(initialMediaIndex);
  const message = post.message?.trim() || "";

  return (
    <article
      ref={cardRef}
      className="relative w-full max-w-md shrink-0 origin-center snap-center overflow-hidden rounded-2xl bg-cream text-charcoal text-left shadow-xl will-change-transform"
      style={{ transform: "scale(0.86)", opacity: 1 }}
    >
      <PostMedia
        post={post}
        index={mediaIndex}
        onIndexChange={setMediaIndex}
        playable
        counterClassName="absolute top-3 left-3"
      />
      <div className="px-5 py-4">
        {message ? (
          <p className="text-charcoal/85 text-sm leading-relaxed whitespace-pre-wrap line-clamp-8">
            {message}
          </p>
        ) : null}
        <a
          href={post.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-moss hover:text-charcoal transition-colors"
        >
          View on Facebook
          <ArrowIcon className="w-3.5 h-3.5" />
        </a>
      </div>
    </article>
  );
}

function FacebookPostModal({
  posts,
  startIndex,
  initialMediaIndex,
  onClose,
  onNearEnd,
  hasMore = false,
  isLoadingMore = false,
}: {
  posts: FacebookPost[];
  startIndex: number;
  initialMediaIndex: number;
  onClose: () => void;
  onNearEnd?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef(0);
  const onNearEndRef = useRef(onNearEnd);
  onNearEndRef.current = onNearEnd;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      window.removeEventListener("keydown", onKeyDown);
      cancelAnimationFrame(rafRef.current);
    };
  }, [onClose]);

  function updateScales() {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const viewMid = scroller.clientHeight / 2;
    const range = Math.max(160, scroller.clientHeight * 0.38);

    itemRefs.current.forEach((el) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollerRect = scroller.getBoundingClientRect();
      const elMid = rect.top - scrollerRect.top + rect.height / 2;
      const t = Math.min(1, Math.abs(elMid - viewMid) / range);
      // Size down away from center; stay opaque — edge masks cover them
      const eased = t * t;
      const scale = 1 - eased * 0.16;
      el.style.transform = `scale(${scale})`;
      el.style.opacity = "1";
    });
  }

  function scheduleScaleUpdate() {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(updateScales);
  }

  useEffect(() => {
    if (!mounted) return;

    const centerStart = () => {
      const target = itemRefs.current[startIndex];
      if (!target) return;
      target.scrollIntoView({ block: "center", inline: "nearest", behavior: "auto" });
      updateScales();
    };

    // Wait a frame so layout exists, then center the clicked post.
    const id = requestAnimationFrame(() => {
      centerStart();
      requestAnimationFrame(updateScales);
    });

    const scroller = scrollerRef.current;
    scroller?.addEventListener("scroll", scheduleScaleUpdate, { passive: true });
    window.addEventListener("resize", scheduleScaleUpdate);

    return () => {
      cancelAnimationFrame(id);
      scroller?.removeEventListener("scroll", scheduleScaleUpdate);
      window.removeEventListener("resize", scheduleScaleUpdate);
    };
  }, [mounted, startIndex]);

  useEffect(() => {
    if (!mounted) return;
    scheduleScaleUpdate();
  }, [mounted, posts.length]);

  // Load more when the bottom sentinel enters the modal scroller
  useEffect(() => {
    if (!mounted || !hasMore) return;
    const scroller = scrollerRef.current;
    const sentinel = sentinelRef.current;
    if (!scroller || !sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) onNearEndRef.current?.();
      },
      { root: scroller, rootMargin: "640px 0px", threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [mounted, hasMore, posts.length, isLoadingMore]);

  if (!mounted || posts.length === 0) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] bg-[#070b0e]/45 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Facebook posts"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-3 right-3 z-30 flex h-11 w-11 items-center justify-center rounded-button bg-cream/95 text-warm-brown/70 shadow-sm hover:text-charcoal transition-colors"
        aria-label="Close"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Soft top / bottom fade so off-center posts are covered by dark */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[18vh] bg-gradient-to-b from-[#070b0e]/85 via-[#070b0e]/40 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[18vh] bg-gradient-to-t from-[#070b0e]/85 via-[#070b0e]/40 to-transparent"
        aria-hidden="true"
      />

      <div
        ref={scrollerRef}
        className="relative z-10 h-full overflow-y-auto overscroll-contain snap-y snap-mandatory px-4 sm:px-6"
        onClick={onClose}
      >
        <div
          className="mx-auto flex w-full max-w-md flex-col items-stretch gap-6 py-[max(18vh,5rem)]"
          onClick={(event) => event.stopPropagation()}
        >
          {posts.map((post, index) => (
            <ModalPostCard
              key={post.id}
              post={post}
              initialMediaIndex={index === startIndex ? initialMediaIndex : 0}
              cardRef={(node) => {
                itemRefs.current[index] = node;
              }}
            />
          ))}
          <div ref={sentinelRef} className="h-10 w-full shrink-0" aria-hidden="true" />
          {isLoadingMore ? (
            <p className="pb-8 text-center text-sm text-cream/70">Loading more…</p>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}

export function FacebookFeedGrid({
  initialPosts,
  initialCursor,
  facebookUrl,
  instagramUrl = "https://www.instagram.com/front_porchflowers",
}: FacebookFeedGridProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [cursor, setCursor] = useState(initialCursor);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [modalPending, startModalTransition] = useTransition();
  const [activePost, setActivePost] = useState<{
    postIndex: number;
    mediaIndex: number;
  } | null>(null);
  // Modal keeps its own feed copy so "see more" there doesn't grow the home grid
  const [modalPosts, setModalPosts] = useState<FacebookPost[] | null>(null);
  const [modalCursor, setModalCursor] = useState<string | null>(null);

  function loadMore() {
    if (!cursor || isPending) return;

    startTransition(async () => {
      setError(null);
      try {
        const res = await fetch(
          `/api/facebook/posts?limit=9&after=${encodeURIComponent(cursor)}`
        );
        if (!res.ok) throw new Error("Could not load more posts");

        const data = (await res.json()) as {
          posts: FacebookPost[];
          nextCursor: string | null;
        };

        setPosts((current) => {
          const seen = new Set(current.map((post) => post.id));
          const next = data.posts.filter((post) => !seen.has(post.id));
          return [...current, ...next];
        });
        setCursor(data.nextCursor);
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  }

  function openModal(postIndex: number, mediaIndex: number) {
    setModalPosts(posts);
    setModalCursor(cursor);
    setActivePost({ postIndex, mediaIndex });
  }

  function closeModal() {
    setActivePost(null);
    setModalPosts(null);
    setModalCursor(null);
  }

  function loadMoreInModal() {
    if (!modalCursor || modalPending) return;

    startModalTransition(async () => {
      try {
        const res = await fetch(
          `/api/facebook/posts?limit=9&after=${encodeURIComponent(modalCursor)}`
        );
        if (!res.ok) throw new Error("Could not load more posts");

        const data = (await res.json()) as {
          posts: FacebookPost[];
          nextCursor: string | null;
        };

        setModalPosts((current) => {
          const list = current ?? [];
          const seen = new Set(list.map((post) => post.id));
          const next = data.posts.filter((post) => !seen.has(post.id));
          return [...list, ...next];
        });
        setModalCursor(data.nextCursor);
      } catch {
        /* keep modal usable; grid error banner is for grid loads */
      }
    });
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post, postIndex) => (
          <FacebookPostCard
            key={post.id}
            post={post}
            onReadMore={(_selected, mediaIndex) =>
              openModal(postIndex, mediaIndex)
            }
          />
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center">
          {cursor ? (
            <button
              type="button"
              onClick={loadMore}
              disabled={isPending}
              aria-label={isPending ? "Loading more posts" : "Load more posts"}
              className={`group inline-flex h-11 shrink-0 items-center overflow-hidden rounded-button border border-cream/35 text-cream/85 transition-[max-width,background-color,border-color,color,justify-content] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/30 disabled:cursor-wait ${
                isPending
                  ? "max-w-[9.5rem] justify-start border-cream/55 bg-cream/5 text-cream"
                  : "max-w-[2.75rem] justify-center enabled:hover:max-w-[9.5rem] enabled:hover:justify-start enabled:hover:border-cream/55 enabled:hover:bg-cream/5 enabled:hover:text-cream enabled:focus-visible:max-w-[9.5rem] enabled:focus-visible:justify-start enabled:focus-visible:border-cream/55 enabled:focus-visible:bg-cream/5 enabled:focus-visible:text-cream"
              }`}
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center"
                aria-hidden="true"
              >
                {isPending ? (
                  <svg
                    className="h-5 w-5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                )}
              </span>
              <span
                className={`min-w-0 overflow-hidden whitespace-nowrap text-sm font-medium transition-[max-width,opacity,padding] duration-300 ease-out ${
                  isPending
                    ? "max-w-[5.5rem] pr-3 opacity-100"
                    : "max-w-0 pr-0 opacity-0 group-hover:max-w-[5.5rem] group-hover:pr-3 group-hover:opacity-100 group-focus-visible:max-w-[5.5rem] group-focus-visible:pr-3 group-focus-visible:opacity-100"
                }`}
              >
                {isPending ? "Loading…" : "More"}
              </span>
            </button>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-cream/70">Follow along</p>
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Front Porch Flowers on Facebook"
            className="inline-flex h-11 w-11 items-center justify-center rounded-button border border-cream/35 bg-transparent text-cream transition-colors hover:border-cream/55 hover:bg-cream/5"
          >
            <FacebookIcon className="w-5 h-5" />
          </a>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Front Porch Flowers on Instagram"
            className="inline-flex h-11 w-11 items-center justify-center rounded-button border border-cream/35 bg-transparent text-cream transition-colors hover:border-cream/55 hover:bg-cream/5"
          >
            <InstagramIcon className="w-5 h-5" />
          </a>
        </div>
      </div>
      {error ? (
        <p className="mt-3 text-left text-sm text-cream/60">{error}</p>
      ) : null}

      {activePost && modalPosts ? (
        <FacebookPostModal
          posts={modalPosts}
          startIndex={activePost.postIndex}
          initialMediaIndex={activePost.mediaIndex}
          onClose={closeModal}
          onNearEnd={loadMoreInModal}
          hasMore={Boolean(modalCursor)}
          isLoadingMore={modalPending}
        />
      ) : null}
    </div>
  );
}
