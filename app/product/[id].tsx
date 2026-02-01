import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useWindowDimensions } from "react-native";
import Colors from "../../src/constants/colors";
import { useCart } from "../../src/context/CartContext";
import { useWishlist } from "../../src/context/WishlistContext";
import { flashSaleProducts } from "../../src/data/home";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [selectedColor, setSelectedColor] = useState(0);
  const [qty, setQty] = useState(1);

  const product = flashSaleProducts.find((p) => String(p.id) === String(id));

  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { width } = useWindowDimensions();

  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={{ color: Colors.text }}>Product not found</Text>
      </View>
    );
  }

  //  define liked AFTER product exists
  const liked = isInWishlist?.(product.id) ?? false;

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>

        <Text style={styles.pageTitle}>Product</Text>

        <Pressable
          onPress={() =>
            toggleWishlist({
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
            })
          }
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
          hitSlop={12}
        >
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={22}
            color={liked ? Colors.primary : Colors.text}
          />
        </Pressable>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Image Carousel */}
        <FlatList
          data={[product.image, product.image, product.image]}
          horizontal
          pagingEnabled
          snapToInterval={width}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <View style={[styles.slide, { width }]}>
              <View style={styles.imageCard}>
                <Image source={item} style={styles.image} />
              </View>
            </View>
          )}
        />

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.rowBetween}>
            <Text style={styles.name}>{product.name}</Text>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>-{product.discountPercent}%</Text>
            </View>
          </View>

          <Text style={styles.price}>£{product.price.toFixed(2)}</Text>

          <View style={styles.metaRow}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.metaText}>{product.rating}</Text>
            </View>

            <Text style={styles.metaText}>{product.sold} sold</Text>
          </View>

          {/* Colors */}
          <Text style={styles.optionTitle}>Color</Text>
          <View style={styles.colorRow}>
            {["#F97316", "#111827", "#2563EB"].map((color, index) => (
              <Pressable
                key={index}
                onPress={() => setSelectedColor(index)}
                style={[
                  styles.colorCircle,
                  { backgroundColor: color },
                  selectedColor === index && styles.activeColor,
                ]}
              />
            ))}
          </View>

          {/* Quantity */}
          <Text style={styles.optionTitle}>Quantity</Text>
          <View style={styles.qtyRow}>
            <Pressable
              style={styles.qtyBtn}
              onPress={() => setQty((prev) => (prev > 1 ? prev - 1 : prev))}
            >
              <Ionicons name="remove" size={18} color={Colors.text} />
            </Pressable>

            <Text style={styles.qtyText}>{qty}</Text>

            <Pressable
              style={styles.qtyBtn}
              onPress={() => setQty((prev) => prev + 1)}
            >
              <Ionicons name="add" size={18} color={Colors.text} />
            </Pressable>
          </View>

          {/* Description */}
          <Text style={styles.desc}>
            Premium quality product with great value. This screen will be
            improved to match the reference UI (description, reviews,
            variations, and more).
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <Pressable
          style={styles.cartBtn}
          onPress={() => {
            addItem(
              {
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
              },
              qty,
            );
            router.push("/cart");
          }}
        >
          <Ionicons name="cart-outline" size={18} color={Colors.primary} />
          <Text style={styles.cartBtnText}>Add to Cart</Text>
        </Pressable>

        <Pressable
          style={styles.buyBtn}
          onPress={() => {
            addItem(
              {
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
              },
              qty,
            );
            router.push("/checkout");
          }}
        >
          <Text style={styles.buyBtnText}>Buy Now</Text>
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
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },

  topBar: {
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 20,
  },

  pageTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text,
  },

  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  scrollContent: {
    paddingBottom: 110,
  },

  imageCard: {
    marginTop: 16,
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  slide: {
    paddingHorizontal: 16,
  },

  image: {
    width: "100%",
    height: 240,
    resizeMode: "contain",
  },

  info: {
    marginTop: 16,
    paddingHorizontal: 16,
  },

  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  name: {
    flex: 1,
    fontSize: 18,
    fontWeight: "900",
    color: Colors.text,
  },

  badge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  badgeText: {
    color: Colors.white,
    fontWeight: "800",
    fontSize: 12,
  },

  price: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "900",
    color: Colors.text,
  },

  metaRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  metaText: {
    fontSize: 13,
    color: Colors.gray,
    fontWeight: "700",
  },

  optionTitle: {
    marginTop: 18,
    fontSize: 14,
    fontWeight: "800",
    color: Colors.text,
  },

  colorRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },

  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  activeColor: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },

  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 14,
  },

  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  qtyText: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text,
  },

  desc: {
    marginTop: 14,
    fontSize: 13,
    color: Colors.gray,
    lineHeight: 18,
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
    gap: 12,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },

  cartBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FFE7DF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  cartBtnText: {
    color: Colors.primary,
    fontWeight: "800",
  },

  buyBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  buyBtnText: {
    color: Colors.white,
    fontWeight: "900",
  },
});
