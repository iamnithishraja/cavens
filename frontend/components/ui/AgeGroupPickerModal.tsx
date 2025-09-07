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

export type AgeGroup = "18-30" | "30-50" | "50+";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (ageGroup: AgeGroup) => void;
  selectedAgeGroup?: AgeGroup;
};

const AGE_GROUPS: { value: AgeGroup; label: string; description: string }[] = [
  { value: "18-30", label: "18-30", description: "Young Adult" },
  { value: "30-50", label: "30-50", description: "Adult" },
  { value: "50+", label: "50+", description: "Senior" },
];

const AgeGroupPickerModal = ({ visible, onClose, onSelect, selectedAgeGroup }: Props) => {
  const handleSelect = (ageGroup: AgeGroup) => {
    onSelect(ageGroup);
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
          <Text style={styles.title}>Select Age Group</Text>
          <Text style={styles.subtitle}>Choose your age range for better event recommendations</Text>

          <View style={styles.ageList}>
            {AGE_GROUPS.map((ageGroup) => (
              <Pressable 
                key={ageGroup.value} 
                style={[
                  styles.ageRow,
                  selectedAgeGroup === ageGroup.value && styles.selectedAgeRow
                ]} 
                onPress={() => handleSelect(ageGroup.value)}
              >
                <View style={styles.ageInfo}>
                  <View style={styles.ageTexts}>
                    <Text style={[
                      styles.ageLabel,
                      selectedAgeGroup === ageGroup.value && styles.selectedAgeLabel
                    ]}>
                      {ageGroup.label}
                    </Text>
                    <Text style={styles.ageDescription}>{ageGroup.description}</Text>
                  </View>
                </View>
                {selectedAgeGroup === ageGroup.value ? (
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
  ageList: {
    gap: 12,
  },
  ageRow: {
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
  selectedAgeRow: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "10",
  },
  ageInfo: {
    flex: 1,
  },
  ageTexts: {
    gap: 4,
  },
  ageLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  selectedAgeLabel: {
    color: Colors.primary,
  },
  ageDescription: {
    fontSize: 14,
    color: Colors.textMuted,
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

export default AgeGroupPickerModal;
