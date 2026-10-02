import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useTheme, useThemedStyles, type ThemePreference } from "@/src/context/ThemeContext";
import { tapFeedback } from "@/src/utils/haptics";
import type { Palette } from "@/src/constants/colors";
import { useAddress } from "@/src/context/AddressContext";
import { useCart } from "@/src/context/CartContext";
import { useOrders } from "@/src/context/OrdersContext";
import { useWishlist } from "@/src/context/WishlistContext";

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  detail?: string;
  href: Href;
};

export default function ProfileScreen() {
  const { Colors, styles } = useThemedStyles(createStyles);
  const { address, summary } = useAddress();
  const { orders, clearOrders } = useOrders();
  const { count: wishlistCount } = useWishlist();
  const { totalItems } = useCart();
  const { preference, setPreference } = useTheme();

  const name = address.fullName || "Guest Shopper";

  const menu: MenuItem[] = [
    { icon: "receipt-outline", label: "My Orders", detail: `${orders.length}`, href: "/transaction" },
    { icon: "cart-outline", label: "My Cart", detail: `${totalItems}`, href: "/cart" },
    { icon: "heart-outline", label: "Wishlist", detail: `${wishlistCount}`, href: "/wishlist" },
    { icon: "location-outline", label: "Delivery Address", detail: summary, href: "/address" },
    { icon: "notifications-outline", label: "Notifications", href: "/notifications" },
    { icon: "grid-outline", label: "Browse All Products", href: "/category/all" },
    { icon: "pricetag-outline", label: "Deals", href: "/category/deals" },
    { icon: "help-circle-outline", label: "Help & About", href: "/help" },
  ];

  function handleClearOrders() {
    if (orders.length === 0) return;
    const message = "Delete your order history from this device?";
    if (Platform.OS === "web") {
      if (window.confirm(message)) clearOrders();
      return;
    }
    Alert.alert("Clear order history", message, [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: clearOrders },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profile</Text>

      <Pressable style={styles.header} onPress={() => router.push("/address")}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.subtle} numberOfLines={1}>
            {address.fullName ? summary : "Tap to add your name and address"}
          </Text>
        </View>
        <Ionicons name="create-outline" size={20} color={Colors.gray} />
      </Pressable>

      <View style={styles.stats}>
        <Stat label="Orders" value={orders.length} onPress={() => router.push("/transaction")} />
        <Stat label="Wishlist" value={wishlistCount} onPress={() => router.push("/wishlist")} />
        <Stat label="In cart" value={totalItems} onPress={() => router.push("/cart")} />
      </View>

      <View style={styles.menu}>
        {menu.map((item, i) => (
          <Pressable
            key={item.label}
            style={[styles.row, i < menu.length - 1 && styles.rowBorder]}
            onPress={() => router.push(item.href)}
          >
            <View style={styles.rowIcon}>
              <Ionicons name={item.icon} size={18} color={Colors.primary} />
            </View>
            <Text style={styles.rowLabel}>{item.label}</Text>
            {item.detail ? (
              <Text style={styles.rowDetail} numberOfLines={1}>
                {item.detail}
              </Text>
            ) : null}
            <Ionicons name="chevron-forward" size={18} color={Colors.gray} />
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Appearance</Text>
      <View style={styles.segment}>
        {(
          [
            { key: "system", label: "System", icon: "phone-portrait-outline" },
            { key: "light", label: "Light", icon: "sunny-outline" },
            { key: "dark", label: "Dark", icon: "moon-outline" },
          ] as { key: ThemePreference; label: string; icon: keyof typeof Ionicons.glyphMap }[]
        ).map((option) => {
          const active = preference === option.key;
          return (
            <Pressable
              key={option.key}
              style={[styles.segmentItem, active && styles.segmentItemActive]}
              onPress={() => {
                tapFeedback();
                setPreference(option.key);
              }}
              accessibilityState={{ selected: active }}
            >
              <Ionicons
                name={option.icon}
                size={16}
                color={active ? Colors.onPrimary : Colors.gray}
              />
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={[styles.dangerBtn, orders.length === 0 && { opacity: 0.4 }]}
        onPress={handleClearOrders}
        disabled={orders.length === 0}
      >
        <Ionicons name="trash-outline" size={18} color={Colors.danger} />
        <Text style={styles.dangerText}>Clear order history</Text>
      </Pressable>
    </ScrollView>
  );
}

function Stat({ label, value, onPress }: { label: string; value: number; onPress: () => void }) {
  const { styles } = useThemedStyles(createStyles);
  return (
    <Pressable style={styles.stat} onPress={onPress}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Pressable>
  );
}

const createStyles = (Colors: Palette) =>
  StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 120 },
  title: { fontSize: 18, fontWeight: "900", color: Colors.text, marginBottom: 14 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: Colors.onPrimary, fontSize: 22, fontWeight: "900" },
  name: { fontSize: 16, fontWeight: "900", color: Colors.text },
  subtle: { marginTop: 2, fontSize: 12, fontWeight: "600", color: Colors.gray },
  stats: { flexDirection: "row", gap: 12, marginTop: 12 },
  stat: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  statValue: { fontSize: 18, fontWeight: "900", color: Colors.text },
  statLabel: { marginTop: 2, fontSize: 12, fontWeight: "700", color: Colors.gray },
  menu: { marginTop: 12, backgroundColor: Colors.surface, borderRadius: 16, paddingHorizontal: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.background },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { flex: 1, fontSize: 14, fontWeight: "800", color: Colors.text },
  rowDetail: { maxWidth: 140, fontSize: 12, fontWeight: "700", color: Colors.gray },
  sectionLabel: { marginTop: 18, marginBottom: 8, fontSize: 14, fontWeight: "900", color: Colors.text },
  segment: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  segmentItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  segmentItemActive: { backgroundColor: Colors.primary },
  segmentText: { fontSize: 13, fontWeight: "800", color: Colors.gray },
  segmentTextActive: { color: Colors.onPrimary },
  dangerBtn: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 14,
  },
  dangerText: { color: Colors.danger, fontWeight: "800" },
});
