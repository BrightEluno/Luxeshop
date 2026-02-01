import { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Colors from "../../src/constants/colors";
import { useOrders } from "../../src/context/OrdersContext";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function TransactionScreen() {
  const { orders } = useOrders();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Orders</Text>

      {orders.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="receipt-outline" size={40} color={Colors.gray} />
          <Text style={styles.emptyText}>No orders yet</Text>
          <Text style={styles.emptySubText}>
            Place an order and it will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <View style={styles.orderTopRow}>
                <View>
                  <Text style={styles.orderId} numberOfLines={1}>
                    Order #{item.id.slice(0, 8)}
                  </Text>
                  <Text style={styles.orderDate}>
                    {formatDate(item.createdAt)}
                  </Text>
                </View>

                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>

              {/* Items preview */}
              <View style={styles.previewRow}>
                {item.items.slice(0, 3).map((p) => (
                  <View
                    key={`${item.id}-${p.id}`}
                    style={styles.previewImageBox}
                  >
                    <Image source={p.image} style={styles.previewImage} />
                  </View>
                ))}
                {item.items.length > 3 && (
                  <View style={styles.moreBox}>
                    <Text style={styles.moreText}>
                      +{item.items.length - 3}
                    </Text>
                  </View>
                )}
              </View>

              {/* Totals */}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  {item.items.length} item(s)
                </Text>
                <Text style={styles.summaryValue}>
                  £{item.total.toFixed(2)}
                </Text>
              </View>

              {/* Optional: Details button later */}
              <Pressable
                style={styles.detailsBtn}
                onPress={() =>
                  router.push({
                    pathname: "/order/[id]",
                    params: { id: item.id },
                  } as Href)
                }
              >
                <Text style={styles.detailsText}>View Details</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={Colors.gray}
                />
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 60,
    paddingHorizontal: 16,
  },

  title: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.text,
    marginBottom: 14,
  },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingBottom: 60,
  },

  emptyText: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.text,
  },

  emptySubText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.gray,
    textAlign: "center",
    paddingHorizontal: 30,
    lineHeight: 18,
  },

  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },

  orderTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  orderId: {
    fontSize: 13,
    fontWeight: "900",
    color: Colors.text,
    maxWidth: 220,
  },

  orderDate: {
    marginTop: 6,
    fontSize: 12,
    color: Colors.gray,
    fontWeight: "700",
  },

  statusPill: {
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

  previewRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 10,
    alignItems: "center",
  },

  previewImageBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  previewImage: {
    width: 34,
    height: 34,
    resizeMode: "contain",
  },

  moreBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  moreText: {
    fontSize: 12,
    fontWeight: "900",
    color: Colors.gray,
  },

  summaryRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  summaryLabel: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: "800",
  },

  summaryValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "900",
  },

  detailsBtn: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.background,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  detailsText: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.gray,
  },
});
