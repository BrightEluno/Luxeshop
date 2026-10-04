import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import type { ProductReview } from "../data/home";
import { getProductReviews } from "../data/products";
import { reportError, supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { useOrders } from "./OrdersContext";

const STORAGE_KEY = "luxeshop:reviews";

/** A review written by a shopper in the app (not part of the catalogue) */
export type UserReview = ProductReview & { date: string; mine: boolean };

type ReviewRow = {
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

type ReviewsContextType = {
  /** Fetches shoppers' reviews for a product from the server */
  loadReviews: (productId: string) => void;
  /** Shoppers' reviews (yours first), then the product's catalogue reviews */
  getReviews: (productId: string) => (ProductReview | UserReview)[];
  hasReviewed: (productId: string) => boolean;
  addReview: (
    productId: string,
    review: Pick<ProductReview, "user" | "rating" | "comment">,
  ) => Promise<{ error: string | null }>;
};

const ReviewsContext = createContext<ReviewsContextType | null>(null);

export function ReviewsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const { syncOrders } = useOrders();
  // Reviews written on this device (guest mode, or when there's no backend)
  const [local, setLocal] = useState<Record<string, UserReview[]>>({});
  // Shoppers' reviews from the server, per product
  const [remote, setRemote] = useState<Record<string, ReviewRow[]>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved: Record<string, UserReview[]> = JSON.parse(raw);
        // Keep any review written while loading
        setLocal((prev) => {
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
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(local)).catch(() => {});
  }, [local, loaded]);

  const loadReviews = useCallback((productId: string) => {
    if (!supabase) return;
    supabase
      .from("reviews")
      .select("user_id, user_name, rating, comment, created_at")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) return reportError("load reviews", error);
        setRemote((prev) => ({ ...prev, [productId]: data as ReviewRow[] }));
      });
  }, []);

  function getReviews(productId: string) {
    const shoppers: UserReview[] = (remote[productId] ?? []).map((r) => ({
      user: r.user_name,
      rating: r.rating,
      comment: r.comment,
      date: r.created_at,
      mine: r.user_id === userId,
    }));
    shoppers.sort((a, b) => Number(b.mine) - Number(a.mine));
    return [...(local[productId] ?? []), ...shoppers, ...getProductReviews(productId)];
  }

  function hasReviewed(productId: string) {
    return (
      (local[productId]?.length ?? 0) > 0 ||
      (remote[productId] ?? []).some((r) => r.user_id === userId)
    );
  }

  async function addReview(
    productId: string,
    review: Pick<ProductReview, "user" | "rating" | "comment">,
  ) {
    if (supabase && userId) {
      const row = {
        product_id: productId,
        user_name: review.user,
        rating: review.rating,
        comment: review.comment,
      };
      let { error } = await supabase.from("reviews").insert(row);
      // Rejected as "not a buyer": the order may still be only on this device.
      // Upload it and try once more.
      if (error?.code === "42501" && (await syncOrders())) {
        ({ error } = await supabase.from("reviews").insert(row));
      }
      if (error) {
        reportError("post review", error);
        // 42501 = blocked by the "only buyers can review" rule; 23505 = already reviewed;
        // PGRST205 = the reviews table doesn't exist (supabase/schema.sql not run yet)
        if (error.code === "42501") return { error: "Only customers who bought this product can review it." };
        if (error.code === "23505") return { error: "You've already reviewed this product." };
        if (error.code === "PGRST205") return { error: "Reviews aren't available yet: the shop's database hasn't been set up." };
        if (error.message?.toLowerCase().includes("fetch")) return { error: "Can't reach the server. Check your connection and try again." };
        return { error: "Couldn't post your review. Please try again." };
      }
      loadReviews(productId);
      return { error: null };
    }

    setLocal((prev) => ({
      ...prev,
      [productId]: [
        { ...review, date: new Date().toISOString(), mine: true },
        ...(prev[productId] ?? []),
      ],
    }));
    return { error: null };
  }

  return (
    <ReviewsContext.Provider value={{ loadReviews, getReviews, hasReviewed, addReview }}>
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error("useReviews must be used inside ReviewsProvider");
  return ctx;
}
