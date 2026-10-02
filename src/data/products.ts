import { catalogProducts } from "./catalog";
import { flashSaleProducts, Product } from "./home";
import { reviews as fallbackReviews } from "./reviews";

/** Every product in the shop */
export const allProducts: Product[] = [...flashSaleProducts, ...catalogProducts];

export function getProduct(id: string) {
  return allProducts.find((p) => p.id === id);
}

/**
 * The photo for a product in a given colour. Saved carts and orders store
 * only names, because bundled image references change between app builds.
 */
export function imageFor(productId: string, colorName?: string) {
  const product = getProduct(productId);
  if (!product) return undefined;
  return product.colors?.find((c) => c.name === colorName)?.image ?? product.image;
}

/**
 * Product lists that aren't a single category:
 * - "flash-sale": the home screen's Flash Sale list
 * - "deals": everything on discount, biggest discount first
 * - "new": new releases
 * - "all": every product
 */
export const specialLists: Record<string, { title: string; description: string; products: () => Product[] }> = {
  "flash-sale": {
    title: "Flash Sale",
    description: "Today's featured products",
    products: () => flashSaleProducts,
  },
  deals: {
    title: "Deals",
    description: "Everything on discount right now",
    products: () =>
      allProducts
        .filter((p) => p.discountPercent > 0)
        .sort((a, b) => b.discountPercent - a.discountPercent),
  },
  new: {
    title: "New Arrivals",
    description: "The latest releases",
    products: () => allProducts.filter((p) => p.isNew),
  },
  all: {
    title: "All Products",
    description: "Everything in the shop",
    products: () => allProducts,
  },
};

/** The product's own reviews, or the shop's general reviews if it has none */
export function getProductReviews(productId: string) {
  return getProduct(productId)?.reviews ?? fallbackReviews;
}

export function getProductsByCategory(slug: string) {
  return allProducts.filter((p) => p.category === slug);
}

export function searchProducts(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return allProducts;
  return allProducts.filter((p) =>
    [p.name, p.brand, p.category].some((field) => field?.toLowerCase().includes(q)),
  );
}
