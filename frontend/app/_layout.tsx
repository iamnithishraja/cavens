import { Colors } from "@/constants/Colors";
import { Text, View } from "react-native";
import Background from "@/components/common/Background";
import { Slot } from "expo-router";
import ClubDetailsForm from "@/components/screens/ClubDetailsScreen";
import ClubManagementForm from "@/components/screens/CreateEventForm";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
    <Background>
      <ClubManagementForm />
    </Background>
    </SafeAreaProvider>
  );
}
