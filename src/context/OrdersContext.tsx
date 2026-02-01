import React, { createContext, useContext, useMemo, useState } from "react";

export type OrderItem = {
  id: string;
  name: string;
  price: number;
  image: any; // RN require(...) images
  qty: number;
};

export type Order = {
  id: string;
  createdAt: string; // ISO date string
  status: "processing" | "completed";
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
};

type OrdersContextValue = {
  orders: Order[];
  addOrder: (order: Omit<Order, "id" | "createdAt" | "status">) => void;
  clearOrders: () => void;
};

const OrdersContext = createContext<OrdersContextValue | undefined>(undefined);

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  const addOrder: OrdersContextValue["addOrder"] = (order) => {
    const newOrder: Order = {
      id: makeId(),
      createdAt: new Date().toISOString(),
      status: "processing",
      ...order,
    };

    setOrders((prev) => [newOrder, ...prev]);
  };

  const clearOrders = () => setOrders([]);

  const value = useMemo(
    () => ({ orders, addOrder, clearOrders }),
    [orders]
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used inside OrdersProvider");
  return ctx;
}
