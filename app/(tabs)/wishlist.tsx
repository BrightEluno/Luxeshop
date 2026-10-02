import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Colors from "../../src/constants/colors";
import { useCart } from "../../src/context/CartContext";
import { useWishlist } from "../../src/context/WishlistContext";
import { Product } from "../../src/data/home";
import { formatPrice } from "@/src/utils/format";

export default function WishlistScreen() {
  const { items, count, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();
  const [addedId, setAddedId] = useState<string | null>(null);

  function handleAddToCart(product: Product) {
    // Use the default (first) colour and storage; the product page lets the
    // user pick other options.
    const storage = product.storage?.[0];
    addItem({
      id: product.id,
      name: product.name,
      price: storage?.price ?? product.price,
      image: product.image,
      color: product.colors?.[0]?.name,
      storage: storage?.label,
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId((cur) => (cur === product.id ? null : cur)), 1500);
  }

  function handleClearAll() {
    const clear = () => items.forEach((p) => removeFromWishlist(p.id));

    // Alert.alert is a no-op on web
    if (Platform.OS === "web") {
      if (window.confirm("Remove all saved items?")) clear();
      return;
    }

    Alert.alert("Clear wishlist", "Remove all saved items?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: clear },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Wishlist</Text>
          {count > 0 && (
            <Text style={styles.subtitle}>
              {count} {count === 1 ? "item" : "items"} saved
            </Text>
          )}
        </View>

        {count > 0 && (
          <Pressable onPress={handleClearAll} hitSlop={10}>
            <Text style={styles.clearText}>Clear all</Text>
          </Pressable>
        )}
      </View>

      {count === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="heart-outline" size={34} color={Colors.primary} />
          </View>
          <Text style={styles.emptyText}>Your wishlist is empty</Text>
          <Text style={styles.emptySub}>
            Tap the heart on any product to save it here for later.
          </Text>
          <Pressable style={styles.shopBtn} onPress={() => router.push("/")}>
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item }) => {
            const added = addedId === item.id;
            const hasOptions = (item.storage?.length ?? 0) > 1;

            return (
              <Pressable
                style={styles.card}
                onPress={() => router.push(`/product/${item.id}`)}
              >
                <View style={styles.imageBox}>
                  <Image source={item.image} style={styles.img} />
                </View>

                <View style={styles.info}>
                  {item.isNew && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>NEW</Text>
                    </View>
                  )}
                  <Text style={styles.name} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.price}>
                    {hasOptions && <Text style={styles.fromText}>From </Text>}
                    {formatPrice(item.price)}
                  </Text>

                  <Pressable
                    onPress={() => handleAddToCart(item)}
                    style={[styles.cartBtn, added && styles.cartBtnAdded]}
                  >
                    <Ionicons
                      name={added ? "checkmark" : "cart-outline"}
                      size={15}
                      color={added ? Colors.white : Colors.primary}
                    />
                    <Text
                      style={[styles.cartBtnText, added && styles.cartBtnTextAdded]}
                    >
                      {added ? "Added" : "Add to cart"}
                    </Text>
                  </Pressable>
                </View>

                <Pressable
                  onPress={() => removeFromWishlist(item.id)}
                  style={styles.removeBtn}
                  hitSlop={12}
                  accessibilityLabel={`Remove ${item.name} from wishlist`}
                >
                  <Ionicons name="heart" size={18} color={Colors.primary} />
                </Pressable>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.text,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
    color: Colors.gray,
  },
  clearText: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.primary,
  },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingBottom: 60,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFE7DF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  emptyText: { fontSize: 15, fontWeight: "900", color: Colors.text },
  emptySub: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.gray,
    textAlign: "center",
    paddingHorizontal: 30,
    lineHeight: 18,
  },
  shopBtn: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
  },
  shopBtnText: { color: Colors.white, fontWeight: "800" },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  imageBox: {
    width: 84,
    height: 84,
    borderRadius: 14,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  img: { width: 70, height: 70, resizeMode: "contain" },

  info: { flex: 1, alignItems: "flex-start" },
  newBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  newBadgeText: { color: Colors.white, fontSize: 10, fontWeight: "900" },
  name: { fontSize: 13, fontWeight: "900", color: Colors.text },
  price: { marginTop: 4, fontSize: 14, fontWeight: "900", color: Colors.text },
  fromText: { fontSize: 11, fontWeight: "700", color: Colors.gray },

  cartBtn: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#FFE7DF",
  },
  cartBtnAdded: { backgroundColor: Colors.primary },
  cartBtnText: { fontSize: 12, fontWeight: "800", color: Colors.primary },
  cartBtnTextAdded: { color: Colors.white },

  removeBtn: {
    alignSelf: "flex-start",
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#FFE7DF",
    alignItems: "center",
    justifyContent: "center",
  },
});
