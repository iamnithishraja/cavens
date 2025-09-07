import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { store } from "@/utils";
import apiClient from "@/app/api/client";

export default function IndexRedirect() {
  useEffect(() => {
    const resolveInitialRoute = async () => {
      try {
        // Attempt to get profile from API every time
        // 1) If no token, request will fail and we send user to auth
        const response = await apiClient.get("/api/user/profile");
        if (response?.data?.success) {
          const data = response.data.data;
          // Persist a minimal user snapshot locally for quick access
          const snapshot = {
            role: data?.user?.role,
            id: data?.user?.id,
            name: data?.user?.name,
            email: data?.user?.email,
            isProfileComplete: Boolean(data?.user?.name && data?.user?.email && data?.user?.age && data?.user?.gender),
          };
          await store.set("user", JSON.stringify(snapshot));

          const role = snapshot.role;
          if (role === "club" || role === "admin") {
            router.replace("/(tabs)/adminTabs");
            return;
          }
          router.replace("/(tabs)/userTabs");
          return;
        }
        // Fallback to auth
        router.replace("/auth/Auth");
      } catch (error: any) {
        const status = error?.response?.status;
        const requiresProfile = error?.response?.data?.requiresProfileUpdate;
        if (status === 403 && requiresProfile) {
          router.replace("/profile");
          return;
        }
        if (status === 401) {
          await store.delete("token");
          await store.delete("user");
          router.replace("/auth/Auth");
          return;
        }
        router.replace("/auth/Auth");
      }
    };

    resolveInitialRoute();
  }, []);

  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" />
    </View>
  );
}


