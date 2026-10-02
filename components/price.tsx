import { StyleSheet, Text, View } from "react-native";

import type { Palette } from "@/src/constants/colors";
import { useThemedStyles } from "@/src/context/ThemeContext";
import { formatPrice } from "@/src/utils/format";

type Props = {
  price: number;
  originalPrice?: number;
  /** Show a small "From" before the price (products with several storage sizes) */
  from?: boolean;
  size?: "small" | "large";
};

/** Sale price, with the original price crossed out when there's a discount. */
export function Price({ price, originalPrice, from, size = "small" }: Props) {
  const { styles } = useThemedStyles(createStyles);
  const large = size === "large";
  const showOriginal = originalPrice !== undefined && originalPrice > price;

  return (
    <View style={styles.row}>
      <Text style={[styles.price, large && styles.priceLarge]}>
        {from && <Text style={styles.from}>From </Text>}
        {formatPrice(price)}
      </Text>
      {showOriginal && (
        <Text style={[styles.original, large && styles.originalLarge]}>
          {formatPrice(originalPrice)}
        </Text>
      )}
    </View>
  );
}

/** "Sold out", "Only 3 left", or null when plenty are in stock. */
export function stockLabel(stock: number) {
  if (stock <= 0) return "Sold out";
  if (stock <= 5) return `Only ${stock} left`;
  return null;
}

const createStyles = (Colors: Palette) =>
  StyleSheet.create({
    row: { flexDirection: "row", alignItems: "baseline", flexWrap: "wrap", columnGap: 6 },
    price: { fontSize: 14, fontWeight: "900", color: Colors.text },
    priceLarge: { fontSize: 20 },
    from: { fontSize: 11, fontWeight: "700", color: Colors.gray },
    original: {
      fontSize: 12,
      fontWeight: "600",
      color: Colors.gray,
      textDecorationLine: "line-through",
    },
    originalLarge: { fontSize: 14 },
  });
