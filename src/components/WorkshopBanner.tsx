import { WorkshopBannerRotator } from "@/components/WorkshopBannerRotator";
import { getPickYourOwnEvents } from "@/lib/queries";
import { formatShortDate, workshopAnchorId } from "@/lib/utils";

export async function WorkshopBanner() {
  const events = await getPickYourOwnEvents();
  if (!events.length) return null;

  const items = events.map((event) => {
    const dateLabel = formatShortDate(event.date);
    const timeLabel =
      event.startTime && event.endTime
        ? `${event.startTime.replace(":00 ", " ")}–${event.endTime.replace(":00 ", " ")}`
        : null;

    return {
      id: event._id,
      href: `/#${workshopAnchorId(event)}`,
      title: event.title,
      detail: `· ${dateLabel}${timeLabel ? ` · ${timeLabel}` : ""}`,
    };
  });

  return <WorkshopBannerRotator items={items} />;
}
