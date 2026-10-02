import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider as NavigationThemeProvider,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AddressProvider } from "@/src/context/AddressContext";
import { CartProvider } from "@/src/context/CartContext";
import { OrdersProvider } from "@/src/context/OrdersContext";
import { RecentlyViewedProvider } from "@/src/context/RecentlyViewedContext";
import { ReviewsProvider } from "@/src/context/ReviewsContext";
import { ThemeProvider, useTheme } from "@/src/context/ThemeContext";
import { WishlistProvider } from "@/src/context/WishlistContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AddressProvider>
        <CartProvider>
          <WishlistProvider>
            <OrdersProvider>
              <ReviewsProvider>
                <RecentlyViewedProvider>
                  <AppStack />
                </RecentlyViewedProvider>
              </ReviewsProvider>
            </OrdersProvider>
          </WishlistProvider>
        </CartProvider>
      </AddressProvider>
    </ThemeProvider>
  );
}

function AppStack() {
  const { colors, scheme } = useTheme();

  // Navigation containers and the web tab bar use React Navigation's theme
  const base = scheme === "dark" ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.lightGray,
      primary: colors.primary,
    },
  };

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="search" />
        <Stack.Screen name="product/[id]" />
        <Stack.Screen name="category/[slug]" />
        <Stack.Screen name="reviews/[id]" />
        <Stack.Screen name="cart" />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="order/[id]" />
        <Stack.Screen name="address" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="help" />
      </Stack>
    </NavigationThemeProvider>
  );
}
