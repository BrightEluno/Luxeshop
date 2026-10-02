import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

import type { ProductReview } from "../data/home";
import { getProductReviews } from "../data/products";

const STORAGE_KEY = "luxeshop:reviews";

export type UserReview = ProductReview & { date: string; mine: true };

type ReviewsContextType = {
  /** The customer's own reviews first, then the product's existing reviews */
  getReviews: (productId: string) => (ProductReview | UserReview)[];
  hasReviewed: (productId: string) => boolean;
  addReview: (productId: string, review: Omit<UserReview, "date" | "mine">) => void;
};

const ReviewsContext = createContext<ReviewsContextType | null>(null);

export function ReviewsProvider({ children }: { children: React.ReactNode }) {
  const [mine, setMine] = useState<Record<string, UserReview[]>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved: Record<string, UserReview[]> = JSON.parse(raw);
        // Keep any review written while loading
        setMine((prev) => {
          const merged = { ...saved };
          for (const [id, list] of Object.entries(prev)) merged[id] = [...list, ...(saved[id] ?? [])];
          return merged;
        });
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mine)).catch(() => {});
  }, [mine, loaded]);

  function getReviews(productId: string) {
    return [...(mine[productId] ?? []), ...getProductReviews(productId)];
  }

  function hasReviewed(productId: string) {
    return (mine[productId]?.length ?? 0) > 0;
  }

  function addReview(productId: string, review: Omit<UserReview, "date" | "mine">) {
    setMine((prev) => ({
      ...prev,
      [productId]: [
        { ...review, date: new Date().toISOString(), mine: true },
        ...(prev[productId] ?? []),
      ],
    }));
  }

  return (
    <ReviewsContext.Provider value={{ getReviews, hasReviewed, addReview }}>
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error("useReviews must be used inside ReviewsProvider");
  return ctx;
}
