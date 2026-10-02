import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SkeletonRow } from "@/components/skeleton";
import { useNow } from "@/hooks/use-now";
import { useThemedStyles } from "@/src/context/ThemeContext";
import type { Palette } from "@/src/constants/colors";
import { getStageIndex, getStatusLabel, useOrders } from "../../src/context/OrdersContext";
import { formatPrice } from "@/src/utils/format";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function TransactionScreen() {
  const { Colors, styles } = useThemedStyles(createStyles);
  const { orders, loaded } = useOrders();
  // Statuses move on over time; refresh them every 15s or on pull-to-refresh
  const ticker = useNow(15000);
  const [refreshedAt, setRefreshedAt] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const now = Math.max(ticker, refreshedAt);

  function handleRefresh() {
    setRefreshing(true);
    setRefreshedAt(Date.now());
    setTimeout(() => setRefreshing(false), 400);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Orders</Text>

      {!loaded ? (
        <View>
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="receipt-outline" size={40} color={Colors.gray} />
          <Text style={styles.emptyText}>No orders yet</Text>
          <Text style={styles.emptySubText}>
            Place an order and it will appear here.
          </Text>
          <Pressable style={styles.shopBtn} onPress={() => router.push("/")}>
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.orderCard}
              onPress={() => router.push(`/order/${item.id}`)}
            >
              <View style={styles.orderTopRow}>
                <View>
                  <Text style={styles.orderId} numberOfLines={1}>
                    Order #{item.id.slice(0, 8)}
                  </Text>
                  <Text style={styles.orderDate}>
                    {formatDate(item.createdAt)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusPill,
                    getStageIndex(item, now) < 0 && styles.statusPillCancelled,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      getStageIndex(item, now) < 0 && { color: Colors.danger },
                    ]}
                  >
                    {getStatusLabel(item, now)}
                  </Text>
                </View>
              </View>

              {/* Items preview */}
              <View style={styles.previewRow}>
                {item.items.slice(0, 3).map((p) => (
                  <View
                    key={`${item.id}-${p.lineId ?? p.id}`}
                    style={styles.previewImageBox}
                  >
                    <Image source={p.image} style={styles.previewImage} contentFit="contain" />
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
                  {item.items.length} {item.items.length === 1 ? "item" : "items"}
                </Text>
                <Text style={styles.summaryValue}>
                  {formatPrice(item.total)}
                </Text>
              </View>

              <View style={styles.detailsBtn}>
                <Text style={styles.detailsText}>Track & view details</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.gray} />
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const createStyles = (Colors: Palette) =>
  StyleSheet.create({
  shopBtn: {
    marginTop: 12,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
  },
  shopBtnText: { color: Colors.onPrimary, fontWeight: "800" },
  statusPillCancelled: { backgroundColor: Colors.background },

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
    backgroundColor: Colors.surface,
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
    backgroundColor: Colors.primarySoft,
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
