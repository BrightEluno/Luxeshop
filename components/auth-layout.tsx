import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import type { Palette } from "@/src/constants/colors";
import { useThemedStyles } from "@/src/context/ThemeContext";

/** Shared page shell for Log In, Sign Up and password screens. */
export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const { Colors, styles } = useThemedStyles(createStyles);
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
          style={styles.iconBtn}
          accessibilityLabel="Back"
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>

        <View style={styles.brand}>
          <Image
            source={require("../src/assets/images/logo.png")}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={styles.brandText}>Luxeshop</Text>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View style={styles.form}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/** Labelled text input; `secure` adds a show/hide toggle for passwords. */
export function FormField({
  label,
  secure,
  ...input
}: { label: string; secure?: boolean } & TextInputProps) {
  const { Colors, styles } = useThemedStyles(createStyles);
  const [hidden, setHidden] = useState(true);
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, focused && styles.inputRowFocused]}>
        <TextInput
          {...input}
          onFocus={(e) => {
            setFocused(true);
            input.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            input.onBlur?.(e);
          }}
          secureTextEntry={secure && hidden}
          placeholderTextColor={Colors.gray}
          style={styles.input}
        />
        {secure && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={8}
            accessibilityLabel={hidden ? "Show password" : "Hide password"}
          >
            <Ionicons name={hidden ? "eye-outline" : "eye-off-outline"} size={20} color={Colors.gray} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

/** Full-width orange button with a busy state. */
export function PrimaryButton({
  label,
  busyLabel,
  busy,
  disabled,
  onPress,
}: {
  label: string;
  busyLabel?: string;
  busy?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const { styles } = useThemedStyles(createStyles);
  const inactive = busy || disabled;
  return (
    <Pressable
      style={[styles.button, inactive && { opacity: 0.5 }]}
      disabled={inactive}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{busy ? busyLabel ?? label : label}</Text>
    </Pressable>
  );
}

/** Red or green message under a form. */
export function FormMessage({ text, kind }: { text: string; kind: "error" | "success" }) {
  const { Colors, styles } = useThemedStyles(createStyles);
  return (
    <View style={[styles.message, kind === "success" && styles.messageSuccess]}>
      <Ionicons
        name={kind === "error" ? "alert-circle" : "checkmark-circle"}
        size={18}
        color={kind === "error" ? Colors.danger : Colors.success}
      />
      <Text style={[styles.messageText, { color: kind === "error" ? Colors.danger : Colors.success }]}>
        {text}
      </Text>
    </View>
  );
}

const createStyles = (Colors: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 40 },
    iconBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: Colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    brand: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 24 },
    logo: { width: 40, height: 40 },
    brandText: { fontSize: 20, fontWeight: "800", color: Colors.text },
    title: { marginTop: 20, fontSize: 26, fontWeight: "900", color: Colors.text },
    subtitle: { marginTop: 6, fontSize: 14, color: Colors.gray, lineHeight: 20 },
    form: { marginTop: 24, gap: 14 },
    field: { gap: 6 },
    label: { fontSize: 12, fontWeight: "800", color: Colors.gray },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: Colors.surface,
      borderRadius: 14,
      paddingHorizontal: 14,
      borderWidth: 1.5,
      borderColor: "transparent",
    },
    // Shows which field is active (replaces the browser's focus outline on web)
    inputRowFocused: { borderColor: Colors.primary },
    input: { flex: 1, paddingVertical: 14, fontSize: 15, fontWeight: "600", color: Colors.text },
    button: {
      marginTop: 6,
      height: 52,
      borderRadius: 14,
      backgroundColor: Colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonText: { color: Colors.onPrimary, fontWeight: "900", fontSize: 15 },
    message: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 12,
      borderRadius: 12,
      backgroundColor: Colors.surface,
    },
    messageSuccess: {},
    messageText: { flex: 1, fontSize: 13, fontWeight: "700", lineHeight: 18 },
  });
