import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import type { Palette } from "@/src/constants/colors";
import { useAddress } from "@/src/context/AddressContext";
import { useOrders } from "@/src/context/OrdersContext";
import { useReviews } from "@/src/context/ReviewsContext";
import { useThemedStyles } from "@/src/context/ThemeContext";
import { getProduct } from "@/src/data/products";
import { successFeedback, tapFeedback } from "@/src/utils/haptics";

export default function ReviewsScreen() {
  const { Colors, styles } = useThemedStyles(createStyles);
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = getProduct(id);
  const { loadReviews, getReviews, hasReviewed, addReview } = useReviews();
  const { orders } = useOrders();
  const { address } = useAddress();

  const reviews = getReviews(id);
  const average =
    reviews.reduce((sum, r) => sum + r.rating, 0) / Math.max(reviews.length, 1);

  // Only customers who ordered the product can review it, once
  const purchased = orders.some(
    (o) => !o.cancelledAt && o.items.some((item) => item.id === id),
  );
  const canReview = purchased && !hasReviewed(id);

  const [writing, setWriting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  useEffect(() => {
    loadReviews(id);
  }, [id, loadReviews]);

  async function handleSubmit() {
    setPosting(true);
    setPostError(null);
    const { error } = await addReview(id, {
      user: address.fullName || "Luxeshop shopper",
      rating,
      comment: comment.trim(),
    });
    setPosting(false);
    if (error) {
      setPostError(error);
      return;
    }
    successFeedback();
    setWriting(false);
    setRating(0);
    setComment("");
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.pageTitle}>Reviews</Text>
        <View style={{ width: 42 }} />
      </View>

      <FlatList
        data={reviews}
        keyExtractor={(r, i) => `${r.user}-${i}`}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={{ gap: 12 }}>
            <View style={styles.summary}>
              {product && (
                <Text style={styles.productName} numberOfLines={2}>
                  {product.name}
                </Text>
              )}
              <View style={styles.summaryRow}>
                <Text style={styles.average}>{average.toFixed(1)}</Text>
                <View>
                  <Stars rating={average} />
                  <Text style={styles.count}>
                    {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                  </Text>
                </View>
              </View>
            </View>

            {canReview && !writing && (
              <Pressable style={styles.writeBtn} onPress={() => setWriting(true)}>
                <Ionicons name="create-outline" size={18} color={Colors.primary} />
                <Text style={styles.writeText}>Write a review</Text>
              </Pressable>
            )}

            {writing && (
              <View style={styles.form}>
                <Text style={styles.formTitle}>Your rating</Text>
                <View style={styles.starPicker}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Pressable
                      key={n}
                      onPress={() => {
                        tapFeedback();
                        setRating(n);
                      }}
                      hitSlop={6}
                      accessibilityLabel={`${n} star${n > 1 ? "s" : ""}`}
                    >
                      <Ionicons
                        name={rating >= n ? "star" : "star-outline"}
                        size={30}
                        color={Colors.star}
                      />
                    </Pressable>
                  ))}
                </View>

                <TextInput
                  value={comment}
                  onChangeText={setComment}
                  placeholder="What did you think? (optional)"
                  placeholderTextColor={Colors.gray}
                  multiline
                  maxLength={500}
                  style={styles.input}
                />

                <View style={styles.formButtons}>
                  <Pressable style={styles.cancelBtn} onPress={() => setWriting(false)}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.submitBtn, (rating === 0 || posting) && { opacity: 0.4 }]}
                    disabled={rating === 0 || posting}
                    onPress={handleSubmit}
                  >
                    <Text style={styles.submitText}>{posting ? "Posting…" : "Post Review"}</Text>
                  </Pressable>
                </View>
                {postError && <Text style={styles.postError}>{postError}</Text>}
              </View>
            )}

            {!purchased && (
              <Text style={styles.hint}>Buy this product to leave a review.</Text>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.user.charAt(0)}</Text>
              </View>
              <Text style={styles.user}>
                {item.user}
                {"mine" in item && item.mine && <Text style={styles.you}>  · You</Text>}
              </Text>
              <Stars rating={item.rating} />
            </View>
            {item.comment ? <Text style={styles.comment}>{item.comment}</Text> : null}
          </View>
        )}
      />
    </KeyboardAvoidingView>
  );
}

function Stars({ rating }: { rating: number }) {
  const { Colors, styles } = useThemedStyles(createStyles);
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Ionicons
          key={n}
          name={rating >= n ? "star" : rating >= n - 0.5 ? "star-half" : "star-outline"}
          size={14}
          color={Colors.star}
        />
      ))}
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
    list: { padding: 16, paddingBottom: 60, gap: 12 },
    summary: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16 },
    productName: { fontSize: 14, fontWeight: "800", color: Colors.text },
    summaryRow: { marginTop: 10, flexDirection: "row", alignItems: "center", gap: 14 },
    average: { fontSize: 36, fontWeight: "900", color: Colors.text },
    count: { marginTop: 4, fontSize: 12, fontWeight: "700", color: Colors.gray },
    stars: { flexDirection: "row", gap: 2 },
    writeBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      height: 48,
      borderRadius: 14,
      backgroundColor: Colors.primarySoft,
    },
    writeText: { color: Colors.primary, fontWeight: "800", fontSize: 14 },
    hint: { fontSize: 12, fontWeight: "700", color: Colors.gray, textAlign: "center" },
    form: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, gap: 12 },
    formTitle: { fontSize: 14, fontWeight: "900", color: Colors.text },
    starPicker: { flexDirection: "row", gap: 8 },
    input: {
      minHeight: 90,
      textAlignVertical: "top",
      backgroundColor: Colors.background,
      borderRadius: 12,
      padding: 12,
      fontSize: 14,
      color: Colors.text,
    },
    formButtons: { flexDirection: "row", gap: 10 },
    cancelBtn: {
      flex: 1,
      height: 44,
      borderRadius: 12,
      backgroundColor: Colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelText: { color: Colors.gray, fontWeight: "800" },
    submitBtn: {
      flex: 1,
      height: 44,
      borderRadius: 12,
      backgroundColor: Colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    submitText: { color: Colors.onPrimary, fontWeight: "900" },
    card: { backgroundColor: Colors.surface, borderRadius: 14, padding: 14 },
    cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: Colors.primarySoft,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: { color: Colors.primary, fontWeight: "900" },
    user: { flex: 1, fontSize: 13, fontWeight: "800", color: Colors.text },
    you: { fontSize: 12, fontWeight: "800", color: Colors.primary },
    postError: { fontSize: 12, fontWeight: "700", color: Colors.danger },
    comment: { marginTop: 8, fontSize: 13, color: Colors.gray, lineHeight: 18 },
  });
