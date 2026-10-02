import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { router } from "expo-router";
import { Price } from "@/components/price";
import { ProductCard } from "@/components/product-card";
import { useCountdownToMidnight } from "@/hooks/use-now";
import { useRecentlyViewed } from "@/src/context/RecentlyViewedContext";
import { specialLists } from "@/src/data/products";
import { useThemedStyles } from "@/src/context/ThemeContext";
import type { Palette } from "@/src/constants/colors";
import { useAddress } from "../../src/context/AddressContext";
import { useCart } from "../../src/context/CartContext";
import categories from "../../src/data/categories";
import { flashSaleProducts } from "../../src/data/home";

// Banner text comes from what's actually on sale
const deals = specialLists.deals.products();
const maxDiscount = Math.max(0, ...deals.map((p) => p.discountPercent));

export default function HomeScreen() {
  const { Colors, styles } = useThemedStyles(createStyles);
  const { totalItems } = useCart();
  const { summary: deliveryAddress } = useAddress();
  const { items: recentlyViewed } = useRecentlyViewed();
  const countdown = useCountdownToMidnight();

  return (
    <FlatList
      data={flashSaleProducts}
      keyExtractor={(item) => item.id}
      numColumns={2}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
      columnWrapperStyle={styles.gridRow}
      ListHeaderComponent={
        <>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <Image
                source={require("../../src/assets/images/logo.png")}
                style={styles.logoImage}
                contentFit="contain"
              />
              <Text style={styles.logoText}>Luxeshop</Text>
            </View>

            <View style={styles.headerIcons}>
              <Pressable
                onPress={() => router.push("/cart")}
                style={styles.cartIconWrap}
              >
                <Ionicons name="cart-outline" size={24} color={Colors.text} />

                {totalItems > 0 && (
                  <View style={styles.badgeDot}>
                    <Text style={styles.badgeDotText}>
                      {totalItems > 9 ? "9+" : totalItems}
                    </Text>
                  </View>
                )}
              </Pressable>

              <Pressable
                onPress={() => router.push("/notifications")}
                accessibilityLabel="Notifications"
              >
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color={Colors.text}
                />
              </Pressable>
            </View>
          </View>

          {/* Search */}
          <Pressable
            onPress={() => router.push("/search")}
            style={styles.searchBox}
          >
            <Ionicons name="search-outline" size={20} color={Colors.gray} />
            <Text
              style={{ marginLeft: 10, color: Colors.gray, fontWeight: "700" }}
            >
              Search products
            </Text>
          </Pressable>

          {/* Delivery */}
          <Pressable
            style={styles.deliveryRow}
            onPress={() => router.push("/address")}
          >
            <Ionicons name="location-outline" size={18} color={Colors.text} />
            <Text style={styles.deliveryLabel}>Delivery to</Text>
            <Text style={styles.deliveryValue} numberOfLines={1}>
              {deliveryAddress || "Add your address"}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.text} />
          </Pressable>

          {/* Categories */}
          <View style={styles.categoriesWrap}>
            {categories.map((item) => (
              <Pressable
                key={item.id}
                style={styles.categoryItem}
                onPress={() => router.push(`/category/${item.slug}`)}
                accessibilityLabel={`${item.name} category`}
              >
                <View style={[styles.categoryIcon, { backgroundColor: item.tint }]}>
                  <Image source={item.image} style={styles.categoryImage} contentFit="contain" />
                </View>
                <Text style={styles.categoryText} numberOfLines={1}>
                  {item.name}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Promo Banner */}
          <Pressable
            style={styles.banner}
            onPress={() => router.push("/category/deals")}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>Up to {maxDiscount}% off</Text>
              <Text style={styles.bannerSubtitle}>
                {deals.length} products on sale across every category
              </Text>

              <View style={styles.bannerBtn}>
                <Text style={styles.bannerBtnText}>Shop Now</Text>
              </View>
            </View>

            <View style={styles.bannerCircle} />
          </Pressable>

          {/* Recently viewed */}
          {recentlyViewed.length > 0 && (
            <>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Recently Viewed</Text>
              </View>
              <FlatList
                data={recentlyViewed}
                keyExtractor={(p) => p.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recentList}
                renderItem={({ item: p }) => (
                  <Pressable
                    style={styles.recentCard}
                    onPress={() => router.push(`/product/${p.id}`)}
                  >
                    <Image source={p.image} style={styles.recentImage} contentFit="contain" />
                    <Text style={styles.recentName} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <Price price={p.price} />
                  </Pressable>
                )}
              />
            </>
          )}

          {/* Flash Sale Header */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Flash Sale</Text>

            <View style={styles.sectionRight}>
              <View style={styles.timerPill}>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={Colors.primary}
                />
                <Text style={styles.timerText}>{countdown}</Text>
              </View>

              <Pressable
                onPress={() => router.push("/category/flash-sale")}
                hitSlop={8}
              >
                <Text style={styles.seeAll}>See All</Text>
              </Pressable>
            </View>
          </View>
        </>
      }
      renderItem={({ item }) => <ProductCard product={item} />}
    />
  );
}

/* STYLES */

const createStyles = (Colors: Palette) =>
  StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 120,
    backgroundColor: Colors.background,
  },

  /* Header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoImage: {
    width: 50,
    height: 50,
  },

  logoText: {
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 6,
    color: Colors.text,
  },

  headerIcons: {
    flexDirection: "row",
    gap: 14,
  },

  /* Search */
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
  },


  /* Delivery */
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },

  deliveryLabel: {
    fontSize: 13,
    color: Colors.gray,
  },

  deliveryValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
  },

  /* Categories */
  categoriesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 16,
  },

  categoryItem: {
    width: "23%",
    alignItems: "center",
    marginBottom: 14,
  },

  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  categoryImage: {
    width: 40,
    height: 40,
  },

  categoryText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text,
  },

  /* Banner */
  banner: {
    marginTop: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },

  bannerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text,
  },

  bannerSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: Colors.gray,
  },

  bannerBtn: {
    marginTop: 12,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: "flex-start",
  },

  bannerBtnText: {
    color: Colors.onPrimary,
    fontWeight: "700",
  },

  bannerCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.background,
    position: "absolute",
    right: -20,
    top: -20,
  },

  /* Recently viewed */
  recentList: {
    gap: 10,
  },

  recentCard: {
    width: 120,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 10,
  },

  recentImage: {
    width: "100%",
    height: 70,
  },

  recentName: {
    marginTop: 6,
    marginBottom: 2,
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text,
  },

  /* Flash Sale Header */
  sectionRow: {
    marginTop: 18,
    // Keeps the timer pill clear of the product cards below
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text,
  },

  sectionRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  timerPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    gap: 6,
  },

  timerText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
  },

  seeAll: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.gray,
  },

  /* Grid */
  gridRow: {
    justifyContent: "space-between",
  },











  cartIconWrap: {
    position: "relative",
  },

  badgeDot: {
    position: "absolute",
    top: -6,
    right: -10,
    backgroundColor: Colors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  badgeDotText: {
    color: Colors.onPrimary,
    fontSize: 11,
    fontWeight: "900",
  },
});
