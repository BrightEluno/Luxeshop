export type PromoResult =
  | { ok: true; code: string; label: string; discount: number; freeShipping: boolean }
  | { ok: false; error: string };

type Promo = {
  label: string;
  minSpend?: number;
  apply: (subtotal: number) => { discount: number; freeShipping: boolean };
};

/** Demo promo codes (shown in Help & About). */
export const PROMOS: Record<string, Promo> = {
  LUXE10: {
    label: "10% off your order",
    apply: (subtotal) => ({ discount: Math.round(subtotal * 0.1 * 100) / 100, freeShipping: false }),
  },
  WELCOME20: {
    label: "£20 off orders over £100",
    minSpend: 100,
    apply: () => ({ discount: 20, freeShipping: false }),
  },
  FREESHIP: {
    label: "Free delivery",
    apply: () => ({ discount: 0, freeShipping: true }),
  },
};

export function applyPromo(rawCode: string, subtotal: number): PromoResult {
  const code = rawCode.trim().toUpperCase();
  const promo = PROMOS[code];
  if (!promo) return { ok: false, error: "That code isn't valid." };
  if (promo.minSpend && subtotal < promo.minSpend) {
    return { ok: false, error: `${code} needs a spend of at least £${promo.minSpend}.` };
  }
  return { ok: true, code, label: promo.label, ...promo.apply(subtotal) };
}
