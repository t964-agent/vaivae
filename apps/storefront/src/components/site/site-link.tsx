import type { Route } from "next";
import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ChromeInternalTarget = {
  _id: string;
  _type:
    | "capsule"
    | "homePage"
    | "journal"
    | "legal"
    | "lookbook"
    | "page"
    | "product"
    | "siteSettings";
  title: string | null;
  slug: string | null;
};

export type ChromeLink = {
  _key?: string;
  _type: "link";
  type: "external" | "internal" | null;
  label: string | null;
  internalTarget: ChromeInternalTarget | null;
  href: string | null;
  targetBlank: boolean | null;
};

type ResolvedChromeLink = {
  href: string;
  isExternal: boolean;
  targetBlank: boolean;
};

function isExternalHref(href: string): boolean {
  return /^(https?:|mailto:|tel:)/i.test(href);
}

function routeFromTarget(target: ChromeInternalTarget | null): string | null {
  if (!target) {
    return null;
  }

  if (target._type === "homePage" || target._type === "siteSettings") {
    return "/";
  }

  if (!target.slug) {
    return null;
  }

  switch (target._type) {
    case "capsule":
      return `/capsules/${target.slug}`;
    case "journal":
      return `/journal/${target.slug}`;
    case "legal":
    case "page":
      return `/${target.slug}`;
    case "lookbook":
      return `/lookbook/${target.slug}`;
    case "product":
      return `/products/${target.slug}`;
    default:
      return null;
  }
}

export function resolveChromeLink(link: ChromeLink): ResolvedChromeLink | null {
  const href = link.href?.trim() ?? "";

  if (link.type === "external" && href) {
    return {
      href,
      isExternal: true,
      targetBlank: link.targetBlank === true,
    };
  }

  const internalHref = routeFromTarget(link.internalTarget);

  if (internalHref) {
    return { href: internalHref, isExternal: false, targetBlank: false };
  }

  if (href.startsWith("/") || href.startsWith("#")) {
    return { href, isExternal: false, targetBlank: false };
  }

  if (href) {
    return {
      href,
      isExternal: isExternalHref(href),
      targetBlank: link.targetBlank === true,
    };
  }

  return null;
}

type SiteChromeLinkProps = {
  "aria-label"?: string;
  children?: ReactNode;
  className?: string;
  link: ChromeLink;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export function SiteChromeLink({
  "aria-label": ariaLabel,
  children,
  className,
  link,
  onClick,
}: SiteChromeLinkProps) {
  const resolved = resolveChromeLink(link);
  const label = children ?? link.label;
  const ariaProps = ariaLabel ? { "aria-label": ariaLabel } : {};
  const interactionProps = onClick ? { onClick } : {};

  if (!resolved || !label) {
    return null;
  }

  if (resolved.isExternal) {
    const resolvedTarget = resolved.targetBlank ? "_blank" : undefined;
    const resolvedRel = resolvedTarget === "_blank" ? "noopener noreferrer" : undefined;

    return (
      <a
        className={cn(className)}
        href={resolved.href}
        rel={resolvedRel}
        target={resolvedTarget}
        {...ariaProps}
        {...interactionProps}
      >
        {label}
      </a>
    );
  }

  return (
    <Link
      className={cn(className)}
      href={resolved.href as Route}
      {...ariaProps}
      {...interactionProps}
    >
      {label}
    </Link>
  );
}
