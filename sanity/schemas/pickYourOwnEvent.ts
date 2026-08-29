import { defineField, defineType } from "sanity";

export default defineType({
  name: "pickYourOwnEvent",
  title: "Pick Your Own Event",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "date",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "startTime",
      title: "Start Time",
      type: "string",
      description: 'e.g. "9:00 AM"',
    }),
    defineField({
      name: "endTime",
      title: "End Time",
      type: "string",
      description: 'e.g. "12:00 PM"',
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "spotsAvailable",
      title: "Capacity (optional)",
      type: "number",
    }),
    defineField({
      name: "priceCents",
      title: "Price per person (cents)",
      type: "number",
      description: "e.g. 2500 for $25.00 CAD. Required for Square prepaid booking.",
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      options: { list: ["CAD", "USD"] },
      initialValue: "CAD",
    }),
    defineField({
      name: "squarePaymentLinkUrl",
      title: "Square payment link (optional override)",
      type: "url",
      description: "Optional fixed Square link if not using dynamic checkout.",
    }),
  ],
  orderings: [
    {
      title: "Date",
      name: "dateAsc",
      by: [{ field: "date", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", date: "date" },
    prepare({ title, date }) {
      return { title, subtitle: date };
    },
  },
});
