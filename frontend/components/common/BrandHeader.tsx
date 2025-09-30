import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Colors } from "@/constants/Colors";

type Props = {
  title?: string;
  subtitle?: string;
};

const BrandHeader = ({
  title = "Caven",
  subtitle = "Your nightlife, curated.",
}: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.brandRow}>
        <Image
          source={require("@/assets/images/adaptive-icon.png")}
          style={styles.logo}
        />
        <Text style={styles.brandText}>{title}</Text>
      </View>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 12,
    borderRadius: 6,
  },
  brandText: {
    fontSize: 28,
    color: Colors.textPrimary,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: "400",
    opacity: 0.8,
  },
});

export default BrandHeader;
