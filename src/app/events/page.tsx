import { PageHeader } from "@/components/AboutTeaser";
import { PhotoGallery } from "@/components/PhotoGallery";
import { FacebookIcon, InstagramIcon } from "@/components/SocialIcons";
import { getFacebookPageUrl } from "@/lib/facebook";
import { getSiteSettings } from "@/lib/queries";
import { getPickYourOwnPhoto, getWorkshopPhotos } from "@/lib/photos.server";

export const metadata = {
  title: "Events",
  description:
    "Pick-your-own days and seasonal workshops in Woodstock, NB. Dates are announced on social when they're ready.",
};

export default async function EventsPage() {
  const settings = await getSiteSettings();
  const workshopPhotos = getWorkshopPhotos();
  const gardenPhoto = getPickYourOwnPhoto();
  const photos = [gardenPhoto, ...workshopPhotos].filter(
    (photo, index, list) => list.findIndex((item) => item.src === photo.src) === index
  );
  const facebookUrl = getFacebookPageUrl(settings.facebookPageUrl);
  const instagramHandle = settings.instagramHandle || "front_porchflowers";
  const instagramUrl = `https://www.instagram.com/${instagramHandle}`;

  return (
    <>
      <PageHeader
        eyebrow="In the garden"
        title="Events"
        description="Workshops and pick-your-own days — announcements coming soon on social."
      />

      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
            <p className="text-warm-brown/75 text-sm max-w-xl leading-relaxed">
              Follow along for dates, details, and how to join.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-sage text-cream rounded-full text-sm font-medium hover:bg-sage-dark transition-colors"
              >
                <FacebookIcon />
                Facebook
              </a>
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-sage/30 text-sage-dark rounded-full text-sm font-medium hover:border-sage hover:bg-sage/5 transition-colors"
              >
                <InstagramIcon />
                Instagram
              </a>
            </div>
          </div>

          {photos.length > 0 && <PhotoGallery photos={photos} layout="square" />}
        </div>
      </section>
    </>
  );
}
