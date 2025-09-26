import React, { useEffect, useRef } from "react";
import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View, Animated, Easing, Image } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Colors } from "@/constants/Colors";

export default function UserTabs() {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const TabIcon = ({
    name,
    color,
    focused,
  }: {
    name: any;
    color: string;
    focused: boolean;
  }) => {
    return (
      <View style={styles.iconWrapper}>
        {focused && (
          <View style={styles.focusRingContainer}>
            <Animated.View
              style={[
                styles.focusRingGlow,
                {
                  opacity: pulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.25, 0.7],
                  }),
                  transform: [
                    {
                      scale: pulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.98, 1.06],
                      }),
                    },
                  ],
                },
              ]}
            />
            <View style={styles.focusRingBorder} />
          </View>
        )}
        <Ionicons name={name} size={24} color={color} />
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: Colors.tabActive,
          tabBarInactiveTintColor: Colors.tabInactive,
          tabBarLabelStyle: styles.tabLabel,
          tabBarStyle: styles.tabBar,
          tabBarItemStyle: styles.tabItem,
          sceneStyle: { backgroundColor: Colors.background },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                name={focused ? "home" : "home-outline"}
                color={color}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: "Map",
            tabBarItemStyle: { marginHorizontal: 18 },
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                name={focused ? "location" : "location-outline"}
                color={color}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="bookings"
          options={{
            title: "Bookings",
            tabBarItemStyle: { marginHorizontal: 18 },
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                name={focused ? "calendar" : "calendar-outline"}
                color={color}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                name={focused ? "person" : "person-outline"}
                color={color}
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>

      {/* Center floating logo overlay (acts as AI button) */}
      <View style={styles.centerLogoWrapper}>
        {/* Animated orbit ring */}
        <Animated.View style={styles.centerRingWrapper}>
          <Svg width={64} height={64}>
            <Circle
              cx={32}
              cy={32}
              r={31}
              stroke="#011C51"
              strokeWidth={1.5}
              fill="none"
            />
          </Svg>
          <Animated.View
            style={[
              styles.orbitDot,
              {
                transform: [
                  {
                    rotate: pulse.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "360deg"],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.dot} />
          </Animated.View>
        </Animated.View>
        <View style={styles.centerLogoContainer}>
          <Image
            source={require("@/assets/images/adaptive-icon.png")}
            style={styles.centerLogo}
            resizeMode="contain"
          />
        </View>
        {/* Invisible tap target over the logo */}
        <Animated.View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <View style={styles.centerTouchArea}>
            <View
              style={StyleSheet.absoluteFill}
              onStartShouldSetResponder={() => true}
              onResponderRelease={() => router.push("/chatbot")}
            />
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.navigationBackground,
    borderTopWidth: 1,
    borderTopColor: "rgba(1, 28, 81, 0.55)",
    height: 74,
    paddingBottom: 10,
    paddingTop: 10,
    position: "absolute",
    bottom: 8,
    marginHorizontal: 12,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(1, 28, 81, 0.35)",
    overflow: "visible",
  },
  tabItem: {
    paddingVertical: 0,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 0,
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    position: "relative",
  },
  focusRingContainer: {
    position: "absolute",
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    alignItems: "center",
    justifyContent: "center",
  },
  focusRingBorder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#011C51",
  },
  focusRingGlow: {
    position: "absolute",
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#011C51",
    opacity: 0.5,
  },
  centerLogoWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  centerGlow: {
    position: "absolute",
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#011C51",
  },
  centerRing: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: "#011C51",
  },
  centerRingWrapper: {
    position: "absolute",
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  orbitDot: {
    position: "absolute",
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#011C51",
  },
  centerLogoContainer: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: Colors.navigationBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  centerTouchArea: {
    position: "absolute",
    left: "50%",
    transform: [{ translateX: -31 }],
    bottom: 0,
    width: 62,
    height: 62,
    borderRadius: 31,
  },
  centerLogo: {
    width: 32,
    height: 32,
    tintColor: "#D4AF37",
  },
});
