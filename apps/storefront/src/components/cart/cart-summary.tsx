import { Separator } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import type { StoreCart } from "@/medusa/types";

type CartSummaryProps = {
  cart: StoreCart;
};

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm leading-5">
      <span className="text-on-light/62">{label}</span>
      <span className="text-right text-on-light tabular-nums">{value}</span>
    </div>
  );
}

export function CartSummary({ cart }: CartSummaryProps) {
  const currencyCode = cart.currency_code;
  const hasDiscount = cart.discount_total > 0;
  const shippingValue =
    cart.shipping_total > 0
      ? formatPrice(cart.shipping_total, currencyCode)
      : "Calculated at checkout";

  return (
    <div className="grid gap-3" aria-label="Cart summary">
      <SummaryRow label="Subtotal" value={formatPrice(cart.subtotal, currencyCode)} />
      {hasDiscount ? (
        <SummaryRow label="Discount" value={`-${formatPrice(cart.discount_total, currencyCode)}`} />
      ) : null}
      <SummaryRow label="Tax" value="Calculated at checkout" />
      <SummaryRow label="Shipping" value={shippingValue} />
      <Separator className="my-1" />
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-body text-[0.68rem] tracking-[0.18em] text-on-light/45 uppercase">
            Total
          </p>
          <p className="mt-1 text-xs leading-5 text-on-light/52">Final taxes settle at checkout.</p>
        </div>
        <p className="font-display text-3xl leading-none font-light tracking-[-0.04em] text-on-light italic tabular-nums">
          {formatPrice(cart.total, currencyCode)}
        </p>
      </div>
    </div>
  );
}
