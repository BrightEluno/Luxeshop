import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import { Pressable, StyleSheet, type PressableProps } from "react-native";

import { useTheme, useThemedStyles } from "@/src/context/ThemeContext";
import type { Palette } from "@/src/constants/colors";

// Checked once: Liquid Glass needs iOS 26+, and some iOS 26 betas lack the API.
const useGlass = isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

type Props = Omit<PressableProps, "style" | "children"> & {
  children: React.ReactNode;
};

/**
 * Round icon button that uses Apple's Liquid Glass on iOS 26+ and falls back
 * to a solid surface-coloured button on Android, web and older iOS.
 */
export function GlassIconButton({ children, ...pressableProps }: Props) {
  const { styles } = useThemedStyles(createStyles);
  const { scheme } = useTheme();
  if (useGlass) {
    return (
      <GlassView isInteractive colorScheme={scheme} style={styles.button}>
        <Pressable {...pressableProps} style={styles.pressable}>
          {children}
        </Pressable>
      </GlassView>
    );
  }

  return (
    <Pressable
      {...pressableProps}
      style={({ pressed }) => [
        styles.button,
        styles.fallback,
        pressed && { opacity: 0.6 },
      ]}
    >
      {children}
    </Pressable>
  );
}

const createStyles = (Colors: Palette) =>
  StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
  },
  pressable: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fallback: {
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
});
