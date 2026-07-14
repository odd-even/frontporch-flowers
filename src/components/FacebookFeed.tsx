import Link from "next/link";
import { PhotoGallery } from "@/components/PhotoGallery";
import { FacebookFeedGrid } from "@/components/FacebookFeedGrid";
import {
  getFacebookPageUrl,
  getFacebookPostsPage,
  isFacebookFeedConfigured,
} from "@/lib/facebook";
import { getInstagramFallbackPhotos } from "@/lib/photos.server";

interface FacebookFeedProps {
  pageUrl?: string;
}

export async function FacebookFeed({ pageUrl }: FacebookFeedProps) {
  const facebookUrl = getFacebookPageUrl(pageUrl);
  const { posts, nextCursor } = await getFacebookPostsPage({ limit: 9 });
  const connected = isFacebookFeedConfigured() && posts.length > 0;
  const fallbackPhotos = getInstagramFallbackPhotos();

  return (
    <section className="py-20 md:py-28 bg-charcoal text-cream">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p className="text-sage-light text-sm uppercase tracking-[0.2em] mb-3">
          From the garden
        </p>
        <h2 className="font-display text-4xl md:text-5xl mb-4">
          Follow along on Facebook
        </h2>
        <p className="text-cream/70 max-w-lg mx-auto mb-10">
          See what&apos;s blooming, get a peek at recent bouquets, and be the first to know
          about workshops and pick-your-own days.
        </p>

        {connected ? (
          <FacebookFeedGrid initialPosts={posts} initialCursor={nextCursor} />
        ) : (
          <div className="mb-10">
            <PhotoGallery
              photos={fallbackPhotos}
              layout="square"
              gridClassName="grid grid-cols-2 md:grid-cols-4 gap-3"
            />
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-4">
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-3.5 bg-cream text-charcoal rounded-full font-medium hover:bg-cream-dark transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Front Porch Flowers
          </a>
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 px-8 py-3.5 border border-cream/30 text-cream rounded-full font-medium hover:bg-cream/10 transition-colors"
          >
            View full gallery
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
