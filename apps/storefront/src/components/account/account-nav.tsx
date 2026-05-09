"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button, Stack } from "@/components/ui";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/medusa/auth-actions";

type AccountNavCustomer = {
  firstName: string | null;
  lastName: string | null;
};

type AccountNavProps = {
  customer: AccountNavCustomer;
};

const accountLinks = [
  { href: "/account" as Route, label: "Account" },
  { href: "/account/orders" as Route, label: "Orders" },
  { href: "/account/addresses" as Route, label: "Addresses" },
  { href: "/account/profile" as Route, label: "Profile" },
  { href: "/account/wishlist" as Route, label: "Wishlist" },
  { href: "/account/marketing-preferences" as Route, label: "Marketing preferences" },
] as const;

function getCustomerName(customer: AccountNavCustomer): string {
  return [customer.firstName, customer.lastName].filter(Boolean).join(" ") || "Account";
}

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/account") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AccountNav({ customer }: AccountNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const customerName = getCustomerName(customer);

  function handleSignOut(): void {
    startTransition(() => {
      void logoutAction().then(() => {
        router.push("/");
        router.refresh();
      });
    });
  }

  return (
    <aside className="border border-on-light/10 bg-on-light/[0.025] p-5 md:p-6 lg:sticky lg:top-28">
      <Stack gap={6}>
        <div className="grid gap-2">
          <p className="font-body text-[0.68rem] tracking-[0.22em] text-on-light/45 uppercase">
            Signed in
          </p>
          <p className="font-display text-2xl leading-none font-light tracking-[-0.04em] text-on-light italic">
            {customerName}
          </p>
        </div>

        <nav aria-label="Account" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {accountLinks.map((link) => {
            const active = isActivePath(pathname, link.href);

            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={cn(
                  "border border-transparent px-3 py-2 font-body text-xs tracking-[0.16em] uppercase transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold",
                  active
                    ? "border-on-light/15 bg-cream text-on-light"
                    : "text-on-light/58 hover:border-on-light/10 hover:text-on-light",
                )}
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Button
          className="w-fit"
          disabled={isPending}
          onClick={handleSignOut}
          type="button"
          variant="underline"
        >
          Sign out
        </Button>
      </Stack>
    </aside>
  );
}
