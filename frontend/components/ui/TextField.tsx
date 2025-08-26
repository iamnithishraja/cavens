import React from "react";
import { View, Text, TextInput, StyleSheet, TextInputProps } from "react-native";
import { Colors } from "@/constants/Colors";

type Props = TextInputProps & {
  label: string;
};

const TextField = ({ label, style, ...rest }: Props) => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput 
        style={[styles.input, style]} 
        placeholderTextColor={Colors.textMuted} 
        selectionColor={Colors.primary}
        {...rest} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "600",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  input: {
    height: 56,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});

export default TextField;