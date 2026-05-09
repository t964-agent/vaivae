"use client";

import type { GlobalQueryResult } from "@/sanity/types";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag, User } from "lucide-react";
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

type SiteHeaderClientProps = {
  brandMark: ReactNode;
  cartItemCount?: number | undefined;
  navigation: GlobalQueryResult["navigation"];
};

const fallbackHeaderLinks = [
  {
    _key: "fallback-lookbook",
    _type: "link",
    href: "#",
    internalTarget: null,
    label: "Lookbook",
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
  return links?.filter((link) => Boolean(link.label?.trim() && resolveChromeLink(link))) ?? [];
}

function HeaderNavLink({
  className,
  link,
  onClick,
}: {
  className?: string;
  link: ChromeLink;
  onClick?: () => void;
}) {
  const interactionProps = onClick ? { onClick } : {};

  return (
    <SiteChromeLink
      className={cn(
        "font-body text-xs font-medium tracking-[0.18em] uppercase underline-offset-4 transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold",
        className,
      )}
      link={link}
      {...interactionProps}
    />
  );
}

function formatCartCount(count: number): string {
  return count > 99 ? "99+" : String(count);
}

export function SiteHeaderClient({
  brandMark,
  cartItemCount = 0,
  navigation,
}: SiteHeaderClientProps) {
  const pathname = usePathname();
  const openCart = useCartUiStore((store) => store.open);
  const reduceMotion = useReducedMotion() === true;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [visibleCartItemCount, setVisibleCartItemCount] = useState(cartItemCount);
  const isHome = pathname === "/";
  const isSolid = !isHome || pastHero;
  const headerLinks = getUsableLinks(navigation?.headerLinks);
  const mobileExtras = getUsableLinks(navigation?.mobileMenuExtras);
  const primaryLinks = headerLinks.length > 0 ? headerLinks : fallbackHeaderLinks;
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

  useEffect(() => {
    if (!isHome) {
      return;
    }

    let frame = 0;

    const update = () => {
      frame = 0;
      setPastHero(window.scrollY >= window.innerHeight - 80);
    };
    const scheduleUpdate = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [isHome]);

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
            <Link
              aria-label="Account"
              className="hidden size-10 items-center justify-center rounded-full transition-colors hover:bg-current/5 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold sm:inline-flex"
              href={"/account" as Route}
            >
              <User aria-hidden className="size-4" strokeWidth={1.8} />
            </Link>
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
                </nav>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    </header>
  );
}
