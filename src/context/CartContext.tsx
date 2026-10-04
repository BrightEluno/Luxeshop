import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

import { getProduct, imageFor } from "../data/products";
import { reportError, supabase } from "../lib/supabase";
import { useAuth, useOnSignOut } from "./AuthContext";

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

type CartRow = {
  line_id: string;
  product_id: string;
  name: string;
  price: number;
  qty: number;
  color: string | null;
  storage: string | null;
};

function stockOf(productId: string) {
  return getProduct(productId)?.stock ?? Infinity;
}

function fromRow(row: CartRow): CartItem {
  return {
    lineId: row.line_id,
    id: row.product_id,
    name: row.name,
    price: Number(row.price),
    qty: row.qty,
    color: row.color ?? undefined,
    storage: row.storage ?? undefined,
    image: imageFor(row.product_id, row.color ?? undefined),
  };
}

function toRow(item: CartItem) {
  return {
    line_id: item.lineId,
    product_id: item.id,
    name: item.name,
    price: item.price,
    qty: item.qty,
    color: item.color ?? null,
    storage: item.storage ?? null,
    updated_at: new Date().toISOString(),
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  // Which account the cart has been merged with (null = guest cart)
  const [syncedUser, setSyncedUser] = useState<string | null>(null);
  const remoteLines = useRef<Set<string>>(new Set());

  // The cart belongs to the account: clear it from the device on sign-out
  useOnSignOut(() => {
    setItems([]);
    remoteLines.current = new Set();
  });

  // Guest / cached cart from the device
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

  // Sign in: merge the account's cart with the guest cart
  useEffect(() => {
    if (!loaded || !userId || !supabase) return;

    let cancelled = false;
    supabase
      .from("cart_items")
      .select("line_id, product_id, name, price, qty, color, storage")
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) return reportError("load cart", error);
        const remote = (data as CartRow[]).filter((r) => getProduct(r.product_id)).map(fromRow);
        remoteLines.current = new Set(remote.map((r) => r.lineId));
        setItems((local) => {
          const merged = [...remote];
          for (const item of local) {
            const existing = merged.find((m) => m.lineId === item.lineId);
            if (existing) existing.qty = Math.max(existing.qty, item.qty);
            else merged.push(item);
          }
          return merged;
        });
        setSyncedUser(userId);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, loaded]);

  // While signed in, save changes to the database (debounced)
  useEffect(() => {
    if (!supabase || !syncedUser || syncedUser !== userId) return;
    const timer = setTimeout(async () => {
      const current = new Set(items.map((i) => i.lineId));
      const removed = [...remoteLines.current].filter((id) => !current.has(id));
      if (items.length > 0) {
        const { error } = await supabase!.from("cart_items").upsert(items.map(toRow));
        reportError("save cart", error);
      }
      if (removed.length > 0) {
        const { error } = await supabase!.from("cart_items").delete().in("line_id", removed);
        reportError("remove cart lines", error);
      }
      remoteLines.current = current;
    }, 400);
    return () => clearTimeout(timer);
  }, [items, syncedUser, userId]);

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
