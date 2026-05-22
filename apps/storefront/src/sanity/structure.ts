import {
  BookIcon,
  CogIcon,
  ControlsIcon,
  ColorWheelIcon,
  DocumentIcon,
  DocumentsIcon,
  EarthGlobeIcon,
  HomeIcon,
  ImagesIcon,
  MenuIcon,
  PackageIcon,
  StackCompactIcon,
} from "@sanity/icons";

import type { StructureResolver } from "sanity/structure";

export const singletonTypes = ["siteSettings", "navigation", "footer", "homePage"] as const;
export const createHiddenTypes = [...singletonTypes, "product"] as const;

const editorialTypes = ["lookbook", "journal", "legal"] as const;
const catalogTypes = ["product", "material", "colorSwatch", "sizeGuide"] as const;
const explicitlyStructuredTypes = new Set<string>([
  ...createHiddenTypes,
  ...editorialTypes,
  ...catalogTypes,
  "page",
]);

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .id("settings")
        .icon(CogIcon)
        .title("Settings")
        .child(
          S.list()
            .id("settingsList")
            .title("Settings")
            .items([
              S.documentListItem({ id: "siteSettings", schemaType: "siteSettings" })
                .icon(ControlsIcon)
                .schemaType("siteSettings")
                .title("Site Settings"),
              S.documentListItem({ id: "navigation", schemaType: "navigation" })
                .icon(MenuIcon)
                .schemaType("navigation")
                .title("Navigation"),
              S.documentListItem({ id: "footer", schemaType: "footer" })
                .icon(StackCompactIcon)
                .schemaType("footer")
                .title("Footer"),
            ]),
        ),
      S.divider(),
      S.listItem()
        .id("pages")
        .icon(DocumentsIcon)
        .title("Pages")
        .child(
          S.list()
            .id("pagesList")
            .title("Pages")
            .items([
              S.documentListItem({ id: "homePage", schemaType: "homePage" })
                .icon(HomeIcon)
                .schemaType("homePage")
                .title("Home page"),
              S.documentTypeListItem("page").icon(DocumentIcon).title("Other pages"),
            ]),
        ),
      S.listItem()
        .id("editorial")
        .icon(BookIcon)
        .title("Editorial")
        .child(
          S.list()
            .id("editorialList")
            .title("Editorial")
            .items([
              S.documentTypeListItem("lookbook").icon(ImagesIcon).title("Lookbooks"),
              S.documentTypeListItem("journal").icon(BookIcon).title("Journal"),
              S.divider(),
              S.documentTypeListItem("legal").icon(DocumentIcon).title("Legal"),
            ]),
        ),
      S.listItem()
        .id("catalog")
        .icon(PackageIcon)
        .title("Catalog")
        .child(
          S.list()
            .id("catalogList")
            .title("Catalog")
            .items([
              S.documentTypeListItem("product").icon(PackageIcon).title("Products"),
              S.documentTypeListItem("material").icon(EarthGlobeIcon).title("Materials"),
              S.documentTypeListItem("colorSwatch").icon(ColorWheelIcon).title("Color swatches"),
              S.documentTypeListItem("sizeGuide").icon(ControlsIcon).title("Size guides"),
            ]),
        ),
      S.divider(),
      ...S.documentTypeListItems().filter((listItem) => {
        const id = listItem.getId();

        return id ? !explicitlyStructuredTypes.has(id) : true;
      }),
    ]);
