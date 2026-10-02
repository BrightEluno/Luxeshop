import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { Product } from "../data/home";
import { getProduct } from "../data/products";

const STORAGE_KEY = "luxeshop:recently-viewed";
const MAX_ITEMS = 10;

type RecentlyViewedContextType = {
  /** Most recent first */
  items: Product[];
  addViewed: (id: string) => void;
};

const RecentlyViewedContext = createContext<RecentlyViewedContextType | null>(null);

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved: string[] = JSON.parse(raw);
        // Keep anything viewed while loading (e.g. the app opened on a product)
        setIds((prev) =>
          [...prev, ...saved.filter((id) => !prev.includes(id))].slice(0, MAX_ITEMS),
        );
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids)).catch(() => {});
  }, [ids, loaded]);

  // Stable so screens can call it from an effect without re-running it
  const addViewed = useCallback((id: string) => {
    setIds((prev) => [id, ...prev.filter((p) => p !== id)].slice(0, MAX_ITEMS));
  }, []);

  const items = useMemo(
    () => ids.map(getProduct).filter((p): p is Product => !!p),
    [ids],
  );

  return (
    <RecentlyViewedContext.Provider value={{ items, addViewed }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed() {
  const ctx = useContext(RecentlyViewedContext);
  if (!ctx) throw new Error("useRecentlyViewed must be used inside RecentlyViewedProvider");
  return ctx;
}
