import { PageHeader } from "@/components/AboutTeaser";
import { PhotoGallery } from "@/components/PhotoGallery";
import { PickYourOwnFeatured } from "@/components/PickYourOwnFeatured";
import { FacebookIcon, InstagramIcon } from "@/components/SocialIcons";
import { getFacebookPageUrl } from "@/lib/facebook";
import { getPickYourOwnEvents, getSiteSettings } from "@/lib/queries";
import {
  getBouquetWorkshopPhotos,
  getPickYourOwnPhoto,
} from "@/lib/photos.server";

export const metadata = {
  title: "Events",
  description:
    "Pick-your-own garden days and seasonal workshops at Front Porch Flowers in Bedell, NB. Reserve your spot for the next visit.",
};

export default async function EventsPage() {
  const [settings, events] = await Promise.all([
    getSiteSettings(),
    getPickYourOwnEvents(),
  ]);
  const workshopPhotos = getBouquetWorkshopPhotos();
  const gardenPhoto = getPickYourOwnPhoto();
  const photos = [...workshopPhotos, gardenPhoto].filter(
    (photo, index, list) => list.findIndex((item) => item.src === photo.src) === index
  );
  const facebookUrl = getFacebookPageUrl(settings.facebookPageUrl);
  const instagramHandle = settings.instagramHandle || "front_porchflowers";
  const instagramUrl = `https://www.instagram.com/${instagramHandle}`;
  const nextPyo = events[0];

  return (
    <>
      <PageHeader
        eyebrow="In the garden"
        title="Events"
        description={
          nextPyo
            ? "Come pick and arrange your own bouquet — next workshop is ready to reserve."
            : "Workshops and pick-your-own days — announcements coming soon on social."
        }
      />

      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6 space-y-14">
          {nextPyo ? (
            <PickYourOwnFeatured
              event={nextPyo}
              photos={workshopPhotos}
              facebookUrl={facebookUrl}
            />
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-warm-brown/75 text-sm max-w-xl leading-relaxed">
                Follow along for dates, details, and how to join.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn gap-2 px-4 py-2 bg-sage text-cream hover:bg-sage-dark"
                >
                  <FacebookIcon />
                  Facebook
                </a>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn gap-2 px-4 py-2 border border-sage/30 text-sage-dark hover:border-sage hover:bg-sage/5"
                >
                  <InstagramIcon />
                  Instagram
                </a>
              </div>
            </div>
          )}

          {photos.length > 0 && (
            <div>
              <h2 className="font-display text-2xl md:text-3xl text-charcoal mb-6">
                A peek at the workshop
              </h2>
              <PhotoGallery photos={photos} layout="square" />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
