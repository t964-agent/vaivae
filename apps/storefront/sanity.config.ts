"use client";

import { codeInput } from "@sanity/code-input";
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import {
  defineDocuments,
  defineLocations,
  presentationTool,
  type DocumentLocation,
  type DocumentLocationsState,
} from "sanity/presentation";
import { structureTool } from "sanity/structure";

import { apiVersion, dataset, projectId, studioUrl } from "./src/sanity/api";
import { schemaTypes } from "./src/sanity/schemas";
import { OpenInMedusaAdminAction } from "./src/sanity/actions/open-in-medusa-admin";
import { createHiddenTypes, singletonTypes, structure } from "./src/sanity/structure";

const singletonTypeSet = new Set<string>(singletonTypes);
const blockedSingletonActions = new Set(["delete", "duplicate"]);
const createHiddenTypeSet = new Set<string>(createHiddenTypes);
const syncedDocumentTypeSet = new Set<string>(["product"]);
const blockedSyncedDocumentActions = new Set(["delete", "duplicate", "unpublish"]);
const studioHost = process.env["SANITY_STUDIO_HOSTNAME"];
const previewBaseUrl = process.env["NEXT_PUBLIC_BASE_URL"]?.trim() || "http://localhost:3000";

type LocationValue = {
  handle?: unknown;
  slug?: unknown;
  title?: unknown;
};

function getString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function getRouteParam(params: Record<string, string>, key: string): Record<string, string> {
  return { [key]: params[key] ?? "" };
}

function createLocation(
  value: LocationValue | null,
  options: {
    fallbackTitle: string;
    field?: "handle" | "slug";
    prefix: string;
  },
): DocumentLocationsState {
  const field = options.field ?? "slug";
  const slug = getString(value?.[field]);

  if (!slug) {
    return {
      message: "Add a slug before previewing this document.",
      tone: "caution",
    };
  }

  const title = getString(value?.title) ?? options.fallbackTitle;
  const href = options.prefix ? `${options.prefix}/${slug}` : `/${slug}`;

  return {
    locations: [{ href, title } satisfies DocumentLocation],
  };
}

const presentationResolve = {
  locations: {
    capsule: defineLocations({
      resolve: (value: LocationValue | null) =>
        createLocation(value, { fallbackTitle: "Capsule", prefix: "/capsule" }),
      select: { slug: "slug.current", title: "title" },
    }),
    homePage: defineLocations({
      locations: [{ href: "/", title: "Home" }],
    }),
    journal: defineLocations({
      resolve: (value: LocationValue | null) =>
        createLocation(value, { fallbackTitle: "Journal", prefix: "/journal" }),
      select: { slug: "slug.current", title: "title" },
    }),
    legal: defineLocations({
      resolve: (value: LocationValue | null) =>
        createLocation(value, { fallbackTitle: "Legal", prefix: "" }),
      select: { slug: "slug.current", title: "title" },
    }),
    lookbook: defineLocations({
      resolve: (value: LocationValue | null) =>
        createLocation(value, { fallbackTitle: "Lookbook", prefix: "/lookbook" }),
      select: { slug: "slug.current", title: "title" },
    }),
    page: defineLocations({
      resolve: (value: LocationValue | null) =>
        createLocation(value, { fallbackTitle: "Page", prefix: "" }),
      select: { slug: "slug.current", title: "title" },
    }),
    product: defineLocations({
      resolve: (value: LocationValue | null) =>
        createLocation(value, {
          fallbackTitle: "Product",
          field: "handle",
          prefix: "/products",
        }),
      select: { handle: "handle.current", title: "title" },
    }),
  },
  mainDocuments: defineDocuments([
    { route: "/", type: "homePage" },
    {
      filter: `_type == "page" && slug.current == $slug`,
      params: ({ params }) => getRouteParam(params, "slug"),
      route: "/:slug",
    },
    {
      filter: `_type == "legal" && slug.current == $slug`,
      params: ({ params }) => getRouteParam(params, "slug"),
      route: "/:slug",
    },
    {
      filter: `_type == "lookbook" && slug.current == $slug`,
      params: ({ params }) => getRouteParam(params, "slug"),
      route: "/lookbook/:slug",
    },
    {
      filter: `_type == "journal" && slug.current == $slug`,
      params: ({ params }) => getRouteParam(params, "slug"),
      route: "/journal/:slug",
    },
    {
      filter: `_type == "capsule" && slug.current == $slug`,
      params: ({ params }) => getRouteParam(params, "slug"),
      route: "/capsule/:slug",
    },
    {
      filter: `_type == "product" && handle.current == $handle`,
      params: ({ params }) => getRouteParam(params, "handle"),
      route: "/products/:handle",
    },
  ]),
};

export default defineConfig({
  basePath: studioUrl,
  dataset,
  document: {
    actions: (previousActions, context) => {
      if (syncedDocumentTypeSet.has(context.schemaType)) {
        const syncedDocumentActions = previousActions.filter((action) => {
          const actionName = action.action;

          return actionName ? !blockedSyncedDocumentActions.has(actionName) : true;
        });

        return [...syncedDocumentActions, OpenInMedusaAdminAction];
      }

      if (!singletonTypeSet.has(context.schemaType)) {
        return previousActions;
      }

      return previousActions.filter((action) => {
        const actionName = action.action;

        return actionName ? !blockedSingletonActions.has(actionName) : true;
      });
    },
    newDocumentOptions: (previousOptions) =>
      previousOptions.filter((templateItem) => {
        const templateId = templateItem.templateId;

        return templateId ? !createHiddenTypeSet.has(templateId) : true;
      }),
  },
  name: "default",
  plugins: [
    structureTool({ structure }),
    presentationTool({
      previewUrl: {
        initial: previewBaseUrl,
        previewMode: {
          disable: "/api/draft-mode/disable",
          enable: "/api/draft-mode/enable",
        },
      },
      resolve: presentationResolve,
    }),
    visionTool({ defaultApiVersion: apiVersion }),
    codeInput(),
  ],
  projectId,
  schema: {
    types: schemaTypes,
  },
  ...(studioHost ? { studioHost } : {}),
  title: "vaïvae",
});
