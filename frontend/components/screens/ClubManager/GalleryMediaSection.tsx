import React from "react";
import { View, Text, StyleSheet } from "react-native";
import ImageUploader from "../../ui/ImageUploader";
import { Colors } from "@/constants/Colors";
import * as ImagePicker from "expo-image-picker";

type Props = {
  galleryPhotos: string[];
  setGalleryPhotos: (urls: string[]) => void;
  promoVideos: string[];
  setPromoVideos: (urls: string[]) => void;
};

const GalleryMediaSection: React.FC<Props> = ({
  galleryPhotos,
  setGalleryPhotos,
  promoVideos,
  setPromoVideos,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Gallery & Media</Text>

      <View style={styles.sectionSpacing}>
        <ImageUploader
          label="Photo Gallery"
          multiple={true}
          onUploaded={setGalleryPhotos}
          existingUrls={galleryPhotos}
          fullWidth
          aspectRatio={4 / 3}
          mediaTypes={ImagePicker.MediaTypeOptions.Images}
        />
        <Text style={styles.helperText}>
          Upload club interior, crowd shots, DJ booth, ambiance photos
        </Text>
      </View>

      <View style={styles.sectionSpacing}>
        <ImageUploader
          label="Promo Videos/Reels"
          multiple={true}
          onUploaded={setPromoVideos}
          existingUrls={promoVideos}
          fullWidth
          aspectRatio={16 / 9}
          mediaTypes={ImagePicker.MediaTypeOptions.Videos}
        />
        <Text style={styles.helperText}>
          Upload short event clips, vibes videos, DJ performances
        </Text>
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

export default GalleryMediaSection;

