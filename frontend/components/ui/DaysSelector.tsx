import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

type Props = {
  value: string[];
  onChange: (days: string[]) => void;
};

const DaysSelector = ({ value, onChange }: Props) => {
  const toggleDay = (day: string) => {
    if (value.includes(day)) onChange(value.filter((d) => d !== day));
    else onChange([...value, day]);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>OPERATING DAYS</Text>
      <View style={styles.row}>
        {DAYS.map((day) => {
          const selected = value.includes(day);
          return (
            <TouchableOpacity 
              key={day} 
              onPress={() => toggleDay(day)} 
              style={[
                styles.chip, 
                selected ? styles.selectedChip : styles.unselectedChip
              ]}
            >
              <Text style={[
                styles.chipText, 
                selected ? styles.chipTextSelected : styles.chipTextUnselected
              ]}>
                {day.slice(0, 3)}
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
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 48,
    alignItems: 'center',
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

export default DaysSelector;