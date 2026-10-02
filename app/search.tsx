import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ProductCard } from "@/components/product-card";
import { useThemedStyles } from "@/src/context/ThemeContext";
import type { Palette } from "@/src/constants/colors";
import categories from "../src/data/categories";
import { searchProducts } from "../src/data/products";

const RECENT_KEY = "luxeshop:recent-searches";
const MAX_RECENT = 8;

const PRICE_RANGES = [
  { key: "any", label: "Any price", min: 0, max: Infinity },
  { key: "u50", label: "Under £50", min: 0, max: 50 },
  { key: "50-250", label: "£50–£250", min: 50, max: 250 },
  { key: "250-1000", label: "£250–£1,000", min: 250, max: 1000 },
  { key: "1000+", label: "£1,000+", min: 1000, max: Infinity },
] as const;
type PriceKey = (typeof PRICE_RANGES)[number]["key"];

export default function SearchScreen() {
  const { Colors, styles } = useThemedStyles(createStyles);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(true);
  const [category, setCategory] = useState<string | null>(null);
  const [price, setPrice] = useState<PriceKey>("any");
  const [topRated, setTopRated] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY)
      .then((raw) => raw && setRecent(JSON.parse(raw)))
      .catch(() => {});
  }, []);

  function rememberSearch(term: string) {
    const t = term.trim();
    if (!t) return;
    const next = [t, ...recent.filter((r) => r.toLowerCase() !== t.toLowerCase())].slice(0, MAX_RECENT);
    setRecent(next);
    AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next)).catch(() => {});
  }

  function clearRecent() {
    setRecent([]);
    AsyncStorage.removeItem(RECENT_KEY).catch(() => {});
  }

  function runSearch(term: string) {
    setQuery(term);
    setFocused(false);
    rememberSearch(term);
  }

  const results = useMemo(() => {
    const range = PRICE_RANGES.find((r) => r.key === price)!;
    return searchProducts(query).filter(
      (p) =>
        (!category || p.category === category) &&
        p.price >= range.min &&
        p.price < range.max &&
        (!topRated || p.rating >= 4),
    );
  }, [query, category, price, topRated]);

  // Name suggestions while typing
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return searchProducts(q)
      .map((p) => p.name)
      .filter((name, i, all) => all.indexOf(name) === i)
      .slice(0, 5);
  }, [query]);

  const filtersActive = category !== null || price !== "any" || topRated;
  const showSuggestions = focused && suggestions.length > 0;
  const showRecent = !query.trim() && recent.length > 0;

  return (
    <View style={styles.container}>
      {/* Top */}
      <View style={styles.topRow}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={Colors.gray} />
          <TextInput
            value={query}
            onChangeText={(t) => {
              setQuery(t);
              setFocused(true);
            }}
            onFocus={() => setFocused(true)}
            onSubmitEditing={() => runSearch(query)}
            returnKeyType="search"
            placeholder="Search products, brands, categories"
            placeholderTextColor={Colors.gray}
            style={styles.input}
            autoFocus
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8} accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={18} color={Colors.gray} />
            </Pressable>
          )}
        </View>
      </View>

      {showSuggestions && (
        <View style={styles.suggestions}>
          {suggestions.map((s) => (
            <Pressable key={s} style={styles.suggestion} onPress={() => runSearch(s)}>
              <Ionicons name="search" size={14} color={Colors.gray} />
              <Text style={styles.suggestionText} numberOfLines={1}>
                {s}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        style={styles.chipScroll}
      >
        <Chip label="4★ & up" active={topRated} onPress={() => setTopRated((v) => !v)} />
        {PRICE_RANGES.slice(1).map((r) => (
          <Chip
            key={r.key}
            label={r.label}
            active={price === r.key}
            onPress={() => setPrice(price === r.key ? "any" : r.key)}
          />
        ))}
      </ScrollView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        style={styles.chipScroll}
      >
        {categories.map((c) => (
          <Chip
            key={c.slug}
            label={c.name}
            active={category === c.slug}
            onPress={() => setCategory(category === c.slug ? null : c.slug)}
          />
        ))}
      </ScrollView>

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(i) => i.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={() => setFocused(false)}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListHeaderComponent={
          <>
            {showRecent && (
              <View style={styles.recent}>
                <View style={styles.recentHeader}>
                  <Text style={styles.recentTitle}>Recent searches</Text>
                  <Pressable onPress={clearRecent} hitSlop={8}>
                    <Text style={styles.clearText}>Clear</Text>
                  </Pressable>
                </View>
                <View style={styles.recentChips}>
                  {recent.map((r) => (
                    <Pressable key={r} style={styles.recentChip} onPress={() => runSearch(r)}>
                      <Ionicons name="time-outline" size={13} color={Colors.gray} />
                      <Text style={styles.recentChipText}>{r}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
            <View style={styles.countRow}>
              <Text style={styles.count}>
                {results.length} {results.length === 1 ? "result" : "results"}
              </Text>
              {filtersActive && (
                <Pressable
                  onPress={() => {
                    setCategory(null);
                    setPrice("any");
                    setTopRated(false);
                  }}
                  hitSlop={8}
                >
                  <Text style={styles.clearText}>Reset filters</Text>
                </Pressable>
              )}
            </View>
          </>
        }
        renderItem={({ item }) => (
          <ProductCard product={item} onOpen={() => rememberSearch(query)} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={36} color={Colors.gray} />
            <Text style={styles.emptyText}>No products match</Text>
            <Text style={styles.emptySub}>Try a different word or remove a filter.</Text>
          </View>
        }
      />
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { styles } = useThemedStyles(createStyles);
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const createStyles = (Colors: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background, paddingTop: 60, paddingHorizontal: 16 },

    topRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
    iconBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: Colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },

    searchBox: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: Colors.surface,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 44,
      gap: 8,
    },
    input: { flex: 1, fontSize: 15, fontWeight: "700", color: Colors.text },

    suggestions: {
      backgroundColor: Colors.surface,
      borderRadius: 12,
      paddingVertical: 4,
      marginBottom: 10,
    },
    suggestion: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10 },
    suggestionText: { flex: 1, fontSize: 14, fontWeight: "600", color: Colors.text },

    chipScroll: { flexGrow: 0, marginBottom: 8 },
    chipRow: { gap: 8 },
    chip: {
      paddingVertical: 7,
      paddingHorizontal: 12,
      borderRadius: 999,
      backgroundColor: Colors.surface,
    },
    chipActive: { backgroundColor: Colors.primarySoft, borderWidth: 1, borderColor: Colors.primary },
    chipText: { fontSize: 12, fontWeight: "700", color: Colors.gray },
    chipTextActive: { color: Colors.primary },

    recent: { marginTop: 6, marginBottom: 6 },
    recentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    recentTitle: { fontSize: 14, fontWeight: "900", color: Colors.text },
    recentChips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
    recentChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 7,
      paddingHorizontal: 12,
      borderRadius: 999,
      backgroundColor: Colors.surface,
    },
    recentChipText: { fontSize: 12, fontWeight: "700", color: Colors.text },
    clearText: { fontSize: 12, fontWeight: "800", color: Colors.primary },

    gridRow: { justifyContent: "space-between" },
    countRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 6,
      marginBottom: 10,
    },
    count: { fontSize: 13, fontWeight: "700", color: Colors.gray },

    empty: { paddingTop: 40, alignItems: "center", gap: 8 },
    emptyText: { fontSize: 14, fontWeight: "800", color: Colors.text },
    emptySub: { fontSize: 12, fontWeight: "600", color: Colors.gray },
  });
