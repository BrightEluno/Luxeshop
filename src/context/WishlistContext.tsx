import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import { flashSaleProducts, Product } from "../data/home";

const STORAGE_KEY = "luxeshop:wishlist";

type WishlistContextType = {
  items: Product[];
  count: number;
  toggleWishlist: (id: string) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  // Only ids are stored; product details always come from the catalogue
  // so prices and images stay current.
  const [ids, setIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setIds(JSON.parse(raw));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    // Don't overwrite saved data with the empty initial state.
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids)).catch(() => {});
  }, [ids, loaded]);

  const items = useMemo(
    () =>
      ids
        .map((id) => flashSaleProducts.find((p) => p.id === id))
        .filter((p): p is Product => !!p),
    [ids],
  );

  function toggleWishlist(id: string) {
    setIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  function removeFromWishlist(id: string) {
    setIds((prev) => prev.filter((p) => p !== id));
  }

  function isInWishlist(id: string) {
    return ids.includes(id);
  }

  return (
    <WishlistContext.Provider
      value={{
        items,
        count: items.length,
        toggleWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
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
