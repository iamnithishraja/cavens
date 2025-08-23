import { Colors } from "@/constants/Colors";
import { Text, View } from "react-native";
import Background from "@/components/common/Background";
import { Slot } from "expo-router";
import ClubDetailsForm from "@/components/screens/ClubDetailsScreen";
import ClubManagementForm from "@/components/screens/CreateEventForm";
import { SafeAreaProvider } from "react-native-safe-area-context";
import UserHomeScreen from "@/components/screens/userHomeScreen";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
    <Background>
      <UserHomeScreen />
    </Background>
    </SafeAreaProvider>
  );
}
