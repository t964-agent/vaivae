import { defineQuery } from "next-sanity";

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
