import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useThemedStyles } from "@/src/context/ThemeContext";
import type { Palette } from "@/src/constants/colors";

const FAQS = [
  {
    q: "How do I place an order?",
    a: "Open a product, choose a colour and storage if offered, then tap Add to Cart or Buy Now. From the cart, tap Checkout and confirm your order.",
  },
  {
    q: "Where can I see my orders?",
    a: "Open the Transaction tab, or Profile → My Orders. Tap an order to see everything in it.",
  },
  {
    q: "How do I change my delivery address?",
    a: "Tap the Delivery row on the Home screen, the Edit button at checkout, or Profile → Delivery Address.",
  },
  {
    q: "How does the wishlist work?",
    a: "Tap the heart on any product to save it. Your wishlist is kept on this device and you can add items to your cart straight from it.",
  },
  {
    q: "Do you have any promo codes?",
    a: "Try LUXE10 for 10% off, WELCOME20 for £20 off orders over £100, or FREESHIP for free delivery. Enter them at checkout.",
  },
  {
    q: "How do I track or cancel an order?",
    a: "Open the order from the Transaction tab to see its progress. You can cancel it until it ships, and use Buy Again to reorder.",
  },
  {
    q: "Can I review a product?",
    a: "Yes. Once you've ordered a product, open its reviews and tap Write a review.",
  },
  {
    q: "How do I switch to dark mode?",
    a: "Go to Profile → Appearance and choose System, Light or Dark.",
  },
  {
    q: "What does the NEW badge mean?",
    a: "It marks the latest releases, such as the iPhone 18 Pro and Galaxy Z Fold8 Ultra.",
  },
];

export default function HelpScreen() {
  const { Colors, styles } = useThemedStyles(createStyles);
  const [open, setOpen] = useState<number | null>(0);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.pageTitle}>Help & About</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.section}>Frequently asked questions</Text>
        <View style={styles.card}>
          {FAQS.map((item, i) => {
            const expanded = open === i;
            return (
              <Pressable
                key={item.q}
                onPress={() => setOpen(expanded ? null : i)}
                style={[styles.faq, i < FAQS.length - 1 && styles.faqBorder]}
              >
                <View style={styles.faqTop}>
                  <Text style={styles.question}>{item.q}</Text>
                  <Ionicons
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={Colors.gray}
                  />
                </View>
                {expanded && <Text style={styles.answer}>{item.a}</Text>}
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.section}>About Luxeshop</Text>
        <View style={[styles.card, styles.about]}>
          <Text style={styles.answer}>
            Luxeshop is a demo shopping app built with Expo and React Native.
            No real payments are taken and orders are stored only on this device.
          </Text>
          <Text style={styles.credit}>
            Phone photos: Apple and Samsung. Other product data and photos:
            DummyJSON (dummyjson.com). Category icons: Microsoft Fluent Emoji
            (MIT License).
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (Colors: Palette) =>
  StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingTop: 60 },
  topBar: {
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  pageTitle: { fontSize: 16, fontWeight: "800", color: Colors.text },
  content: { padding: 16, paddingBottom: 60 },
  section: { marginTop: 8, marginBottom: 10, fontSize: 14, fontWeight: "900", color: Colors.text },
  card: { backgroundColor: Colors.surface, borderRadius: 16, paddingHorizontal: 14, marginBottom: 16 },
  faq: { paddingVertical: 14 },
  faqBorder: { borderBottomWidth: 1, borderBottomColor: Colors.background },
  faqTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  question: { flex: 1, fontSize: 14, fontWeight: "800", color: Colors.text },
  answer: { marginTop: 8, fontSize: 13, color: Colors.gray, lineHeight: 19 },
  about: { paddingVertical: 8 },
  credit: { marginTop: 10, marginBottom: 6, fontSize: 11, color: Colors.gray, lineHeight: 16 },
});
