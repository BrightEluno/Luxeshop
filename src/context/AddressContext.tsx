import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

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
  const [address, setAddress] = useState<Address>(DEFAULT_ADDRESS);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setAddress({ ...DEFAULT_ADDRESS, ...JSON.parse(raw) });
      })
      .catch(() => {});
  }, []);

  function saveAddress(next: Address) {
    setAddress(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
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
