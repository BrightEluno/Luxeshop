import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

import { imageFor } from "../data/products";

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
};

const OrdersContext = createContext<OrdersContextValue | undefined>(undefined);

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved: Order[] = JSON.parse(raw);
        const restored = saved.map((o) => ({
          ...o,
          items: o.items.map((item) => ({
            ...item,
            image: imageFor(item.id, item.color) ?? item.image,
          })),
        }));
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

  function addOrder(order: Omit<Order, "id" | "createdAt">) {
    const id = makeId();
    setOrders((prev) => [{ id, createdAt: new Date().toISOString(), ...order }, ...prev]);
    return id;
  }

  function cancelOrder(id: string) {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, cancelledAt: new Date().toISOString() } : o)),
    );
  }

  function clearOrders() {
    setOrders([]);
  }

  return (
    <OrdersContext.Provider value={{ orders, loaded, addOrder, cancelOrder, clearOrders }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used inside OrdersProvider");
  return ctx;
}
