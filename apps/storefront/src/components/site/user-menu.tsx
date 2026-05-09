"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { useTransition } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui";
import { logoutAction } from "@/medusa/auth-actions";
import { cn } from "@/lib/utils";

export type UserMenuCustomer = {
  firstName: string | null;
  lastName: string | null;
};

type UserMenuProps = {
  className?: string;
  customer: UserMenuCustomer | null;
  onNavigate?: (() => void) | undefined;
  variant?: "desktop" | "mobile";
};

const accountLinks = [
  { href: "/account" as Route, label: "Account home" },
  { href: "/account/orders" as Route, label: "Orders" },
  { href: "/account/addresses" as Route, label: "Addresses" },
  { href: "/account/profile" as Route, label: "Profile" },
  { href: "/account/wishlist" as Route, label: "Wishlist" },
  { href: "/account/marketing-preferences" as Route, label: "Marketing preferences" },
] as const;

function getCustomerName(customer: UserMenuCustomer): string {
  return [customer.firstName, customer.lastName].filter(Boolean).join(" ") || "Account";
}

export function UserMenu({ className, customer, onNavigate, variant = "desktop" }: UserMenuProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const navigateProps = onNavigate ? { onClick: onNavigate } : {};

  const handleSignOut = () => {
    startTransition(() => {
      void logoutAction().then(() => {
        onNavigate?.();
        router.refresh();
      });
    });
  };

  if (!customer) {
    if (variant === "mobile") {
      return (
        <Link
          className={cn(
            "font-body text-base font-medium tracking-[0.16em] text-on-light uppercase underline-offset-4 transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold",
            className,
          )}
          href="/login"
          {...navigateProps}
        >
          Sign in
        </Link>
      );
    }

    return (
      <Link
        aria-label="Sign in"
        className={cn(
          "inline-flex size-10 items-center justify-center rounded-full transition-colors hover:bg-current/5 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold",
          className,
        )}
        href="/login"
      >
        <User aria-hidden className="size-4" strokeWidth={1.8} />
      </Link>
    );
  }

  const customerName = getCustomerName(customer);

  if (variant === "mobile") {
    return (
      <div className={cn("grid gap-4", className)}>
        <p className="font-body text-xs tracking-[0.18em] text-on-light/45 uppercase">
          Hello, {customerName}
        </p>
        <div className="grid gap-4">
          {accountLinks.map((link) => (
            <Link
              className="font-body text-base font-medium tracking-[0.16em] text-on-light uppercase underline-offset-4 transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold"
              href={link.href}
              key={link.href}
              {...navigateProps}
            >
              {link.label}
            </Link>
          ))}
          <button
            className="w-fit font-body text-base font-medium tracking-[0.16em] text-on-light uppercase underline-offset-4 transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold disabled:opacity-45"
            disabled={isPending}
            onClick={handleSignOut}
            type="button"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Account menu"
          className={cn(
            "inline-flex size-10 items-center justify-center rounded-full transition-colors hover:bg-current/5 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent-gold",
            className,
          )}
          type="button"
        >
          <User aria-hidden className="size-4" strokeWidth={1.8} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel>Hello, {customerName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {accountLinks.map((link) => (
          <DropdownMenuItem asChild key={link.href}>
            <Link href={link.href}>{link.label}</Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={isPending} onSelect={handleSignOut} variant="destructive">
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
