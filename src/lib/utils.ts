import type { PickYourOwnEvent } from "@/lib/types";

export function formatDate(dateString: string): string {
  const date = new Date(dateString + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatShortDate(dateString: string): string {
  const date = new Date(dateString + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** Stable homepage anchors for workshop banner deep-links. */
export function workshopAnchorId(event: PickYourOwnEvent) {
  if (/pumpkin/i.test(event.title) || /pumpkin/i.test(event.description || "")) {
    return "workshop-pumpkin";
  }
  if (/wreath/i.test(event.title) || /wreath/i.test(event.description || "")) {
    return "workshop-wreath";
  }
  if (/stem\s*&\s*style/i.test(event.title)) {
    return "workshop-stem-style";
  }
  return `workshop-${event._id}`;
}
