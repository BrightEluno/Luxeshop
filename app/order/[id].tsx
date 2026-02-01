import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "../../src/constants/colors";
import { useOrders } from "../../src/context/OrdersContext";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders } = useOrders();

  const order = useMemo(() => orders.find((o) => o.id === id), [orders, id]);

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

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>

        <Text style={styles.title}>Order Details</Text>

        <View style={{ width: 42 }} />
      </View>

      {/* Header Card */}
      <View style={styles.card}>
        <Text style={styles.orderId}>Order #{order.id.slice(0, 8)}</Text>
        <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>

        <View style={styles.statusPill}>
          <Text style={styles.statusText}>{order.status}</Text>
        </View>
      </View>

      {/* Items */}
      <Text style={styles.sectionTitle}>Items</Text>

      <FlatList
        data={order.items}
        keyExtractor={(item) => `${order.id}-${item.id}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.imageBox}>
              <Image source={item.image} style={styles.itemImage} />
            </View>

            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.qtyLine}>Qty: {item.qty}</Text>
            </View>

            <Text style={styles.itemPrice}>£{(item.price * item.qty).toFixed(2)}</Text>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>£{order.subtotal.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>£{order.shipping.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={styles.summaryValue}>-£{order.discount.toFixed(2)}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>£{order.total.toFixed(2)}</Text>
            </View>
          </View>
        }
      />

      {/* Bottom */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.primaryBtn} onPress={() => router.replace("/(tabs)")}>
          <Text style={styles.primaryText}>Continue Shopping</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 60,
  },

  center: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
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
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 16,
    fontWeight: "900",
    color: Colors.text,
  },

  card: {
    marginHorizontal: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },

  orderId: {
    fontSize: 14,
    fontWeight: "900",
    color: Colors.text,
  },

  orderDate: {
    marginTop: 6,
    fontSize: 12,
    color: Colors.gray,
    fontWeight: "700",
  },

  statusPill: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "#FFE7DF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  statusText: {
    color: Colors.primary,
    fontWeight: "900",
    fontSize: 12,
    textTransform: "capitalize",
  },

  sectionTitle: {
    marginHorizontal: 16,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "900",
    color: Colors.text,
  },

  itemCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.white,
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

  itemImage: {
    width: 44,
    height: 44,
    resizeMode: "contain",
  },

  itemInfo: {
    flex: 1,
  },

  itemName: {
    fontSize: 13,
    fontWeight: "900",
    color: Colors.text,
  },

  qtyLine: {
    marginTop: 6,
    fontSize: 12,
    color: Colors.gray,
    fontWeight: "800",
  },

  itemPrice: {
    fontSize: 13,
    fontWeight: "900",
    color: Colors.text,
  },

  summaryRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  summaryLabel: {
    fontSize: 13,
    color: Colors.gray,
    fontWeight: "800",
  },

  summaryValue: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: "900",
  },

  divider: {
    height: 1,
    backgroundColor: Colors.background,
    marginTop: 14,
  },

  summaryTotalLabel: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "900",
    color: Colors.text,
  },

  summaryTotalValue: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "900",
    color: Colors.text,
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },

  primaryBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryText: {
    color: Colors.white,
    fontWeight: "900",
  },
});
