import React from "react";
import { View, Text, StyleSheet, Pressable, Modal } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";

export type City = {
  id: string;
  name: string;
  emoji: string;
  country: string;
};

export const CITIES: City[] = [
  {
    id: "dubai",
    name: "Dubai",
    emoji: "🏙️",
    country: "United Arab Emirates"
  },
  {
    id: "abu_dhabi", 
    name: "Abu Dhabi",
    emoji: "🕌",
    country: "United Arab Emirates"
  }
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (city: City) => void;
  selectedCityId?: string;
};

const CityPickerModal = ({ visible, onClose, onSelect, selectedCityId }: Props) => {
  const handleSelect = (city: City) => {
    onSelect(city);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.scrim} onPress={onClose} />

        <LinearGradient
          colors={[Colors.backgroundSecondary, Colors.backgroundTertiary]}
          style={styles.sheet}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.grabber} />
          <Text style={styles.title}>Choose your city</Text>
          <Text style={styles.subtitle}>Select a city to find nearby events</Text>

          <View style={styles.cityList}>
            {CITIES.map((city) => (
              <Pressable 
                key={city.id} 
                style={[
                  styles.cityRow,
                  selectedCityId === city.id && styles.selectedCityRow
                ]} 
                onPress={() => handleSelect(city)}
              >
                <View style={styles.cityInfo}>
                  <Text style={styles.cityEmoji}>{city.emoji}</Text>
                  <View style={styles.cityTexts}>
                    <Text style={[
                      styles.cityName,
                      selectedCityId === city.id && styles.selectedCityName
                    ]}>
                      {city.name}
                    </Text>
                    <Text style={styles.countryName}>{city.country}</Text>
                  </View>
                </View>
                {selectedCityId === city.id && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.withOpacity.black80,
  },
  sheet: {
    backgroundColor: Colors.backgroundSecondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 32,
    borderTopColor: Colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    minHeight: 200,
  },
  grabber: {
    alignSelf: "center",
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.border,
    marginBottom: 10,
    opacity: 0.9,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  cityList: {
    gap: 8,
  },
  cityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.backgroundTertiary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedCityRow: {
    backgroundColor: Colors.withOpacity.primary10,
    borderColor: Colors.primary,
  },
  cityInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cityEmoji: {
    fontSize: 28,
    marginRight: 16,
  },
  cityTexts: {
    flex: 1,
  },
  cityName: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  selectedCityName: {
    color: Colors.primary,
  },
  countryName: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkText: {
    color: Colors.button.text,
    fontSize: 14,
    fontWeight: "700",
  },
});

export default CityPickerModal;
