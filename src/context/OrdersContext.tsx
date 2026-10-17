import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

import { imageFor } from "../data/products";
import { reportError, supabase } from "../lib/supabase";
import { useAuth, useOnSignOut } from "./AuthContext";

const STORAGE_KEY = "luxeshop:orders";

export type OrderItem = {
  lineId?: string;
  id: string;
  name: string;
  price: number;
  image: any; // RN require(...) images
  qty: number;
  color?: string;
  storage?: string;
};

export type PaymentMethod = "card" | "cash";

export type Order = {
  id: string;
  createdAt: string; // ISO date string
  cancelledAt?: string;
  paymentMethod?: PaymentMethod;
  promoCode?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
};

/**
 * Delivery stages. This demo has no courier, so an order moves through them
 * on a timer measured from when it was placed (minutes, so you can watch it).
 */
export const ORDER_STAGES = [
  { key: "placed", label: "Order placed", afterMinutes: 0 },
  { key: "shipped", label: "Shipped", afterMinutes: 2 },
  { key: "out", label: "Out for delivery", afterMinutes: 5 },
  { key: "delivered", label: "Delivered", afterMinutes: 10 },
] as const;

/** Index into ORDER_STAGES of the stage reached at `now`, or -1 if cancelled. */
export function getStageIndex(order: Order, now = Date.now()) {
  if (order.cancelledAt) return -1;
  const minutes = (now - new Date(order.createdAt).getTime()) / 60000;
  let index = 0;
  ORDER_STAGES.forEach((stage, i) => {
    if (minutes >= stage.afterMinutes) index = i;
  });
  return index;
}

export function getStatusLabel(order: Order, now = Date.now()) {
  const i = getStageIndex(order, now);
  return i < 0 ? "Cancelled" : ORDER_STAGES[i].label;
}

/** Orders can be cancelled until they ship. */
export function canCancel(order: Order, now = Date.now()) {
  return getStageIndex(order, now) === 0;
}

type OrdersContextValue = {
  orders: Order[];
  loaded: boolean;
  /** Returns the new order's id */
  addOrder: (order: Omit<Order, "id" | "createdAt">) => string;
  cancelOrder: (id: string) => void;
  clearOrders: () => void;
  /** Uploads orders that so far exist only on this device; true if it succeeded */
  syncOrders: () => Promise<boolean>;
};

const OrdersContext = createContext<OrdersContextValue | undefined>(undefined);

type OrderRow = {
  id: string;
  created_at: string;
  cancelled_at: string | null;
  payment_method: PaymentMethod;
  promo_code: string | null;
  items: Omit<OrderItem, "image">[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
};

function withImages(order: Order): Order {
  return {
    ...order,
    items: order.items.map((item) => ({ ...item, image: imageFor(item.id, item.color) ?? item.image })),
  };
}

function fromRow(row: OrderRow): Order {
  return withImages({
    id: row.id,
    createdAt: row.created_at,
    cancelledAt: row.cancelled_at ?? undefined,
    paymentMethod: row.payment_method,
    promoCode: row.promo_code ?? undefined,
    items: row.items as OrderItem[],
    subtotal: Number(row.subtotal),
    shipping: Number(row.shipping),
    discount: Number(row.discount),
    total: Number(row.total),
  });
}

function toRow(order: Order) {
  return {
    id: order.id,
    created_at: order.createdAt,
    cancelled_at: order.cancelledAt ?? null,
    payment_method: order.paymentMethod ?? "card",
    promo_code: order.promoCode ?? null,
    items: order.items.map(({ image, ...rest }) => rest),
    subtotal: order.subtotal,
    shipping: order.shipping,
    discount: order.discount,
    total: order.total,
  };
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);
  useOnSignOut(() => setOrders([]));
  // Latest orders, readable from async code without waiting for a re-render
  const ordersRef = useRef<Order[]>([]);
  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved: Order[] = JSON.parse(raw);
        const restored = saved.map(withImages);
        // Keep any order placed while loading (newest first)
        setOrders((prev) => [...prev, ...restored.filter((r) => !prev.some((p) => p.id === r.id))]);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    // Don't overwrite saved orders with the empty initial state.
    if (!loaded) return;
    const toSave = orders.map((o) => ({
      ...o,
      items: o.items.map(({ image, ...rest }) => rest),
    }));
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)).catch(() => {});
  }, [orders, loaded]);

  // Sign in: load the account's orders and upload any placed on this device
  // before signing in
  useEffect(() => {
    if (!loaded || !userId || !supabase) return;

    let cancelled = false;
    (async () => {
      const { data, error } = await supabase!
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (error) return reportError("load orders", error);
      const remote = (data as OrderRow[]).map(fromRow);

      const localOnly = ordersRef.current.filter((o) => !remote.some((r) => r.id === o.id));
      setOrders(
        [...remote, ...localOnly].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      );
      if (localOnly.length > 0) {
        const { error: uploadError } = await supabase!
          .from("orders")
          .upsert(localOnly.map(toRow), { onConflict: "id", ignoreDuplicates: true });
        reportError("upload orders", uploadError);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, loaded]);

  function addOrder(order: Omit<Order, "id" | "createdAt">) {
    const newOrder: Order = { id: makeId(), createdAt: new Date().toISOString(), ...order };
    setOrders((prev) => [newOrder, ...prev]);
    if (supabase && userId) {
      supabase
        .from("orders")
        .insert(toRow(newOrder))
        .then(({ error }) => reportError("place order", error));
    }
    return newOrder.id;
  }

  function cancelOrder(id: string) {
    const cancelledAt = new Date().toISOString();
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, cancelledAt } : o)));
    if (supabase && userId) {
      supabase
        .from("orders")
        .update({ cancelled_at: cancelledAt })
        .eq("id", id)
        .then(({ error }) => reportError("cancel order", error));
    }
  }

  async function syncOrders() {
    if (!supabase || !userId || ordersRef.current.length === 0) return false;
    const { error } = await supabase
      .from("orders")
      .upsert(ordersRef.current.map(toRow), { onConflict: "id", ignoreDuplicates: true });
    reportError("sync orders", error);
    return !error;
  }

  function clearOrders() {
    setOrders([]);
    if (supabase && userId) {
      supabase
        .from("orders")
        .delete()
        .eq("user_id", userId)
        .then(({ error }) => reportError("clear orders", error));
    }
  }

  return (
    <OrdersContext.Provider value={{ orders, loaded, addOrder, cancelOrder, clearOrders, syncOrders }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used inside OrdersProvider");
  return ctx;
}
