import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ActivityIndicator, AppState, StatusBar } from "react-native";
import { store } from "@/utils";
import Background from "@/components/common/Background";

// Global callback to allow other screens to request a user re-check
let externalCheckUserRef: null | (() => void) = null;
export const triggerUserRoleCheck = () => {
  externalCheckUserRef?.();
};

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const [, setUser] = useState<{ role: string } | null>(null);

  const checkUser = async () => {
    try {
      const saved = await store.get("user");

      if (saved) {
        const userData = JSON.parse(saved);

        // Validate user data structure
        if (userData && typeof userData.role === "string") {
          setUser(userData);
        } else {
          setUser(null);
          await store.delete("user");
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to load user:", err);
      setUser(null);
      // Clear corrupted user data
      await store.delete("user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
    // Expose checkUser globally for external triggers
    externalCheckUserRef = checkUser;
    return () => {
      if (externalCheckUserRef === checkUser) externalCheckUserRef = null;
    };
  }, []);

  // Listen for app state changes to refresh user data
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "active") {
        // Refresh user data when app becomes active
        checkUser();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription?.remove();
  }, []);

  // (Removed force flag effect; using callable ref instead)

  if (loading) {
    return (
      <SafeAreaProvider>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaProvider>
    );
  }

  // initial route is handled by `app/index.tsx` redirect

  return (
    <SafeAreaProvider>
      <Background>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <Stack
          screenOptions={{ headerShown: false }}
          initialRouteName="index"
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="(tabs)/adminTabs" />
          <Stack.Screen name="(tabs)/userTabs" />
        </Stack>
      </Background>
    </SafeAreaProvider>
  );
}
