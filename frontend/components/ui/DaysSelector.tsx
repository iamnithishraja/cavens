import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
      <Text style={styles.label}>Operating Days</Text>
      <View style={styles.row}>
        {DAYS.map((day) => {
          const selected = value.includes(day);
          return (
            <TouchableOpacity key={day} onPress={() => toggleDay(day)} style={[styles.chip, selected && styles.selectedChip]}>
              <LinearGradient
                colors={selected ? [Colors.accentBlue, Colors.borderBlue] : [Colors.surfaceElevated, Colors.surface]}
                style={styles.chipBg}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{day.slice(0, 3)}</Text>
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

export default DaysSelector;


