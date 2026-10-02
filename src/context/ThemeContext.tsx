import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { darkPalette, lightPalette, type Palette } from "../constants/colors";

const STORAGE_KEY = "luxeshop:theme";

export type ThemePreference = "system" | "light" | "dark";

type ThemeContextType = {
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
  scheme: "light" | "dark";
  colors: Palette;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw === "light" || raw === "dark" || raw === "system") setPreferenceState(raw);
      })
      .catch(() => {});
  }, []);

  function setPreference(p: ThemePreference) {
    setPreferenceState(p);
    AsyncStorage.setItem(STORAGE_KEY, p).catch(() => {});
  }

  const scheme = preference === "system" ? system : preference;
  const colors = scheme === "dark" ? darkPalette : lightPalette;

  return (
    <ThemeContext.Provider value={{ preference, setPreference, scheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

/**
 * Builds a screen's styles from the active palette.
 * `factory` must be defined at module level so it stays the same between renders.
 */
export function useThemedStyles<T>(factory: (colors: Palette) => T) {
  const { colors } = useTheme();
  const styles = useMemo(() => factory(colors), [factory, colors]);
  return { Colors: colors, styles };
}
