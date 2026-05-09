import type { Metadata } from "next";

import { PageBuilder } from "@/components/page-builder/page-builder";
import type { PageBuilderModule, PageBuilderModuleOf } from "@/components/page-builder/types";

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
  title: "Module Preview — vaïvae",
};

type PreviewImage = NonNullable<PageBuilderModuleOf<"imagePair">["leftImage"]>;
type PreviewBlock = NonNullable<PageBuilderModuleOf<"brandPromise">["body"]>[number];
type PreviewCta = NonNullable<PageBuilderModuleOf<"ctaSection">["primaryCta"]>;

function mockImage(alt: string): PreviewImage {
  return {
    _type: "vaivaeImage",
    alt,
    asset: {
      _id: "image-G3i4emG6B8JnTmGoN0UjgAp8-3000x2000-jpg",
      _type: "sanity.imageAsset",
      metadata: {
        dimensions: {
          aspectRatio: 1.5,
          height: 2000,
          width: 3000,
        },
        lqip: null,
      },
      url: "https://cdn.sanity.io/images/vaivae/production/G3i4emG6B8JnTmGoN0UjgAp8-3000x2000.jpg",
    },
    caption: null,
    crop: null,
    hotspot: null,
  };
}

function mockKeyedImage(
  key: string,
  alt: string,
): NonNullable<PageBuilderModuleOf<"lookbookGrid">["images"]>[number] {
  return { _key: key, ...mockImage(alt) };
}

function mockBlock(key: string, text: string): PreviewBlock {
  return {
    _key: key,
    _type: "block",
    children: [
      {
        _key: `${key}-span`,
        _type: "span",
        marks: [],
        text,
      },
    ],
    markDefs: [],
    style: "normal",
  };
}

function mockCta(label: string): PreviewCta {
  return {
    _type: "cta",
    label,
    link: {
      _type: "link",
      href: "#preview-modules",
      internal: null,
      internalTarget: null,
      label,
      targetBlank: false,
      type: "internal",
    },
    style: "underline",
  };
}

const product = {
  _id: "productContent.preview-slip",
  _type: "product",
  editorialReady: true,
  handle: "preview-slip-dress",
  heroImage: mockImage("Preview product on a cream backdrop"),
  medusaProductId: "prod_preview_slip",
  oneLineHook: "Bias-cut silk with a quiet line.",
  title: "Preview Slip Dress",
} as const;

const previewModules = [
  {
    _key: "hero-film",
    _type: "heroFilm",
    chapters: [
      {
        _key: "chapter-1",
        _type: "heroFilmChapter",
        align: "left",
        body: [mockBlock("chapter-1-body", "A held frame for the opening movement.")],
        eyebrow: "Chapter 01",
        heading: "The first light",
        mediaPoster: mockImage("Hero chapter poster"),
        note: "Preview only",
      },
      {
        _key: "chapter-2",
        _type: "heroFilmChapter",
        align: "right",
        body: [mockBlock("chapter-2-body", "The second movement remains intentionally spare.")],
        eyebrow: "Chapter 02",
        heading: "The room answers",
        mediaPoster: mockImage("Second hero chapter poster"),
        note: null,
      },
    ],
    cta: mockCta("Enter the story"),
    eyebrow: "The living runway",
    heading: "Clothes for <em>living</em> in motion",
    marquee: {
      direction: "left",
      enabled: true,
      separator: "·",
      speed: 60,
      text: "vaïvae preview modules",
    },
    media: {
      directUrl: null,
      muxPlaybackId: "B8ZuF45hL3WJk7eBqQpX02Jx7yJ9bE6Pj",
      posterImage: mockImage("Hero film poster"),
      sourceType: "image",
    },
    scrollIndicator: true,
    subhead: "A smoke-test surface for the brand component layer.",
    terminalCta: {
      body: "Terminal CTA preview.",
      eyebrow: "Next",
      heading: "Continue",
      primaryCta: mockCta("Primary"),
      secondaryCta: mockCta("Secondary"),
    },
  },
  {
    _key: "brand-promise",
    _type: "brandPromise",
    alignment: "center",
    body: [
      mockBlock("brand-body", "Every module is restrained, editorial, and source-of-truth aware."),
    ],
    cta: mockCta("Read the promise"),
    eyebrow: "Promise",
    statement: "A quieter kind of presence.",
    theme: "dark-text-on-light",
    width: "narrow",
  },
  {
    _key: "product-rail",
    _type: "productRail",
    columns: 3,
    cta: mockCta("Shop the edit"),
    density: "standard",
    eyebrow: "The edit",
    heading: "Product rail",
    intro: "Sanity fields render first; Medusa enrichment can arrive separately.",
    layout: "carousel",
    products: [
      product,
      {
        ...product,
        _id: "productContent.preview-coat",
        handle: "preview-coat",
        title: "Preview Coat",
      },
      {
        ...product,
        _id: "productContent.preview-trouser",
        handle: "preview-trouser",
        title: "Preview Trouser",
      },
      {
        ...product,
        _id: "productContent.preview-knit",
        handle: "preview-knit",
        title: "Preview Knit",
      },
    ],
  },
  {
    _key: "capsule-rail",
    _type: "capsuleRail",
    capsules: [
      {
        _id: "capsule.preview-01",
        _type: "capsule",
        slug: "preview-capsule",
        title: "Preview Capsule",
      },
      {
        _id: "capsule.preview-02",
        _type: "capsule",
        slug: "preview-study",
        title: "Preview Study",
      },
    ],
    cta: mockCta("View capsules"),
    eyebrow: "Capsules",
    heading: "Capsule rail",
  },
  {
    _key: "editorial-excerpt",
    _type: "editorialExcerpt",
    cta: mockCta("Read journal"),
    customHeading: "A note from the atelier",
    eyebrow: "Excerpt",
    journalEntry: {
      _id: "journal.preview",
      _type: "journal",
      slug: "preview-journal",
      title: "Preview Journal",
    },
    quote: "The garment should keep its own counsel.",
  },
  {
    _key: "lookbook-grid",
    _type: "lookbookGrid",
    cta: mockCta("Open lookbook"),
    eyebrow: "Lookbook",
    heading: "Lookbook grid",
    images: [
      mockKeyedImage("look-1", "Look one"),
      mockKeyedImage("look-2", "Look two"),
      mockKeyedImage("look-3", "Look three"),
    ],
    layout: "grid",
    lookbookEntry: {
      _id: "lookbook.preview",
      _type: "lookbook",
      slug: "preview-lookbook",
      title: "Preview Lookbook",
    },
  },
  {
    _key: "journal-rail",
    _type: "journalRail",
    cta: mockCta("All journal"),
    entries: [
      {
        _id: "journal.preview-1",
        _type: "journal",
        slug: "preview-one",
        title: "Preview Note One",
      },
      {
        _id: "journal.preview-2",
        _type: "journal",
        slug: "preview-two",
        title: "Preview Note Two",
      },
      {
        _id: "journal.preview-3",
        _type: "journal",
        slug: "preview-three",
        title: "Preview Note Three",
      },
    ],
    eyebrow: "Journal",
    heading: "Journal rail",
    limit: 3,
    mode: "curated",
  },
  {
    _key: "image-pair",
    _type: "imagePair",
    cta: mockCta("View spread"),
    eyebrow: "Spread",
    heading: "Image pair",
    layout: "left-emphasis",
    leftCaption: "Left frame",
    leftImage: mockImage("Left editorial frame"),
    rightCaption: "Right frame",
    rightImage: mockImage("Right editorial frame"),
    theme: "dark-text-on-light",
  },
  {
    _key: "video-chapter",
    _type: "videoChapter",
    body: [
      mockBlock("video-body", "The player lazy-mounts and keeps the poster as the first surface."),
    ],
    eyebrow: "Chapter",
    heading: "Video chapter",
    muxPlaybackId: "B8ZuF45hL3WJk7eBqQpX02Jx7yJ9bE6Pj",
    posterImage: mockImage("Video chapter poster"),
    productHotspots: [
      {
        _key: "hotspot-1",
        _type: "productHotspot",
        label: "Slip dress",
        product,
        timestampSeconds: 12,
      },
    ],
    theme: "light-text-on-dark",
  },
  {
    _key: "quote",
    _type: "quote",
    attribution: "vaïvae notes",
    quote: "Luxury is a tempo before it is a logo.",
    source: "Preview",
    style: "pull",
  },
  {
    _key: "cta-section",
    _type: "ctaSection",
    background: {
      image: null,
      solidColor: "oxblood",
      type: "solidColor",
    },
    body: "A final call-to-action band with reversible theme handling.",
    eyebrow: "Continue",
    heading: "CTA section",
    primaryCta: mockCta("Primary action"),
    secondaryCta: mockCta("Secondary action"),
    theme: "light-text-on-dark",
  },
] satisfies PageBuilderModule[];

export default function PreviewModulesPage() {
  return (
    <div className="bg-cream text-on-light" id="preview-modules">
      <header className="mx-auto max-w-7xl px-6 py-20 md:px-8 lg:px-12">
        <p className="font-body text-xs tracking-[0.28em] text-on-light/50 uppercase">Smoke test</p>
        <h1 className="mt-4 font-display text-6xl leading-none font-light tracking-[-0.055em] md:text-8xl">
          Preview modules
        </h1>
      </header>
      {previewModules.map((builderModule) => (
        <section className="border-t border-on-light/10" key={builderModule._key}>
          <div className="mx-auto max-w-7xl px-6 py-6 md:px-8 lg:px-12">
            <h2 className="font-body text-xs tracking-[0.24em] text-on-light/45 uppercase">
              {builderModule._type}
            </h2>
          </div>
          <PageBuilder modules={[builderModule]} />
        </section>
      ))}
    </div>
  );
}
