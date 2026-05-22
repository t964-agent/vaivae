import { defineArrayMember } from "sanity";

export const pageBuilderTypes = [
  "heroFilm",
  "brandPromise",
  "productRail",
  "editorialExcerpt",
  "lookbookGrid",
  "journalRail",
  "imagePair",
  "videoChapter",
  "quote",
  "ctaSection",
] as const;

export const homePageBuilderTypes = [
  "heroFilm",
  "editorialExcerpt",
  "brandPromise",
  "productRail",
  "journalRail",
  "ctaSection",
  "imagePair",
] as const;

export const productStorytellingTypes = ["imagePair", "videoChapter", "quote"] as const;

export const pageBuilderArray = pageBuilderTypes.map((type) => defineArrayMember({ type }));

export const homePageBuilderArray = homePageBuilderTypes.map((type) => defineArrayMember({ type }));

export const productStorytellingArray = productStorytellingTypes.map((type) =>
  defineArrayMember({ type }),
);

export const pageBuilderOptions = {
  insertMenu: {
    filter: "auto" as const,
    groups: [
      { name: "hero", of: ["heroFilm"], title: "Hero" },
      {
        name: "editorial",
        of: ["brandPromise", "editorialExcerpt", "imagePair", "videoChapter", "quote"],
        title: "Editorial",
      },
      {
        name: "commerce",
        of: ["productRail", "lookbookGrid", "journalRail", "ctaSection"],
        title: "Commerce and navigation",
      },
    ],
    showIcons: true,
    views: [{ name: "list" as const }],
  },
  layout: "list" as const,
  sortable: true,
};

export const productStorytellingOptions = {
  insertMenu: {
    filter: "auto" as const,
    groups: [{ name: "editorial", of: ["imagePair", "videoChapter", "quote"], title: "Editorial" }],
    showIcons: true,
    views: [{ name: "list" as const }],
  },
  layout: "list" as const,
  sortable: true,
};

export function validateSingleHeroFilm(value: unknown): true | string {
  if (!Array.isArray(value)) {
    return true;
  }

  const heroCount = value.filter(
    (item) => item && typeof item === "object" && "_type" in item && item._type === "heroFilm",
  ).length;

  return heroCount <= 1 ? true : "Use at most one hero film module per page.";
}
