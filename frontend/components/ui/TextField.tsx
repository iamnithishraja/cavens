import React from "react";
import { View, Text, TextInput, StyleSheet, TextInputProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";

type Props = TextInputProps & {
  label: string;
};

const TextField = ({ label, style, ...rest }: Props) => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <LinearGradient colors={[Colors.surfaceElevated, Colors.surface]} style={styles.inputContainer}>
        <TextInput style={[styles.input, style]} placeholderTextColor={Colors.textMuted} {...rest} />
      </LinearGradient>
      <LinearGradient colors={[Colors.borderBlue, "transparent"]} style={styles.inputUnderline} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderBlue,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  inputUnderline: {
    height: 2,
    borderRadius: 1,
    marginTop: 6,
  },
});

export default TextField;


