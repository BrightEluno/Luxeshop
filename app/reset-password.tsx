import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { AuthLayout, FormField, FormMessage, PrimaryButton } from "@/components/auth-layout";
import { useAuth } from "@/src/context/AuthContext";
import { supabase } from "@/src/lib/supabase";

/** Reads `#access_token=…&refresh_token=…` (or an error) from a Supabase email link. */
function parseAuthFragment(url: string) {
  const fragment = url.includes("#") ? url.split("#")[1] : url.split("?")[1] ?? "";
  return Object.fromEntries(new URLSearchParams(fragment));
}

/** Opened from the password-reset email (luxeshop://reset-password#…). */
export default function ResetPasswordScreen() {
  const url = Linking.useLinkingURL();
  const { session, updatePassword } = useAuth();
  const params = useMemo(() => (url ? parseAuthFragment(url) : {}), [url]);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const linkError = params.error_description
    ? params.error_description.replace(/\+/g, " ")
    : sessionError;
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Sign in with the one-time tokens from the email link
  useEffect(() => {
    if (!supabase || !params.access_token || !params.refresh_token) return;
    supabase.auth
      .setSession({ access_token: params.access_token, refresh_token: params.refresh_token })
      .then(({ error: e }) => e && setSessionError("This reset link has expired. Please request a new one."));
  }, [params]);

  async function handleSave() {
    if (password.length < 8) return setError("Use at least 8 characters for your password.");
    setBusy(true);
    setError(null);
    const result = await updatePassword(password);
    setBusy(false);
    if (result.error) setError(result.error);
    else setDone(true);
  }

  if (done) {
    return (
      <AuthLayout title="Password updated" subtitle="You're signed in with your new password.">
        <FormMessage kind="success" text="All set! Your new password is ready to use." />
        <PrimaryButton label="Continue Shopping" onPress={() => router.replace("/")} />
      </AuthLayout>
    );
  }

  if (linkError || !session) {
    return (
      <AuthLayout
        title="Reset link"
        subtitle={linkError ? "We couldn't use that link." : "Open the reset link from your email on this phone."}
      >
        {linkError && <FormMessage kind="error" text={linkError} />}
        <PrimaryButton label="Request a New Link" onPress={() => router.replace("/forgot-password")} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Choose a new password" subtitle={`For ${session.user.email}`}>
      <FormField
        label="New password"
        value={password}
        onChangeText={setPassword}
        placeholder="At least 8 characters"
        secure
        autoComplete="new-password"
        onSubmitEditing={handleSave}
      />
      {error && <FormMessage kind="error" text={error} />}
      <PrimaryButton
        label="Save Password"
        busyLabel="Saving…"
        busy={busy}
        disabled={!password}
        onPress={handleSave}
      />
    </AuthLayout>
  );
}
