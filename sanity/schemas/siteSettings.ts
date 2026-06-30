import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "tagline",
      title: "Homepage Tagline",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "aboutText",
      title: "About Text",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "instagramHandle",
      title: "Instagram Handle",
      type: "string",
      description: "Without the @",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
    }),
    defineField({
      name: "location",
      title: "Location / Pickup Info",
      type: "string",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Site Settings" };
    },
  },
});
