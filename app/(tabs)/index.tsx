import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { router } from "expo-router";
import Colors from "../../src/constants/colors";
import { useCart } from "../../src/context/CartContext";
import categories from "../../src/data/categories";
import { flashSale, flashSaleProducts, promoBanner } from "../../src/data/home";

export default function HomeScreen() {
  const { totalItems } = useCart();

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
                resizeMode="contain"
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

              <Pressable>
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
          <View style={styles.deliveryRow}>
            <Ionicons name="location-outline" size={18} color={Colors.text} />
            <Text style={styles.deliveryLabel}>Delivery to</Text>
            <Text style={styles.deliveryValue} numberOfLines={1}>
              3517 W. Gray St. Utica
            </Text>
            <Ionicons name="chevron-down" size={18} color={Colors.text} />
          </View>

          {/* Categories */}
          <View style={styles.categoriesWrap}>
            {categories.map((item) => (
              <View key={item.id} style={styles.categoryItem}>
                <View style={styles.categoryIcon}>
                  <Image source={item.image} style={styles.categoryImage} />
                </View>
                <Text style={styles.categoryText} numberOfLines={1}>
                  {item.name}
                </Text>
              </View>
            ))}
          </View>

          {/* Promo Banner */}
          <View style={styles.banner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>{promoBanner.title}</Text>
              <Text style={styles.bannerSubtitle}>{promoBanner.subtitle}</Text>

              <View style={styles.bannerBtn}>
                <Text style={styles.bannerBtnText}>
                  {promoBanner.buttonText}
                </Text>
              </View>
            </View>

            <View style={styles.bannerCircle} />
          </View>

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
                <Text style={styles.timerText}>{flashSale.endsIn}</Text>
              </View>

              <Text style={styles.seeAll}>See All</Text>
            </View>
          </View>
        </>
      }
      renderItem={({ item }) => (
        <Pressable
          style={styles.productCard}
          onPress={() => router.push(`/product/${item.id}`)}
        >
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{item.discountPercent}%</Text>
          </View>

          <Image source={item.image} style={styles.productImage} />

          <Text style={styles.productName} numberOfLines={1}>
            {item.name}
          </Text>

          <Text style={styles.productPrice}>£{item.price.toFixed(2)}</Text>

          <View style={styles.productMeta}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>

            <Text style={styles.soldText}>{item.sold} sold</Text>
          </View>
        </Pressable>
      )}
    />
  );
}

/* STYLES */

const styles = StyleSheet.create({
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
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
  },

  input: {
    marginLeft: 10,
    fontSize: 16,
    flex: 1,
    color: Colors.text,
  },

  /* Delivery */
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
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
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  categoryImage: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },

  categoryText: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.text,
  },

  /* Banner */
  banner: {
    marginTop: 12,
    backgroundColor: Colors.white,
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
    color: Colors.white,
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

  /* Flash Sale Header */
  sectionRow: {
    marginTop: 18,
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
    backgroundColor: Colors.white,
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

  productCard: {
    width: "48%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    overflow: "hidden",
  },

  discountBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    zIndex: 1,
  },

  discountText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "800",
  },

  productImage: {
    width: "100%",
    height: 100,
    resizeMode: "contain",
    marginTop: 12,
  },

  productName: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },

  productPrice: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "900",
    color: Colors.text,
  },

  productMeta: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  ratingText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text,
  },

  soldText: {
    fontSize: 12,
    color: Colors.gray,
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
    color: Colors.white,
    fontSize: 11,
    fontWeight: "900",
  },
});
