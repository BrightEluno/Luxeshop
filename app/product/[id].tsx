import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
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
import { formatPrice } from "@/src/utils/format";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedStorage, setSelectedStorage] = useState(0);
  const [qty, setQty] = useState(1);

  const carouselRef = useRef<FlatList<any>>(null);
  // While the carousel is being scrolled programmatically, ignore the slides
  // it passes so the selected colour doesn't flicker.
  const scrollTarget = useRef<number | null>(null);
  // Mirrors selectedColor for the focus handler below
  const selectedColorRef = useRef(0);

  const product = flashSaleProducts.find((p) => String(p.id) === String(id));

  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { width } = useWindowDimensions();

  function scrollToColor(index: number, animated: boolean) {
    scrollTarget.current = index;
    carouselRef.current?.scrollToIndex({ index, animated });
    // Release the lock even if the scroll never reports reaching the target
    // (e.g. tapping the colour that's already showing).
    setTimeout(() => {
      if (scrollTarget.current === index) scrollTarget.current = null;
    }, 600);
  }

  // Leaving the screen mid-animation (e.g. tapping a colour then Add to Cart)
  // can leave the carousel between slides; snap it back to the selected
  // colour whenever the screen regains focus.
  useFocusEffect(
    useCallback(() => {
      scrollToColor(selectedColorRef.current, false);
    }, []),
  );

  if (!product) {
    return (
      <View style={styles.center}>
        <Text style={{ color: Colors.text }}>Product not found</Text>
      </View>
    );
  }

  // define liked AFTER product exists
  const liked = isInWishlist(product.id);

  // Only products that define colours / storage show those pickers
  const colors = product.colors ?? [];
  const storageOptions = product.storage ?? [];
  const color = colors[selectedColor];
  const storage = storageOptions[selectedStorage];

  // One slide per colour, or just the product image
  const slides = colors.length > 0 ? colors.map((c) => c.image) : [product.image];

  const cartItem = {
    id: product.id,
    name: product.name,
    price: storage?.price ?? product.price,
    image: color?.image ?? product.image,
    color: color?.name,
    storage: storage?.label,
  };

  function updateColor(index: number) {
    selectedColorRef.current = index;
    setSelectedColor(index);
  }

  function selectColor(index: number) {
    updateColor(index);
    scrollToColor(index, true);
  }

  function handleCarouselScroll(x: number) {
    const index = Math.round(x / width);
    if (scrollTarget.current !== null) {
      if (index === scrollTarget.current) scrollTarget.current = null;
      return;
    }
    if (index !== selectedColor && index >= 0 && index < slides.length) {
      updateColor(index);
    }
  }

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>

        <Text style={styles.pageTitle}>Product</Text>

        <Pressable
          onPress={() => toggleWishlist(product.id)}
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
          data={slides}
          horizontal
          pagingEnabled
          snapToInterval={width}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          scrollEnabled={slides.length > 1}
          keyExtractor={(_, i) => i.toString()}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          scrollEventThrottle={16}
          onScroll={(e) => handleCarouselScroll(e.nativeEvent.contentOffset.x)}
          renderItem={({ item }) => (
            <View style={[styles.slide, { width }]}>
              <View style={styles.imageCard}>
                <Image source={item} style={styles.image} />
              </View>
            </View>
          )}
        />

        {/* Pagination Dots */}
        {slides.length > 1 && (
          <View style={styles.dotsRow}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, selectedColor === i && styles.activeDot]}
              />
            ))}
          </View>
        )}

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.rowBetween}>
            <Text style={styles.name}>{product.name}</Text>

            {(product.isNew || product.discountPercent > 0) && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {product.isNew ? "NEW" : `-${product.discountPercent}%`}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.price}>
            {formatPrice(storage?.price ?? product.price)}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.metaText}>{product.rating}</Text>
            </View>

            <Text style={styles.metaText}>{product.sold} sold</Text>
          </View>

          {/* Colors */}
          {color && (
            <>
              <Text style={styles.optionTitle}>
                Color <Text style={styles.optionValue}>· {color.name}</Text>
              </Text>
              <View style={styles.colorRow}>
                {colors.map((c, index) => {
                  const active = selectedColor === index;
                  return (
                    <Pressable
                      key={c.name}
                      onPress={() => selectColor(index)}
                      accessibilityLabel={c.name}
                      accessibilityState={{ selected: active }}
                      style={[styles.colorRing, active && styles.colorRingActive]}
                    >
                      <View
                        style={[styles.colorCircle, { backgroundColor: c.hex }]}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {/* Storage */}
          {storage && (
            <>
              <Text style={styles.optionTitle}>Storage</Text>

              <View style={styles.sizeRow}>
                {storageOptions.map((s, index) => {
                  const active = selectedStorage === index;
                  return (
                    <Pressable
                      key={s.label}
                      onPress={() => setSelectedStorage(index)}
                      style={[styles.sizePill, active && styles.sizePillActive]}
                    >
                      <Text
                        style={[
                          styles.sizeText,
                          active && styles.sizeTextActive,
                        ]}
                      >
                        {s.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

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
            {product.description ??
              "Premium quality product with great value."}
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
                {(item.isNew || item.discountPercent > 0) && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>
                      {item.isNew ? "NEW" : `-${item.discountPercent}%`}
                    </Text>
                  </View>
                )}

                <Image source={item.image} style={styles.relatedImage} />

                <Text style={styles.relatedName} numberOfLines={1}>
                  {item.name}
                </Text>

                <Text style={styles.relatedPrice}>
                  {formatPrice(item.price)}
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
            addItem(cartItem, qty);
            router.push("/cart");
          }}
        >
          <Ionicons name="cart-outline" size={18} color={Colors.primary} />
          <Text style={styles.cartBtnText}>Add to Cart</Text>
        </Pressable>

        <Pressable
          style={styles.buyBtn}
          onPress={() => {
            addItem(cartItem, qty);
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

  optionValue: {
    fontWeight: "700",
    color: Colors.gray,
  },

  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },

  // Outer ring marks the selection without covering the swatch colour
  colorRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },

  colorRingActive: {
    borderColor: Colors.primary,
  },

  colorCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.lightGray,
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
