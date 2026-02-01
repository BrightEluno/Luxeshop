import { Stack } from "expo-router";
import { CartProvider } from "@/src/context/CartContext";
import { WishlistProvider } from "@/src/context/WishlistContext";
import { OrdersProvider } from "@/src/context/OrdersContext";

export default function RootLayout() {
  return (
    <CartProvider>
      <WishlistProvider>
        <OrdersProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="search" />
            <Stack.Screen name="product/[id]" />
            <Stack.Screen name="cart" />
            <Stack.Screen name="checkout" />
            <Stack.Screen name="order/[id]" />
          </Stack>
        </OrdersProvider>
      </WishlistProvider>
    </CartProvider>
  );
}
