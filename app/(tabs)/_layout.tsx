import { Tabs } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { useWishlist } from "@/src/context/WishlistContext";

export default function TabsLayout() {
  const { colors: Colors } = useTheme();
  const { count: wishlistCount } = useWishlist();
  const wishlistBadge = wishlistCount > 0 ? String(wishlistCount) : undefined;

  // Native tabs don't render icons on web, so keep the JS tab bar there.
  if (Platform.OS === "web") {
    return <WebTabs wishlistBadge={wishlistBadge} />;
  }

  // System tab bar: Liquid Glass on iOS 26+, Material 3 on Android.
  return (
    <NativeTabs
      tintColor={Colors.primary}
      iconColor={{ selected: Colors.primary }}
      labelStyle={{ selected: { color: Colors.primary } }}
      badgeBackgroundColor={Colors.primary}
      indicatorColor={Colors.primarySoft}
      minimizeBehavior="onScrollDown"
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon
          sf={{ default: "house", selected: "house.fill" }}
          md="home"
        />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="wishlist">
        <NativeTabs.Trigger.Icon
          sf={{ default: "heart", selected: "heart.fill" }}
          md="favorite"
        />
        <NativeTabs.Trigger.Label>Wishlist</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Badge hidden={!wishlistBadge}>
          {wishlistBadge}
        </NativeTabs.Trigger.Badge>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="transaction">
        <NativeTabs.Trigger.Icon
          sf={{ default: "list.bullet.rectangle", selected: "list.bullet.rectangle.fill" }}
          md="receipt_long"
        />
        <NativeTabs.Trigger.Label>Transaction</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon
          sf={{ default: "person", selected: "person.fill" }}
          md="person"
        />
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function WebTabs({ wishlistBadge }: { wishlistBadge?: string }) {
  const { colors: Colors } = useTheme();
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: Colors.primary }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="wishlist"
        options={{
          title: "Wishlist",
          tabBarBadge: wishlistBadge,
          tabBarBadgeStyle: { backgroundColor: Colors.primary },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="transaction"
        options={{
          title: "Transaction",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
