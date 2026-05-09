import type { Metadata } from "next";
import Link from "next/link";

import { SectionBody } from "@/components/atoms/section-text";
import { Badge, Button, HStack, Stack } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { getCurrentCustomer, listAddresses, listOrders } from "@/medusa/customer";
import { getWishlist } from "@/medusa/wishlist";

export const metadata: Metadata = {
  title: "Account",
};

function getFirstName(value: string | null | undefined): string {
  return value?.trim() || "there";
}

function formatDate(value: string | Date | null | undefined): string {
  if (!value) {
    return "Date pending";
  }

  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
}

function formatOrderTotal(
  total: number | null | undefined,
  currencyCode: string | null | undefined,
): string {
  if (typeof total !== "number" || !currencyCode) {
    return "Total pending";
  }

  return formatPrice(total, currencyCode);
}

export default async function AccountPage() {
  const [customer, ordersResult, addresses, wishlistItems] = await Promise.all([
    getCurrentCustomer(),
    listOrders({ limit: 1 }).catch(() => ({ count: 0, hasMore: false, orders: [] })),
    listAddresses().catch(() => []),
    getWishlist().catch(() => []),
  ]);
  const recentOrder = ordersResult.orders[0] ?? null;

  return (
    <Stack gap={8}>
      <div className="grid gap-3 border-b border-on-light/10 pb-8">
        <h2 className="font-display text-5xl leading-none font-light tracking-[-0.05em] text-on-light italic md:text-6xl">
          Welcome back, {getFirstName(customer?.first_name)}.
        </h2>
        <SectionBody className="text-base">
          Your account keeps the practical details close and the browsing quiet.
        </SectionBody>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="grid gap-5 border border-on-light/10 bg-on-light/[0.025] p-5">
          <HStack justify="between">
            <p className="font-body text-xs tracking-[0.18em] text-on-light/45 uppercase">Orders</p>
            <Badge size="sm">{ordersResult.count}</Badge>
          </HStack>
          {recentOrder ? (
            <Stack gap={2}>
              <h3 className="font-display text-3xl leading-none font-light tracking-[-0.05em] italic">
                Order #{recentOrder.display_id ?? recentOrder.id.slice(-6)}
              </h3>
              <p className="text-sm leading-6 text-on-light/60">
                {formatDate(recentOrder.created_at)} ·{" "}
                {formatOrderTotal(recentOrder.total, recentOrder.currency_code)}
              </p>
            </Stack>
          ) : (
            <p className="text-sm leading-6 text-on-light/60">
              No orders yet. Your first chapter awaits.
            </p>
          )}
          <Button asChild className="w-fit" size="sm" variant="underline">
            <Link href="/account/orders">View orders</Link>
          </Button>
        </article>

        <article className="grid gap-5 border border-on-light/10 bg-on-light/[0.025] p-5">
          <HStack justify="between">
            <p className="font-body text-xs tracking-[0.18em] text-on-light/45 uppercase">
              Addresses
            </p>
            <Badge size="sm">{addresses.length}</Badge>
          </HStack>
          <Stack gap={2}>
            <h3 className="font-display text-3xl leading-none font-light tracking-[-0.05em] italic">
              Address book
            </h3>
            <p className="text-sm leading-6 text-on-light/60">
              {addresses.length > 0
                ? "Saved details are ready for checkout."
                : "Add a saved address before your next checkout."}
            </p>
          </Stack>
          <Button asChild className="w-fit" size="sm" variant="underline">
            <Link href="/account/addresses">Manage addresses</Link>
          </Button>
        </article>

        <article className="grid gap-5 border border-on-light/10 bg-on-light/[0.025] p-5">
          <HStack justify="between">
            <p className="font-body text-xs tracking-[0.18em] text-on-light/45 uppercase">
              Wishlist
            </p>
            <Badge size="sm">{wishlistItems.length}</Badge>
          </HStack>
          <Stack gap={2}>
            <h3 className="font-display text-3xl leading-none font-light tracking-[-0.05em] italic">
              Saved pieces
            </h3>
            <p className="text-sm leading-6 text-on-light/60">
              {wishlistItems.length > 0
                ? "Return to the pieces you held aside."
                : "Heart something you love to keep it here."}
            </p>
          </Stack>
          <Button asChild className="w-fit" size="sm" variant="underline">
            <Link href="/account/wishlist">Open wishlist</Link>
          </Button>
        </article>
      </div>
    </Stack>
  );
}
