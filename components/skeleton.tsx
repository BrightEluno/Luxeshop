import { useEffect, useState } from "react";
import { Animated, StyleSheet, View, type ViewStyle } from "react-native";

import type { Palette } from "@/src/constants/colors";
import { useThemedStyles } from "@/src/context/ThemeContext";

/** A grey block that gently pulses while content loads. */
export function Skeleton({ style }: { style?: ViewStyle }) {
  const { styles } = useThemedStyles(createStyles);
  // Created once; useState keeps the same Animated.Value across renders
  const [opacity] = useState(() => new Animated.Value(0.5));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={[styles.block, style, { opacity }]} />;
}

/** Placeholder for a list row card (image + two lines of text). */
export function SkeletonRow() {
  const { styles } = useThemedStyles(createStyles);
  return (
    <View style={styles.row}>
      <Skeleton style={{ width: 72, height: 72, borderRadius: 14 }} />
      <View style={{ flex: 1, gap: 8 }}>
        <Skeleton style={{ height: 14, width: "70%" }} />
        <Skeleton style={{ height: 12, width: "40%" }} />
      </View>
    </View>
  );
}

const createStyles = (Colors: Palette) =>
  StyleSheet.create({
    block: { backgroundColor: Colors.muted, borderRadius: 8 },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: Colors.surface,
      borderRadius: 16,
      padding: 12,
      marginBottom: 12,
    },
  });
