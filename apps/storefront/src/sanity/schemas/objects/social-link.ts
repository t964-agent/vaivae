import { ShareIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

function isHttpsUrl(value: unknown): boolean {
  if (typeof value !== "string" || value.trim().length === 0) {
    return false;
  }

  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export const socialLink = defineType({
  fields: [
    defineField({
      name: "platform",
      options: {
        list: [
          { title: "Instagram", value: "instagram" },
          { title: "TikTok", value: "tiktok" },
          { title: "Pinterest", value: "pinterest" },
          { title: "YouTube", value: "youtube" },
          { title: "LinkedIn", value: "linkedin" },
          { title: "Facebook", value: "facebook" },
          { title: "X", value: "x" },
        ],
      },
      title: "Platform",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      description: "Enter the handle without a leading @.",
      name: "handle",
      title: "Handle",
      type: "string",
      validation: (rule) =>
        rule
          .required()
          .custom((value) =>
            typeof value === "string" && value.trim().length > 0 && !value.trim().startsWith("@")
              ? true
              : "Enter the handle without a leading @.",
          ),
    }),
    defineField({
      name: "url",
      title: "URL",
      type: "url",
      validation: (rule) =>
        rule
          .required()
          .custom((value) => (isHttpsUrl(value) ? true : "Enter a valid HTTP or HTTPS URL.")),
    }),
  ],
  icon: ShareIcon,
  name: "socialLink",
  preview: {
    select: {
      handle: "handle",
      platform: "platform",
    },
    prepare({ handle, platform }) {
      return {
        media: ShareIcon,
        subtitle: handle ? `@${handle}` : "",
        title: platform || "Social link",
      };
    },
  },
  title: "Social Link",
  type: "object",
});
