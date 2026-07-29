import { Hero } from "@/components/Hero";
import { BouquetGrid } from "@/components/BouquetCard";
import { WorkshopsSection } from "@/components/WorkshopCard";
import { AboutTeaser, PickYourOwnTeaser } from "@/components/AboutTeaser";
import { FacebookFeed } from "@/components/FacebookFeed";
import { getContactEmail } from "@/lib/email";
import { getFacebookPageUrl } from "@/lib/facebook";
import {
  getBouquets,
  getPickYourOwnEvents,
  getSiteSettings,
  getWorkshops,
} from "@/lib/queries";

/** Keep Facebook posts fresh; homepage is server-rendered with env-backed Graph API. */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, bouquets, workshops, events] = await Promise.all([
    getSiteSettings(),
    getBouquets(),
    getWorkshops(),
    getPickYourOwnEvents(),
  ]);

  const nextEvent = events[0];

  return (
    <>
      <Hero tagline={settings.tagline} />
      <BouquetGrid bouquets={bouquets} contactEmail={getContactEmail(settings.email)} />
      <AboutTeaser aboutText={settings.aboutText} />
      <PickYourOwnTeaser
        facebookUrl={getFacebookPageUrl(settings.facebookPageUrl)}
        nextEvent={
          nextEvent
            ? {
                title: nextEvent.title,
                date: nextEvent.date,
                startTime: nextEvent.startTime,
                endTime: nextEvent.endTime,
              }
            : undefined
        }
      />
      <WorkshopsSection
        workshops={workshops}
        facebookUrl={getFacebookPageUrl(settings.facebookPageUrl)}
      />
      <FacebookFeed pageUrl={settings.facebookPageUrl} />
    </>
  );
}
