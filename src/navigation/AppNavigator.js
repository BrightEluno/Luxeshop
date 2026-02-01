import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "../screens/Home/HomeScreen";
import WishlistScreen from "../screens/Wishlist/WishlistScreen";
import TransactionScreen from "../screens/Transaction/TransactionScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";

import SearchScreen from "../screens/Search/SearchScreen";
import ProductDetailScreen from "../screens/ProductDetail/ProductDetailScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: "Home" }} />
      <Tab.Screen name="WishlistTab" component={WishlistScreen} options={{ title: "Wishlist" }} />
      <Tab.Screen name="TransactionTab" component={TransactionScreen} options={{ title: "Transaction" }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: "Profile" }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
