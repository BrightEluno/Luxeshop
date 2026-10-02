const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

/** Formats a number as a UK price, e.g. 1199 -> "£1,199.00" */
export function formatPrice(value: number) {
  return gbp.format(value);
}
