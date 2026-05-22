import { createClient, type ClientConfig } from "@sanity/client";
import { createRequire } from "node:module";

type Drop01Material = {
  careInstructions: string;
  composition: string;
  description: readonly string[];
  key: string;
  name: string;
  origin: string;
};

type Drop01ColorSwatch = {
  fallbackTextColor: "dark" | "light";
  hex: `#${string}`;
  key: string;
  name: string;
};

type Drop01SizeGuide = {
  description: string;
  key: string;
  measurements: ReadonlyArray<{
    bust: string;
    hips: string;
    length: string;
    note?: string;
    size: string;
    waist: string;
  }>;
  name: string;
  tips: readonly string[];
  unitSystem: "both" | "cm" | "in";
};

type Drop01Product = {
  description: string;
  handle: string;
  madeIn: string;
  materialKeys: readonly string[];
  medusaProductId: `prod_${string}`;
  sanityEditorial: {
    careNotes: readonly string[];
    colorSwatchKeys: readonly string[];
    eyebrow: string;
    materialKeys: readonly string[];
    modelSpecs: {
      height: string;
      notes: string;
      wearingSize: string;
    };
    narrative: readonly string[];
    oneLineHook: string;
    sizeGuideKey: string;
    sustainabilityNotes: readonly string[];
  };
  title: string;
};

type Drop01Module = {
  DROP_01_COLOR_SWATCHES: readonly Drop01ColorSwatch[];
  DROP_01_MATERIALS: readonly Drop01Material[];
  DROP_01_PRODUCTS: readonly Drop01Product[];
  DROP_01_RELEASE: {
    date: string;
    eyebrow: string;
    title: string;
  };
  DROP_01_SIZE_GUIDES: readonly Drop01SizeGuide[];
};

type Reference = {
  _key?: string;
  _ref: string;
  _type: "reference";
  _weak?: true;
};

type Slug = {
  _type: "slug";
  current: string;
};

type SeedImage = {
  _type: "vaivaeImage";
  alt: string;
  asset: Reference;
  caption?: string;
};

type PortableTextSpan = {
  _key: string;
  _type: "span";
  marks: string[];
  text: string;
};

type PortableTextBlock = {
  _key: string;
  _type: "block";
  children: PortableTextSpan[];
  markDefs: [];
  style: "blockquote" | "h2" | "h3" | "h4" | "normal" | "pullQuote";
};

type SeedDocument = {
  _id: string;
  _type: string;
} & Record<string, unknown>;

type UploadedAsset = {
  _id: string;
};

const nodeRequire = createRequire(import.meta.url);
const {
  DROP_01_COLOR_SWATCHES,
  DROP_01_MATERIALS,
  DROP_01_PRODUCTS,
  DROP_01_RELEASE,
  DROP_01_SIZE_GUIDES,
} = nodeRequire("../../../medusa/src/scripts/drop-01") as Drop01Module;

const SANITY_API_VERSION = "2026-03-01";
const BASE_URL = "https://vaivae.vercel.app";
const PLACEHOLDER_FILENAME = "vaivae-drop-01-placeholder.png";
const PLACEHOLDER_MUX_PLAYBACK_ID = "uNbxnGLKJ00yfbijDO8COxTOyVKT01xpxW";
const PLACEHOLDER_IMAGE_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required to seed Sanity.`);
  }

  return value;
}

const clientConfig = {
  apiVersion: SANITY_API_VERSION,
  dataset:
    process.env["SANITY_DATASET"]?.trim() ||
    process.env["NEXT_PUBLIC_SANITY_DATASET"]?.trim() ||
    "production",
  projectId:
    process.env["SANITY_PROJECT_ID"]?.trim() || requireEnv("NEXT_PUBLIC_SANITY_PROJECT_ID"),
  token: requireEnv("SANITY_WRITE_TOKEN"),
  useCdn: false,
} satisfies ClientConfig;

const client = createClient(clientConfig);

function slug(current: string): Slug {
  return { _type: "slug", current };
}

function weakRef(_ref: string, _key?: string): Reference {
  const reference: Reference = { _ref, _type: "reference", _weak: true };

  if (_key) {
    reference._key = _key;
  }

  return reference;
}

function image(assetId: string, alt: string, caption?: string): SeedImage {
  const base = {
    _type: "vaivaeImage" as const,
    alt,
    asset: { _ref: assetId, _type: "reference" as const },
  };

  return caption ? { ...base, caption } : base;
}

function ptBlock(
  key: string,
  text: string,
  style: PortableTextBlock["style"] = "normal",
): PortableTextBlock {
  return {
    _key: `block-${key}`,
    _type: "block",
    children: [
      {
        _key: `span-${key}-0`,
        _type: "span",
        marks: [],
        text,
      },
    ],
    markDefs: [],
    style,
  };
}

function ptBlocks(prefix: string, paragraphs: readonly string[]): PortableTextBlock[] {
  return paragraphs.map((paragraph, index) => ptBlock(`${prefix}-${index}`, paragraph));
}

function externalLink(_key: string, label: string, pathOrUrl: string): Record<string, unknown> {
  const href = pathOrUrl.startsWith("http") ? pathOrUrl : `${BASE_URL}${pathOrUrl}`;

  return {
    _key,
    _type: "link",
    href,
    label,
    targetBlank: false,
    type: "external",
  };
}

function internalLink(_key: string, label: string, documentId: string): Record<string, unknown> {
  return {
    _key,
    _type: "link",
    internal: weakRef(documentId),
    label,
    targetBlank: false,
    type: "internal",
  };
}

function cta(label: string, path: string, style: "ghost" | "primary" | "underline" = "primary") {
  return {
    _type: "cta",
    label,
    link: externalLink("link", label, path),
    style,
  };
}

function materialId(key: string): string {
  return `material-${key}`;
}

function colorSwatchId(key: string): string {
  return `color-${key}`;
}

function sizeGuideId(key: string): string {
  return `size-guide-${key}`;
}

function materialLabels(product: Drop01Product): string[] {
  return product.materialKeys.map((materialKey) => {
    const material = DROP_01_MATERIALS.find((item) => item.key === materialKey);

    return material?.name ?? materialKey;
  });
}

async function ensurePlaceholderAsset(): Promise<string> {
  const existing = await client.fetch<UploadedAsset | null>(
    '*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{_id}',
    { filename: PLACEHOLDER_FILENAME },
  );

  if (existing?._id) {
    return existing._id;
  }

  const uploaded = (await client.assets.upload(
    "image",
    Buffer.from(PLACEHOLDER_IMAGE_BASE64, "base64"),
    { filename: PLACEHOLDER_FILENAME },
  )) as UploadedAsset;

  return uploaded._id;
}

function siteSettingsDocument(): SeedDocument {
  return {
    _id: "siteSettings",
    _type: "siteSettings",
    address: {
      _type: "address",
      city: "New York",
      country: "United States",
      line1: "Launch showroom address pending",
      postalCode: "10001",
      region: "NY",
    },
    contactEmail: "hello@vaivae.com",
    defaultCurrency: "USD",
    defaultRegion: "United States",
    defaultSeo: {
      _type: "seo",
      description:
        "vaïvae is a luxury editorial fashion house. Drop 01 introduces The Living Runway.",
      keywords: ["vaïvae", "Drop 01", "The Living Runway", "luxury fashion"],
      noindex: false,
      title: "vaïvae - The Living Runway",
    },
    pressEmail: "press@vaivae.com",
    siteName: "vaïvae",
    socialLinks: [
      {
        _key: "instagram",
        _type: "socialLink",
        handle: "vaivae",
        platform: "instagram",
        url: "https://instagram.com/vaivae",
      },
      {
        _key: "tiktok",
        _type: "socialLink",
        handle: "vaivae",
        platform: "tiktok",
        url: "https://www.tiktok.com/@vaivae",
      },
    ],
    tagline: "The Living Runway",
    wholesaleEmail: "wholesale@vaivae.com",
  };
}

function navigationDocument(): SeedDocument {
  return {
    _id: "navigation",
    _type: "navigation",
    headerLinks: [
      externalLink("nav-drop-01", "READY-TO-WEAR", "/products"),
      externalLink("nav-collections", "COLLECTIONS", "/collections/summer-fall-26"),
      externalLink("nav-journal", "Journal", "/journal"),
      externalLink("nav-atelier", "Atelier", "/atelier"),
    ],
    mobileMenuExtras: [
      internalLink("mobile-privacy", "Privacy", "legal-privacy"),
      internalLink("mobile-terms", "Terms", "legal-terms"),
    ],
    promoBannerEnabled: false,
    secondaryLinks: [externalLink("nav-account", "Account", "/account")],
  };
}

function footerDocument(): SeedDocument {
  return {
    _id: "footer",
    _type: "footer",
    columns: [
      {
        _key: "footer-shop",
        _type: "footerColumn",
        links: [
          externalLink("footer-products", "READY-TO-WEAR", "/products"),
          externalLink("footer-collections", "COLLECTIONS", "/collections/summer-fall-26"),
          externalLink("footer-journal", "Journal", "/journal"),
        ],
        title: "Shop",
      },
      {
        _key: "footer-house",
        _type: "footerColumn",
        links: [
          externalLink("footer-atelier", "Atelier", "/atelier"),
          internalLink("footer-wholesale", "Wholesale", "legal-wholesale"),
          externalLink("footer-press", "Press", "/press"),
        ],
        title: "House",
      },
      {
        _key: "footer-care",
        _type: "footerColumn",
        links: [
          internalLink("footer-shipping", "Shipping", "legal-shipping"),
          internalLink("footer-returns", "Returns", "legal-returns"),
          internalLink("footer-accessibility", "Accessibility", "legal-accessibility"),
        ],
        title: "Care",
      },
    ],
    copyrightText: "© {year} vaïvae. All rights reserved.",
    legalLinks: [
      internalLink("legal-privacy", "Privacy", "legal-privacy"),
      internalLink("legal-terms", "Terms", "legal-terms"),
      internalLink("legal-returns", "Returns", "legal-returns"),
      internalLink("legal-shipping", "Shipping", "legal-shipping"),
      internalLink("legal-cookies", "Cookies", "legal-cookies"),
      internalLink("legal-imprint", "Imprint", "legal-imprint"),
    ],
    newsletterCtaLabel: "Subscribe",
    newsletterDescription:
      "Drop notes, atelier letters, and first access to future releases. Configure KLAVIYO_NEWSLETTER_LIST_ID before launch.",
    newsletterEnabled: true,
    newsletterHeading: "Stay in the runway",
    paymentMethods: ["visa", "mastercard", "amex", "applepay", "googlepay"],
  };
}

function materialDocuments(): SeedDocument[] {
  return DROP_01_MATERIALS.map((material) => ({
    _id: materialId(material.key),
    _type: "material",
    careInstructions: material.careInstructions,
    composition: material.composition,
    description: ptBlocks(`material-${material.key}`, material.description),
    name: material.name,
    origin: material.origin,
    slug: slug(material.key),
  }));
}

function colorSwatchDocuments(): SeedDocument[] {
  return DROP_01_COLOR_SWATCHES.map((swatch) => ({
    _id: colorSwatchId(swatch.key),
    _type: "colorSwatch",
    fallbackTextColor: swatch.fallbackTextColor,
    hex: swatch.hex,
    name: swatch.name,
    slug: slug(swatch.key),
  }));
}

function sizeGuideDocuments(): SeedDocument[] {
  return DROP_01_SIZE_GUIDES.map((guide) => ({
    _id: sizeGuideId(guide.key),
    _type: "sizeGuide",
    description: guide.description,
    measurements: guide.measurements.map((measurement) => ({
      _key: `measurement-${guide.key}-${measurement.size.toLowerCase().replace("/", "-")}`,
      _type: "measurement",
      ...measurement,
    })),
    name: guide.name,
    slug: slug(guide.key),
    tipsRichText: ptBlocks(`size-guide-${guide.key}`, guide.tips),
    unitSystem: guide.unitSystem,
  }));
}

function productDocuments(assetId: string): SeedDocument[] {
  return DROP_01_PRODUCTS.map((product) => ({
    _id: product.medusaProductId,
    _type: "product",
    careNotes: ptBlocks(`care-${product.handle}`, product.sanityEditorial.careNotes),
    colorSwatches: product.sanityEditorial.colorSwatchKeys.map((colorKey) => ({
      _key: `color-${product.handle}-${colorKey}`,
      _type: "productColorSwatch",
      swatch: weakRef(colorSwatchId(colorKey)),
    })),
    editorialReady: true,
    eyebrow: product.sanityEditorial.eyebrow,
    gallery: [
      image(
        assetId,
        `${product.title} editorial detail placeholder`,
        "Replace with final Drop 01 product photography.",
      ),
    ],
    handle: slug(product.handle),
    heroImage: image(
      assetId,
      `${product.title} product image placeholder`,
      "Replace with final Drop 01 product photography.",
    ),
    madeIn: product.madeIn,
    materials: product.sanityEditorial.materialKeys.map((materialKey) =>
      weakRef(materialId(materialKey), `material-${product.handle}-${materialKey}`),
    ),
    medusaProductId: product.medusaProductId,
    mirrorMaterials: materialLabels(product),
    modelSpecs: product.sanityEditorial.modelSpecs,
    narrative: ptBlocks(`product-${product.handle}`, product.sanityEditorial.narrative),
    oneLineHook: product.sanityEditorial.oneLineHook,
    seo: {
      _type: "seo",
      description: product.description,
      noindex: false,
      title: `${product.title} - vaïvae`,
    },
    sizeGuide: weakRef(sizeGuideId(product.sanityEditorial.sizeGuideKey)),
    sustainabilityNotes: ptBlocks(
      `sustainability-${product.handle}`,
      product.sanityEditorial.sustainabilityNotes,
    ),
    title: product.title,
  }));
}

function lookbookDocuments(assetId: string): SeedDocument[] {
  return [
    {
      _id: "lookbook-drop-01-living-runway",
      _type: "lookbook",
      coverImage: image(assetId, "Drop 01 lookbook cover placeholder"),
      coverVideo: { muxAssetId: PLACEHOLDER_MUX_PLAYBACK_ID },
      description: ptBlocks("lookbook-living-runway", [
        "Liquid form, living cloth, and a new house resolving frame by frame.",
      ]),
      eyebrow: "Campaign",
      looks: DROP_01_PRODUCTS.slice(0, 4).map((product, index) => ({
        _key: `look-living-runway-${index + 1}`,
        _type: "look",
        caption: product.sanityEditorial.oneLineHook,
        image: image(assetId, `${product.title} look placeholder`),
        products: [weakRef(product.medusaProductId, `look-product-${product.handle}`)],
      })),
      publishedAt: DROP_01_RELEASE.date,
      seo: {
        _type: "seo",
        description: "The Drop 01 lookbook: Terracotta, Glacial, Coral, and Linen in motion.",
        noindex: false,
        title: "Drop 01 Lookbook - vaïvae",
      },
      slug: slug("drop-01-living-runway"),
      title: "Drop 01 - The Living Runway",
    },
    {
      _id: "lookbook-premiere-lounge-collection",
      _type: "lookbook",
      coverImage: image(assetId, "Première lounge collection cover placeholder"),
      description: ptBlocks("lookbook-premiere", [
        "The launch lounge collection in its quieter register: open weave, Écru Argenté, and the final line of the trouser.",
      ]),
      eyebrow: "Première",
      looks: DROP_01_PRODUCTS.slice(3).map((product, index) => ({
        _key: `look-premiere-${index + 1}`,
        _type: "look",
        caption: product.title,
        image: image(assetId, `${product.title} lounge look placeholder`),
        products: [weakRef(product.medusaProductId, `look-product-${product.handle}`)],
      })),
      publishedAt: "2026-05-13T14:00:00.000Z",
      seo: {
        _type: "seo",
        description: "A closer look at the three-piece lounge story inside vaïvae Drop 01.",
        noindex: false,
        title: "Première Lounge Collection - vaïvae",
      },
      slug: slug("premiere-lounge-collection"),
      title: "Première - Lounge Collection",
    },
  ];
}

function journalDocuments(assetId: string): SeedDocument[] {
  const firstProduct = DROP_01_PRODUCTS[0];
  const loungeProducts = DROP_01_PRODUCTS.slice(3);

  if (!firstProduct) {
    throw new Error("Drop 01 must contain at least one product for journal seeding.");
  }

  return [
    {
      _id: "journal-the-living-runway",
      _type: "journal",
      author: "vaïvae editorial",
      body: [
        ptBlock("living-runway-heading", "Out of the gradient, a figure forms.", "h2"),
        ...ptBlocks("living-runway-body", [
          "No model placed on top of the brand. The muse emerges from inside the world - heat, hair, fabric, breath - resolving frame by frame as you move.",
          "Drop 01 begins with four temperatures: Terracotta, Glacial, Coral, and Linen. Each is less a color story than a state of motion.",
        ]),
      ],
      coverImage: image(assetId, "The Living Runway journal cover placeholder"),
      excerpt:
        "The launch note for Drop 01: fabric, light, and color resolving into the first living runway.",
      eyebrow: "Launch note",
      publishedAt: DROP_01_RELEASE.date,
      relatedLookbooks: [
        weakRef("lookbook-drop-01-living-runway", "related-lookbook-living-runway"),
      ],
      relatedProducts: [weakRef(firstProduct.medusaProductId, "related-product-terracotta")],
      seo: {
        _type: "seo",
        description: "The editorial launch note for vaïvae Drop 01 and The Living Runway.",
        noindex: false,
        title: "The Living Runway - vaïvae Journal",
      },
      slug: slug("the-living-runway"),
      subtitle: "How Drop 01 enters the world.",
      tags: ["Drop 01", "Campaign", "The Living Runway"],
      title: "The Living Runway",
    },
    {
      _id: "journal-notes-on-open-weave",
      _type: "journal",
      author: "vaïvae editorial",
      body: [
        ptBlock("open-weave-heading", "Open weave as atmosphere.", "h2"),
        ...ptBlocks("open-weave-body", [
          "The lounge collection uses openness as structure: crochet edges, mesh collars, fine-gauge layers, and a trouser line quiet enough to finish the sentence.",
          "The pieces are made to live together, but not depend on one another. Each carries enough language to stand alone.",
        ]),
      ],
      coverImage: image(assetId, "Open weave journal cover placeholder"),
      excerpt:
        "A material note on the launch lounge pieces: open mesh, contrast trim, Lin Naturel, and Écru Argenté.",
      eyebrow: "Material note",
      publishedAt: "2026-05-14T14:00:00.000Z",
      relatedLookbooks: [
        weakRef("lookbook-premiere-lounge-collection", "related-lookbook-premiere"),
      ],
      relatedProducts: loungeProducts.map((product) =>
        weakRef(product.medusaProductId, `related-product-${product.handle}`),
      ),
      seo: {
        _type: "seo",
        description: "A material note on the open-weave construction inside vaïvae Drop 01.",
        noindex: false,
        title: "Notes on Open Weave - vaïvae Journal",
      },
      slug: slug("notes-on-open-weave"),
      subtitle: "A material note for the launch lounge pieces.",
      tags: ["Materials", "Drop 01", "Atelier"],
      title: "Notes on Open Weave",
    },
  ];
}

function legalDocuments(): SeedDocument[] {
  const pages = [
    { kind: "privacy", title: "Privacy Policy" },
    { kind: "terms", title: "Terms of Service" },
    { kind: "returns", title: "Returns Policy" },
    { kind: "shipping", title: "Shipping Policy" },
    { kind: "accessibility", title: "Accessibility Statement" },
    { kind: "cookies", title: "Cookie Policy" },
    { kind: "wholesale", title: "Wholesale Terms" },
    { kind: "imprint", title: "Imprint" },
  ] as const;

  return pages.map((page) => ({
    _id: `legal-${page.kind}`,
    _type: "legal",
    body: ptBlocks(`legal-${page.kind}`, [
      `${page.title} placeholder for counsel review. Replace this seeded copy with the finalized Termly and lawyer-approved text before public launch.`,
      "Operational policy details must match Medusa configuration, Stripe settings, shipping rules, and customer support procedures at launch.",
    ]),
    kind: page.kind,
    lastUpdated: "2026-05-10T00:00:00.000Z",
    seo: {
      _type: "seo",
      description: `${page.title} for vaïvae. Placeholder pending counsel review.`,
      noindex: false,
      title: `${page.title} - vaïvae`,
    },
    slug: slug(page.kind),
    title: page.title,
  }));
}

function homePageDocument(assetId: string): SeedDocument {
  return {
    _id: "homePage",
    _type: "homePage",
    pageBuilder: [
      {
        _key: "home-hero-film",
        _type: "heroFilm",
        chapters: [
          {
            _key: "chapter-formation",
            _type: "heroFilmChapter",
            align: "left",
            body: ptBlocks("chapter-formation", [
              "No model placed on top of the brand. The muse emerges from inside the world - heat, hair, fabric, breath - resolving frame by frame as you move.",
            ]),
            eyebrow: "001 / Formation",
            heading: "Out of the <em>gradient</em>, a figure forms.",
            note: "Generated - Live - One-of-one",
          },
          {
            _key: "chapter-terracotta",
            _type: "heroFilmChapter",
            align: "right",
            body: ptBlocks("chapter-terracotta", [
              "A two-piece knit set shaped for contour. The first heat of the season - slow, low-burning, alive at the hem.",
            ]),
            eyebrow: "002 / Look 01",
            heading: "<em>Terracotta.</em><br/>Earth, set in motion.",
            note: "Sparkly Waist Contouring Set",
          },
          {
            _key: "chapter-glacial",
            _type: "heroFilmChapter",
            align: "left",
            body: ptBlocks("chapter-glacial", [
              "Open-weave crochet with contrast trim. Cuts that hold air. Color that arrives quietly and refuses to leave.",
            ]),
            eyebrow: "003 / Look 02",
            heading: "<em>Glacial.</em><br/>Cool intelligence.",
            note: "Riviera Knit Set",
          },
          {
            _key: "chapter-coral",
            _type: "heroFilmChapter",
            align: "right",
            body: ptBlocks("chapter-coral", [
              "An open-mesh polo set. The exact temperature of late afternoon, made wearable.",
            ]),
            eyebrow: "004 / Look 03",
            heading: "<em>Coral.</em><br/>Warmth without weight.",
            note: "Short Net Set",
          },
          {
            _key: "chapter-linen",
            _type: "heroFilmChapter",
            align: "left",
            body: ptBlocks("chapter-linen", [
              "Lin Naturel and Écru Argenté complete the runway into something you can wear into the rest of your life.",
            ]),
            eyebrow: "005 / Look 04",
            heading: "<em>Linen.</em><br/>The last word.",
            note: "The three-piece lounge story",
          },
        ],
        cta: cta("Shop Drop 01", "/products"),
        eyebrow: DROP_01_RELEASE.eyebrow,
        heading: "The <em>living</em> runway.",
        marquee: {
          direction: "left",
          enabled: true,
          separator: "·",
          speed: 60,
          text: "Liquid form · Living cloth · A new house",
        },
        media: {
          muxPlaybackId: PLACEHOLDER_MUX_PLAYBACK_ID,
          posterImage: image(assetId, "Drop 01 hero film poster placeholder"),
          sourceType: "mux",
        },
        scrollIndicator: true,
        subhead:
          "An AI muse emerges from the brand world itself - fabric, light and color resolving into a season. Scroll to enter.",
        terminalCta: {
          body: "A small, considered launch edit in knit, mesh, linen, and light.",
          eyebrow: "Drop 01 - Available now",
          heading: "Enter the <em>collection.</em>",
          primaryCta: cta("Shop the Living Runway", "/products"),
          secondaryCta: cta("View the Lookbook", "/lookbook", "underline"),
        },
      },
      {
        _key: "home-brand-promise",
        _type: "brandPromise",
        alignment: "left",
        body: ptBlocks("home-brand-promise", [
          "A luxury editorial house for cinematic silhouettes, restrained launches, and clothing that enters slowly.",
        ]),
        eyebrow: "The house",
        statement:
          "No model placed on top of the brand. The muse emerges from inside the <em>world</em>.",
        theme: "dark-text-on-light",
        width: "wide",
      },
      {
        _key: "home-product-rail",
        _type: "productRail",
        cta: cta("Shop Drop 01", "/products", "underline"),
        density: "spacious",
        eyebrow: "Drop 01",
        heading: "The launch edit",
        intro: "Six pieces, one first language: contour, open weave, coral heat, and linen quiet.",
        layout: "carousel",
        products: DROP_01_PRODUCTS.map((product) =>
          weakRef(product.medusaProductId, `home-product-${product.handle}`),
        ),
      },
      {
        _key: "home-editorial-excerpt",
        _type: "editorialExcerpt",
        cta: cta("Read the launch note", "/journal/the-living-runway", "underline"),
        customHeading: "The muse emerges from inside the world.",
        eyebrow: "Journal",
        journalEntry: weakRef("journal-the-living-runway"),
        quote:
          "No model placed on top of the brand. The muse emerges from inside the world - heat, hair, fabric, breath.",
      },
      {
        _key: "home-journal-rail",
        _type: "journalRail",
        cta: cta("Read the journal", "/journal", "underline"),
        entries: [
          weakRef("journal-the-living-runway", "home-journal-living-runway"),
          weakRef("journal-notes-on-open-weave", "home-journal-open-weave"),
        ],
        eyebrow: "Notes",
        heading: "From the runway",
        mode: "curated",
      },
      {
        _key: "home-cta",
        _type: "ctaSection",
        background: { solidColor: "oxblood", type: "solidColor" },
        body: "Drop 01 is seeded for launch operations. Replace placeholder media with final campaign assets before publishing.",
        eyebrow: "Launch operations",
        heading: "The collection is ready for final image and legal review.",
        primaryCta: cta("Shop Drop 01", "/products"),
        secondaryCta: cta("View lookbook", "/lookbook", "underline"),
        theme: "light-text-on-dark",
      },
    ],
    seo: {
      _type: "seo",
      description:
        "vaïvae introduces Drop 01, The Living Runway: a cinematic launch edit of knit, open mesh, linen, and light.",
      noindex: false,
      title: "vaïvae - The Living Runway",
    },
    title: "Home",
  };
}

async function seedDocuments(documents: SeedDocument[]): Promise<void> {
  const batchSize = 50;

  for (let index = 0; index < documents.length; index += batchSize) {
    const batch = documents.slice(index, index + batchSize);
    let transaction = client.transaction();

    for (const document of batch) {
      transaction = transaction.createOrReplace(document);
    }

    await transaction.commit({ autoGenerateArrayKeys: false, visibility: "sync" });
  }
}

async function seed(): Promise<void> {
  const placeholderAssetId = await ensurePlaceholderAsset();
  const documents = [
    siteSettingsDocument(),
    navigationDocument(),
    footerDocument(),
    ...materialDocuments(),
    ...colorSwatchDocuments(),
    ...sizeGuideDocuments(),
    ...productDocuments(placeholderAssetId),
    ...lookbookDocuments(placeholderAssetId),
    ...journalDocuments(placeholderAssetId),
    ...legalDocuments(),
    homePageDocument(placeholderAssetId),
  ];

  await seedDocuments(documents);
}

void seed().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
