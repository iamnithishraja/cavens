import React from "react";
import { View } from "react-native";
import UserHomeScreen from "@/components/screens/userHomeScreen";
import { store } from "@/utils";
import { router } from "expo-router";

export default function HomeScreen() {
  const handleChatButtonPress = async () => {
    // Get the selected city from store, default to Dubai
    const selectedCity = (await store.get("selectedCity")) || "Dubai";

    router.push({
      pathname: "/chatbot",
      params: {
        Screen: "home",
        city: selectedCity,
      },
    });
  };
  return (
    <View style={{ flex: 1 }}>
      <UserHomeScreen />
      {/** <FloatingChatButton onPress={handleChatButtonPress} /> **/}
    </View>
  );
}
