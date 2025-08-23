import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

type Props = {
  amount: number;
  tint?: string;
  size?: number; // icon size in px
  textStyle?: any;
};

// Using a public icon URL for the AED-like mark; replace with local asset later
const AED_ICON = "https://i.imgur.com/Fx8x7lG.png"; // monochrome symbol-like image

const CurrencyAED: React.FC<Props> = ({ amount, tint = Colors.accentYellow, size = 12, textStyle }) => {
  const formatted = new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(amount);
  return (
    <View style={styles.row}>
      <Image source={{ uri: AED_ICON }} style={{ width: size, height: size, tintColor: tint, marginRight: 6 }} />
      <Text style={[styles.text, textStyle]}>{formatted}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  text: { color: Colors.textPrimary, fontWeight: "800" },
});

export default CurrencyAED;


