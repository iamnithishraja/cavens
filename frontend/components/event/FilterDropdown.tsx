import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";

type Props = {
  open: boolean;
  selected?: string;
  onSelect: (category?: string) => void;
  onClose: () => void;
};

const FilterDropdown: React.FC<Props> = ({ open, selected, onSelect, onClose }) => {
  if (!open) return null;

  const categories = ["Nightclubs", "Bars", "Organizers", "Festivals"];

  return (
    <LinearGradient
      colors={Colors.gradients.card as [string, string]}
      style={styles.sheet}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <LinearGradient
        colors={Colors.gradients.blueGlow as [string, string]}
        style={styles.glowOverlay}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.3 }}
      />
      <View style={styles.content}>
        <Text style={styles.title}>Filter by Category</Text>
        <View style={styles.chipsContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={styles.chipWrapper}
              onPress={() => {
                onSelect(selected === category ? undefined : category);
                onClose();
              }}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={selected === category ? [Colors.accentYellow, Colors.accentYellow] : [Colors.surfaceElevated, Colors.surface]}
                style={[styles.chip, selected === category && styles.selectedChip]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={[styles.chipText, selected === category && styles.selectedChipText]}>
                  {category}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  sheet: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderBlue,
    shadowColor: Colors.accentYellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
    minWidth: 200,
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    opacity: 0.2,
  },
  content: {
    padding: 16,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chipWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderBlue,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  selectedChip: {
    borderColor: Colors.accentYellow,
    shadowColor: Colors.accentYellow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  selectedChipText: {
    color: Colors.button.text,
    fontWeight: "700",
  },
});

export default FilterDropdown;



