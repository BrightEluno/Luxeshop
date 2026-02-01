import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
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
import { useOrders } from "../src/context/OrdersContext";

type PaymentMethod = "card" | "cash";

export default function CheckoutScreen() {
  const { items, totalPrice, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");

  // You can tweak these later
  const shippingFee = useMemo(() => (totalPrice > 0 ? 4.99 : 0), [totalPrice]);
  const discount = useMemo(() => (totalPrice > 300 ? 10 : 0), [totalPrice]); // example rule
  const grandTotal = useMemo(
    () => Math.max(0, totalPrice + shippingFee - discount),
    [totalPrice, shippingFee, discount],
  );
  const { addOrder } = useOrders();

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>

        <Text style={styles.title}>Checkout</Text>

        <View style={{ width: 42 }} />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Delivery Address */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.sectionTitle}>Delivery Address</Text>
                <Pressable style={styles.editPill}>
                  <Ionicons
                    name="create-outline"
                    size={14}
                    color={Colors.gray}
                  />
                  <Text style={styles.editText}>Edit</Text>
                </Pressable>
              </View>

              <View style={styles.addressRow}>
                <Ionicons
                  name="location-outline"
                  size={18}
                  color={Colors.text}
                />
                <Text style={styles.address} numberOfLines={1}>
                  3517 W. Gray St. Utica
                </Text>
              </View>
            </View>

            {/* Payment Method */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Payment Method</Text>

              <View style={styles.paymentRow}>
                <Pressable
                  onPress={() => setPaymentMethod("card")}
                  style={[
                    styles.paymentOption,
                    paymentMethod === "card" && styles.paymentActive,
                  ]}
                >
                  <View style={styles.paymentIcon}>
                    <Ionicons
                      name="card-outline"
                      size={18}
                      color={Colors.text}
                    />
                  </View>
                  <Text style={styles.paymentText}>Card</Text>
                </Pressable>

                <Pressable
                  onPress={() => setPaymentMethod("cash")}
                  style={[
                    styles.paymentOption,
                    paymentMethod === "cash" && styles.paymentActive,
                  ]}
                >
                  <View style={styles.paymentIcon}>
                    <Ionicons
                      name="cash-outline"
                      size={18}
                      color={Colors.text}
                    />
                  </View>
                  <Text style={styles.paymentText}>Cash</Text>
                </Pressable>
              </View>
            </View>

            <Text style={styles.itemsTitle}>Items</Text>
          </>
        }
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

            <Text style={styles.itemPrice}>
              £{(item.price * item.qty).toFixed(2)}
            </Text>
          </View>
        )}
        ListFooterComponent={
          <>
            {/* Order Summary */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Order Summary</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>
                  £{totalPrice.toFixed(2)}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping</Text>
                <Text style={styles.summaryValue}>
                  £{shippingFee.toFixed(2)}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <Text style={styles.summaryValue}>-£{discount.toFixed(2)}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotalLabel}>Total</Text>
                <Text style={styles.summaryTotalValue}>
                  £{grandTotal.toFixed(2)}
                </Text>
              </View>
            </View>
          </>
        }
      />

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>£{grandTotal.toFixed(2)}</Text>
        </View>

        <Pressable
          style={styles.placeBtn}
          onPress={() => {
            addOrder({
              items,
              subtotal: totalPrice,
              shipping: shippingFee,
              discount,
              total: grandTotal,
            });

            clearCart();
            router.replace("/success");

          }}
        >
          <Text style={styles.placeText}>Place Order</Text>
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

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 160,
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: Colors.text,
  },

  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  editPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.background,
  },

  editText: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.gray,
  },

  addressRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  address: {
    flex: 1,
    fontSize: 13,
    color: Colors.gray,
    fontWeight: "800",
  },

  paymentRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 12,
  },

  paymentOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: Colors.background,
  },

  paymentActive: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: "#FFE7DF",
  },

  paymentIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  paymentText: {
    fontSize: 13,
    fontWeight: "900",
    color: Colors.text,
  },

  itemsTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: Colors.text,
    marginBottom: 8,
  },

  itemCard: {
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
    alignItems: "center",
    justifyContent: "space-between",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },

  totalLabel: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: "800",
  },

  totalPrice: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: "900",
    color: Colors.text,
  },

  placeBtn: {
    height: 48,
    paddingHorizontal: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  placeText: {
    color: Colors.white,
    fontWeight: "900",
  },
});
