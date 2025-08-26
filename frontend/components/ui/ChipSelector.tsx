import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
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
            <TouchableOpacity 
              key={opt} 
              onPress={() => onChange(opt)} 
              style={[
                styles.chip, 
                selected ? styles.selectedChip : styles.unselectedChip
              ]}
            >
              <Text style={[
                styles.chipText, 
                selected ? styles.chipTextSelected : styles.chipTextUnselected
              ]}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
  },
  selectedChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  unselectedChip: {
    backgroundColor: Colors.backgroundSecondary,
    borderColor: Colors.border,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  chipTextSelected: {
    color: Colors.button.text,
  },
  chipTextUnselected: {
    color: Colors.textSecondary,
  },
});

export default ChipSelector;