import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";

export type Gender = "male" | "female" | "other";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (gender: Gender) => void;
  selectedGender?: Gender;
};

const GENDER_OPTIONS: { value: Gender; label: string; emoji: string }[] = [
  { value: "male", label: "Male", emoji: "👨" },
  { value: "female", label: "Female", emoji: "👩" },
  { value: "other", label: "Other", emoji: "🧑" },
];

const GenderPickerModal = ({ visible, onClose, onSelect, selectedGender }: Props) => {
  const handleSelect = (gender: Gender) => {
    onSelect(gender);
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
          <Text style={styles.title}>Select Gender</Text>
          <Text style={styles.subtitle}>Choose your gender for personalized recommendations</Text>

          <View style={styles.genderList}>
            {GENDER_OPTIONS.map((gender) => (
              <Pressable 
                key={gender.value} 
                style={[
                  styles.genderRow,
                  selectedGender === gender.value && styles.selectedGenderRow
                ]} 
                onPress={() => handleSelect(gender.value)}
              >
                <View style={styles.genderInfo}>
                  <Text style={styles.genderEmoji}>{gender.emoji}</Text>
                  <View style={styles.genderTexts}>
                    <Text style={[
                      styles.genderLabel,
                      selectedGender === gender.value && styles.selectedGenderLabel
                    ]}>
                      {gender.label}
                    </Text>
                  </View>
                </View>
                {selectedGender === gender.value ? (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                ) : (
                  <Text style={styles.chevron}>›</Text>
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
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  scrim: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 34,
    paddingHorizontal: 24,
    maxHeight: "70%",
  },
  grabber: {
    width: 40,
    height: 4,
    backgroundColor: Colors.textMuted,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  genderList: {
    gap: 12,
  },
  genderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedGenderRow: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "10",
  },
  genderInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  genderEmoji: {
    fontSize: 24,
  },
  genderTexts: {
    gap: 4,
  },
  genderLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  selectedGenderLabel: {
    color: Colors.primary,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmarkText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: "600",
  },
  chevron: {
    fontSize: 20,
    color: Colors.textMuted,
    fontWeight: "300",
  },
});

export default GenderPickerModal;
