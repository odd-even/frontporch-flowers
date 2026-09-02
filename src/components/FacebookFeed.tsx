import Image from "next/image";
import { PhotoGallery } from "@/components/PhotoGallery";
import { FacebookFeedGrid } from "@/components/FacebookFeedGrid";
import { Reveal } from "@/components/Reveal";
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
  });
  const connected = isFacebookFeedConfigured() && posts.length > 0;
  const fallbackPhotos = getInstagramFallbackPhotos();

  return (
    <section id="follow" className="relative scroll-mt-24 bg-site-dark-band bg-follow-band py-20 md:py-28 text-cream">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 bottom-0 z-[1] bg-gradient-to-b from-follow-band from-55% via-follow-band/75 via-80% to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <Reveal variant="up" className="mb-10 text-center">
          <p className="text-sage-light text-sm uppercase tracking-[0.2em] mb-3">
            From the garden
          </p>
          <h2 className="font-display text-4xl md:text-5xl mb-4">
            Follow along
          </h2>
          <p className="text-cream/70 max-w-lg mx-auto">
            See what&apos;s blooming, get a peek at recent bouquets, and be the first to know
            about workshops and pick-your-own days.
          </p>
        </Reveal>

        {connected ? (
          <Reveal variant="scale" delay={60}>
            <FacebookFeedGrid
              initialPosts={posts}
              initialCursor={nextCursor}
              facebookUrl={facebookUrl}
            />
          </Reveal>
        ) : (
          <>
            <Reveal variant="scale" delay={60} className="mb-8">
              <PhotoGallery
                photos={fallbackPhotos}
                layout="square"
                gridClassName="grid grid-cols-2 md:grid-cols-4 gap-3"
              />
            </Reveal>
            <Reveal
              variant="up"
              delay={120}
              className="flex flex-wrap items-center justify-end gap-3"
            >
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
                href="https://www.instagram.com/front_porchflowers"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Front Porch Flowers on Instagram"
                className="inline-flex h-11 w-11 items-center justify-center rounded-button border border-cream/35 bg-transparent text-cream transition-colors hover:border-cream/55 hover:bg-cream/5"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
            </Reveal>
          </>
        )}
      </div>
    </section>
  );
}
