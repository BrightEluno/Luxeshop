import React, { createContext, useContext, useState } from "react";

type WishlistItem = {
  id: string;
  name: string;
  price: number;
  image: any;
};

type WishlistContextType = {
  items: WishlistItem[];
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (id: string) => boolean;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  function toggleWishlist(item: WishlistItem) {
    setItems((prev) => {
      const exists = prev.find((p) => p.id === item.id);
      if (exists) return prev.filter((p) => p.id !== item.id);
      return [...prev, item];
    });
  }

  function isInWishlist(id: string) {
    return items.some((p) => p.id === id);
  }

  return (
    <WishlistContext.Provider
      value={{ items, toggleWishlist, isInWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}
