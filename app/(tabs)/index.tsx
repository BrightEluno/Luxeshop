import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../src/constants/colors";
import { categories } from "../../src/data/categories";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
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
          <Ionicons name="cart-outline" size={24} color={Colors.text} />
          <Ionicons
            name="notifications-outline"
            size={24}
            color={Colors.text}
          />
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={20} color={Colors.gray} />
        <TextInput
          placeholder="Search products"
          placeholderTextColor={Colors.gray}
          style={styles.input}
        />
      </View>

      {/* Delivery Address */}
      <View style={styles.deliveryRow}>
        <Ionicons name="location-outline" size={18} color={Colors.text} />
        <Text style={styles.deliveryLabel}>Delivery to</Text>
        <Text style={styles.deliveryValue} numberOfLines={1}>
          3517 W. Gray St. Utica
        </Text>
        <Ionicons name="chevron-down" size={18} color={Colors.text} />
      </View>

      {/* Categories */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => (
          <Pressable style={styles.categoryItem}>
            <View style={styles.categoryIcon}>
              <Ionicons name={item.icon as any} size={22} color={Colors.text} />
            </View>
            <Text style={styles.categoryText} numberOfLines={1}>
              {item.name}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingTop: 60,
  },

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

  categoryList: {
    marginTop: 16,
    paddingBottom: 8,
    gap: 12,
  },

  categoryItem: {
    width: 82,
    alignItems: "center",
  },

  categoryIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  categoryText: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.text,
  },
});
