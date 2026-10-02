import React, { createContext, useContext, useMemo, useState } from "react";

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
  addItem: (item: Omit<CartItem, "qty" | "lineId">, qty?: number) => void;
  removeItem: (lineId: string) => void;
  increaseQty: (lineId: string) => void;
  decreaseQty: (lineId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: Omit<CartItem, "qty" | "lineId">, qty = 1) => {
  const lineId = [item.id, item.color ?? "", item.storage ?? ""].join("|");
  setItems((prev) => {
    const existingIndex = prev.findIndex((p) => p.lineId === lineId);

    if (existingIndex >= 0) {
      const copy = [...prev];
      copy[existingIndex] = {
        ...copy[existingIndex],
        qty: copy[existingIndex].qty + qty,
      };
      return copy;
    }

    return [...prev, { ...item, lineId, qty }];
  });
};


  const removeItem = (lineId: string) => {
    setItems((prev) => prev.filter((p) => p.lineId !== lineId));
  };

  const increaseQty = (lineId: string) => {
    setItems((prev) =>
      prev.map((p) => (p.lineId === lineId ? { ...p, qty: p.qty + 1 } : p))
    );
  };

  const decreaseQty = (lineId: string) => {
    setItems((prev) =>
      prev.map((p) =>
        p.lineId === lineId ? { ...p, qty: Math.max(1, p.qty - 1) } : p
      )
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.qty, 0),
    [items]
  );

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.qty * item.price, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      increaseQty,
      decreaseQty,
      clearCart,
      totalItems,
      totalPrice,
    }),
    [items, totalItems, totalPrice]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
