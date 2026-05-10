import "server-only";

import { stegaClean } from "@sanity/client/stega";

import type { GlobalQueryResult } from "@/sanity/types";

type SiteSettings = GlobalQueryResult["siteSettings"];

type BreadcrumbItem = {
  name: string;
  url: string;
};

type ItemListItem = {
  name: string;
  url: string;
};

type ArticleJsonLdInput = {
  author?: string | null | undefined;
  dateModified?: string | null | undefined;
  datePublished?: string | null | undefined;
  description?: string | null | undefined;
  headline: string;
  image?: string | null | undefined;
  keywords?: string[] | null | undefined;
  url: string;
};

type CreativeWorkJsonLdInput = {
  datePublished?: string | null | undefined;
  description?: string | null | undefined;
  image?: string | null | undefined;
  name: string;
  url: string;
};

type CollectionPageJsonLdInput = {
  description?: string | null | undefined;
  image?: string | null | undefined;
  name: string;
  url: string;
};

function cleanString(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();

  return trimmed ? trimmed : undefined;
}

function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

function getSiteUrl(): string {
  return (process.env["NEXT_PUBLIC_BASE_URL"]?.trim() || "https://vaivae.com").replace(/\/+$/, "");
}

export function absoluteUrl(value: string): string {
  const normalized = value.trim();

  try {
    return new URL(normalized).toString();
  } catch {
    return new URL(
      normalized.startsWith("/") ? normalized : `/${normalized}`,
      `${getSiteUrl()}/`,
    ).toString();
  }
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(stegaClean(value)).replaceAll("<", "\\u003c");
}

export function jsonLdScriptProps(value: unknown): {
  dangerouslySetInnerHTML: { __html: string };
  type: "application/ld+json";
} {
  return {
    dangerouslySetInnerHTML: { __html: serializeJsonLd(value) },
    type: "application/ld+json",
  };
}

export function organizationJsonLd(siteSettings: SiteSettings) {
  const siteUrl = getSiteUrl();
  const organizationId = `${siteUrl}/#organization`;
  const websiteId = `${siteUrl}/#website`;
  const name = cleanString(siteSettings?.siteName) ?? "vaïvae";
  const tagline = cleanString(siteSettings?.tagline) ?? "The Living Runway";
  const logo = cleanString(siteSettings?.logo?.asset?.url) ?? absoluteUrl("/icon-512.png");
  const contactEmail = cleanString(siteSettings?.contactEmail);
  const pressEmail = cleanString(siteSettings?.pressEmail);
  const wholesaleEmail = cleanString(siteSettings?.wholesaleEmail);
  const socialLinks =
    siteSettings?.socialLinks
      ?.map((link) => cleanString(link.url))
      .filter((url): url is string => Boolean(url)) ?? [];
  const contactPoint = [
    contactEmail
      ? {
          "@type": "ContactPoint",
          availableLanguage: "en-US",
          contactType: "customer support",
          email: contactEmail,
        }
      : null,
    pressEmail
      ? {
          "@type": "ContactPoint",
          availableLanguage: "en-US",
          contactType: "press",
          email: pressEmail,
        }
      : null,
    wholesaleEmail
      ? {
          "@type": "ContactPoint",
          availableLanguage: "en-US",
          contactType: "wholesale",
          email: wholesaleEmail,
        }
      : null,
  ].filter(isDefined);
  const address = siteSettings?.address;
  const streetAddress = [cleanString(address?.line1), cleanString(address?.line2)]
    .filter(isDefined)
    .join(", ");
  const hasAddress = Boolean(
    streetAddress ||
    cleanString(address?.city) ||
    cleanString(address?.region) ||
    cleanString(address?.postalCode) ||
    cleanString(address?.country),
  );

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@id": organizationId,
        "@type": "Organization",
        description: cleanString(siteSettings?.defaultSeo?.description) ?? tagline,
        logo,
        name,
        url: siteUrl,
        ...(socialLinks.length > 0 ? { sameAs: socialLinks } : {}),
        ...(contactPoint.length > 0 ? { contactPoint } : {}),
        ...(hasAddress
          ? {
              address: {
                "@type": "PostalAddress",
                ...(streetAddress ? { streetAddress } : {}),
                ...(cleanString(address?.city)
                  ? { addressLocality: cleanString(address?.city) }
                  : {}),
                ...(cleanString(address?.region)
                  ? { addressRegion: cleanString(address?.region) }
                  : {}),
                ...(cleanString(address?.postalCode)
                  ? { postalCode: cleanString(address?.postalCode) }
                  : {}),
                ...(cleanString(address?.country)
                  ? { addressCountry: cleanString(address?.country) }
                  : {}),
              },
            }
          : {}),
      },
      {
        "@id": websiteId,
        "@type": "WebSite",
        name: `${name} — ${tagline}`,
        potentialAction: {
          "@type": "SearchAction",
          "query-input": "required name=search_term_string",
          target: `${siteUrl}/products?q={search_term_string}`,
        },
        publisher: {
          "@id": organizationId,
        },
        url: siteUrl,
      },
    ],
  };
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      item: absoluteUrl(item.url),
      name: item.name,
      position: index + 1,
    })),
  };
}

export function itemListJsonLd(items: ItemListItem[], name = "vaïvae collection") {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      name: item.name,
      position: index + 1,
      url: absoluteUrl(item.url),
    })),
    name,
    numberOfItems: items.length,
  };
}

export function articleJsonLd({
  author,
  dateModified,
  datePublished,
  description,
  headline,
  image,
  keywords,
  url,
}: ArticleJsonLdInput) {
  const absolutePageUrl = absoluteUrl(url);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    ...(cleanString(author)
      ? {
          author: {
            "@type": "Person",
            name: cleanString(author),
          },
        }
      : {}),
    ...(cleanString(dateModified) ? { dateModified: cleanString(dateModified) } : {}),
    ...(cleanString(datePublished) ? { datePublished: cleanString(datePublished) } : {}),
    ...(cleanString(description) ? { description: cleanString(description) } : {}),
    headline,
    ...(cleanString(image) ? { image: cleanString(image) } : {}),
    ...(keywords?.length ? { keywords: keywords.join(", ") } : {}),
    mainEntityOfPage: absolutePageUrl,
    publisher: {
      "@type": "Organization",
      name: "vaïvae",
      url: getSiteUrl(),
    },
    url: absolutePageUrl,
  };
}

export function creativeWorkJsonLd({
  datePublished,
  description,
  image,
  name,
  url,
}: CreativeWorkJsonLdInput) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    ...(cleanString(datePublished) ? { datePublished: cleanString(datePublished) } : {}),
    ...(cleanString(description) ? { description: cleanString(description) } : {}),
    ...(cleanString(image) ? { image: cleanString(image) } : {}),
    name,
    publisher: {
      "@type": "Organization",
      name: "vaïvae",
      url: getSiteUrl(),
    },
    url: absoluteUrl(url),
  };
}

export function collectionPageJsonLd({ description, image, name, url }: CollectionPageJsonLdInput) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    ...(cleanString(description) ? { description: cleanString(description) } : {}),
    ...(cleanString(image) ? { image: cleanString(image) } : {}),
    name,
    url: absoluteUrl(url),
  };
}
