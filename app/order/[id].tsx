import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useNow } from "@/hooks/use-now";
import type { Palette } from "@/src/constants/colors";
import { useCart } from "@/src/context/CartContext";
import {
  canCancel,
  getStageIndex,
  ORDER_STAGES,
  useOrders,
  type Order,
} from "@/src/context/OrdersContext";
import { useThemedStyles } from "@/src/context/ThemeContext";
import { formatPrice } from "@/src/utils/format";
import { successFeedback, warningFeedback } from "@/src/utils/haptics";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString();
}

/** When a stage is (or will be) reached, e.g. "14:32" */
function stageTime(order: Order, afterMinutes: number) {
  const t = new Date(new Date(order.createdAt).getTime() + afterMinutes * 60000);
  return t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function confirm(title: string, message: string, onConfirm: () => void) {
  if (Platform.OS === "web") {
    if (window.confirm(message)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: "Keep order", style: "cancel" },
    { text: "Cancel order", style: "destructive", onPress: onConfirm },
  ]);
}

export default function OrderDetailScreen() {
  const { Colors, styles } = useThemedStyles(createStyles);
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders, cancelOrder } = useOrders();
  const { addItem } = useCart();
  // Re-check the delivery stage regularly so the timeline moves on its own
  const now = useNow(15000);

  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <View style={styles.center}>
        <Text style={{ color: Colors.text, fontWeight: "800" }}>Order not found</Text>
        <Pressable
          onPress={() => router.back()}
          style={[styles.primaryBtn, { marginTop: 12 }]}
        >
          <Text style={styles.primaryText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const stageIndex = getStageIndex(order, now);
  const cancelled = stageIndex < 0;
  const delivered = stageIndex === ORDER_STAGES.length - 1;
  const cancellable = canCancel(order, now);

  function handleReorder() {
    if (!order) return;
    let added = 0;
    for (const item of order.items) {
      added += addItem(
        { id: item.id, name: item.name, price: item.price, image: item.image, color: item.color, storage: item.storage },
        item.qty,
      );
    }
    if (added > 0) {
      successFeedback();
      router.push("/cart");
    } else {
      warningFeedback();
      Alert.alert("Out of stock", "These items are no longer available.");
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Order Details</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.orderId}>Order #{order.id.slice(0, 8)}</Text>
              <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
            </View>
            <View style={[styles.statusPill, cancelled && styles.statusPillCancelled]}>
              <Text style={[styles.statusText, cancelled && { color: Colors.danger }]}>
                {cancelled ? "Cancelled" : ORDER_STAGES[stageIndex].label}
              </Text>
            </View>
          </View>
        </View>

        {/* Tracking */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Tracking</Text>

          {cancelled ? (
            <View style={styles.cancelledRow}>
              <Ionicons name="close-circle" size={20} color={Colors.danger} />
              <Text style={styles.cancelledText}>
                Cancelled {formatDate(order.cancelledAt!)}
              </Text>
            </View>
          ) : (
            <View style={styles.timeline}>
              {ORDER_STAGES.map((stage, i) => {
                const done = i <= stageIndex;
                const last = i === ORDER_STAGES.length - 1;
                return (
                  <View key={stage.key} style={styles.stageRow}>
                    <View style={styles.stageMarker}>
                      <View style={[styles.stageDot, done && styles.stageDotDone]}>
                        {done && <Ionicons name="checkmark" size={12} color={Colors.onPrimary} />}
                      </View>
                      {!last && (
                        <View style={[styles.stageLine, i < stageIndex && styles.stageLineDone]} />
                      )}
                    </View>
                    <View style={styles.stageInfo}>
                      <Text style={[styles.stageLabel, !done && { color: Colors.gray }]}>
                        {stage.label}
                      </Text>
                      <Text style={styles.stageTime}>
                        {done ? "" : "Expected "}
                        {stageTime(order, stage.afterMinutes)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Items */}
        <Text style={styles.listTitle}>Items</Text>
        {order.items.map((item) => (
          <Pressable
            key={`${order.id}-${item.lineId ?? item.id}`}
            style={styles.itemCard}
            onPress={() => router.push(`/product/${item.id}`)}
          >
            <View style={styles.imageBox}>
              <Image source={item.image} style={styles.itemImage} contentFit="contain" />
            </View>

            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.qtyLine}>
                {[item.storage, item.color, `Qty: ${item.qty}`].filter(Boolean).join(" · ")}
              </Text>
              {delivered && (
                <Pressable
                  onPress={() => router.push(`/reviews/${item.id}`)}
                  hitSlop={8}
                  style={styles.reviewLink}
                >
                  <Ionicons name="star-outline" size={13} color={Colors.primary} />
                  <Text style={styles.reviewLinkText}>Review</Text>
                </Pressable>
              )}
            </View>

            <Text style={styles.itemPrice}>{formatPrice(item.price * item.qty)}</Text>
          </Pressable>
        ))}

        {/* Payment + summary */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment</Text>
            <Text style={styles.summaryValue}>
              {order.paymentMethod === "cash" ? "Cash on delivery" : "Card"}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatPrice(order.subtotal)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>
              {order.shipping === 0 ? "Free" : formatPrice(order.shipping)}
            </Text>
          </View>

          {order.discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Discount{order.promoCode ? ` (${order.promoCode})` : ""}
              </Text>
              <Text style={[styles.summaryValue, { color: Colors.success }]}>
                -{formatPrice(order.discount)}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>{formatPrice(order.total)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.bottomBar}>
        {cancellable && (
          <Pressable
            style={styles.secondaryBtn}
            onPress={() =>
              confirm("Cancel order", "Cancel this order? This can't be undone.", () => {
                warningFeedback();
                cancelOrder(order.id);
              })
            }
          >
            <Text style={styles.secondaryText}>Cancel Order</Text>
          </Pressable>
        )}
        <Pressable style={styles.primaryBtn} onPress={handleReorder}>
          <Ionicons name="refresh" size={16} color={Colors.onPrimary} />
          <Text style={styles.primaryText}>Buy Again</Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (Colors: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background, paddingTop: 60 },
    center: {
      flex: 1,
      backgroundColor: Colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    topBar: {
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    iconBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: Colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    title: { fontSize: 16, fontWeight: "900", color: Colors.text },
    content: { paddingHorizontal: 16, paddingBottom: 140 },
    card: { backgroundColor: Colors.surface, borderRadius: 16, padding: 14, marginBottom: 12 },
    headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    orderId: { fontSize: 15, fontWeight: "900", color: Colors.text },
    orderDate: { marginTop: 4, fontSize: 12, fontWeight: "700", color: Colors.gray },
    statusPill: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: Colors.primarySoft,
    },
    statusPillCancelled: { backgroundColor: Colors.background },
    statusText: { fontSize: 12, fontWeight: "900", color: Colors.primary },
    sectionTitle: { fontSize: 14, fontWeight: "900", color: Colors.text },
    listTitle: { fontSize: 14, fontWeight: "900", color: Colors.text, marginVertical: 8 },

    timeline: { marginTop: 14 },
    stageRow: { flexDirection: "row", gap: 12 },
    stageMarker: { alignItems: "center", width: 22 },
    stageDot: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: Colors.lightGray,
      backgroundColor: Colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    stageDotDone: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    stageLine: { width: 2, flex: 1, minHeight: 22, backgroundColor: Colors.lightGray },
    stageLineDone: { backgroundColor: Colors.primary },
    stageInfo: { flex: 1, paddingBottom: 18 },
    stageLabel: { fontSize: 14, fontWeight: "800", color: Colors.text },
    stageTime: { marginTop: 2, fontSize: 12, fontWeight: "600", color: Colors.gray },
    cancelledRow: { marginTop: 12, flexDirection: "row", alignItems: "center", gap: 8 },
    cancelledText: { fontSize: 13, fontWeight: "800", color: Colors.danger },

    itemCard: {
      backgroundColor: Colors.surface,
      borderRadius: 16,
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 12,
    },
    imageBox: {
      width: 56,
      height: 56,
      borderRadius: 14,
      backgroundColor: Colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    itemImage: { width: 44, height: 44 },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 13, fontWeight: "900", color: Colors.text },
    qtyLine: { marginTop: 6, fontSize: 12, color: Colors.gray, fontWeight: "800" },
    reviewLink: { marginTop: 6, flexDirection: "row", alignItems: "center", gap: 4 },
    reviewLinkText: { fontSize: 12, fontWeight: "800", color: Colors.primary },
    itemPrice: { fontSize: 13, fontWeight: "900", color: Colors.text },

    summaryRow: {
      marginTop: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    summaryLabel: { fontSize: 13, color: Colors.gray, fontWeight: "800" },
    summaryValue: { fontSize: 13, color: Colors.text, fontWeight: "900" },
    divider: { height: 1, backgroundColor: Colors.background, marginTop: 14 },
    summaryTotalLabel: { fontSize: 14, fontWeight: "900", color: Colors.text },
    summaryTotalValue: { fontSize: 16, fontWeight: "900", color: Colors.text },

    bottomBar: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: Colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 14,
      flexDirection: "row",
      gap: 12,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
    },
    primaryBtn: {
      flex: 1,
      height: 48,
      borderRadius: 14,
      backgroundColor: Colors.primary,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: 20,
    },
    primaryText: { color: Colors.onPrimary, fontWeight: "900" },
    secondaryBtn: {
      flex: 1,
      height: 48,
      borderRadius: 14,
      backgroundColor: Colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryText: { color: Colors.danger, fontWeight: "900" },
  });
