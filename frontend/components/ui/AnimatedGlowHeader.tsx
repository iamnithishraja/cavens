import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import { MotiView } from "moti";
import Svg, {
  Defs,
  RadialGradient,
  Stop,
  Ellipse,
  Filter,
  FeGaussianBlur,
} from "react-native-svg";
import { Colors } from "@/constants/Colors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const AnimatedGlowHeader = () => {
  const glowHeight = SCREEN_HEIGHT * 0.4; // Extend coverage

  return (
    <MotiView
      style={[styles.container, { height: glowHeight }]}
      pointerEvents="none"
      animate={{ opacity: [0.8, 1, 0.9, 0.8] }}
      transition={{ type: "timing", duration: 1200, loop: true }}
    >
      <Svg
        width={SCREEN_WIDTH + 100}
        height={glowHeight + 80}
        style={styles.svg}
      >
        <Defs>
          <Filter id="softBlur" x="-100%" y="-100%" width="300%" height="300%">
            <FeGaussianBlur stdDeviation="10" />
          </Filter>
          <Filter
            id="mediumBlur"
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            <FeGaussianBlur stdDeviation="18" />
          </Filter>
          <Filter
            id="strongBlur"
            x="-100%"
            y="-100%"
            width="300%"
            height="300%"
          >
            <FeGaussianBlur stdDeviation="30" />
          </Filter>
          <Filter id="extraBlur" x="-100%" y="-100%" width="300%" height="300%">
            <FeGaussianBlur stdDeviation="45" />
          </Filter>
          <RadialGradient id="solidBlueGlow" cx="50%" cy="20%" r="70%">
            <Stop offset="0%" stopColor={Colors.blueDark} stopOpacity="0.6" />
            <Stop offset="100%" stopColor={Colors.blueDark} stopOpacity="0.1" />
          </RadialGradient>
        </Defs>

        <Ellipse
          cx={SCREEN_WIDTH * 0.5}
          cy={glowHeight * 0.28}
          rx={SCREEN_WIDTH * 1.25}
          ry={glowHeight * 0.85}
          fill="url(#solidBlueGlow)"
          filter="url(#extraBlur)"
        />
        <Ellipse
          cx={SCREEN_WIDTH * 0.5}
          cy={glowHeight * 0.25}
          rx={SCREEN_WIDTH * 1.05}
          ry={glowHeight * 0.75}
          fill="url(#solidBlueGlow)"
          filter="url(#strongBlur)"
        />
        <Ellipse
          cx={SCREEN_WIDTH * 0.5}
          cy={glowHeight * 0.35}
          rx={SCREEN_WIDTH * 0.95}
          ry={glowHeight * 0.6}
          fill="url(#solidBlueGlow)"
          filter="url(#mediumBlur)"
        />
      </Svg>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: -60,
    left: -100,
    right: -100,
    height: SCREEN_HEIGHT * 0.5,
    zIndex: 1,
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
  },
});

export default AnimatedGlowHeader;
