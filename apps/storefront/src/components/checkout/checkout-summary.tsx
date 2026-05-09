import { Separator } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import type { StoreCart, StoreCartLineItem } from "@/medusa/types";

type CheckoutSummaryProps = {
  cart: StoreCart;
};

function getTrimmedValue(value: string | null | undefined): string | null {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

function getItemTitle(item: StoreCartLineItem): string {
  return getTrimmedValue(item.product_title) ?? getTrimmedValue(item.title) ?? "Untitled piece";
}

function getVariantLabel(item: StoreCartLineItem): string | null {
  const optionLabels =
    item.variant?.options
      ?.map((optionValue) => {
        const value = getTrimmedValue(optionValue.value);

        if (!value) {
          return null;
        }

        const optionTitle = getTrimmedValue(optionValue.option?.title);

        if (!optionTitle || optionTitle.toLowerCase() === "title") {
          return value;
        }

        return `${optionTitle}: ${value}`;
      })
      .filter((label): label is string => Boolean(label)) ?? [];

  if (optionLabels.length > 0) {
    return optionLabels.join(" / ");
  }

  return (
    getTrimmedValue(item.variant_title) ??
    getTrimmedValue(item.variant?.title) ??
    getTrimmedValue(item.subtitle)
  );
}

function getThumbnailUrl(item: StoreCartLineItem): string | null {
  return (
    getTrimmedValue(item.thumbnail) ??
    getTrimmedValue(item.variant?.thumbnail) ??
    getTrimmedValue(item.product?.thumbnail) ??
    getTrimmedValue(item.variant?.images?.[0]?.url) ??
    getTrimmedValue(item.product?.images?.[0]?.url)
  );
}

function getLineAmount(item: StoreCartLineItem): number {
  return item.total ?? item.subtotal ?? item.unit_price;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm leading-5">
      <span className="text-on-light/62">{label}</span>
      <span className="text-right text-on-light tabular-nums">{value}</span>
    </div>
  );
}

export function CheckoutSummary({ cart }: CheckoutSummaryProps) {
  const currencyCode = cart.currency_code;
  const items = cart.items ?? [];
  const hasDiscount = cart.discount_total > 0;
  const shippingValue =
    cart.shipping_total > 0
      ? formatPrice(cart.shipping_total, currencyCode)
      : "Selected at delivery";
  const taxValue =
    cart.tax_total > 0 ? formatPrice(cart.tax_total, currencyCode) : "Calculated soon";

  return (
    <aside aria-labelledby="checkout-summary-heading" className="grid gap-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2
          className="font-body text-[0.68rem] tracking-[0.22em] text-on-light/45 uppercase"
          id="checkout-summary-heading"
        >
          Order edit
        </h2>
        <span className="text-xs text-on-light/50">{items.length} pieces</span>
      </div>

      <ul aria-label="Items in your order" className="grid gap-4">
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
                    {formatPrice(getLineAmount(item), currencyCode)}
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

      <Separator />

      <div className="grid gap-3" aria-label="Order totals">
        <SummaryRow label="Subtotal" value={formatPrice(cart.subtotal, currencyCode)} />
        {hasDiscount ? (
          <SummaryRow
            label="Discount"
            value={`-${formatPrice(cart.discount_total, currencyCode)}`}
          />
        ) : null}
        <SummaryRow label="Shipping" value={shippingValue} />
        <SummaryRow label="Tax" value={taxValue} />
        <Separator className="my-1" />
        <div className="flex items-end justify-between gap-4">
          <span className="font-body text-[0.68rem] tracking-[0.18em] text-on-light/45 uppercase">
            Total
          </span>
          <span className="font-display text-3xl leading-none font-light tracking-[-0.04em] text-on-light italic tabular-nums">
            {formatPrice(cart.total, currencyCode)}
          </span>
        </div>
      </div>
    </aside>
  );
}
