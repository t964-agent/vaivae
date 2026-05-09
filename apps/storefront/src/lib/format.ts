export function formatPrice(
  amount: number,
  currencyCode: string,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat("en-US", {
    currency: currencyCode.toUpperCase(),
    style: "currency",
    ...options,
  }).format(amount / 100);
}
