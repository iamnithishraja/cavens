import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ActivityIndicator } from "react-native";
import { store } from "@/utils";
import Background from "@/components/common/Background";

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ role: string } | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const saved = await store.get("user");
        if (saved) {
          setUser(JSON.parse(saved));
        }
      } catch (err) {
        console.error("Failed to load user:", err);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  if (loading) {
    return (
      
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
        </View>
      
    );
  }

  return (
    <SafeAreaProvider>
      <Background >
      <Stack screenOptions={{ headerShown: false }}>
        {!user && <Stack.Screen name="auth" />} 
        {user?.role === "admin" && <Stack.Screen name="tabs/adminTabs" />}
        {user?.role === "user" && <Stack.Screen name="tabs/userTabs" />}
      </Stack>
      </Background>
    </SafeAreaProvider>
  );
}
