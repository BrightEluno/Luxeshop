import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

import { reportError, supabase } from "../lib/supabase";
import { useAuth, useOnSignOut } from "./AuthContext";

const STORAGE_KEY = "luxeshop:address";

export type Address = {
  fullName: string;
  phone: string;
  line1: string;
  city: string;
  postcode: string;
};

const DEFAULT_ADDRESS: Address = {
  fullName: "",
  phone: "",
  line1: "3517 W. Gray St.",
  city: "Utica",
  postcode: "",
};

type AddressContextType = {
  address: Address;
  /** One-line version for compact rows, e.g. "3517 W. Gray St., Utica" */
  summary: string;
  saveAddress: (address: Address) => void;
};

const AddressContext = createContext<AddressContextType | null>(null);

export function AddressProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [address, setAddress] = useState<Address>(DEFAULT_ADDRESS);
  const [loaded, setLoaded] = useState(false);
  const addressRef = useRef<Address>(DEFAULT_ADDRESS);
  useEffect(() => {
    addressRef.current = address;
  }, [address]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setAddress({ ...DEFAULT_ADDRESS, ...JSON.parse(raw) });
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  function store(next: Address) {
    setAddress(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }

  function pushToProfile(next: Address) {
    if (!supabase || !userId) return;
    supabase
      .from("profiles")
      .upsert({
        id: userId,
        full_name: next.fullName,
        phone: next.phone,
        line1: next.line1,
        city: next.city,
        postcode: next.postcode,
        updated_at: new Date().toISOString(),
      })
      .then(({ error }) => reportError("save address", error));
  }

  useOnSignOut(() => store(DEFAULT_ADDRESS));

  // Sign in: use the address saved on the account, or save this device's
  // address to the account if it has none yet
  useEffect(() => {
    if (!loaded || !userId || !supabase) return;

    let cancelled = false;
    supabase
      .from("profiles")
      .select("full_name, phone, line1, city, postcode")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) return reportError("load profile", error);
        const local = addressRef.current;
        if (data?.line1) {
          store({
            fullName: data.full_name,
            phone: data.phone,
            line1: data.line1,
            city: data.city,
            postcode: data.postcode,
          });
        } else {
          // Account has no address yet: keep this device's, plus the sign-up name
          const merged = { ...local, fullName: data?.full_name || local.fullName };
          store(merged);
          if (merged.line1 !== DEFAULT_ADDRESS.line1 || merged.fullName) pushToProfile(merged);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, loaded]);

  function saveAddress(next: Address) {
    store(next);
    pushToProfile(next);
  }

  const summary = [address.line1, address.city, address.postcode]
    .filter(Boolean)
    .join(", ");

  return (
    <AddressContext.Provider value={{ address, summary, saveAddress }}>
      {children}
    </AddressContext.Provider>
  );
}

export function useAddress() {
  const ctx = useContext(AddressContext);
  if (!ctx) throw new Error("useAddress must be used inside AddressProvider");
  return ctx;
}
