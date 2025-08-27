import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ActivityIndicator } from "react-native";
import { store } from "@/utils";
import Background from "@/components/common/Background";
import { AppState } from "react-native";
import Auth from "./auth/Auth";
import ClubDetailsRoute from "./club/details";

// Global flag to force user role re-check
let forceUserCheck = false;

export const triggerUserRoleCheck = () => {
  forceUserCheck = true;
};

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ role: string } | null>(null);

  const checkUser = async () => {
    try {
      const saved = await store.get("user");
      
      if (saved) {
        const userData = JSON.parse(saved);
        
        // Validate user data structure
        if (userData && typeof userData.role === 'string') {
          setUser(userData);
        } else {
          setUser(null);
          await store.delete('user');
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to load user:", err);
      setUser(null);
      // Clear corrupted user data
      await store.delete('user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  // Listen for app state changes to refresh user data
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // Refresh user data when app becomes active
        checkUser();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Check for forced user role re-check
  useEffect(() => {
    if (forceUserCheck) {
      forceUserCheck = false;
      checkUser();
    }
  }, [forceUserCheck]);

  if (loading) {
    return (
      <SafeAreaProvider>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaProvider>
    );
  }

  let initialRouteName = "auth";
  console.log("user", user);
  if (user?.role === "club" || user?.role === "admin") {
    initialRouteName = "(tabs)/adminTabs";
  } else if (user?.role === "user") {
    initialRouteName = "(tabs)/userTabs";
  }

  return (
    <SafeAreaProvider>
      <Background >
      <Stack 
        screenOptions={{ headerShown: false }}
        initialRouteName={initialRouteName}
      >
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)/adminTabs" />
        <Stack.Screen name="(tabs)/userTabs" />
      </Stack>
      
      </Background>
    </SafeAreaProvider>
  );
}