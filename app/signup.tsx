import { router, useLocalSearchParams, type Href } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AuthLayout, FormField, FormMessage, PrimaryButton } from "@/components/auth-layout";
import type { Palette } from "@/src/constants/colors";
import { useAuth } from "@/src/context/AuthContext";
import { useThemedStyles } from "@/src/context/ThemeContext";
import { successFeedback } from "@/src/utils/haptics";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupScreen() {
  const { styles } = useThemedStyles(createStyles);
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSignup() {
    if (!EMAIL_RE.test(email.trim())) return setError("Please enter a valid email address.");
    if (password.length < 8) return setError("Use at least 8 characters for your password.");

    setBusy(true);
    setError(null);
    const result = await signUp(name, email, password);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    successFeedback();
    if (result.needsConfirmation) {
      setCheckEmail(true);
      return;
    }
    if (router.canGoBack()) router.back();
    else router.replace((redirect ?? "/profile") as Href);
  }

  if (checkEmail) {
    return (
      <AuthLayout title="Check your email" subtitle={`We sent a confirmation link to ${email.trim()}.`}>
        <FormMessage
          kind="success"
          text="Tap the link in the email to activate your account, then come back and log in."
        />
        <PrimaryButton
          label="Go to Log In"
          onPress={() => router.replace({ pathname: "/login", params: redirect ? { redirect } : {} })}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Save your cart, wishlist and orders, and pick up where you left off on any device."
    >
      <FormField
        label="Full name"
        value={name}
        onChangeText={setName}
        placeholder="Alex Morgan"
        autoComplete="name"
      />
      <FormField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <FormField
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="At least 8 characters"
        secure
        autoComplete="new-password"
        onSubmitEditing={handleSignup}
      />

      {error && <FormMessage kind="error" text={error} />}

      <PrimaryButton
        label="Create Account"
        busyLabel="Creating account…"
        busy={busy}
        disabled={!name.trim() || !email.trim() || !password}
        onPress={handleSignup}
      />

      <View style={styles.switchRow}>
        <Text style={styles.switchText}>Already have an account?</Text>
        <Pressable
          onPress={() => router.replace({ pathname: "/login", params: redirect ? { redirect } : {} })}
          hitSlop={8}
        >
          <Text style={styles.link}>Log in</Text>
        </Pressable>
      </View>
    </AuthLayout>
  );
}

const createStyles = (Colors: Palette) =>
  StyleSheet.create({
    link: { fontSize: 13, fontWeight: "800", color: Colors.primary },
    switchRow: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 8 },
    switchText: { fontSize: 13, fontWeight: "600", color: Colors.gray },
  });
