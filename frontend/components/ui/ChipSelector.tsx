import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";

type Props<T extends string> = {
  label: string;
  options: readonly T[] | T[];
  value: T | null;
  onChange: (value: T) => void;
};

const ChipSelector = <T extends string>({ label, options, value, onChange }: Props<T>) => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {options.map((opt) => {
          const selected = value === opt;
          return (
            <TouchableOpacity key={opt} onPress={() => onChange(opt)} style={[styles.chip, selected && styles.selectedChip]}>
              <LinearGradient
                colors={selected ? [Colors.accentBlue, Colors.borderBlue] : [Colors.surfaceElevated, Colors.surface]}
                style={styles.chipBg}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{opt}</Text>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>
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
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    overflow: "hidden",
  },
  chipBg: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.borderBlue,
  },
  selectedChip: {},
  chipText: {
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  chipTextSelected: {
    color: Colors.button.text,
    fontWeight: "800",
  },
});

export default ChipSelector;


