import type { Session, User } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";

import { backendEnabled, supabase } from "../lib/supabase";

type Result = { error: string | null };

type AuthContextType = {
  /** False when the app has no Supabase credentials (guest-only mode) */
  backendEnabled: boolean;
  /** True until the saved session has been checked */
  initializing: boolean;
  session: Session | null;
  user: User | null;
  signUp: (fullName: string, email: string, password: string) => Promise<Result & { needsConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<Result>;
  signOut: () => Promise<void>;
  /** Emails a reset link that opens app/reset-password */
  sendPasswordReset: (email: string) => Promise<Result>;
  updatePassword: (password: string) => Promise<Result>;
};

const AuthContext = createContext<AuthContextType | null>(null);

/** Supabase error messages, reworded for shoppers */
function friendly(message: string) {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "That email and password don't match.";
  if (m.includes("email not confirmed")) return "Please confirm your email first. Check your inbox for the link.";
  if (m.includes("user already registered")) return "An account with this email already exists. Try logging in.";
  if (m.includes("rate limit")) return "Too many attempts. Please wait a minute and try again.";
  if (m.includes("password should be")) return "Password must be at least 6 characters.";
  if (m.includes("network") || m.includes("fetch")) return "Can't reach the server. Check your connection.";
  return message;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(backendEnabled);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .finally(() => setInitializing(false));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  async function signUp(fullName: string, email: string, password: string) {
    if (!supabase) return { error: "Accounts aren't set up in this build.", needsConfirmation: false };
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: Linking.createURL("/login"),
      },
    });
    if (error) return { error: friendly(error.message), needsConfirmation: false };
    // With email confirmation on, Supabase returns a user but no session yet
    return { error: null, needsConfirmation: !data.session };
  }

  async function signIn(email: string, password: string) {
    if (!supabase) return { error: "Accounts aren't set up in this build." };
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return { error: error ? friendly(error.message) : null };
  }

  async function signOut() {
    await supabase?.auth.signOut();
  }

  async function sendPasswordReset(email: string) {
    if (!supabase) return { error: "Accounts aren't set up in this build." };
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: Linking.createURL("/reset-password"),
    });
    return { error: error ? friendly(error.message) : null };
  }

  async function updatePassword(password: string) {
    if (!supabase) return { error: "Accounts aren't set up in this build." };
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error ? friendly(error.message) : null };
  }

  return (
    <AuthContext.Provider
      value={{
        backendEnabled,
        initializing,
        session,
        user: session?.user ?? null,
        signUp,
        signIn,
        signOut,
        sendPasswordReset,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/** Runs `handler` when the user signs out, so per-account data can be cleared. */
export function useOnSignOut(handler: () => void) {
  const latest = useRef(handler);
  useEffect(() => {
    latest.current = handler;
  });
  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") latest.current();
    });
    return () => data.subscription.unsubscribe();
  }, []);
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
