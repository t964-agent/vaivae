import { defineQuery } from "next-sanity";

const imageFragment = `_type,
asset->{
  _id,
  _type,
  url,
  metadata{
    lqip,
    dimensions{
      width,
      height,
      aspectRatio
    }
  }
},
hotspot,
crop,
alt,
caption`;

const internalTargetFragment = `_id,
_type,
"title": coalesce(siteName, title, name),
"slug": coalesce(slug.current, handle.current)`;

const linkFragment = `_type,
type,
label,
internal{
  _ref,
  _type,
  _weak
},
"internalTarget": internal->{
  ${internalTargetFragment}
},
href,
targetBlank`;

const ctaFragment = `_type,
label,
link{
  ${linkFragment}
},
style`;

const seoFragment = `_type,
title,
description,
noindex,
ogImage{
  ${imageFragment}
},
keywords`;

const portableTextFragment = `...,
_type == "vaivaeImage" => {
  _key,
  ${imageFragment}
}`;

const materialFragment = `_id,
_type,
name,
composition,
origin,
careInstructions,
"slug": slug.current,
description[]{
  ${portableTextFragment}
}`;

const colorSwatchFragment = `_id,
_type,
name,
"slug": slug.current,
hex,
image{
  ${imageFragment}
},
fallbackTextColor`;

const sizeGuideFragment = `_id,
_type,
name,
"slug": slug.current,
description,
measurements[]{
  _key,
  _type,
  size,
  bust,
  waist,
  hips,
  length,
  note
},
unitSystem,
tipsRichText[]{
  ${portableTextFragment}
}`;

const productReferenceFragment = `_id,
_type,
"medusaProductId": medusaProductId,
title,
"handle": handle.current,
editorialReady,
oneLineHook,
heroImage{
  ${imageFragment}
}`;

export const pageBuilderFragment = `_key,
_type,
_type == "heroFilm" => {
  eyebrow,
  heading,
  subhead,
  media{
    sourceType,
    muxPlaybackId,
    directUrl,
    posterImage{
      ${imageFragment}
    }
  },
  cta{
    ${ctaFragment}
  },
  scrollIndicator,
  marquee{
    enabled,
    text,
    separator,
    speed,
    direction
  },
  chapters[]{
    _key,
    _type,
    eyebrow,
    heading,
    body[],
    note,
    mediaPoster{
      ${imageFragment}
    },
    align
  },
  terminalCta{
    eyebrow,
    heading,
    body,
    primaryCta{
      ${ctaFragment}
    },
    secondaryCta{
      ${ctaFragment}
    }
  }
},
_type == "brandPromise" => {
  eyebrow,
  statement,
  body[],
  width,
  alignment,
  theme,
  cta{
    ${ctaFragment}
  }
},
_type == "productRail" => {
  eyebrow,
  heading,
  intro,
  layout,
  columns,
  density,
  "products": array::compact(products[]->{
    ${productReferenceFragment}
  }),
  cta{
    ${ctaFragment}
  }
},
_type == "editorialExcerpt" => {
  journalEntry->{
    _id,
    _type,
    title,
    "slug": slug.current
  },
  eyebrow,
  customHeading,
  quote,
  cta{
    ${ctaFragment}
  }
},
_type == "lookbookGrid" => {
  eyebrow,
  heading,
  lookbookEntry->{
    _id,
    _type,
    title,
    "slug": slug.current
  },
  images[]{
    _key,
    ${imageFragment}
  },
  layout,
  cta{
    ${ctaFragment}
  }
},
_type == "journalRail" => {
  eyebrow,
  heading,
  mode,
  "entries": array::compact(entries[]->{
    _id,
    _type,
    title,
    "slug": slug.current
  }),
  limit,
  cta{
    ${ctaFragment}
  }
},
_type == "imagePair" => {
  eyebrow,
  heading,
  leftImage{
    ${imageFragment}
  },
  leftCaption,
  rightImage{
    ${imageFragment}
  },
  rightCaption,
  layout,
  theme,
  cta{
    ${ctaFragment}
  }
},
_type == "videoChapter" => {
  eyebrow,
  heading,
  muxPlaybackId,
  posterImage{
    ${imageFragment}
  },
  body[],
  productHotspots[]{
    _key,
    _type,
    label,
    timestampSeconds,
    product->{
      ${productReferenceFragment}
    }
  },
  theme
},
_type == "quote" => {
  quote,
  attribution,
  source,
  style
},
_type == "ctaSection" => {
  eyebrow,
  heading,
  body,
  primaryCta{
    ${ctaFragment}
  },
  secondaryCta{
    ${ctaFragment}
  },
  background{
    type,
    solidColor,
    image{
      ${imageFragment}
    }
  },
  theme
}`;

export const siteSettingsQuery =
  defineQuery(`*[_type == "siteSettings" && _id == "siteSettings"][0]{
  _id,
  _type,
  _createdAt,
  _updatedAt,
  _rev,
  siteName,
  tagline,
  logo{
    _type,
    asset->{
      _id,
      _type,
      url,
      metadata{
        lqip,
        dimensions{
          width,
          height,
          aspectRatio
        }
      }
    },
    hotspot,
    crop,
    alt,
    caption
  },
  favicon{
    _type,
    asset->{
      _id,
      _type,
      url,
      metadata{
        lqip,
        dimensions{
          width,
          height,
          aspectRatio
        }
      }
    },
    hotspot,
    crop,
    alt,
    caption
  },
  defaultSeo{
    _type,
    title,
    description,
    noindex,
    ogImage{
      _type,
      asset->{
        _id,
        _type,
        url,
        metadata{
          lqip,
          dimensions{
            width,
            height,
            aspectRatio
          }
        }
      },
      hotspot,
      crop,
      alt,
      caption
    },
    keywords
  },
  defaultRegion,
  defaultCurrency,
  contactEmail,
  pressEmail,
  wholesaleEmail,
  address{
    _type,
    line1,
    line2,
    city,
    region,
    postalCode,
    country
  },
  socialLinks[]{
    _key,
    _type,
    platform,
    handle,
    url
  }
}`);

export const navigationQuery = defineQuery(`*[_type == "navigation" && _id == "navigation"][0]{
  _id,
  _type,
  _createdAt,
  _updatedAt,
  _rev,
  headerLinks[]{
    _key,
    _type,
    type,
    label,
    internal{
      _ref,
      _type,
      _weak
    },
    "internalTarget": internal->{
      _id,
      _type,
      "title": coalesce(siteName, title, name),
      "slug": slug.current
    },
    href,
    targetBlank,
    children[]{
      _key,
      _type,
      type,
      label,
      internal{
        _ref,
        _type,
        _weak
      },
      "internalTarget": internal->{
        _id,
        _type,
        "title": coalesce(siteName, title, name),
        "slug": slug.current
      },
      href,
      targetBlank
    }
  },
  secondaryLinks[]{
    _key,
    _type,
    type,
    label,
    internal{
      _ref,
      _type,
      _weak
    },
    "internalTarget": internal->{
      _id,
      _type,
      "title": coalesce(siteName, title, name),
      "slug": slug.current
    },
    href,
    targetBlank
  },
  mobileMenuExtras[]{
    _key,
    _type,
    type,
    label,
    internal{
      _ref,
      _type,
      _weak
    },
    "internalTarget": internal->{
      _id,
      _type,
      "title": coalesce(siteName, title, name),
      "slug": slug.current
    },
    href,
    targetBlank
  },
  promoBannerEnabled,
  promoBannerText,
  promoBannerLink{
    _type,
    type,
    label,
    internal{
      _ref,
      _type,
      _weak
    },
    "internalTarget": internal->{
      _id,
      _type,
      "title": coalesce(siteName, title, name),
      "slug": slug.current
    },
    href,
    targetBlank
  }
}`);

export const footerQuery = defineQuery(`*[_type == "footer" && _id == "footer"][0]{
  _id,
  _type,
  _createdAt,
  _updatedAt,
  _rev,
  columns[]{
    _key,
    _type,
    title,
    links[]{
      _key,
      _type,
      type,
      label,
      internal{
        _ref,
        _type,
        _weak
      },
      "internalTarget": internal->{
        _id,
        _type,
        "title": coalesce(siteName, title, name),
        "slug": slug.current
      },
      href,
      targetBlank
    }
  },
  newsletterEnabled,
  newsletterHeading,
  newsletterDescription,
  newsletterCtaLabel,
  legalLinks[]{
    _key,
    _type,
    type,
    label,
    internal{
      _ref,
      _type,
      _weak
    },
    "internalTarget": internal->{
      _id,
      _type,
      "title": coalesce(siteName, title, name),
      "slug": slug.current
    },
    href,
    targetBlank
  },
  copyrightText,
  paymentMethods
}`);

export const homePageQuery = defineQuery(`*[_type == "homePage" && _id == "homePage"][0]{
  _id,
  _type,
  _createdAt,
  _updatedAt,
  _rev,
  title,
  seo{
    ${seoFragment}
  },
  pageBuilder[]{
    ${pageBuilderFragment}
  }
}`);

export const pageBySlugQuery = defineQuery(`*[_type == "page" && slug.current == $slug][0]{
  _id,
  _type,
  _createdAt,
  _updatedAt,
  _rev,
  title,
  "slug": slug.current,
  seo{
    ${seoFragment}
  },
  pageBuilder[]{
    ${pageBuilderFragment}
  }
}`);

export const pageListQuery = defineQuery(`*[_type == "page"] | order(title asc){
  _id,
  _type,
  title,
  "slug": slug.current
}`);

const productDetailFragment = `_id,
  _type,
  _createdAt,
  _updatedAt,
  _rev,
  medusaProductId,
  title,
  "handle": handle.current,
  mirrorMaterials,
  editorialReady,
  eyebrow,
  oneLineHook,
  narrative[]{
    ${portableTextFragment}
  },
  pdpStorytelling[]{
    ${pageBuilderFragment}
  },
  heroImage{
    ${imageFragment}
  },
  gallery[]{
    _key,
    ${imageFragment}
  },
  lookbookFeature->{
    _id,
    _type,
    title,
    "slug": slug.current,
    coverImage{
      ${imageFragment}
    }
  },
  modelSpecs{
    height,
    wearingSize,
    notes
  },
  "materials": array::compact(materials[]->{
    ${materialFragment}
  }),
  colorSwatches[]{
    _key,
    _type,
    medusaVariantOptionValueId,
    swatch->{
      ${colorSwatchFragment}
    }
  },
  sizeGuide->{
    ${sizeGuideFragment}
  },
  careNotes[]{
    ${portableTextFragment}
  },
  madeIn,
  sustainabilityNotes[]{
    ${portableTextFragment}
  },
  certifications,
  seo{
    ${seoFragment}
  }`;

export const productByHandleQuery =
  defineQuery(`*[_type == "product" && handle.current == $handle][0]{
  ${productDetailFragment}
}`);

export const productByMedusaIdQuery =
  defineQuery(`*[_type == "product" && _id == $medusaProductId][0]{
  ${productDetailFragment}
}`);

export const productListQuery = defineQuery(`*[_type == "product"] | order(title asc){
  _id,
  _type,
  medusaProductId,
  title,
  "handle": handle.current,
  editorialReady,
  heroImage{
    ${imageFragment}
  },
  oneLineHook
}`);

export const productsByMedusaIdsQuery = defineQuery(`*[
  _type == "product" &&
  editorialReady == true &&
  medusaProductId in $medusaProductIds
] | order(title asc){
  _id,
  _type,
  medusaProductId,
  title,
  "handle": handle.current,
  editorialReady,
  heroImage{
    ${imageFragment}
  },
  oneLineHook
}`);

export const lookbookByHandleQuery =
  defineQuery(`*[_type == "lookbook" && slug.current == $handle][0]{
  _id,
  _type,
  _createdAt,
  _updatedAt,
  _rev,
  title,
  "slug": slug.current,
  eyebrow,
  coverImage{
    ${imageFragment}
  },
  coverVideo{
    muxAssetId
  },
  description[]{
    ${portableTextFragment}
  },
  looks[]{
    _key,
    _type,
    image{
      ${imageFragment}
    },
    caption,
    "products": array::compact(products[]->{
      ${productReferenceFragment}
    })
  },
  seo{
    ${seoFragment}
  },
  publishedAt
}`);

export const lookbookListQuery = defineQuery(`*[_type == "lookbook"] | order(publishedAt desc){
  _id,
  _type,
  title,
  "slug": slug.current,
  eyebrow,
  coverImage{
    ${imageFragment}
  },
  publishedAt
}`);

export const journalEntryQuery = defineQuery(`*[_type == "journal" && slug.current == $slug][0]{
  _id,
  _type,
  _createdAt,
  _updatedAt,
  _rev,
  title,
  "slug": slug.current,
  subtitle,
  eyebrow,
  coverImage{
    ${imageFragment}
  },
  excerpt,
  body[]{
    ${portableTextFragment}
  },
  tags,
  "relatedProducts": array::compact(relatedProducts[]->{
    ${productReferenceFragment}
  }),
  "relatedLookbooks": array::compact(relatedLookbooks[]->{
    _id,
    _type,
    title,
    "slug": slug.current,
    coverImage{
      ${imageFragment}
    }
  }),
  author,
  seo{
    ${seoFragment}
  },
  publishedAt
}`);

export const journalListQuery = defineQuery(`*[_type == "journal"] | order(publishedAt desc){
  _id,
  _type,
  title,
  "slug": slug.current,
  subtitle,
  eyebrow,
  coverImage{
    ${imageFragment}
  },
  excerpt,
  tags,
  author,
  publishedAt
}`);

export const legalBySlugQuery = defineQuery(`*[_type == "legal" && slug.current == $slug][0]{
  _id,
  _type,
  _createdAt,
  _updatedAt,
  _rev,
  title,
  "slug": slug.current,
  kind,
  body[]{
    ${portableTextFragment}
  },
  lastUpdated,
  seo{
    ${seoFragment}
  }
}`);

export const legalListQuery = defineQuery(`*[_type == "legal"] | order(title asc){
  _id,
  _type,
  title,
  "slug": slug.current,
  kind,
  lastUpdated
}`);

export const sizeGuideByIdQuery = defineQuery(`*[_type == "sizeGuide" && _id == $id][0]{
  ${sizeGuideFragment}
}`);

export const materialBySlugQuery = defineQuery(`*[_type == "material" && slug.current == $slug][0]{
  ${materialFragment}
}`);

export const materialListQuery = defineQuery(`*[_type == "material"] | order(name asc){
  ${materialFragment}
}`);

export const colorSwatchBySlugQuery =
  defineQuery(`*[_type == "colorSwatch" && slug.current == $slug][0]{
  ${colorSwatchFragment}
}`);

export const colorSwatchListQuery = defineQuery(`*[_type == "colorSwatch"] | order(name asc){
  ${colorSwatchFragment}
}`);

export const sizeGuideListQuery = defineQuery(`*[_type == "sizeGuide"] | order(name asc){
  ${sizeGuideFragment}
}`);

export const globalQuery = defineQuery(`{
  "siteSettings": *[_type == "siteSettings" && _id == "siteSettings"][0]{
    _id,
    _type,
    _createdAt,
    _updatedAt,
    _rev,
    siteName,
    tagline,
    logo{
      _type,
      asset->{
        _id,
        _type,
        url,
        metadata{
          lqip,
          dimensions{
            width,
            height,
            aspectRatio
          }
        }
      },
      hotspot,
      crop,
      alt,
      caption
    },
    favicon{
      _type,
      asset->{
        _id,
        _type,
        url,
        metadata{
          lqip,
          dimensions{
            width,
            height,
            aspectRatio
          }
        }
      },
      hotspot,
      crop,
      alt,
      caption
    },
    defaultSeo{
      _type,
      title,
      description,
      noindex,
      ogImage{
        _type,
        asset->{
          _id,
          _type,
          url,
          metadata{
            lqip,
            dimensions{
              width,
              height,
              aspectRatio
            }
          }
        },
        hotspot,
        crop,
        alt,
        caption
      },
      keywords
    },
    defaultRegion,
    defaultCurrency,
    contactEmail,
    pressEmail,
    wholesaleEmail,
    address{
      _type,
      line1,
      line2,
      city,
      region,
      postalCode,
      country
    },
    socialLinks[]{
      _key,
      _type,
      platform,
      handle,
      url
    }
  },
  "navigation": *[_type == "navigation" && _id == "navigation"][0]{
    _id,
    _type,
    _createdAt,
    _updatedAt,
    _rev,
    headerLinks[]{
      _key,
      _type,
      type,
      label,
      internal{
        _ref,
        _type,
        _weak
      },
      "internalTarget": internal->{
        _id,
        _type,
        "title": coalesce(siteName, title, name),
        "slug": slug.current
      },
      href,
      targetBlank,
      children[]{
        _key,
        _type,
        type,
        label,
        internal{
          _ref,
          _type,
          _weak
        },
        "internalTarget": internal->{
          _id,
          _type,
          "title": coalesce(siteName, title, name),
          "slug": slug.current
        },
        href,
        targetBlank
      }
    },
    secondaryLinks[]{
      _key,
      _type,
      type,
      label,
      internal{
        _ref,
        _type,
        _weak
      },
      "internalTarget": internal->{
        _id,
        _type,
        "title": coalesce(siteName, title, name),
        "slug": slug.current
      },
      href,
      targetBlank
    },
    mobileMenuExtras[]{
      _key,
      _type,
      type,
      label,
      internal{
        _ref,
        _type,
        _weak
      },
      "internalTarget": internal->{
        _id,
        _type,
        "title": coalesce(siteName, title, name),
        "slug": slug.current
      },
      href,
      targetBlank
    },
    promoBannerEnabled,
    promoBannerText,
    promoBannerLink{
      _type,
      type,
      label,
      internal{
        _ref,
        _type,
        _weak
      },
      "internalTarget": internal->{
        _id,
        _type,
        "title": coalesce(siteName, title, name),
        "slug": slug.current
      },
      href,
      targetBlank
    }
  },
  "footer": *[_type == "footer" && _id == "footer"][0]{
    _id,
    _type,
    _createdAt,
    _updatedAt,
    _rev,
    columns[]{
      _key,
      _type,
      title,
      links[]{
        _key,
        _type,
        type,
        label,
        internal{
          _ref,
          _type,
          _weak
        },
        "internalTarget": internal->{
          _id,
          _type,
          "title": coalesce(siteName, title, name),
          "slug": slug.current
        },
        href,
        targetBlank
      }
    },
    newsletterEnabled,
    newsletterHeading,
    newsletterDescription,
    newsletterCtaLabel,
    legalLinks[]{
      _key,
      _type,
      type,
      label,
      internal{
        _ref,
        _type,
        _weak
      },
      "internalTarget": internal->{
        _id,
        _type,
        "title": coalesce(siteName, title, name),
        "slug": slug.current
      },
      href,
      targetBlank
    },
    copyrightText,
    paymentMethods
  }
}`);
