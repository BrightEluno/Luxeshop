import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ProductCard } from "@/components/product-card";
import { useThemedStyles } from "@/src/context/ThemeContext";
import type { Palette } from "@/src/constants/colors";
import { getCategory } from "@/src/data/categories";
import type { Product } from "@/src/data/home";
import { getProductsByCategory, specialLists } from "@/src/data/products";

const SORTS = {
  popular: { label: "Popular", compare: (a: Product, b: Product) => b.sold - a.sold },
  priceLow: { label: "Price: Low", compare: (a: Product, b: Product) => a.price - b.price },
  priceHigh: { label: "Price: High", compare: (a: Product, b: Product) => b.price - a.price },
  rating: { label: "Top rated", compare: (a: Product, b: Product) => b.rating - a.rating },
};
type SortKey = keyof typeof SORTS;

/** Shows a category (/category/fashion) or a special list (/category/deals). */
export default function CategoryScreen() {
  const { Colors, styles } = useThemedStyles(createStyles);
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [sort, setSort] = useState<SortKey | null>(null);

  const category = getCategory(slug);
  const special = specialLists[slug];

  const title = category?.name ?? special?.title ?? "Products";
  const description = category?.description ?? special?.description;

  const products = useMemo(() => {
    const list = category
      ? getProductsByCategory(slug)
      : special
        ? special.products()
        : [];
    return sort ? [...list].sort(SORTS[sort].compare) : list;
  }, [category, special, slug, sort]);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={styles.iconBtn}
          accessibilityLabel="Back"
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>

        <Text style={styles.pageTitle} numberOfLines={1}>
          {title}
        </Text>

        <Pressable
          onPress={() => router.push("/search")}
          style={styles.iconBtn}
          accessibilityLabel="Search"
        >
          <Ionicons name="search-outline" size={20} color={Colors.text} />
        </Pressable>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            {category && (
              <View style={styles.hero}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.heroTitle}>{category.name}</Text>
                  {description && (
                    <Text style={styles.heroText}>{description}</Text>
                  )}
                </View>
                <View style={[styles.heroIcon, { backgroundColor: category.tint }]}>
                  <Image source={category.image} style={styles.heroImage} contentFit="contain" />
                </View>
              </View>
            )}

            {!category && description && (
              <Text style={styles.subtitle}>{description}</Text>
            )}

            <View style={styles.countRow}>
              <Text style={styles.countText}>
                {products.length} {products.length === 1 ? "product" : "products"}
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sortRow}
            >
              {(Object.keys(SORTS) as SortKey[]).map((key) => {
                const active = sort === key;
                return (
                  <Pressable
                    key={key}
                    onPress={() => setSort(active ? null : key)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {SORTS[key].label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </>
        }
        renderItem={({ item }) => <ProductCard product={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={40} color={Colors.gray} />
            <Text style={styles.emptyText}>No products here yet</Text>
            <Pressable style={styles.emptyBtn} onPress={() => router.replace("/category/all")}>
              <Text style={styles.emptyBtnText}>Browse all products</Text>
            </Pressable>
          </View>
        }
      />
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
    gap: 12,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  pageTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
  },
  gridRow: {
    justifyContent: "space-between",
  },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.text,
  },
  heroText: {
    marginTop: 4,
    fontSize: 13,
    color: Colors.gray,
    lineHeight: 18,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  heroImage: {
    width: 46,
    height: 46,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.gray,
  },
  countRow: {
    marginTop: 16,
  },
  countText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.gray,
  },
  sortRow: {
    gap: 8,
    paddingVertical: 12,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: Colors.surface,
  },
  chipActive: {
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.gray,
  },
  chipTextActive: {
    color: Colors.primary,
  },
  empty: {
    alignItems: "center",
    paddingTop: 40,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.text,
  },
  emptyBtn: {
    marginTop: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  emptyBtnText: {
    color: Colors.onPrimary,
    fontWeight: "800",
  },
});
