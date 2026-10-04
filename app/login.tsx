import { router, useLocalSearchParams, type Href } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AuthLayout, FormField, FormMessage, PrimaryButton } from "@/components/auth-layout";
import type { Palette } from "@/src/constants/colors";
import { useAuth } from "@/src/context/AuthContext";
import { useThemedStyles } from "@/src/context/ThemeContext";
import { successFeedback } from "@/src/utils/haptics";

export default function LoginScreen() {
  const { styles } = useThemedStyles(createStyles);
  // Where to go after logging in, e.g. /checkout
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setBusy(true);
    setError(null);
    const result = await signIn(email, password);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    successFeedback();
    // Usually the screen that sent us here (e.g. checkout) is underneath
    if (router.canGoBack()) router.back();
    else router.replace((redirect ?? "/") as Href);
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to see your orders, wishlist and saved address on any device.">
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
        placeholder="Your password"
        secure
        autoComplete="current-password"
        onSubmitEditing={handleLogin}
      />

      <Pressable onPress={() => router.push("/forgot-password")} style={styles.forgot} hitSlop={8}>
        <Text style={styles.link}>Forgot password?</Text>
      </Pressable>

      {error && <FormMessage kind="error" text={error} />}

      <PrimaryButton
        label="Log In"
        busyLabel="Logging in…"
        busy={busy}
        disabled={!email.trim() || !password}
        onPress={handleLogin}
      />

      <View style={styles.switchRow}>
        <Text style={styles.switchText}>New to Luxeshop?</Text>
        <Pressable
          onPress={() => router.replace({ pathname: "/signup", params: redirect ? { redirect } : {} })}
          hitSlop={8}
        >
          <Text style={styles.link}>Create an account</Text>
        </Pressable>
      </View>
    </AuthLayout>
  );
}

const createStyles = (Colors: Palette) =>
  StyleSheet.create({
    forgot: { alignSelf: "flex-end" },
    link: { fontSize: 13, fontWeight: "800", color: Colors.primary },
    switchRow: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 8 },
    switchText: { fontSize: 13, fontWeight: "600", color: Colors.gray },
  });
