import React from "react";
import { View, Text, StyleSheet, Pressable, Modal, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";

export type ClubCityPickerProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (cityName: string) => void;
  selectedCityId?: string;
  cities?: string[];
};

const ClubCityPickerModal = ({ visible, onClose, onSelect, selectedCityId, cities = ["Dubai", "Abu Dhabi"] }: ClubCityPickerProps) => {
  const handleSelect = (cityName: string) => {
    onSelect(cityName);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.scrim} onPress={onClose} />

        <LinearGradient
          colors={[Colors.backgroundSecondary, Colors.backgroundTertiary]}
          style={styles.sheet}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.grabber} />
          <Text style={styles.title}>Select City</Text>
          <Text style={styles.subtitle}>Choose where your club operates</Text>

          <ScrollView contentContainerStyle={styles.cityList} showsVerticalScrollIndicator={false}>
            {cities.map((cityName) => (
              <Pressable 
                key={cityName} 
                style={[
                  styles.cityRow,
                  selectedCityId === cityName && styles.selectedCityRow
                ]} 
                onPress={() => handleSelect(cityName)}
              >
                <View style={styles.cityInfo}>
                  <View style={styles.cityTexts}>
                    <Text style={[
                      styles.cityName,
                      selectedCityId === cityName && styles.selectedCityName
                    ]}>
                      {cityName}
                    </Text>
                  </View>
                </View>
                {selectedCityId === cityName ? (
                  <View style={styles.checkmark}><Text style={styles.checkmarkText}>✓</Text></View>
                ) : (
                  <Text style={styles.chevron}>›</Text>
                )}
              </Pressable>
            ))}
          </ScrollView>
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
    paddingBottom: 24,
    borderTopColor: Colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    maxHeight: "70%",
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
    marginBottom: 16,
  },
  cityList: {
    gap: 8,
    paddingBottom: 8,
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
  chevron: {
    color: Colors.textSecondary,
    fontSize: 22,
    fontWeight: "700",
  },
});

export default ClubCityPickerModal;

