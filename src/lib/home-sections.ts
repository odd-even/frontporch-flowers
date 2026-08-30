export const HOME_SECTIONS = [
  { id: "about", label: "About" },
  { id: "bouquets", label: "Order a bouquet" },
  { id: "events", label: "Events" },
] as const;

export type HomeSectionId = (typeof HOME_SECTIONS)[number]["id"];

export const HOME_SECTION_IDS = HOME_SECTIONS.map((section) => section.id);
