import type { Metadata } from "next";
import Link from "next/link";

import { Badge, Button, HStack, Stack } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { listOrders } from "@/medusa/customer";
import type { StoreOrder } from "@/medusa/types";

type OrdersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type OrderPreviewItem = {
  id: string;
  thumbnail: string | null;
  title: string;
};

const PAGE_SIZE = 6;

export const metadata: Metadata = {
  title: "Orders",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function getOrderNumber(order: StoreOrder): string {
  return String(order.display_id ?? order.id.slice(-6));
}

function getOrderStatusLabel(status: StoreOrder["status"]): string {
  const normalizedStatus = String(status ?? "pending").replaceAll("_", " ");

  if (normalizedStatus === "completed") {
    return "Delivered";
  }

  if (normalizedStatus === "pending") {
    return "Placed";
  }

  return normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);
}

function formatDate(value: string | Date | null | undefined): string {
  if (!value) {
    return "Date pending";
  }

  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
}

function formatOrderTotal(order: StoreOrder): string {
  if (typeof order.total !== "number" || !order.currency_code) {
    return "Total pending";
  }

  return formatPrice(order.total, order.currency_code);
}

function getPreviewItems(order: StoreOrder): OrderPreviewItem[] {
  const record = isRecord(order) ? order : null;
  const items = record && Array.isArray(record["items"]) ? record["items"] : [];

  return items.slice(0, 4).flatMap((item, index) => {
    if (!isRecord(item)) {
      return [];
    }

    const product = isRecord(item["product"]) ? item["product"] : null;
    const variant = isRecord(item["variant"]) ? item["variant"] : null;
    const id = getString(item["id"]) ?? `item-${index}`;
    const title = getString(item["product_title"]) ?? getString(item["title"]) ?? "Untitled piece";
    const thumbnail =
      getString(item["thumbnail"]) ??
      getString(variant?.["thumbnail"]) ??
      getString(product?.["thumbnail"]);

    return [{ id, thumbnail, title }];
  });
}

function getPage(value: string | string[] | undefined): number {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const page = rawValue ? Number.parseInt(rawValue, 10) : 1;

  return Number.isFinite(page) ? Math.max(1, page) : 1;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const page = getPage(params["page"]);
  const offset = (page - 1) * PAGE_SIZE;
  const { count, hasMore, orders } = await listOrders({ limit: PAGE_SIZE, offset });
  const previousHref = page > 2 ? `/account/orders?page=${page - 1}` : "/account/orders";
  const nextHref = `/account/orders?page=${page + 1}`;

  if (orders.length === 0) {
    return (
      <div className="grid min-h-96 place-items-center border border-on-light/10 bg-on-light/[0.025] p-8 text-center">
        <Stack align="center" className="max-w-xl" gap={6}>
          <h2 className="font-display text-5xl leading-none font-light tracking-[-0.05em] text-on-light italic">
            No orders yet.
          </h2>
          <p className="text-sm leading-6 text-on-light/60">Your first chapter awaits.</p>
          <Button asChild>
            <Link href="/products">Discover the collection</Link>
          </Button>
        </Stack>
      </div>
    );
  }

  return (
    <Stack gap={8}>
      <HStack align="start" justify="between" wrap>
        <div className="grid gap-2">
          <h2 className="font-display text-4xl leading-none font-light tracking-[-0.05em] text-on-light italic">
            Orders
          </h2>
          <p className="text-sm leading-6 text-on-light/60">
            {count === 1 ? "1 order" : `${count} orders`} held in your history.
          </p>
        </div>
      </HStack>

      <div className="grid gap-4" role="list">
        {orders.map((order) => {
          const items = getPreviewItems(order);

          return (
            <article
              className="grid gap-5 border border-on-light/10 bg-on-light/[0.025] p-5 md:grid-cols-[1fr_auto] md:items-center"
              key={order.id}
              role="listitem"
            >
              <Stack gap={4}>
                <HStack gap={3} wrap>
                  <Badge>{getOrderStatusLabel(order.status)}</Badge>
                  <span className="text-xs tracking-[0.16em] text-on-light/45 uppercase">
                    Order #{getOrderNumber(order)}
                  </span>
                </HStack>
                <div className="grid gap-2">
                  <h3 className="font-display text-3xl leading-none font-light tracking-[-0.05em] italic">
                    {formatDate(order.created_at)}
                  </h3>
                  <p className="text-sm leading-6 text-on-light/60">{formatOrderTotal(order)}</p>
                </div>
                {items.length > 0 ? (
                  <HStack aria-label="Order item preview" gap={2} wrap>
                    {items.map((item) => (
                      <div
                        aria-label={`${item.title} image`}
                        className="size-14 overflow-hidden bg-on-light/5"
                        key={item.id}
                        role="img"
                        style={
                          item.thumbnail
                            ? { backgroundImage: `url(${JSON.stringify(item.thumbnail)})` }
                            : undefined
                        }
                      />
                    ))}
                  </HStack>
                ) : null}
              </Stack>

              <Button asChild className="w-fit" variant="ghost">
                <Link href={`/account/orders/${order.id}`}>View order</Link>
              </Button>
            </article>
          );
        })}
      </div>

      <HStack justify="between" wrap>
        {page > 1 ? (
          <Button asChild variant="underline">
            <Link href={previousHref}>Previous</Link>
          </Button>
        ) : (
          <span />
        )}
        {hasMore ? (
          <Button asChild variant="ghost">
            <Link href={nextHref}>Next orders</Link>
          </Button>
        ) : null}
      </HStack>
    </Stack>
  );
}
