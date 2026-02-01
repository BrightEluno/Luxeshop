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
import Colors from "../../src/constants/colors";
import { useWishlist } from "../../src/context/WishlistContext";

export default function WishlistScreen() {
  const { items, toggleWishlist } = useWishlist();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wishlist</Text>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={40} color={Colors.gray} />
          <Text style={styles.emptyText}>No items in wishlist</Text>
          <Text style={styles.emptySub}>
            Tap the heart on a product to save it.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => String(i.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/product/${item.id}`)}
            >
              <View style={styles.imageBox}>
                <Image source={item.image} style={styles.img} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.price}>£{item.price.toFixed(2)}</Text>
              </View>

              {/* Remove */}
              <Pressable
                onPress={(e) => {
                  e.stopPropagation(); // IMPORTANT: don't trigger the card press
                  toggleWishlist(item); // toggling removes it
                }}
                style={styles.removeBtn}
                hitSlop={12}
              >
                <Ionicons name="trash-outline" size={18} color={Colors.gray} />
              </Pressable>
            </Pressable>
          )}
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
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.text,
    marginBottom: 14,
  },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingBottom: 60,
  },
  emptyText: { fontSize: 14, fontWeight: "800", color: Colors.text },
  emptySub: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.gray,
    textAlign: "center",
    paddingHorizontal: 30,
    lineHeight: 18,
  },

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
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  img: { width: 44, height: 44, resizeMode: "contain" },

  name: { fontSize: 13, fontWeight: "900", color: Colors.text },
  price: { marginTop: 6, fontSize: 13, fontWeight: "900", color: Colors.text },

  removeBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
});
