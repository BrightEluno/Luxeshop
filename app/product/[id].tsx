import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import Colors from "../../src/constants/colors";
import { useCart } from "../../src/context/CartContext";
import { useWishlist } from "../../src/context/WishlistContext";
import { flashSaleProducts } from "../../src/data/home";
import { reviews } from "../../src/data/reviews";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [selectedColor, setSelectedColor] = useState(0);
  const [qty, setQty] = useState(1);

  // Dots state
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef<FlatList<any>>(null);

  const product = flashSaleProducts.find((p) => String(p.id) === String(id));

  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { width } = useWindowDimensions();
  const sizes = ["64GB", "128GB", "256GB"];
  const colors = ["#F97316", "#111827", "#2563EB"];
  const [selectedSize, setSelectedSize] = useState(sizes[0]);

  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={{ color: Colors.text }}>Product not found</Text>
      </View>
    );
  }

  // define liked AFTER product exists
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
          ref={carouselRef}
          data={[product.image, product.image, product.image]}
          horizontal
          pagingEnabled
          snapToInterval={width}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => i.toString()}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setActiveSlide(index);
          }}
          renderItem={({ item }) => (
            <View style={[styles.slide, { width }]}>
              <View style={styles.imageCard}>
                <Image source={item} style={styles.image} />
              </View>
            </View>
          )}
        />

        {/* Pagination Dots */}
        <View style={styles.dotsRow}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[styles.dot, activeSlide === i && styles.activeDot]}
            />
          ))}
        </View>

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
            {colors.map((color, index) => (
              <Pressable
                key={color}
                onPress={() => setSelectedColor(index)}
                style={[
                  styles.colorCircle,
                  { backgroundColor: color },
                  selectedColor === index && styles.activeColor,
                ]}
              />
            ))}
          </View>

          {/* Size / Storage */}
          <Text style={styles.optionTitle}>Storage</Text>

          <View style={styles.sizeRow}>
            {sizes.map((s) => {
              const active = selectedSize === s;
              return (
                <Pressable
                  key={s}
                  onPress={() => setSelectedSize(s)}
                  style={[styles.sizePill, active && styles.sizePillActive]}
                >
                  <Text
                    style={[styles.sizeText, active && styles.sizeTextActive]}
                  >
                    {s}
                  </Text>
                </Pressable>
              );
            })}
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

          {/* Reviews */}
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewTitle}>Reviews</Text>
            <Text style={styles.seeAll}>See All</Text>
          </View>

          {reviews.slice(0, 2).map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewTop}>
                <Text style={styles.reviewUser}>{review.user}</Text>
                <View style={styles.reviewRatingRow}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.reviewRatingText}>{review.rating}</Text>
                </View>
              </View>

              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))}

          {/* Related Products */}
          <View style={styles.relatedHeader}>
            <Text style={styles.relatedTitle}>Related Products</Text>
            <Text style={styles.seeAll}>See All</Text>
          </View>

          <FlatList
            data={flashSaleProducts
              .filter((p) => p.id !== product.id)
              .slice(0, 4)}
            keyExtractor={(item) => String(item.id)}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.relatedRow}
            renderItem={({ item }) => (
              <Pressable
                style={styles.relatedCard}
                onPress={() => router.push(`/product/${item.id}`)}
              >
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    -{item.discountPercent}%
                  </Text>
                </View>

                <Image source={item.image} style={styles.relatedImage} />

                <Text style={styles.relatedName} numberOfLines={1}>
                  {item.name}
                </Text>

                <Text style={styles.relatedPrice}>
                  £{item.price.toFixed(2)}
                </Text>

                <View style={styles.relatedMeta}>
                  <View style={styles.reviewRatingRow}>
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text style={styles.reviewRatingText}>{item.rating}</Text>
                  </View>

                  <Text style={styles.soldText}>{item.sold} sold</Text>
                </View>
              </Pressable>
            )}
          />
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

  slide: {
    paddingHorizontal: 16,
  },

  imageCard: {
    marginTop: 16,
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  image: {
    width: "100%",
    height: 240,
    resizeMode: "contain",
  },

  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#D1D5DB",
  },

  activeDot: {
    width: 18,
    backgroundColor: Colors.primary,
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

  reviewHeader: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  reviewTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: Colors.text,
  },

  seeAll: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.gray,
  },

  reviewCard: {
    marginTop: 12,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 12,
  },

  reviewTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  reviewUser: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.text,
  },

  reviewComment: {
    marginTop: 6,
    fontSize: 12,
    color: Colors.gray,
    lineHeight: 18,
  },

  reviewRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  reviewRatingText: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.text,
  },

  relatedHeader: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  relatedTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: Colors.text,
  },

  relatedRow: {
    justifyContent: "space-between",
    marginTop: 12,
  },

  relatedCard: {
    width: "48%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    overflow: "hidden",
  },

  relatedImage: {
    width: "100%",
    height: 92,
    resizeMode: "contain",
    marginTop: 12,
  },

  relatedName: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "800",
    color: Colors.text,
  },

  relatedPrice: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "900",
    color: Colors.text,
  },

  relatedMeta: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  soldText: {
    fontSize: 12,
    color: Colors.gray,
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
  sizeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },

  sizePill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: Colors.white,
  },

  sizePillActive: {
    backgroundColor: "#FFE7DF",
    borderWidth: 1,
    borderColor: Colors.primary,
  },

  sizeText: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.gray,
  },

  sizeTextActive: {
    color: Colors.primary,
  },
});
