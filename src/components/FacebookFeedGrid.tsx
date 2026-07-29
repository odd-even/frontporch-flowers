"use client";

import { useEffect, useState, useTransition, type MouseEvent } from "react";
import Image from "next/image";
import type { FacebookMediaItem, FacebookPost } from "@/lib/facebook";

interface FacebookFeedGridProps {
  initialPosts: FacebookPost[];
  initialCursor: string | null;
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
}: {
  post: FacebookPost;
  index: number;
  onIndexChange: (index: number) => void;
  linked?: boolean;
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
      <video
        key={current.url}
        src={current.url}
        poster={current.poster || undefined}
        controls
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover bg-charcoal"
        onClick={(event) => event.stopPropagation()}
      >
        Your browser does not support video playback.
      </video>
    ) : (
      <Image
        src={current.url}
        alt={message.slice(0, 100) || "Front Porch Flowers on Facebook"}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    );

  const wrapWithLink = linked && !message && current.type === "image";

  return (
    <div className="relative aspect-square overflow-hidden bg-charcoal">
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
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-charcoal/70 text-cream hover:bg-charcoal/90 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M14.7 5.3a1 1 0 0 1 0 1.4L9.4 12l5.3 5.3a1 1 0 0 1-1.4 1.4l-6-6a1 1 0 0 1 0-1.4l6-6a1 1 0 0 1 1.4 0z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={showNext}
            aria-label="Next media"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-charcoal/70 text-cream hover:bg-charcoal/90 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M9.3 5.3a1 1 0 0 1 1.4 0l6 6a1 1 0 0 1 0 1.4l-6 6a1 1 0 0 1-1.4-1.4l5.3-5.3-5.3-5.3a1 1 0 0 1 0-1.4z" />
            </svg>
          </button>
          <p className="absolute bottom-2 right-2 z-10 rounded-full bg-charcoal/70 px-2.5 py-1 text-xs text-cream tabular-nums">
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
  const canExpand = message.length > 140;

  return (
    <article className="overflow-hidden rounded-xl bg-cream/5 ring-1 ring-cream/10 hover:ring-cream/25 transition-all text-left flex flex-col">
      <PostMedia
        post={post}
        index={index}
        onIndexChange={setIndex}
        linked
      />

      {message ? (
        <div className="flex flex-1 flex-col px-3.5 py-3">
          <p className="text-cream/85 text-sm leading-relaxed line-clamp-3 whitespace-pre-wrap">
            {message}
          </p>
          {canExpand ? (
            <button
              type="button"
              onClick={() => onReadMore(post, index)}
              className="mt-2 self-start text-sm text-sage-light hover:text-cream transition-colors"
            >
              Read more
            </button>
          ) : null}
          <a
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto pt-3 text-sm text-cream/55 hover:text-cream transition-colors"
          >
            View on Facebook &rarr;
          </a>
        </div>
      ) : null}
    </article>
  );
}

function FacebookPostModal({
  post,
  initialIndex,
  onClose,
}: {
  post: FacebookPost;
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const message = post.message?.trim() || "";

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-charcoal/65"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Facebook post"
    >
      <div
        className="relative w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-charcoal text-cream text-left shadow-xl ring-1 ring-cream/15"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-charcoal/80 text-cream/80 hover:text-cream transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <PostMedia post={post} index={index} onIndexChange={setIndex} />

        <div className="px-5 py-4">
          {message ? (
            <p className="text-cream/90 text-sm leading-relaxed whitespace-pre-wrap">
              {message}
            </p>
          ) : null}
          <a
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex text-sm text-sage-light hover:text-cream transition-colors"
          >
            View on Facebook &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}

export function FacebookFeedGrid({
  initialPosts,
  initialCursor,
}: FacebookFeedGridProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [cursor, setCursor] = useState(initialCursor);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [activePost, setActivePost] = useState<{
    post: FacebookPost;
    mediaIndex: number;
  } | null>(null);

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

  return (
    <div className="mb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => (
          <FacebookPostCard
            key={post.id}
            post={post}
            onReadMore={(selected, mediaIndex) =>
              setActivePost({ post: selected, mediaIndex })
            }
          />
        ))}
      </div>

      {cursor ? (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-8 py-3.5 border border-cream/30 text-cream rounded-full font-medium hover:bg-cream/10 transition-colors disabled:opacity-60 disabled:cursor-wait"
          >
            {isPending ? "Loading…" : "Load more"}
          </button>
          {error ? <p className="mt-3 text-sm text-cream/60">{error}</p> : null}
        </div>
      ) : null}

      {activePost ? (
        <FacebookPostModal
          post={activePost.post}
          initialIndex={activePost.mediaIndex}
          onClose={() => setActivePost(null)}
        />
      ) : null}
    </div>
  );
}
