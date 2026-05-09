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

const productReferenceFragment = `_id,
_type,
"medusaProductId": medusaProductId,
title,
"handle": handle.current,
editorialReady`;

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
_type == "capsuleRail" => {
  eyebrow,
  heading,
  "capsules": array::compact(capsules[]->{
    _id,
    _type,
    title,
    "slug": slug.current
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
    targetBlank
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
      targetBlank
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
