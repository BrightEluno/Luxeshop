import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Price, stockLabel } from "@/components/price";
import type { Palette } from "@/src/constants/colors";
import { useThemedStyles } from "@/src/context/ThemeContext";
import { useWishlist } from "@/src/context/WishlistContext";
import type { Product } from "@/src/data/home";
import { tapFeedback } from "@/src/utils/haptics";

/** Grid card used on Home, category pages, search and related products. */
export function ProductCard({
  product,
  onOpen,
}: {
  product: Product;
  /** Called just before the product page opens (e.g. to save a search) */
  onOpen?: () => void;
}) {
  const { Colors, styles } = useThemedStyles(createStyles);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const liked = isInWishlist(product.id);
  const soldOut = product.stock <= 0;
  const stock = stockLabel(product.stock);

  return (
    <Pressable
      style={styles.card}
      onPress={() => {
        onOpen?.();
        router.push(`/product/${product.id}`);
      }}
    >
      {(product.isNew || product.discountPercent > 0) && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {product.isNew ? "NEW" : `-${product.discountPercent}%`}
          </Text>
        </View>
      )}

      <Pressable
        onPress={() => {
          tapFeedback();
          toggleWishlist(product.id);
        }}
        style={styles.heartBtn}
        hitSlop={8}
        accessibilityLabel={liked ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Ionicons
          name={liked ? "heart" : "heart-outline"}
          size={16}
          color={liked ? Colors.primary : Colors.gray}
        />
      </Pressable>

      <Image
        source={product.image}
        style={[styles.image, soldOut && styles.imageSoldOut]}
        contentFit="contain"
        transition={200}
      />

      {product.brand && (
        <Text style={styles.brand} numberOfLines={1}>
          {product.brand}
        </Text>
      )}
      <Text style={styles.name} numberOfLines={1}>
        {product.name}
      </Text>

      <View style={styles.priceRow}>
        <Price
          price={product.price}
          originalPrice={product.originalPrice}
          from={(product.storage?.length ?? 0) > 1}
        />
      </View>

      {stock && (
        <Text style={[styles.stock, soldOut && styles.stockSoldOut]}>{stock}</Text>
      )}

      <View style={styles.meta}>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color={Colors.star} />
          <Text style={styles.ratingText}>{product.rating}</Text>
        </View>
        <Text style={styles.soldText}>{product.sold} sold</Text>
      </View>
    </Pressable>
  );
}

const createStyles = (Colors: Palette) =>
  StyleSheet.create({
    card: {
      width: "48%",
      backgroundColor: Colors.surface,
      borderRadius: 16,
      padding: 12,
      marginBottom: 12,
      overflow: "hidden",
    },
    badge: {
      position: "absolute",
      top: 10,
      left: 10,
      backgroundColor: Colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      zIndex: 1,
    },
    badgeText: {
      color: Colors.onPrimary,
      fontSize: 12,
      fontWeight: "800",
    },
    heartBtn: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: Colors.background,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1,
    },
    image: {
      width: "100%",
      height: 100,
      marginTop: 12,
    },
    imageSoldOut: {
      opacity: 0.4,
    },
    brand: {
      marginTop: 10,
      fontSize: 11,
      fontWeight: "700",
      color: Colors.gray,
    },
    name: {
      marginTop: 2,
      fontSize: 13,
      fontWeight: "700",
      color: Colors.text,
    },
    priceRow: {
      marginTop: 6,
    },
    stock: {
      marginTop: 4,
      fontSize: 11,
      fontWeight: "800",
      color: Colors.primary,
    },
    stockSoldOut: {
      color: Colors.danger,
    },
    meta: {
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
  });
