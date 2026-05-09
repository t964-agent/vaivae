import type { Metadata, Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ClearCartCookie } from "@/components/checkout/clear-cart-cookie";
import { Button, Separator } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { getMedusaClient } from "@/medusa/client";
import type { StoreOrder } from "@/medusa/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
  title: "Order confirmed",
};

type OrderConfirmationPageProps = {
  params: Promise<{ orderId: string }>;
};

type OrderLineItem = NonNullable<StoreOrder["items"]>[number];
type OrderAddress = StoreOrder["shipping_address"];

async function getOrder(orderId: string): Promise<StoreOrder | null> {
  try {
    const { order } = await getMedusaClient().store.order.retrieve(orderId, {
      fields:
        "id,display_id,email,currency_code,total,subtotal,tax_total,shipping_total,discount_total,*items,*items.product,*items.variant,*shipping_address,*billing_address,*shipping_methods",
    });

    return order;
  } catch {
    return null;
  }
}

function getTrimmedValue(value: string | null | undefined): string | null {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

function getItemTitle(item: OrderLineItem): string {
  return getTrimmedValue(item.product_title) ?? getTrimmedValue(item.title) ?? "Untitled piece";
}

function getVariantLabel(item: OrderLineItem): string | null {
  return getTrimmedValue(item.variant_title) ?? getTrimmedValue(item.subtitle);
}

function getThumbnailUrl(item: OrderLineItem): string | null {
  return (
    getTrimmedValue(item.thumbnail) ??
    getTrimmedValue(item.variant?.thumbnail) ??
    getTrimmedValue(item.product?.thumbnail)
  );
}

function formatAddress(address: OrderAddress): string[] {
  if (!address) {
    return ["Shipping address pending"];
  }

  return [
    `${address.first_name ?? ""} ${address.last_name ?? ""}`.trim(),
    address.address_1 ?? "",
    address.address_2 ?? "",
    `${address.city ?? ""}, ${(address.province ?? "").toUpperCase()} ${address.postal_code ?? ""}`.trim(),
    "United States",
  ].filter((line) => line.trim());
}

function getOrderNumber(order: StoreOrder): string {
  return order.display_id ? `#${order.display_id}` : order.id;
}

function getDeliveryEstimate(order: StoreOrder): string {
  const methodName = order.shipping_methods?.[0]?.name?.toLowerCase() ?? "";

  if (methodName.includes("express")) {
    return "Estimated delivery: 2-3 business days after dispatch.";
  }

  return "Estimated delivery: 3-5 business days after dispatch.";
}

function OrderItems({ order }: { order: StoreOrder }) {
  const items = order.items ?? [];

  return (
    <ul className="grid gap-4" aria-label="Confirmed order items">
      {items.map((item) => {
        const title = getItemTitle(item);
        const variantLabel = getVariantLabel(item);
        const thumbnailUrl = getThumbnailUrl(item);
        const imageStyle = thumbnailUrl
          ? { backgroundImage: `url(${JSON.stringify(thumbnailUrl)})` }
          : undefined;

        return (
          <li className="grid grid-cols-[4.5rem_1fr] gap-4" key={item.id}>
            <div className="relative size-[4.5rem] overflow-hidden bg-on-light/5">
              {thumbnailUrl ? (
                <div
                  aria-label={`${title} image`}
                  className="size-full bg-cover bg-center"
                  role="img"
                  style={imageStyle}
                />
              ) : (
                <div className="flex size-full items-center justify-center text-[0.55rem] tracking-[0.16em] text-on-light/35 uppercase">
                  Image
                </div>
              )}
              <span className="absolute top-1.5 right-1.5 inline-flex size-5 items-center justify-center rounded-full bg-oxblood text-[0.65rem] text-on-dark tabular-nums">
                {item.quantity}
              </span>
            </div>
            <div className="min-w-0 py-1">
              <div className="flex items-start justify-between gap-3">
                <p className="font-display text-lg leading-tight font-light tracking-[-0.03em] text-on-light italic">
                  {title}
                </p>
                <p className="shrink-0 text-sm text-on-light/75 tabular-nums">
                  {formatPrice(item.total, order.currency_code)}
                </p>
              </div>
              {variantLabel ? (
                <p className="mt-1 text-xs leading-5 text-on-light/55">{variantLabel}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { orderId } = await params;
  const order = await getOrder(orderId);

  if (!order) {
    notFound();
  }

  const firstName = order.shipping_address?.first_name?.trim();
  const heading = firstName ? `Thank you, ${firstName}.` : "Your order is in motion.";
  const addressLines = formatAddress(order.shipping_address);

  return (
    <div className="min-h-dvh bg-cream px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
      <ClearCartCookie />
      <article className="mx-auto grid max-w-5xl gap-10" aria-labelledby="confirmation-heading">
        <div className="grid gap-5 border-b border-on-light/10 pb-10">
          <p className="font-body text-[0.68rem] tracking-[0.24em] text-on-light/45 uppercase">
            Order confirmed
          </p>
          <div className="grid gap-4">
            <h1
              className="font-display text-5xl leading-none font-light tracking-[-0.06em] text-on-light italic sm:text-7xl"
              id="confirmation-heading"
            >
              {heading}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-on-light/62 sm:text-base sm:leading-7">
              A receipt is on its way to your inbox. We will send tracking as soon as the order
              leaves the studio.
            </p>
          </div>
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="font-body text-[0.68rem] tracking-[0.18em] text-on-light/45 uppercase">
                Order
              </dt>
              <dd className="mt-1 text-on-light">{getOrderNumber(order)}</dd>
            </div>
            <div>
              <dt className="font-body text-[0.68rem] tracking-[0.18em] text-on-light/45 uppercase">
                Total paid
              </dt>
              <dd className="mt-1 text-on-light tabular-nums">
                {formatPrice(order.total, order.currency_code)}
              </dd>
            </div>
            <div>
              <dt className="font-body text-[0.68rem] tracking-[0.18em] text-on-light/45 uppercase">
                Delivery
              </dt>
              <dd className="mt-1 text-on-light">{getDeliveryEstimate(order)}</dd>
            </div>
          </dl>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
          <section className="grid gap-6" aria-labelledby="confirmation-items-heading">
            <h2
              className="font-display text-3xl leading-none font-light tracking-[-0.05em] text-on-light italic"
              id="confirmation-items-heading"
            >
              Pieces ordered
            </h2>
            <OrderItems order={order} />
          </section>

          <aside className="grid gap-6 border border-on-light/10 bg-on-light/[0.03] p-6">
            <section className="grid gap-3" aria-labelledby="ship-to-heading">
              <h2
                className="font-body text-[0.68rem] tracking-[0.18em] text-on-light/45 uppercase"
                id="ship-to-heading"
              >
                Ship to
              </h2>
              <address className="text-sm leading-6 text-on-light/70 not-italic">
                {addressLines.map((line) => (
                  <span className="block" key={line}>
                    {line}
                  </span>
                ))}
              </address>
            </section>

            <Separator />

            <dl className="grid gap-3 text-sm leading-5">
              <div className="flex justify-between gap-4">
                <dt className="text-on-light/62">Subtotal</dt>
                <dd className="text-on-light tabular-nums">
                  {formatPrice(order.subtotal, order.currency_code)}
                </dd>
              </div>
              {order.discount_total > 0 ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-on-light/62">Discount</dt>
                  <dd className="text-on-light tabular-nums">
                    -{formatPrice(order.discount_total, order.currency_code)}
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-4">
                <dt className="text-on-light/62">Shipping</dt>
                <dd className="text-on-light tabular-nums">
                  {formatPrice(order.shipping_total, order.currency_code)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-on-light/62">Tax</dt>
                <dd className="text-on-light tabular-nums">
                  {formatPrice(order.tax_total, order.currency_code)}
                </dd>
              </div>
              <Separator />
              <div className="flex items-end justify-between gap-4">
                <dt className="text-on-light/62">Total</dt>
                <dd className="font-display text-3xl leading-none font-light tracking-[-0.04em] text-on-light italic tabular-nums">
                  {formatPrice(order.total, order.currency_code)}
                </dd>
              </div>
            </dl>
          </aside>
        </div>

        <Button asChild className="w-fit" size="lg">
          <Link href={"/" as Route}>Back to vaïvae</Link>
        </Button>
      </article>
    </div>
  );
}
