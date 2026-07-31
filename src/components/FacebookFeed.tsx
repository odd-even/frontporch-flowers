import Link from "next/link";
import { PhotoGallery } from "@/components/PhotoGallery";
import { FacebookFeedGrid } from "@/components/FacebookFeedGrid";
import { FacebookIcon, InstagramIcon } from "@/components/SocialIcons";
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
  const { posts, nextCursor } = await getFacebookPostsPage({
    limit: 6,
    dynamic: true,
  });
  const connected = isFacebookFeedConfigured() && posts.length > 0;
  const fallbackPhotos = getInstagramFallbackPhotos();

  return (
    <section className="py-20 md:py-28 bg-charcoal text-cream">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p className="text-sage-light text-sm uppercase tracking-[0.2em] mb-3">
          From the garden
        </p>
        <h2 className="font-display text-4xl md:text-5xl mb-4">
          Follow along
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
            <FacebookIcon className="w-5 h-5" />
            Facebook
          </a>
          <a
            href="https://www.instagram.com/front_porchflowers"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-3.5 bg-cream text-charcoal rounded-full font-medium hover:bg-cream-dark transition-colors"
          >
            <InstagramIcon className="w-5 h-5" />
            Instagram
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
