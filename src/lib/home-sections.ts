export const HOME_SECTIONS = [
  { id: "about", label: "About" },
  { id: "events", label: "Workshops" },
  { id: "bouquets", label: "Order" },
  { id: "follow", label: "Follow" },
] as const;

export type HomeSectionId = (typeof HOME_SECTIONS)[number]["id"];

export const HOME_SECTION_IDS = HOME_SECTIONS.map((section) => section.id);
