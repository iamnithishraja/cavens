import { Colors } from "@/constants/Colors";
import { Text, View } from "react-native";
import Background from "@/components/common/Background";
import { Slot } from "expo-router";

export default function RootLayout() {
  return (
    <Background>
      <Slot />
    </Background>
  );
}
