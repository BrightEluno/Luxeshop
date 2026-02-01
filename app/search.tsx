import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Colors from "../src/constants/colors";
import { flashSaleProducts } from "../src/data/home";

export default function SearchScreen() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return flashSaleProducts;
    return flashSaleProducts.filter((p) => p.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <View style={styles.container}>
      {/* Top */}
      <View style={styles.topRow}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={Colors.gray} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search products"
            placeholderTextColor={Colors.gray}
            style={styles.input}
            autoFocus
          />
        </View>
      </View>

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(i) => i.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <Pressable style={styles.productCard} onPress={() => router.push(`/product/${item.id}`)}>
            <Image source={item.image} style={styles.productImage} />
            <Text style={styles.productName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.productPrice}>£{item.price.toFixed(2)}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No results found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingTop: 60, paddingHorizontal: 16 },

  topRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  iconBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center" },

  searchBox: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: Colors.white, borderRadius: 12, paddingHorizontal: 12, height: 44, gap: 8 },
  input: { flex: 1, fontSize: 15, fontWeight: "700", color: Colors.text },

  gridRow: { justifyContent: "space-between" },

  productCard: { width: "48%", backgroundColor: Colors.white, borderRadius: 16, padding: 12, marginBottom: 12 },
  productImage: { width: "100%", height: 100, resizeMode: "contain" },
  productName: { marginTop: 10, fontSize: 13, fontWeight: "900", color: Colors.text },
  productPrice: { marginTop: 6, fontSize: 13, fontWeight: "900", color: Colors.text },

  empty: { paddingTop: 40, alignItems: "center" },
  emptyText: { fontSize: 13, fontWeight: "800", color: Colors.gray },
});
