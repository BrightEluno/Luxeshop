import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { useThemedStyles } from "@/src/context/ThemeContext";
import type { Palette } from "@/src/constants/colors";
import { Address, useAddress } from "@/src/context/AddressContext";

// Turning coordinates into a street address is only available on iOS and Android.
const CAN_LOCATE = Platform.OS !== "web";

class LocationError extends Error {
  constructor(message: string, readonly needsSettings = false) {
    super(message);
  }
}

/** Gets the device's position and turns it into address fields. */
async function getCurrentAddress(): Promise<Pick<Address, "line1" | "city" | "postcode">> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== "granted") {
    throw new LocationError(
      "Location access is off for Luxeshop. Allow it in Settings to use your current address.",
      !permission.canAskAgain,
    );
  }

  if (!(await Location.hasServicesEnabledAsync())) {
    throw new LocationError("Turn on Location Services on your phone, then try again.");
  }

  // A GPS fix can take a while indoors; fall back to the last known position.
  const position = await Promise.race([
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 15000)),
  ]) ?? (await Location.getLastKnownPositionAsync());

  if (!position) {
    throw new LocationError("Couldn't find your location. Move somewhere with better signal and try again.");
  }

  const [place] = await Location.reverseGeocodeAsync(position.coords);
  if (!place) {
    throw new LocationError("Couldn't find an address for your location. Please enter it manually.");
  }

  const street = [place.streetNumber, place.street].filter(Boolean).join(" ");
  return {
    line1: street || place.name || "",
    city: place.city ?? place.subregion ?? place.district ?? place.region ?? "",
    postcode: place.postalCode ?? "",
  };
}

export default function AddressScreen() {
  const { Colors, styles } = useThemedStyles(createStyles);
  const { address, saveAddress } = useAddress();
  const [form, setForm] = useState<Address>(address);
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<LocationError | null>(null);
  const [filledFromLocation, setFilledFromLocation] = useState(false);

  async function handleUseLocation() {
    setLocating(true);
    setLocationError(null);
    setFilledFromLocation(false);
    try {
      const found = await getCurrentAddress();
      // Keep the name and phone; replace the address lines.
      setForm((prev) => ({ ...prev, ...found }));
      setFilledFromLocation(true);
      setError(null);
    } catch (e) {
      setLocationError(
        e instanceof LocationError
          ? e
          : new LocationError("Something went wrong getting your location. Please try again."),
      );
    } finally {
      setLocating(false);
    }
  }

  function update(field: keyof Address, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }

  function handleSave() {
    if (!form.line1.trim() || !form.city.trim()) {
      setError("Please enter at least a street address and a city.");
      return;
    }
    saveAddress({
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      line1: form.line1.trim(),
      city: form.city.trim(),
      postcode: form.postcode.trim().toUpperCase(),
    });
    router.back();
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.pageTitle}>Delivery Address</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {CAN_LOCATE && (
          <Pressable
            style={[styles.locationBtn, locating && { opacity: 0.6 }]}
            onPress={handleUseLocation}
            disabled={locating}
          >
            {locating ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <Ionicons name="navigate" size={18} color={Colors.primary} />
            )}
            <Text style={styles.locationText}>
              {locating ? "Finding your address…" : "Use my current location"}
            </Text>
          </Pressable>
        )}

        {filledFromLocation && (
          <Text style={styles.hint}>
            Filled in from your current location. Please check it before saving.
          </Text>
        )}

        {locationError && (
          <View style={styles.locationErrorBox}>
            <Text style={styles.error}>{locationError.message}</Text>
            {locationError.needsSettings && (
              <Pressable onPress={() => Linking.openSettings()} hitSlop={8}>
                <Text style={styles.settingsLink}>Open Settings</Text>
              </Pressable>
            )}
          </View>
        )}

        <View style={styles.card}>
          <Field label="Full name" value={form.fullName} onChangeText={(v) => update("fullName", v)} autoComplete="name" />
          <Field label="Phone number" value={form.phone} onChangeText={(v) => update("phone", v)} keyboardType="phone-pad" autoComplete="tel" />
          <Field label="Street address *" value={form.line1} onChangeText={(v) => update("line1", v)} autoComplete="street-address" />
          <Field label="Town / City *" value={form.city} onChangeText={(v) => update("city", v)} />
          <Field label="Postcode" value={form.postcode} onChangeText={(v) => update("postcode", v)} autoCapitalize="characters" autoComplete="postal-code" />
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Save Address</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, ...input }: { label: string } & TextInputProps) {
  const { Colors, styles } = useThemedStyles(createStyles);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...input}
        placeholderTextColor={Colors.gray}
        style={styles.input}
      />
    </View>
  );
}

const createStyles = (Colors: Palette) =>
  StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingTop: 60 },
  topBar: {
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  pageTitle: { fontSize: 16, fontWeight: "800", color: Colors.text },
  content: { padding: 16, paddingBottom: 60 },
  card: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 14 },
  field: { gap: 6 },
  label: { fontSize: 12, fontWeight: "800", color: Colors.gray },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  error: { marginTop: 12, color: Colors.danger, fontWeight: "700", fontSize: 13 },
  locationBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    marginBottom: 12,
    borderRadius: 14,
    backgroundColor: Colors.primarySoft,
  },
  locationText: { color: Colors.primary, fontWeight: "800", fontSize: 15 },
  hint: { marginBottom: 12, fontSize: 12, fontWeight: "700", color: Colors.gray },
  locationErrorBox: { marginBottom: 12 },
  settingsLink: { marginTop: 6, color: Colors.primary, fontWeight: "800", fontSize: 13 },
  saveBtn: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: { color: Colors.onPrimary, fontWeight: "900", fontSize: 15 },
});
