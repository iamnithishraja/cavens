import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";

type Props = {
  title?: string;
  subtitle?: string;
};

const BrandHeader = ({ title = "caven", subtitle = "Your nightlife, curated." }: Props) => {
  return (
    <LinearGradient
      colors={Colors.gradients.background as [string, string]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.row}>
        <Image source={require("@/assets/images/icon.png")} style={styles.logo} />
        <Text style={styles.brand}>caVén</Text>
      </View>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 64,
    paddingHorizontal: 24,
    paddingBottom: 20
  },
  row: {
    flexDirection: "row",
    alignItems: "center"
  },
  logo: {
    width: 36,
    height: 36,
    marginRight: 10,
    borderRadius: 8
  },
  brand: {
    fontSize: 34,
    color: Colors.textPrimary,
    fontWeight: "800"
  },
  subtitle: {
    marginTop: 6,
    color: Colors.textSecondary,
    fontSize: 14
  }
});

export default BrandHeader;


