import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "../src/constants/colors";

export default function SuccessScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark" size={34} color={Colors.white} />
        </View>

        <Text style={styles.title}>Order Placed!</Text>
        <Text style={styles.subtitle}>
          Your order has been successfully placed. You can view it in your order
          history anytime.
        </Text>

        <View style={styles.btnRow}>
          <Pressable
            style={styles.secondaryBtn}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.secondaryText}>Continue Shopping</Text>
          </Pressable>

          <Pressable
            style={styles.primaryBtn}
            onPress={() => router.replace("/(tabs)/transaction")}
          >
            <Text style={styles.primaryText}>View Orders</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  card: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
  },

  iconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: "900",
    color: Colors.text,
  },

  subtitle: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.gray,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 300,
  },

  btnRow: {
    marginTop: 18,
    width: "100%",
    gap: 12,
  },

  secondaryBtn: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#FFE7DF",
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryText: {
    color: Colors.primary,
    fontWeight: "900",
  },

  primaryBtn: {
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryText: {
    color: Colors.white,
    fontWeight: "900",
  },
});
