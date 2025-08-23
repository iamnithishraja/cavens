import React from "react";
import { View, Text, StyleSheet, TextStyle, ViewStyle, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";

type GlowVariant = "subtle" | "accent" | "featured" | "minimal";
type TextVariant = "section" | "event" | "highlight" | "category";

type Props = {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
  containerStyle?: ViewStyle | ViewStyle[];
  variant?: GlowVariant;
  textVariant?: TextVariant;
  customGlowColor?: string;
  customTextColor?: string;
  animated?: boolean;
};

const GlowingText: React.FC<Props> = ({
  children,
  style,
  containerStyle,
  variant = "subtle",
  textVariant = "section",
  customGlowColor,
  customTextColor,
  animated = false,
}) => {
  // Glow configurations for different use cases
  const glowConfigs = {
    subtle: {
      colors: ["rgba(59, 130, 246, 0.15)", "transparent"],
      glowRadius: 8,
      shadowRadius: 6,
      borderRadius: 8,
    },
    accent: {
      colors: ["rgba(99, 102, 241, 0.25)", "rgba(59, 130, 246, 0.1)"],
      glowRadius: 12,
      shadowRadius: 10,
      borderRadius: 10,
    },
    featured: {
      colors: [
        "rgba(99, 102, 241, 0.3)",
        "rgba(59, 130, 246, 0.2)",
        "transparent"
      ],
      glowRadius: 16,
      shadowRadius: 14,
      borderRadius: 12,
    },
    minimal: {
      colors: ["rgba(255, 255, 255, 0.1)", "transparent"],
      glowRadius: 6,
      shadowRadius: 4,
      borderRadius: 6,
    },
  };

  // Text style configurations with modern typography
  const textConfigs = {
    section: {
      fontSize: 28,
      fontWeight: "800" as const,
      letterSpacing: -0.3,
      lineHeight: 34,
      fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    },
    event: {
      fontSize: 22,
      fontWeight: "700" as const,
      letterSpacing: -0.2,
      lineHeight: 28,
      fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    },
    highlight: {
      fontSize: 15,
      fontWeight: "600" as const,
      letterSpacing: 0.2,
      lineHeight: 21,
      fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    },
    category: {
      fontSize: 13,
      fontWeight: "700" as const,
      letterSpacing: 1.2,
      lineHeight: 18,
      textTransform: "uppercase" as const,
      fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto',
    },
  };

  const currentGlow = glowConfigs[variant];
  const currentText = textConfigs[textVariant];
  
  const glowColor = customGlowColor || Colors.accentBlue || "#3B82F6";
  const textColor = customTextColor || Colors.textPrimary || "#FFFFFF";

  const dynamicStyles = StyleSheet.create({
    glowContainer: {
      position: "absolute",
      left: -currentGlow.glowRadius,
      right: -currentGlow.glowRadius,
      top: -currentGlow.glowRadius / 2,
      bottom: -currentGlow.glowRadius / 2,
      borderRadius: currentGlow.borderRadius,
      opacity: animated ? 0.8 : 1,
    },
    text: {
      ...currentText,
      color: textColor,
      textShadowColor: glowColor,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: currentGlow.shadowRadius,
    },
  });

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {/* Multi-layer glow effect */}
      <LinearGradient
        colors={currentGlow.colors}
        style={dynamicStyles.glowContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Optional enhanced glow for featured variant */}
      {variant === "featured" && (
        <LinearGradient
          colors={[
            `${glowColor}20`,
            `${glowColor}10`,
            "transparent"
          ]}
          style={[
            dynamicStyles.glowContainer,
            {
              left: -currentGlow.glowRadius * 1.5,
              right: -currentGlow.glowRadius * 1.5,
              top: -currentGlow.glowRadius,
              bottom: -currentGlow.glowRadius,
            }
          ]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      )}

      <Text style={[dynamicStyles.text, style]}>
        {children}
      </Text>

      {/* Subtle bottom accent line for section headers */}
      {textVariant === "section" && (
        <LinearGradient
          colors={[`${glowColor}60`, "transparent", `${glowColor}60`]}
          style={styles.accentLine}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    alignSelf: "flex-start",
  },
  accentLine: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -8,
    height: 1.5,
    borderRadius: 1,
  },
});

export default GlowingText;