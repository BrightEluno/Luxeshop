import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

import { getProduct, imageFor } from "../data/products";

const STORAGE_KEY = "luxeshop:cart";

export type CartItem = {
  /** Unique per product + colour + storage combination */
  lineId: string;
  id: string;
  name: string;
  price: number;
  image: any;
  qty: number;
  color?: string;
  storage?: string;
};

type CartContextType = {
  items: CartItem[];
  /** Returns how many were actually added (limited by stock) */
  addItem: (item: Omit<CartItem, "qty" | "lineId">, qty?: number) => number;
  removeItem: (lineId: string) => void;
  increaseQty: (lineId: string) => void;
  decreaseQty: (lineId: string) => void;
  clearCart: () => void;
  /** Units of a product still available to add (stock minus what's in the cart) */
  remainingStock: (productId: string) => number;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | null>(null);

function stockOf(productId: string) {
  return getProduct(productId)?.stock ?? Infinity;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved: CartItem[] = JSON.parse(raw);
        const restored = saved
          // Drop products that no longer exist
          .filter((item) => getProduct(item.id))
          .map((item) => ({ ...item, image: imageFor(item.id, item.color) }));
        // Keep anything added while loading
        setItems((prev) => [
          ...restored.filter((r) => !prev.some((p) => p.lineId === r.lineId)),
          ...prev,
        ]);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const toSave = items.map(({ image, ...rest }) => rest);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)).catch(() => {});
  }, [items, loaded]);

  // Stock is per product, shared by all its colour/storage variants
  function inCart(productId: string, list = items) {
    return list.filter((p) => p.id === productId).reduce((sum, p) => sum + p.qty, 0);
  }

  function remainingStock(productId: string) {
    return Math.max(0, stockOf(productId) - inCart(productId));
  }

  function addItem(item: Omit<CartItem, "qty" | "lineId">, qty = 1) {
    const lineId = [item.id, item.color ?? "", item.storage ?? ""].join("|");
    const toAdd = Math.min(qty, remainingStock(item.id));
    if (toAdd <= 0) return 0;

    setItems((prev) => {
      const existingIndex = prev.findIndex((p) => p.lineId === lineId);
      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = { ...copy[existingIndex], qty: copy[existingIndex].qty + toAdd };
        return copy;
      }
      return [...prev, { ...item, lineId, qty: toAdd }];
    });
    return toAdd;
  }

  function removeItem(lineId: string) {
    setItems((prev) => prev.filter((p) => p.lineId !== lineId));
  }

  function increaseQty(lineId: string) {
    setItems((prev) =>
      prev.map((p) =>
        p.lineId === lineId && inCart(p.id, prev) < stockOf(p.id) ? { ...p, qty: p.qty + 1 } : p,
      ),
    );
  }

  function decreaseQty(lineId: string) {
    setItems((prev) =>
      prev.map((p) => (p.lineId === lineId ? { ...p, qty: Math.max(1, p.qty - 1) } : p)),
    );
  }

  function clearCart() {
    setItems([]);
  }

  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.qty * item.price, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        increaseQty,
        decreaseQty,
        clearCart,
        remainingStock,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
