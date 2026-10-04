import { useState } from "react";

import { AuthLayout, FormField, FormMessage, PrimaryButton } from "@/components/auth-layout";
import { useAuth } from "@/src/context/AuthContext";

export default function ForgotPasswordScreen() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSend() {
    setBusy(true);
    setError(null);
    const result = await sendPasswordReset(email);
    setBusy(false);
    if (result.error) setError(result.error);
    else setSent(true);
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter the email you signed up with and we'll send you a link to choose a new password."
    >
      <FormField
        label="Email"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          setSent(false);
        }}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        onSubmitEditing={handleSend}
      />

      {error && <FormMessage kind="error" text={error} />}
      {sent && (
        <FormMessage
          kind="success"
          text="If an account exists for that email, a reset link is on its way. Open it on this phone."
        />
      )}

      <PrimaryButton
        label={sent ? "Send Again" : "Send Reset Link"}
        busyLabel="Sending…"
        busy={busy}
        disabled={!email.trim()}
        onPress={handleSend}
      />
    </AuthLayout>
  );
}
