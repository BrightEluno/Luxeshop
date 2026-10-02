import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { useThemedStyles } from "@/src/context/ThemeContext";
import type { Palette } from "@/src/constants/colors";
import { getStatusLabel, useOrders } from "@/src/context/OrdersContext";
import { formatPrice } from "@/src/utils/format";

type Notification = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  time?: string;
  href: Href;
};

const PROMOS: Notification[] = [
  {
    id: "promo-iphone18",
    icon: "phone-portrait-outline",
    title: "iPhone 18 Pro is here",
    body: "Apple's newest Pro iPhone, in four finishes. From £1,199.",
    href: "/product/8",
  },
  {
    id: "promo-deals",
    icon: "pricetag-outline",
    title: "Deals of the week",
    body: "Up to 50% off across fashion, beauty and more.",
    href: "/category/deals",
  },
  {
    id: "promo-fold8",
    icon: "sparkles-outline",
    title: "Galaxy Z Fold8 Ultra in stock",
    body: "Samsung's crease-free foldable. Tap to see the colours.",
    href: "/product/12",
  },
];

export default function NotificationsScreen() {
  const { Colors, styles } = useThemedStyles(createStyles);
  const { orders } = useOrders();

  const orderNotifications: Notification[] = orders.map((o) => ({
    id: `order-${o.id}`,
    icon: "receipt-outline",
    title: `Order #${o.id.slice(0, 8)}: ${getStatusLabel(o)}`,
    body: `${o.items.length} ${o.items.length === 1 ? "item" : "items"} · ${formatPrice(o.total)}`,
    time: new Date(o.createdAt).toLocaleDateString(),
    href: `/order/${o.id}`,
  }));

  const data = [...orderNotifications, ...PROMOS];

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.pageTitle}>Notifications</Text>
        <View style={{ width: 42 }} />
      </View>

      <FlatList
        data={data}
        keyExtractor={(n) => n.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(item.href)}>
            <View style={styles.iconWrap}>
              <Ionicons name={item.icon} size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
              {item.time && <Text style={styles.time}>{item.time}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.gray} />
          </Pressable>
        )}
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
  list: { padding: 16, paddingBottom: 60, gap: 12 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 14, fontWeight: "800", color: Colors.text },
  body: { marginTop: 2, fontSize: 12, color: Colors.gray, lineHeight: 17 },
  time: { marginTop: 4, fontSize: 11, fontWeight: "700", color: Colors.gray },
});
