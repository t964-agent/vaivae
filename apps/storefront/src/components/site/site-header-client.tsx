"use client";

import type { GlobalQueryResult } from "@/sanity/types";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

import { useCartUiStore } from "@/components/providers/cart-ui-provider";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui";
import { CART_UPDATED_EVENT, isCartUpdatedEvent } from "@/lib/cart-events";
import { getCartItemCount } from "@/lib/cart-utils";
import { cn } from "@/lib/utils";

import { resolveChromeLink, SiteChromeLink, type ChromeLink } from "./site-link";
import { UserMenu, type UserMenuCustomer } from "./user-menu";

type SiteHeaderClientProps = {
  brandMark: ReactNode;
  cartItemCount?: number | undefined;
  customer: UserMenuCustomer | null;
  navigation: GlobalQueryResult["navigation"];
};

const COLLECTION_HREF = "/collections/summer-fall-26";
const collectionLabels = new Set(["collection", "collections", "lookbook", "pre fall 26", "summer fall 26"]);

const fallbackHeaderLinks = [
  {
    _key: "fallback-ready-to-wear",
    _type: "link",
    href: "/products",
    internalTarget: null,
    label: "READY-TO-WEAR",
    targetBlank: false,
    type: "internal",
  },
  {
    _key: "fallback-collections",
    _type: "link",
    href: COLLECTION_HREF,
    internalTarget: null,
    label: "COLLECTIONS",
    targetBlank: false,
    type: "internal",
  },
  {
    _key: "fallback-atelier",
    _type: "link",
    href: "#",
    internalTarget: null,
    label: "Atelier",
    targetBlank: false,
    type: "internal",
  },
  {
    _key: "fallback-stockists",
    _type: "link",
    href: "#",
    internalTarget: null,
    label: "Stockists",
    targetBlank: false,
    type: "internal",
  },
] satisfies ChromeLink[];

function getUsableLinks(links: ChromeLink[] | null | undefined): ChromeLink[] {
  return (
    links?.filter((link) => {
      if (!link.label?.trim()) {
        return false;
      }

      return Boolean(resolveChromeLink(link) ?? getUsableLinks(link.children).length > 0);
    }) ?? []
  );
}

function normalizeHeaderLabel(label: string | null): string {
  return label?.trim().replaceAll(/\s+/g, " ").toLowerCase() ?? "";
}

/**
 * Normalize legacy CMS labels while preserving Sanity's internal target. Sub-links
 * are stripped so the header renders as a flat collection link until there are
 * multiple collection navigation entries.
 */
function getPrimaryLinks(links: ChromeLink[]): ChromeLink[] {
  return links.map((link) => {
    const label = normalizeHeaderLabel(link.label);

    if (label === "drop 1" || label === "drop 01") {
      return { ...link, label: "READY-TO-WEAR" };
    }

    if (collectionLabels.has(label)) {
      return {
        ...link,
        children: [],
        label: "COLLECTIONS",
      };
    }

    return link;
  });
}

function HeaderNavLink({
  className,
  link,
  onClick,
  variant = "desktop",
}: {
  className?: string;
  link: ChromeLink;
  onClick?: () => void;
  variant?: "desktop" | "mobile";
}) {
  const interactionProps = onClick ? { onClick } : {};
  const subLinks = getUsableLinks(link.children);
  const linkClassName = cn(
    "font-body text-xs font-medium tracking-[0.18em] uppercase underline-offset-4 transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold",
    className,
  );

  if (subLinks.length > 0) {
    return (
      <details className={cn("group", variant === "desktop" && "relative")}>
        <summary className={cn(linkClassName, "flex cursor-pointer list-none items-center gap-2")}>
          {link.label}
        </summary>
        <div
          className={cn(
            "grid gap-3",
            variant === "desktop"
              ? "absolute top-full left-1/2 z-50 mt-4 min-w-48 -translate-x-1/2 border border-on-light/10 bg-cream p-4 shadow-fine"
              : "mt-3 border-l border-on-light/10 pl-4",
          )}
        >
          {subLinks.map((subLink) => (
            <SiteChromeLink
              className={cn(
                "font-body text-xs font-medium tracking-[0.16em] text-on-light/65 uppercase underline-offset-4 transition-colors hover:text-on-light focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold",
                variant === "mobile" && "text-sm",
              )}
              key={subLink._key ?? `${subLink.label}-${subLink.href}`}
              link={subLink}
              {...interactionProps}
            />
          ))}
        </div>
      </details>
    );
  }

  return <SiteChromeLink className={linkClassName} link={link} {...interactionProps} />;
}

function formatCartCount(count: number): string {
  return count > 99 ? "99+" : String(count);
}

export function SiteHeaderClient({
  brandMark,
  cartItemCount = 0,
  customer,
  navigation,
}: SiteHeaderClientProps) {
  const pathname = usePathname();
  const openCart = useCartUiStore((store) => store.open);
  const reduceMotion = useReducedMotion() === true;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [visibleCartItemCount, setVisibleCartItemCount] = useState(cartItemCount);
  const isHome = pathname === "/";
  const isSolid = !isHome;
  const headerLinks = getUsableLinks(navigation?.headerLinks);
  const mobileExtras = getUsableLinks(navigation?.mobileMenuExtras);
  const primaryLinks = getPrimaryLinks(headerLinks.length > 0 ? headerLinks : fallbackHeaderLinks);
  const promoEnabled =
    navigation?.promoBannerEnabled === true && Boolean(navigation.promoBannerText?.trim());

  useEffect(() => {
    function handleCartUpdated(event: Event): void {
      if (!isCartUpdatedEvent(event)) {
        return;
      }

      setVisibleCartItemCount(getCartItemCount(event.detail.cart));
    }

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    };
  }, []);

  return (
    <header
      className={cn(isHome ? "fixed inset-x-0 top-0 z-40" : "sticky top-0 z-40")}
      role="banner"
    >
      {promoEnabled ? (
        <div className="bg-oxblood px-6 py-2 text-center font-body text-[0.68rem] tracking-[0.18em] text-on-dark uppercase md:px-8 lg:px-12">
          {navigation?.promoBannerLink ? (
            <SiteChromeLink
              className="underline-offset-4 hover:underline"
              link={navigation.promoBannerLink}
            >
              {navigation.promoBannerText}
            </SiteChromeLink>
          ) : (
            <span>{navigation?.promoBannerText}</span>
          )}
        </div>
      ) : null}

      <div
        className={cn(
          "border-b px-6 py-4 md:px-8 lg:px-12",
          reduceMotion
            ? "transition-none"
            : "transition-[background-color,backdrop-filter,border-color,color] duration-300 ease-out",
          isSolid
            ? "border-on-light/10 bg-cream/90 text-on-light backdrop-blur-md"
            : "border-transparent bg-transparent text-on-dark [mix-blend-mode:difference]",
        )}
      >
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-5">
          <div className="min-w-0">{brandMark}</div>

          <nav aria-label="Main" className="hidden items-center justify-center gap-8 md:flex">
            {primaryLinks.map((link) => (
              <HeaderNavLink key={link._key ?? `${link.label}-${link.href}`} link={link} />
            ))}
          </nav>

          <div className="flex items-center justify-end gap-1">
            <UserMenu className="hidden sm:inline-flex" customer={customer} />
            <button
              className="relative inline-flex size-10 items-center justify-center rounded-full transition-colors hover:bg-current/5 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold"
              onClick={openCart}
              type="button"
            >
              <span className="sr-only">
                Open cart{visibleCartItemCount > 0 ? `, ${visibleCartItemCount} items` : ""}
              </span>
              <ShoppingBag aria-hidden className="size-4" strokeWidth={1.8} />
              {visibleCartItemCount > 0 ? (
                <span
                  aria-hidden
                  className="absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full bg-accent-red px-1 font-body text-[0.58rem] leading-4 font-medium text-on-dark tabular-nums"
                >
                  {formatCartCount(visibleCartItemCount)}
                </span>
              ) : null}
            </button>
            <Drawer open={mobileOpen} onOpenChange={setMobileOpen}>
              <DrawerTrigger asChild>
                <button
                  aria-label="Open menu"
                  className="inline-flex size-10 items-center justify-center rounded-full transition-colors hover:bg-current/5 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold md:hidden"
                  type="button"
                >
                  <Menu aria-hidden className="size-5" strokeWidth={1.8} />
                </button>
              </DrawerTrigger>
              <DrawerContent side="right">
                <DrawerHeader>
                  <DrawerTitle>vaïvae</DrawerTitle>
                  <DrawerDescription>Navigation for the storefront.</DrawerDescription>
                </DrawerHeader>
                <nav aria-label="Mobile" className="mt-10 grid gap-5">
                  {primaryLinks.map((link) => (
                    <HeaderNavLink
                      className="text-base tracking-[0.16em]"
                      key={link._key ?? `${link.label}-${link.href}-mobile`}
                      link={link}
                      onClick={() => setMobileOpen(false)}
                      variant="mobile"
                    />
                  ))}
                  {mobileExtras.length > 0 ? (
                    <div className="mt-6 grid gap-4 border-t border-on-light/10 pt-6">
                      {mobileExtras.map((link) => (
                        <HeaderNavLink
                          className="text-sm text-on-light/65"
                          key={link._key ?? `${link.label}-${link.href}-mobile-extra`}
                          link={link}
                          onClick={() => setMobileOpen(false)}
                        />
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-6 border-t border-on-light/10 pt-6">
                    <UserMenu
                      customer={customer}
                      onNavigate={() => setMobileOpen(false)}
                      variant="mobile"
                    />
                  </div>
                </nav>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    </header>
  );
}
