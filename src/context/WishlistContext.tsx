import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import type { Product } from "../data/home";
import { getProduct } from "../data/products";

const STORAGE_KEY = "luxeshop:wishlist";

type WishlistContextType = {
  items: Product[];
  count: number;
  /** False until the saved wishlist has been read from the device */
  loaded: boolean;
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
        if (!raw) return;
        const saved: string[] = JSON.parse(raw);
        // Keep anything toggled while loading
        setIds((prev) => [...saved.filter((id) => !prev.includes(id)), ...prev]);
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
        .map((id) => getProduct(id))
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
        loaded,
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
