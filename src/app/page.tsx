import { Hero } from "@/components/Hero";
import { BouquetGrid } from "@/components/BouquetCard";
import { WorkshopsSection } from "@/components/WorkshopCard";
import { AboutTeaser, InstagramFeed, PickYourOwnTeaser } from "@/components/AboutTeaser";
import {
  getBouquets,
  getPickYourOwnEvents,
  getSiteSettings,
  getWorkshops,
} from "@/lib/queries";

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
      <BouquetGrid bouquets={bouquets} />
      <AboutTeaser aboutText={settings.aboutText} />
      <PickYourOwnTeaser
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
      <WorkshopsSection workshops={workshops} />
      <InstagramFeed />
    </>
  );
}
