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

type Drop01ProductOption = {
  title: string;
  values: readonly string[];
};

type Drop01ProductVariant = {
  inventory: number;
  optionValues: Readonly<Record<string, string>>;
  sku: string;
  title: string;
};

type Drop01Product = {
  description: string;
  handle: string;
  madeIn: string;
  material: string;
  materialKeys: readonly Drop01MaterialKey[];
  medusaProductId: `prod_${string}`;
  options: readonly Drop01ProductOption[];
  priceUsd: number;
  sanityEditorial: {
    careNotes: readonly string[];
    colorSwatchKeys: readonly Drop01ColorSwatchKey[];
    eyebrow: string;
    materialKeys: readonly Drop01MaterialKey[];
    modelSpecs: {
      height: string;
      notes: string;
      wearingSize: string;
    };
    narrative: readonly string[];
    oneLineHook: string;
    sizeGuideKey: Drop01SizeGuideKey;
    sustainabilityNotes: readonly string[];
  };
  title: string;
  variants: readonly Drop01ProductVariant[];
  weightGrams: number;
};

const DROP_01_RELEASE = {
  capsuleId: "capsule-drop-01-may-2026",
  date: "2026-05-12T14:00:00.000Z",
  eyebrow: "Drop 01 - May 2026",
  title: "Drop 01 - The Living Runway",
} as const;

const DROP_01_MATERIALS = [
  {
    careInstructions: "Dry clean with a knit specialist. Store folded, away from direct light.",
    composition: "SET 2PC - KNIT. Final fiber percentages follow the production care label.",
    description: [
      "A compact knit language used for the first launch set: close to the body, dimensional at the waist, and quiet in the hand.",
    ],
    key: "set-2pc-knit",
    name: "Set 2PC Knit",
    origin: "Launch Collection 2026 production notes",
  },
  {
    careInstructions:
      "Dry clean only. Protect open-weave structure from jewelry and rough surfaces.",
    composition:
      "SET 2PC - CONTRAST TRIM. Open-weave crochet with contrast trim at neck, cuff, and hem.",
    description: [
      "The contrast is the signature: two tones held in conversation across an open crochet structure.",
    ],
    key: "contrast-trim-crochet",
    name: "Contrast Trim Crochet",
    origin: "Launch Collection 2026 production notes",
  },
  {
    careInstructions: "Dry clean only. Fold with tissue to preserve the open mesh.",
    composition: "SET 2PC - OPEN MESH POLO. Open-mesh polo-collar top with matching short.",
    description: [
      "A breathable net structure with an expressive collar line, built for late light and movement.",
    ],
    key: "open-mesh-polo",
    name: "Open Mesh Polo Knit",
    origin: "Launch Collection 2026 production notes",
  },
  {
    careInstructions: "Dry clean only. Close the zip before cleaning and store folded.",
    composition: "Open weave zip cardigan in Lin Naturel.",
    description: [
      "A fine-gauge open weave used as the outer layer of the three-piece lounge story.",
    ],
    key: "open-weave-zip-cardigan",
    name: "Open Weave Zip Cardigan",
    origin: "Launch Collection 2026 production notes",
  },
  {
    careInstructions:
      "Dry clean only. Lay flat after wear and protect embellishment from abrasion.",
    composition: "Knitted halter in Écru Argenté with pearl embellishment.",
    description: [
      "A bright knit surface, cropped and close, designed to sit under the zip sweater or stand alone.",
    ],
    key: "pearl-embellished-knit",
    name: "Pearl Embellished Knit",
    origin: "Launch Collection 2026 production notes",
  },
  {
    careInstructions: "Dry clean only. Hang from the waistband to preserve the trouser line.",
    composition: "Wide-leg trouser in Écru Argenté.",
    description: [
      "A long, easy trouser line that completes the first lounge silhouette without raising its voice.",
    ],
    key: "ecru-argente-trouser",
    name: "Écru Argenté Trouser",
    origin: "Launch Collection 2026 production notes",
  },
] as const satisfies readonly Drop01Material[];

type Drop01MaterialKey = (typeof DROP_01_MATERIALS)[number]["key"];

const DROP_01_COLOR_SWATCHES = [
  { fallbackTextColor: "light", hex: "#C8321C", key: "terracotta", name: "Terracotta" },
  { fallbackTextColor: "dark", hex: "#C9D4D6", key: "glacial", name: "Glacial" },
  { fallbackTextColor: "light", hex: "#E87468", key: "coral", name: "Coral" },
  { fallbackTextColor: "dark", hex: "#EFE9DF", key: "linen", name: "Linen" },
  { fallbackTextColor: "dark", hex: "#F6F1EA", key: "amor-blanc", name: "Amor Blanc" },
  {
    fallbackTextColor: "light",
    hex: "#2F5F7D",
    key: "alexandrite-bleu",
    name: "Alexandrite Bleu",
  },
  { fallbackTextColor: "light", hex: "#5B3327", key: "brun-terre", name: "Brun Terre" },
  { fallbackTextColor: "dark", hex: "#F2D660", key: "citron-azur", name: "Citron & Azur" },
  { fallbackTextColor: "light", hex: "#172C55", key: "marine-ciel", name: "Marine & Ciel" },
  { fallbackTextColor: "light", hex: "#E36F5F", key: "corail", name: "Corail" },
  { fallbackTextColor: "light", hex: "#B48A62", key: "camel-clair", name: "Camel Clair" },
  { fallbackTextColor: "dark", hex: "#D8CAB6", key: "lin-naturel", name: "Lin Naturel" },
  { fallbackTextColor: "dark", hex: "#E8E0D2", key: "ecru-argente", name: "Écru Argenté" },
] as const satisfies readonly Drop01ColorSwatch[];

type Drop01ColorSwatchKey = (typeof DROP_01_COLOR_SWATCHES)[number]["key"];

const DROP_01_SIZE_GUIDES = [
  {
    description: "Alpha sizing for the Drop 01 knit sets and upper-body pieces.",
    key: "womens-alpha-sml",
    measurements: [
      {
        bust: "32-34 in / 81-86 cm",
        hips: "35-37 in / 89-94 cm",
        length: "Varies by style",
        size: "S",
        waist: "25-27 in / 64-69 cm",
      },
      {
        bust: "34-36 in / 86-91 cm",
        hips: "37-39 in / 94-99 cm",
        length: "Varies by style",
        size: "M",
        waist: "27-29 in / 69-74 cm",
      },
      {
        bust: "36-38 in / 91-97 cm",
        hips: "39-41 in / 99-104 cm",
        length: "Varies by style",
        size: "L",
        waist: "29-31 in / 74-79 cm",
      },
    ],
    name: "Women's Alpha - S/L",
    tips: ["If between sizes, choose the larger size for a softer lounge fit."],
    unitSystem: "both",
  },
  {
    description: "Dual sizing for the BC Zip Sweater.",
    key: "womens-dual-sm-ml",
    measurements: [
      {
        bust: "32-36 in / 81-91 cm",
        hips: "35-39 in / 89-99 cm",
        length: "Relaxed crop",
        size: "S/M",
        waist: "25-29 in / 64-74 cm",
      },
      {
        bust: "36-40 in / 91-102 cm",
        hips: "39-43 in / 99-109 cm",
        length: "Relaxed crop",
        size: "M/L",
        waist: "29-33 in / 74-84 cm",
      },
    ],
    name: "Women's Dual - S/M to M/L",
    tips: ["The open weave is intended to float away from the body."],
    unitSystem: "both",
  },
] as const satisfies readonly Drop01SizeGuide[];

type Drop01SizeGuideKey = (typeof DROP_01_SIZE_GUIDES)[number]["key"];

const DROP_01_PRODUCTS = [
  {
    description:
      "A two-piece knit set cut for waist contouring. The first heat of the season - slow, low-burning, alive at the hem.",
    handle: "terracotta-sparkly-waist-contouring-set",
    madeIn: "Italy",
    material: "Set 2PC Knit",
    materialKeys: ["set-2pc-knit"],
    medusaProductId: "prod_vaivae_drop01_w83935",
    options: [
      { title: "Size", values: ["S", "M"] },
      { title: "Color", values: ["Amor Blanc", "Alexandrite Bleu", "Brun Terre"] },
    ],
    priceUsd: 118000,
    sanityEditorial: {
      careNotes: ["Dry clean with a knit specialist. Store folded between wears."],
      colorSwatchKeys: ["amor-blanc", "alexandrite-bleu", "brun-terre", "terracotta"],
      eyebrow: "Look 01 - Terracotta",
      materialKeys: ["set-2pc-knit"],
      modelSpecs: {
        height: "5'10\" / 178 cm",
        notes: "Close through the waist with a clean knit fall.",
        wearingSize: "S",
      },
      narrative: [
        "Earth, set in motion. A knit two-piece set shaped for contour, not compression.",
        "The first heat of the season stays low and deliberate: fabric, breath, and color resolving as you move.",
      ],
      oneLineHook: "Earth, set in motion.",
      sizeGuideKey: "womens-alpha-sml",
      sustainabilityNotes: [
        "Produced in a focused launch run to keep stock intentional and avoid speculative overproduction.",
      ],
    },
    title: "Terracotta - Sparkly Waist Contouring Set",
    variants: [
      {
        inventory: 6,
        optionValues: { Color: "Amor Blanc", Size: "S" },
        sku: "VV-W83935-003-S",
        title: "Amor Blanc / S",
      },
      {
        inventory: 6,
        optionValues: { Color: "Amor Blanc", Size: "M" },
        sku: "VV-W83935-003-M",
        title: "Amor Blanc / M",
      },
      {
        inventory: 6,
        optionValues: { Color: "Alexandrite Bleu", Size: "S" },
        sku: "VV-W83935-079-S",
        title: "Alexandrite Bleu / S",
      },
      {
        inventory: 6,
        optionValues: { Color: "Alexandrite Bleu", Size: "M" },
        sku: "VV-W83935-079-M",
        title: "Alexandrite Bleu / M",
      },
      {
        inventory: 6,
        optionValues: { Color: "Brun Terre", Size: "S" },
        sku: "VV-W83935-117-S",
        title: "Brun Terre / S",
      },
      {
        inventory: 6,
        optionValues: { Color: "Brun Terre", Size: "M" },
        sku: "VV-W83935-117-M",
        title: "Brun Terre / M",
      },
    ],
    weightGrams: 520,
  },
  {
    description:
      "An open-weave crochet two-piece with contrast trim at neck, cuff, and hem. The contrast is the signature - two tones in conversation.",
    handle: "glacial-riviera-knit-set",
    madeIn: "Italy",
    material: "Contrast Trim Crochet",
    materialKeys: ["contrast-trim-crochet"],
    medusaProductId: "prod_vaivae_drop01_w83534",
    options: [
      { title: "Size", values: ["S", "M"] },
      { title: "Color", values: ["Citron & Azur", "Marine & Ciel"] },
    ],
    priceUsd: 142000,
    sanityEditorial: {
      careNotes: ["Dry clean only. Protect open-weave yarns from jewelry and rough surfaces."],
      colorSwatchKeys: ["citron-azur", "marine-ciel", "glacial"],
      eyebrow: "Look 02 - Glacial",
      materialKeys: ["contrast-trim-crochet"],
      modelSpecs: {
        height: "5'10\" / 178 cm",
        notes: "Open-weave structure with contrast edges at the neck, cuff, and hem.",
        wearingSize: "S",
      },
      narrative: [
        "Cool intelligence. The Riviera set lets contrast do the speaking.",
        "Two tones meet at the edge: crisp at the trim, open through the body, exact where the line needs to hold.",
      ],
      oneLineHook: "Cool intelligence.",
      sizeGuideKey: "womens-alpha-sml",
      sustainabilityNotes: [
        "Small-batch launch quantities keep the crochet work considered from first cut to final trim.",
      ],
    },
    title: "Glacial - Riviera Knit Set",
    variants: [
      {
        inventory: 7,
        optionValues: { Color: "Citron & Azur", Size: "S" },
        sku: "VV-W83534-134156-S",
        title: "Citron & Azur / S",
      },
      {
        inventory: 7,
        optionValues: { Color: "Citron & Azur", Size: "M" },
        sku: "VV-W83534-134156-M",
        title: "Citron & Azur / M",
      },
      {
        inventory: 7,
        optionValues: { Color: "Marine & Ciel", Size: "S" },
        sku: "VV-W83534-048071-S",
        title: "Marine & Ciel / S",
      },
      {
        inventory: 7,
        optionValues: { Color: "Marine & Ciel", Size: "M" },
        sku: "VV-W83534-048071-M",
        title: "Marine & Ciel / M",
      },
    ],
    weightGrams: 480,
  },
  {
    description:
      "An open-mesh polo-collar top with wide lapel, paired with high-waisted shorts. The most expressive silhouette of the collection.",
    handle: "coral-short-net-set",
    madeIn: "Italy",
    material: "Open Mesh Polo Knit",
    materialKeys: ["open-mesh-polo"],
    medusaProductId: "prod_vaivae_drop01_w83543",
    options: [
      { title: "Size", values: ["S", "M"] },
      { title: "Color", values: ["Corail", "Camel Clair"] },
    ],
    priceUsd: 98000,
    sanityEditorial: {
      careNotes: ["Dry clean only. Fold with tissue to protect the open-mesh structure."],
      colorSwatchKeys: ["corail", "camel-clair", "coral"],
      eyebrow: "Look 03 - Coral",
      materialKeys: ["open-mesh-polo"],
      modelSpecs: {
        height: "5'10\" / 178 cm",
        notes: "Wide lapel, open mesh, high-waisted short.",
        wearingSize: "S",
      },
      narrative: [
        "Warmth without weight. The net set carries the temperature of late afternoon without the heaviness of the day.",
        "An open-mesh collar, a short line, and enough air between the stitches to let the silhouette breathe.",
      ],
      oneLineHook: "Warmth without weight.",
      sizeGuideKey: "womens-alpha-sml",
      sustainabilityNotes: [
        "The launch edit favors expressive pieces in controlled quantities over broad seasonal depth.",
      ],
    },
    title: "Coral - Short Net Set",
    variants: [
      {
        inventory: 8,
        optionValues: { Color: "Corail", Size: "S" },
        sku: "VV-W83543-075-S",
        title: "Corail / S",
      },
      {
        inventory: 8,
        optionValues: { Color: "Corail", Size: "M" },
        sku: "VV-W83543-075-M",
        title: "Corail / M",
      },
      {
        inventory: 8,
        optionValues: { Color: "Camel Clair", Size: "S" },
        sku: "VV-W83543-046-S",
        title: "Camel Clair / S",
      },
      {
        inventory: 8,
        optionValues: { Color: "Camel Clair", Size: "M" },
        sku: "VV-W83543-046-M",
        title: "Camel Clair / M",
      },
    ],
    weightGrams: 420,
  },
  {
    description:
      "An open-weave zip cardigan in Lin Naturel. The outer layer of the first lounge silhouette.",
    handle: "linen-bc-zip-sweater",
    madeIn: "Italy",
    material: "Open Weave Zip Cardigan",
    materialKeys: ["open-weave-zip-cardigan"],
    medusaProductId: "prod_vaivae_drop01_kk100",
    options: [
      { title: "Size", values: ["S/M", "M/L"] },
      { title: "Color", values: ["Lin Naturel"] },
    ],
    priceUsd: 68000,
    sanityEditorial: {
      careNotes: ["Dry clean only. Close the zip before cleaning and store folded."],
      colorSwatchKeys: ["lin-naturel", "linen"],
      eyebrow: "Look 04 - Linen",
      materialKeys: ["open-weave-zip-cardigan"],
      modelSpecs: {
        height: "5'10\" / 178 cm",
        notes: "Relaxed open-weave cardigan, designed as the top layer of the three-piece set.",
        wearingSize: "S/M",
      },
      narrative: [
        "The last word. Lin Naturel turns the runway into something lived-in, direct, and ready for the rest of the day.",
        "The cardigan holds the silhouette open: a fine-gauge layer with enough structure to frame the body and enough air to disappear at the edge.",
      ],
      oneLineHook: "The last word.",
      sizeGuideKey: "womens-dual-sm-ml",
      sustainabilityNotes: [
        "A measured first run keeps the three-piece lounge story focused and replenishment-led.",
      ],
    },
    title: "Linen - BC Zip Sweater",
    variants: [
      {
        inventory: 8,
        optionValues: { Color: "Lin Naturel", Size: "S/M" },
        sku: "VV-KK100-LIN-SM",
        title: "Lin Naturel / S/M",
      },
      {
        inventory: 8,
        optionValues: { Color: "Lin Naturel", Size: "M/L" },
        sku: "VV-KK100-LIN-ML",
        title: "Lin Naturel / M/L",
      },
    ],
    weightGrams: 560,
  },
  {
    description:
      "A knitted halter in Écru Argenté, cropped close and finished with pearl embellishment.",
    handle: "ecru-argente-halter-crop",
    madeIn: "Italy",
    material: "Pearl Embellished Knit",
    materialKeys: ["pearl-embellished-knit"],
    medusaProductId: "prod_vaivae_drop01_kk101",
    options: [
      { title: "Size", values: ["S", "M", "L"] },
      { title: "Color", values: ["Écru Argenté"] },
    ],
    priceUsd: 42000,
    sanityEditorial: {
      careNotes: ["Dry clean only. Protect pearl embellishment from abrasion."],
      colorSwatchKeys: ["ecru-argente", "linen"],
      eyebrow: "Look 05 - Écru Argenté",
      materialKeys: ["pearl-embellished-knit"],
      modelSpecs: {
        height: "5'10\" / 178 cm",
        notes: "Cropped halter designed to sit under the BC Zip Sweater or stand alone.",
        wearingSize: "S",
      },
      narrative: [
        "Warmth without weight, reduced to a bright line at the collarbone.",
        "The halter is the smallest gesture in the three-piece set, but the one that catches the light first.",
      ],
      oneLineHook: "A bright line, held close.",
      sizeGuideKey: "womens-alpha-sml",
      sustainabilityNotes: [
        "Embellishment is held to a restrained placement so the piece can remain part of the everyday wardrobe.",
      ],
    },
    title: "Écru Argenté - Halter Crop",
    variants: [
      {
        inventory: 9,
        optionValues: { Color: "Écru Argenté", Size: "S" },
        sku: "VV-KK101-ECR-S",
        title: "Écru Argenté / S",
      },
      {
        inventory: 9,
        optionValues: { Color: "Écru Argenté", Size: "M" },
        sku: "VV-KK101-ECR-M",
        title: "Écru Argenté / M",
      },
      {
        inventory: 6,
        optionValues: { Color: "Écru Argenté", Size: "L" },
        sku: "VV-KK101-ECR-L",
        title: "Écru Argenté / L",
      },
    ],
    weightGrams: 260,
  },
  {
    description:
      "A wide-leg trouser in Écru Argenté. The grounding line of the three-piece lounge set.",
    handle: "ecru-argente-obsession-pants",
    madeIn: "Italy",
    material: "Écru Argenté Trouser",
    materialKeys: ["ecru-argente-trouser"],
    medusaProductId: "prod_vaivae_drop01_kk102",
    options: [
      { title: "Size", values: ["S", "M", "L"] },
      { title: "Color", values: ["Écru Argenté"] },
    ],
    priceUsd: 74000,
    sanityEditorial: {
      careNotes: ["Dry clean only. Hang from the waistband to keep the trouser line clean."],
      colorSwatchKeys: ["ecru-argente", "linen"],
      eyebrow: "Look 06 - Écru Argenté",
      materialKeys: ["ecru-argente-trouser"],
      modelSpecs: {
        height: "5'10\" / 178 cm",
        notes: "Wide-leg trouser with an easy lounge fall.",
        wearingSize: "S",
      },
      narrative: [
        "The last word, lowered to the floor line.",
        "Wide, quiet, and exact in proportion, the trouser completes the lounge set without asking the rest of the look to soften.",
      ],
      oneLineHook: "The last word, lowered to the floor line.",
      sizeGuideKey: "womens-alpha-sml",
      sustainabilityNotes: [
        "The trouser is cut for long wear across the set, not a single campaign moment.",
      ],
    },
    title: "Écru Argenté - Obsession Pants",
    variants: [
      {
        inventory: 8,
        optionValues: { Color: "Écru Argenté", Size: "S" },
        sku: "VV-KK102-ECR-S",
        title: "Écru Argenté / S",
      },
      {
        inventory: 8,
        optionValues: { Color: "Écru Argenté", Size: "M" },
        sku: "VV-KK102-ECR-M",
        title: "Écru Argenté / M",
      },
      {
        inventory: 6,
        optionValues: { Color: "Écru Argenté", Size: "L" },
        sku: "VV-KK102-ECR-L",
        title: "Écru Argenté / L",
      },
    ],
    weightGrams: 620,
  },
] as const satisfies readonly Drop01Product[];

const exported = {
  DROP_01_COLOR_SWATCHES,
  DROP_01_MATERIALS,
  DROP_01_PRODUCTS,
  DROP_01_RELEASE,
  DROP_01_SIZE_GUIDES,
};

export = exported;
