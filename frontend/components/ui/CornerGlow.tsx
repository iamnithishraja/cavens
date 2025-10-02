import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

const AnimatedLinearGradient = Reanimated.createAnimatedComponent(LinearGradient);

const CornerGlow = ({ position }: { position: "topLeft" | "topRight" | "bottomLeft" | "bottomRight" }) => {
  const rotate = useSharedValue(0);

  useEffect(() => {
    // smoother & faster shimmer
    rotate.value = withRepeat(
      withTiming(360, { duration: 5000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  const cornerStyles: any = {
    topLeft: { top: -25, left: -25 },
    topRight: { top: -25, right: -25 },
    bottomLeft: { bottom: -25, left: -25 },
    bottomRight: { bottom: -25, right: -25 },
  };

  return (
    <AnimatedLinearGradient
      colors={[
        "rgba(255, 215, 0, 0.8)", // strong golden edge
        "transparent",            // fade away into background
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.cornerGlow, cornerStyles[position], animatedStyle]}
    />
  );
};

const styles = StyleSheet.create({
  cornerGlow: {
    position: "absolute",
    width: 80,   // smaller so it only touches corners
    height: 80,
    borderRadius: 80,
    opacity: 0.9,
    zIndex: -1,  // BEHIND the carousel card
  },
});

export { CornerGlow };
