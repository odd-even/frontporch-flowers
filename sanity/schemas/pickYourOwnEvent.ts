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
