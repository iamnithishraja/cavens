import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

type Props = {
  amount: number;
  tint?: string;
  size?: number; // font size
  textStyle?: any;
};

const CurrencyAED: React.FC<Props> = ({ amount, tint = Colors.accentYellow, size = 12, textStyle }) => {
  const formatted = new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(amount);
  return (
    <View style={styles.row}>
      <Text style={[styles.currency, { color: tint, fontSize: size }, textStyle]}>د.إ </Text>
      <Text style={[styles.text, { fontSize: size }, textStyle]}>{formatted}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  currency: { fontWeight: "800" },
  text: { color: Colors.textPrimary, fontWeight: "800" },
});

export default CurrencyAED;


