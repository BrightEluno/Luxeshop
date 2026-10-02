import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

// Haptics only exist on phones; on web these quietly do nothing.
const enabled = Platform.OS === "ios" || Platform.OS === "android";

/** Light tap for small actions (heart, colour, storage) */
export function tapFeedback() {
  if (enabled) Haptics.selectionAsync().catch(() => {});
}

/** Stronger buzz for confirmations (added to cart, order placed) */
export function successFeedback() {
  if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

/** For blocked actions (sold out, invalid promo code) */
export function warningFeedback() {
  if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
}
