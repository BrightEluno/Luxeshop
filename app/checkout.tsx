import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useThemedStyles } from "@/src/context/ThemeContext";
import type { Palette } from "@/src/constants/colors";
import { applyPromo } from "@/src/data/promos";
import { successFeedback, warningFeedback } from "@/src/utils/haptics";
import { useAddress } from "../src/context/AddressContext";
import { useCart } from "../src/context/CartContext";
import { useOrders, type PaymentMethod } from "../src/context/OrdersContext";
import { formatPrice } from "@/src/utils/format";

const SHIPPING_FEE = 4.99;

export default function CheckoutScreen() {
  const { Colors, styles } = useThemedStyles(createStyles);
  const { items, totalPrice, clearCart } = useCart();
  const { summary: deliveryAddress } = useAddress();
  const { addOrder } = useOrders();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [codeInput, setCodeInput] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Re-check the code against the current subtotal (the cart can change)
  const promo = appliedCode ? applyPromo(appliedCode, totalPrice) : null;
  const activePromo = promo?.ok ? promo : null;

  const shippingFee = totalPrice > 0 && !activePromo?.freeShipping ? SHIPPING_FEE : 0;
  const discount = Math.min(activePromo?.discount ?? 0, totalPrice);
  // Round to the penny so stored totals don't carry floating-point noise
  const round = (n: number) => Math.round(n * 100) / 100;
  const grandTotal = round(Math.max(0, totalPrice + shippingFee - discount));

  function handleApplyCode() {
    const result = applyPromo(codeInput, totalPrice);
    if (result.ok) {
      successFeedback();
      setAppliedCode(result.code);
      setPromoError(null);
      setCodeInput("");
    } else {
      warningFeedback();
      setPromoError(result.error);
    }
  }

  function handlePlaceOrder() {
    const orderId = addOrder({
      items,
      subtotal: round(totalPrice),
      shipping: shippingFee,
      discount,
      total: grandTotal,
      paymentMethod,
      promoCode: activePromo?.code,
    });
    successFeedback();
    clearCart();
    router.replace({ pathname: "/success", params: { orderId } });
  }

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>

        <Text style={styles.title}>Checkout</Text>

        <View style={{ width: 42 }} />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.lineId}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Delivery Address */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.sectionTitle}>Delivery Address</Text>
                <Pressable
                  style={styles.editPill}
                  onPress={() => router.push("/address")}
                >
                  <Ionicons name="create-outline" size={14} color={Colors.gray} />
                  <Text style={styles.editText}>Edit</Text>
                </Pressable>
              </View>

              <View style={styles.addressRow}>
                <Ionicons name="location-outline" size={18} color={Colors.text} />
                <Text style={styles.address} numberOfLines={1}>
                  {deliveryAddress || "Add a delivery address"}
                </Text>
              </View>
            </View>

            {/* Payment Method */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Payment Method</Text>

              <View style={styles.paymentRow}>
                {(
                  [
                    { key: "card", label: "Card", icon: "card-outline" },
                    { key: "cash", label: "Cash on delivery", icon: "cash-outline" },
                  ] as const
                ).map((option) => (
                  <Pressable
                    key={option.key}
                    onPress={() => setPaymentMethod(option.key)}
                    style={[
                      styles.paymentOption,
                      paymentMethod === option.key && styles.paymentActive,
                    ]}
                  >
                    <View style={styles.paymentIcon}>
                      <Ionicons name={option.icon} size={18} color={Colors.text} />
                    </View>
                    <Text style={styles.paymentText}>{option.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Promo code */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Promo Code</Text>

              {activePromo ? (
                <View style={styles.promoApplied}>
                  <Ionicons name="pricetag" size={16} color={Colors.success} />
                  <Text style={styles.promoAppliedText}>
                    {activePromo.code} · {activePromo.label}
                  </Text>
                  <Pressable onPress={() => setAppliedCode(null)} hitSlop={8} accessibilityLabel="Remove promo code">
                    <Ionicons name="close-circle" size={18} color={Colors.gray} />
                  </Pressable>
                </View>
              ) : (
                <View style={styles.promoRow}>
                  <TextInput
                    value={codeInput}
                    onChangeText={(t) => {
                      setCodeInput(t);
                      setPromoError(null);
                    }}
                    placeholder="Enter code, e.g. LUXE10"
                    placeholderTextColor={Colors.gray}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    style={styles.promoInput}
                    onSubmitEditing={handleApplyCode}
                  />
                  <Pressable
                    style={[styles.promoBtn, !codeInput.trim() && { opacity: 0.4 }]}
                    disabled={!codeInput.trim()}
                    onPress={handleApplyCode}
                  >
                    <Text style={styles.promoBtnText}>Apply</Text>
                  </Pressable>
                </View>
              )}

              {promoError && <Text style={styles.promoError}>{promoError}</Text>}
              {promo && !promo.ok && <Text style={styles.promoError}>{promo.error}</Text>}
            </View>

            <Text style={styles.itemsTitle}>Items</Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
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
            </View>

            <Text style={styles.itemPrice}>
              {formatPrice(item.price * item.qty)}
            </Text>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Order Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatPrice(totalPrice)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>
                {shippingFee === 0 && totalPrice > 0 ? "Free" : formatPrice(shippingFee)}
              </Text>
            </View>

            {discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount ({activePromo?.code})</Text>
                <Text style={[styles.summaryValue, { color: Colors.success }]}>
                  -{formatPrice(discount)}
                </Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>{formatPrice(grandTotal)}</Text>
            </View>
          </View>
        }
      />

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>{formatPrice(grandTotal)}</Text>
        </View>

        <Pressable
          style={[styles.placeBtn, items.length === 0 && { opacity: 0.4 }]}
          disabled={items.length === 0}
          onPress={handlePlaceOrder}
        >
          <Text style={styles.placeText}>Place Order</Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (Colors: Palette) =>
  StyleSheet.create({
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

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 160,
  },

  card: {
    backgroundColor: Colors.surface,
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
    backgroundColor: Colors.primarySoft,
  },

  paymentIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: Colors.surface,
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

  itemImage: {
    width: 44,
    height: 44,
  },

  promoRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 10,
  },

  promoInput: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: Colors.background,
    color: Colors.text,
    fontWeight: "700",
  },

  promoBtn: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  promoBtnText: {
    color: Colors.onPrimary,
    fontWeight: "900",
  },

  promoApplied: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.background,
  },

  promoAppliedText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    color: Colors.text,
  },

  promoError: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "700",
    color: Colors.danger,
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
    color: Colors.onPrimary,
    fontWeight: "900",
  },
});
