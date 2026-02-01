import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Product Detail</Text>
      <Text>ID: {id}</Text>
    </View>
  );
}
