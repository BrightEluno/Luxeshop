import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useThemedStyles } from "@/src/context/ThemeContext";
import type { Palette } from "@/src/constants/colors";
import { useCart } from "../src/context/CartContext";
import { formatPrice } from "@/src/utils/format";
import { tapFeedback } from "@/src/utils/haptics";

export default function CartScreen() {
  const { Colors, styles } = useThemedStyles(createStyles);
  const { items, increaseQty, decreaseQty, removeItem, remainingStock, totalPrice } = useCart();

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>

        <Text style={styles.title}>My Cart</Text>

        <View style={{ width: 42 }} />
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="cart-outline" size={40} color={Colors.gray} />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Pressable style={styles.shopBtn} onPress={() => router.replace("/")}>
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.lineId}
            contentContainerStyle={{ paddingBottom: 140 }}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <Pressable onPress={() => router.push(`/product/${item.id}`)}>
                  <Image source={item.image} style={styles.itemImage} contentFit="contain" />
                </Pressable>

                <View style={{ flex: 1 }}>
                  <Text
                    style={styles.itemName}
                    numberOfLines={1}
                    onPress={() => router.push(`/product/${item.id}`)}
                  >
                    {item.name}
                  </Text>

                  {(item.storage || item.color) && (
                    <Text style={styles.itemVariant} numberOfLines={1}>
                      {[item.storage, item.color].filter(Boolean).join(" · ")}
                    </Text>
                  )}

                  <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>

                  <View style={styles.qtyRow}>
                    <Pressable
                      style={styles.qtyBtn}
                      onPress={() => decreaseQty(item.lineId)}
                    >
                      <Ionicons name="remove" size={16} color={Colors.text} />
                    </Pressable>

                    <Text style={styles.qtyText}>{item.qty}</Text>

                    <Pressable
                      style={[styles.qtyBtn, remainingStock(item.id) === 0 && { opacity: 0.4 }]}
                      disabled={remainingStock(item.id) === 0}
                      onPress={() => increaseQty(item.lineId)}
                    >
                      <Ionicons name="add" size={16} color={Colors.text} />
                    </Pressable>
                  </View>
                </View>

                <Pressable
                  onPress={() => {
                    tapFeedback();
                    removeItem(item.lineId);
                  }}
                  accessibilityLabel={`Remove ${item.name}`}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={Colors.gray}
                  />
                </Pressable>
              </View>
            )}
          />

          {/* Bottom Checkout Bar */}
          <View style={styles.bottomBar}>
            <View>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalPrice}>{formatPrice(totalPrice)}</Text>
            </View>

            <Pressable
              style={styles.checkoutBtn}
              onPress={() => router.push("/checkout")}
            >
              <Text style={styles.checkoutText}>Checkout</Text>
            </Pressable>
          </View>
        </>
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

  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 60,
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
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 16,
    fontWeight: "900",
    color: Colors.text,
  },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  emptyText: {
    color: Colors.gray,
    fontWeight: "700",
  },

  cartItem: {
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 12,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  itemImage: {
    width: 64,
    height: 64,
    backgroundColor: Colors.background,
    borderRadius: 12,
  },

  itemName: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.text,
  },

  itemVariant: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "600",
    color: Colors.gray,
  },
  itemPrice: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "900",
    color: Colors.text,
  },

  qtyRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  qtyText: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.text,
  },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },

  totalLabel: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: "700",
  },

  totalPrice: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: "900",
    color: Colors.text,
  },

  checkoutBtn: {
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  checkoutText: {
    color: Colors.onPrimary,
    fontWeight: "900",
  },
});
