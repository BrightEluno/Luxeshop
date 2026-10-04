import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

import type { Product } from "../data/home";
import { getProduct } from "../data/products";
import { reportError, supabase } from "../lib/supabase";
import { useAuth, useOnSignOut } from "./AuthContext";

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
  const { user } = useAuth();
  const userId = user?.id ?? null;
  // Only ids are stored; product details always come from the catalogue
  // so prices and images stay current.
  const [ids, setIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [syncedUser, setSyncedUser] = useState<string | null>(null);
  const remoteIds = useRef<Set<string>>(new Set());

  useOnSignOut(() => {
    setIds([]);
    remoteIds.current = new Set();
  });

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

  // Sign in: merge with the account's wishlist
  useEffect(() => {
    if (!loaded || !userId || !supabase) return;

    let cancelled = false;
    supabase
      .from("wishlist_items")
      .select("product_id")
      .order("created_at")
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) return reportError("load wishlist", error);
        const remote = (data as { product_id: string }[]).map((r) => r.product_id);
        remoteIds.current = new Set(remote);
        setIds((local) => [...remote, ...local.filter((id) => !remote.includes(id))]);
        setSyncedUser(userId);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, loaded]);

  // While signed in, save changes to the database
  useEffect(() => {
    if (!supabase || !syncedUser || syncedUser !== userId) return;
    const timer = setTimeout(async () => {
      const added = ids.filter((id) => !remoteIds.current.has(id));
      const removed = [...remoteIds.current].filter((id) => !ids.includes(id));
      if (added.length > 0) {
        const { error } = await supabase!
          .from("wishlist_items")
          .upsert(added.map((product_id) => ({ product_id })), { ignoreDuplicates: true });
        reportError("save wishlist", error);
      }
      if (removed.length > 0) {
        const { error } = await supabase!.from("wishlist_items").delete().in("product_id", removed);
        reportError("remove from wishlist", error);
      }
      remoteIds.current = new Set(ids);
    }, 300);
    return () => clearTimeout(timer);
  }, [ids, syncedUser, userId]);

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
