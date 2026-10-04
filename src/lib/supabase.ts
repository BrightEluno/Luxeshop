import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY;

/**
 * True when the app has Supabase credentials (.env.local). Without them the
 * app runs in guest mode and keeps everything on the device.
 */
export const backendEnabled = Boolean(url && key);

export const supabase = backendEnabled
  ? createClient(url!, key!, {
      auth: {
        // During web static rendering there's no storage; skip persistence there
        storage: typeof window === "undefined" && Platform.OS === "web" ? undefined : AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        // Password-reset links are handled by app/reset-password.tsx
        detectSessionInUrl: false,
      },
    })
  : null;

// Keep the session fresh only while the app is in the foreground
if (supabase && Platform.OS !== "web") {
  AppState.addEventListener("change", (state) => {
    if (state === "active") supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}

let warnedMissingTables = false;

/** Log backend failures without crashing; local data stays as the fallback. */
export function reportError(action: string, error: unknown) {
  if (!error) return;
  const e = error as { code?: string; message?: string };
  // PGRST205: the table doesn't exist. Explain once instead of on every request.
  if (e.code === "PGRST205") {
    if (!warnedMissingTables) {
      warnedMissingTables = true;
      console.warn(
        "[supabase] The database tables don't exist yet. Open your Supabase project → SQL Editor, " +
          "run supabase/schema.sql, then reload the app. Until then, data stays on this device.",
      );
    }
    return;
  }
  console.warn(`[supabase] ${action} failed:`, e.message ?? error);
}
