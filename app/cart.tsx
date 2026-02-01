import { Ionicons } from "@expo/vector-icons";
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
import Colors from "../src/constants/colors";
import { useCart } from "../src/context/CartContext";

export default function CartScreen() {
  const { items, increaseQty, decreaseQty, removeItem, totalPrice } = useCart();

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
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 140 }}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <Image source={item.image} style={styles.itemImage} />

                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>

                  <Text style={styles.itemPrice}>£{item.price.toFixed(2)}</Text>

                  <View style={styles.qtyRow}>
                    <Pressable
                      style={styles.qtyBtn}
                      onPress={() => decreaseQty(item.id)}
                    >
                      <Ionicons name="remove" size={16} color={Colors.text} />
                    </Pressable>

                    <Text style={styles.qtyText}>{item.qty}</Text>

                    <Pressable
                      style={styles.qtyBtn}
                      onPress={() => increaseQty(item.id)}
                    >
                      <Ionicons name="add" size={16} color={Colors.text} />
                    </Pressable>
                  </View>
                </View>

                <Pressable onPress={() => removeItem(item.id)}>
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
              <Text style={styles.totalPrice}>£{totalPrice.toFixed(2)}</Text>
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

const styles = StyleSheet.create({
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
    backgroundColor: Colors.white,
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
    backgroundColor: Colors.white,
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
    resizeMode: "contain",
    backgroundColor: Colors.background,
    borderRadius: 12,
  },

  itemName: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.text,
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
    backgroundColor: Colors.white,
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
    color: Colors.white,
    fontWeight: "900",
  },
});
