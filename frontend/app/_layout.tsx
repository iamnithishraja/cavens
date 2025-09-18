import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ActivityIndicator, AppState, StatusBar } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { fcmService } from '@/utils/fcm';
import { sendCityUpdateToBackend } from '@/app/api/client';
import { store } from "@/utils";
import Background from "@/components/common/Background";
import NotificationService from "@/components/common/NotificationService";
import { toastConfig } from "@/components/common/CustomToastConfig";

// Import firebase-messaging.js to register background message handler
import '../firebase-messaging';

// Import and register the headless task for background notifications
import '../ReactNativeFirebaseMessagingHeadlessTask';

// Define geofencing task IMMEDIATELY after imports (critical for background operation)
TaskManager.defineTask('city-geofencing-task', async ({ data, error }: any) => {
  console.log('🔔 Geofencing task triggered:', { data, error });
  if (error) {
    console.error('❌ Geofencing error:', error);
    return;
  }
  if (!data) {
    console.log('❌ No data in geofencing task');
    return;
  }

  const { eventType, region } = data;
  if (!eventType || !region) {
    console.log('❌ Missing eventType or region:', { eventType, region });
    return;
  }

  try {
    const lastTriggerKey = `lastTrigger_${region.identifier}_${eventType}`;
    const lastTriggerTime = await store.get(lastTriggerKey);
    const now = Date.now();
    
    if (lastTriggerTime && (now - parseInt(lastTriggerTime)) < 30000) {
      console.log(`Ignoring duplicate trigger for ${region.identifier}`);
      return;
    }
    
    await store.set(lastTriggerKey, now.toString());

    if (eventType === Location.GeofencingEventType.Enter) {
      console.log('🏙️ Entered city:', region.identifier);
      await store.set('currentCity', region.identifier);
      await store.set('lastCityChangeTime', new Date().toISOString());

      try {
        console.log('📡 Sending city update to backend...');
        const result = await sendCityUpdateToBackend({
          city: region.identifier,
          latitude: region.latitude,
          longitude: region.longitude,
          timestamp: new Date().toISOString(),
          eventType: 'enter',
        });
        console.log('✅ City update sent successfully:', result);
      } catch (err) {
        console.error('❌ Failed to send city update:', err);
      }
    } else if (eventType === Location.GeofencingEventType.Exit) {
      console.log('Exited city:', region.identifier);
      try {
        await sendCityUpdateToBackend({
          city: region.identifier,
          latitude: region.latitude,
          longitude: region.longitude,
          timestamp: new Date().toISOString(),
          eventType: 'exit',
        });
      } catch (err) {
        console.error('Failed to send city update:', err);
      }
    }
  } catch (err) {
    console.error('Error in geofencing task:', err);
  }
});

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
    // Initialize FCM at startup
    fcmService.initialize().catch(console.error);
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
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaProvider>
    );
  }

  // initial route is handled by `app/index.tsx` redirect

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Background>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />
          <NotificationService />
          <Stack
            screenOptions={{ headerShown: false }}
            initialRouteName="index"
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="(tabs)/adminTabs" />
            <Stack.Screen name="(tabs)/userTabs" />
          </Stack>
          <Toast config={toastConfig as any} />
        </Background>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}