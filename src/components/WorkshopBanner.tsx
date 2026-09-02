import Link from "next/link";
import { getPickYourOwnEvents } from "@/lib/queries";
import { formatShortDate } from "@/lib/utils";

export async function WorkshopBanner() {
  const events = await getPickYourOwnEvents();
  const event = events[0];
  if (!event) return null;

  const dateLabel = formatShortDate(event.date);
  const timeLabel =
    event.startTime && event.endTime
      ? `${event.startTime.replace(":00 ", " ")}–${event.endTime.replace(":00 ", " ")}`
      : null;

  return (
    <div
      data-workshop-banner
      className="fixed inset-x-0 top-0 z-[120] h-8 border-b border-cream/10 bg-[#182126] text-cream"
    >
      <Link
        href="/#events"
        className="flex h-full w-full items-center gap-2 px-6 md:px-8 lg:px-10 transition-colors hover:bg-[#1f2c33]"
      >
        <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.16em] text-cream/70">
          Workshop
        </span>
        <span className="hidden h-2.5 w-px shrink-0 bg-cream/25 sm:block" aria-hidden="true" />
        <span className="min-w-0 truncate text-xs font-medium text-cream sm:text-[13px]">
          {event.title}
          <span className="font-normal text-cream/75">
            {" "}
            · {dateLabel}
            {timeLabel ? ` · ${timeLabel}` : ""}
          </span>
        </span>
        <span className="ml-auto hidden shrink-0 items-center gap-0.5 text-xs font-medium text-cream sm:inline-flex">
          Details
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 6l6 6-6 6" />
          </svg>
        </span>
      </Link>
    </div>
  );
}
