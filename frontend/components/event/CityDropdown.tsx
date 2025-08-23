import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import type { City } from "./types";

type Props = {
  open: boolean;
  value: City;
  onChange: (city: City) => void;
  onClose: () => void;
};

const CityDropdown: React.FC<Props> = ({ open, value, onChange, onClose }) => {
  if (!open) return null;

  const cities: City[] = ["Dubai", "Abu Dhabi", "Sharjah"];

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
        {cities.map((city) => (
          <TouchableOpacity
            key={city}
            style={styles.option}
            onPress={() => {
              onChange(city);
              onClose();
            }}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={city === value ? [Colors.accentBlue, Colors.accentBlue] : [Colors.surfaceElevated, Colors.surface]}
              style={[styles.optionGradient, city === value && styles.selectedOption]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={[styles.optionText, city === value && styles.selectedText]}>
                {city}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  sheet: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderBlue,
    shadowColor: Colors.accentBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    opacity: 0.2,
  },
  content: {
    padding: 8,
  },
  option: {
    marginBottom: 4,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderBlue,
  },
  optionGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectedOption: {
    borderColor: Colors.accentBlue,
    shadowColor: Colors.accentBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  optionText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  selectedText: {
    color: Colors.textPrimary,
    fontWeight: "700",
  },
});

export default CityDropdown;


