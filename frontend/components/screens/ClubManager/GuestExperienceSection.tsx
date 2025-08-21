import React from "react";
import { View, Text, StyleSheet } from "react-native";
import TextArea from "../../ui/TextArea";
import ImageUploader from "../../ui/ImageUploader";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "@/constants/Colors";

type Props = {
  dressCode: string;
  setDressCode: (value: string) => void;
  entryRules: string;
  setEntryRules: (value: string) => void;
  tableLayoutMap: string | null;
  setTableLayoutMap: (value: string | null) => void;
  parkingInfo: string;
  setParkingInfo: (value: string) => void;
  accessibilityInfo: string;
  setAccessibilityInfo: (value: string) => void;
};

const GuestExperienceSection: React.FC<Props> = ({
  dressCode,
  setDressCode,
  entryRules,
  setEntryRules,
  tableLayoutMap,
  setTableLayoutMap,
  parkingInfo,
  setParkingInfo,
  accessibilityInfo,
  setAccessibilityInfo,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Guest Info</Text>



      <View style={styles.sectionSpacing}>
        <TextArea
          label="Dress Code"
          value={dressCode}
          onChangeText={setDressCode}
          placeholder="e.g. Smart casual, no shorts or flip-flops"
        />
      </View>

      <View style={styles.sectionSpacing}>
        <TextArea
          label="Entry Rules"
          value={entryRules}
          onChangeText={setEntryRules}
          placeholder="e.g. Couples and groups only, 21+ age limit, ID required"
        />
      </View>

      <View style={styles.sectionSpacing}>
        <ImageUploader
          label="Venue Layout Map"
          multiple={false}
          onUploaded={(urls) => setTableLayoutMap(urls[0] || null)}
          existingUrls={tableLayoutMap ? [tableLayoutMap] : []}
          fullWidth
          aspectRatio={4 / 3}
          mediaTypes={ImagePicker.MediaTypeOptions.Images}
        />
        <Text style={styles.helperText}>
          Upload floor plan showing table locations and VIP areas
        </Text>
      </View>

      <View style={styles.sectionSpacing}>
        <TextArea
          label="Parking / Valet Info"
          value={parkingInfo}
          onChangeText={setParkingInfo}
          placeholder="e.g. Valet parking available, 200. Street parking nearby."
        />
      </View>

      <View style={styles.sectionSpacing}>
        <TextArea
          label="Accessibility Info (Optional)"
          value={accessibilityInfo}
          onChangeText={setAccessibilityInfo}
          placeholder="e.g. Wheelchair accessible entrance, accessible restrooms"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 24,
    letterSpacing: 0.5,
  },

  sectionSpacing: {
    marginBottom: 24,
  },
  helperText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 8,
    fontStyle: "italic",
  },
});

export default GuestExperienceSection;

