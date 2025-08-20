import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import apiClient from "@/app/api/client";

import TextField from "../ui/TextField";
import TextArea from "../ui/TextArea";
import ChipSelector from "../ui/ChipSelector";
import DaysSelector from "../ui/DaysSelector";
import ImageUploader from "../ui/ImageUploader";
import PhoneInput from "../ui/PhoneInput";
import ClubDetailsHeader from "../ui/ClubDetailsHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

const VENUE_TYPES = [
  "Nightclub",
  "Rooftop",
  "Bar",
  "Lounge",
  "Pool Club",
  "Other",
] as const;

const ClubDetailsForm = () => {
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [coverBannerUrl, setCoverBannerUrl] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [typeOfVenue, setTypeOfVenue] = useState<
    (typeof VENUE_TYPES)[number] | null
  >(null);
  const [otherVenue, setOtherVenue] = useState("");
  const [mapLink, setMapLink] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [operatingDays, setOperatingDays] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (
      !name ||
      !description ||
      !typeOfVenue ||
      operatingDays.length === 0 ||
      !mapLink ||
      !address ||
      !phone ||
      !email
    ) {
      return;
    }
    try {
      setSubmitting(true);
      await apiClient.post("/api/club", {
        name,
        email,
        clubDescription: description,
        typeOfVenue: typeOfVenue === "Other" ? (otherVenue || "Other") : typeOfVenue,
        operatingDays,
        phone,
        address,
        mapLink,
        logoUrl,
        coverBannerUrl,
        photos,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    // Handle back navigation
    console.log("Back pressed");
  };

  const handleMenu = () => {
    // Handle menu action
    console.log("Menu pressed");
  };

  return (
      <SafeAreaView style={styles.safeArea} edges={[]}>
        <ClubDetailsHeader 
          onBack={handleBack}
          onMenu={handleMenu}
          title="Club Details"
        />
        
        <KeyboardAvoidingView 
          style={styles.keyboardContainer} 
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.contentContainer}>
              <LinearGradient
                colors={Colors.gradients.card as [string, string]}
                style={styles.card}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* Subtle glow effect */}
                <LinearGradient
                  colors={Colors.gradients.blueGlow as [string, string]}
                  style={styles.glowOverlay}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0.3 }}
                />
                
                <View style={styles.cardContent}>
                  {/* Club Name and Logo Row */}
                  <View style={styles.rowAlignTop}>
                    <View style={styles.nameInputContainer}>
                      <TextField
                        label="Club Name"
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter club name"
                      />
                    </View>
                    <View style={styles.logoContainer}>
                      <ImageUploader
                        label="Club Logo"
                        multiple={false}
                        onUploaded={(urls) => setLogoUrl(urls[0] || null)}
                        existingUrls={logoUrl ? [logoUrl] : []}
                      />
                    </View>
                  </View>

                  {/* Contact Information */}
                  <View style={styles.sectionSpacing}>
                    <TextField
                      label="Email"
                      value={email}
                      onChangeText={setEmail}
                      placeholder="contact@club.com"
                      keyboardType="email-address"
                    />
                  </View>

                  <View style={styles.sectionSpacing}>
                    <PhoneInput 
                      label="Phone" 
                      value={phone} 
                      onChangeText={setPhone} 
                    />
                  </View>

                  {/* Cover Banner */}
                  <View style={styles.sectionSpacing}>
                    <ImageUploader
                      label="Cover Banner"
                      multiple={false}
                      onUploaded={(urls) => setCoverBannerUrl(urls[0] || null)}
                      existingUrls={coverBannerUrl ? [coverBannerUrl] : []}
                      fullWidth
                      aspectRatio={16 / 9}
                      mediaTypes={ImagePicker.MediaTypeOptions.All}
                      fileNamePrefix="cover-"
                    />
                  </View>

                  {/* Description */}
                  <View style={styles.sectionSpacing}>
                    <TextArea
                      label="Short Description / Vibe"
                      value={description}
                      onChangeText={setDescription}
                      placeholder="e.g. Luxury rooftop lounge with house & techno beats"
                    />
                  </View>

                  {/* Photos */}
                  <View style={styles.sectionSpacing}>
                    <ImageUploader
                      label="Photos (crowd shots, interiors, stage)"
                      multiple
                      onUploaded={(urls) => setPhotos(urls)}
                      existingUrls={photos}
                      fullWidth
                      aspectRatio={16 / 9}
                    />
                  </View>

                  {/* Venue Type */}
                  <View style={styles.sectionSpacing}>
                    <ChipSelector
                      label="Type of Venue"
                      options={[...VENUE_TYPES]}
                      value={typeOfVenue}
                      onChange={(v) => setTypeOfVenue(v)}
                    />
                    {typeOfVenue === "Other" && (
                      <View style={{ marginTop: 12 }}>
                        <TextField
                          label="Specify Venue Type"
                          value={otherVenue}
                          onChangeText={setOtherVenue}
                          placeholder="Enter venue type"
                        />
                      </View>
                    )}
                  </View>

                  {/* Location */}
                  <View style={styles.sectionSpacing}>
                    <TextField
                      label="Address"
                      value={address}
                      onChangeText={setAddress}
                      placeholder="Street, City, Country"
                    />
                  </View>

                  <View style={styles.sectionSpacing}>
                    <TextField
                      label="Maps Link"
                      value={mapLink}
                      onChangeText={setMapLink}
                      placeholder="https://maps.google.com/..."
                    />
                  </View>

                  {/* Operating Days */}
                  <View style={styles.sectionSpacing}>
                    <DaysSelector 
                      value={operatingDays} 
                      onChange={setOperatingDays} 
                    />
                  </View>

                  {/* Submit Button */}
                  <View style={styles.actionSection}>
                    <TouchableOpacity
                      disabled={submitting}
                      style={styles.buttonWrapper}
                      onPress={handleSubmit}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[Colors.accentYellow, "#F7C84A"]}
                        style={styles.button}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Text style={styles.buttonText}>
                          {submitting ? "Submitting..." : "Save Club Details"}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* Status Note */}
                    <View style={styles.statusNote}>
                      <View style={styles.statusNoteDot} />
                      <Text style={styles.statusNoteText}>
                        Your club details will be reviewed before going live
                      </Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.borderBlue,
    shadowColor: Colors.accentBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    position: "relative",
    overflow: "hidden",
  },
  glowOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    opacity: 0.3,
  },
  cardContent: {
    padding: 24,
    paddingTop: 32,
  },
  rowAlignTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  nameInputContainer: {
    flex: 1,
    marginRight: 16,
  },
  logoContainer: {
    width: 110,
  },
  sectionSpacing: {
    marginBottom: 24,
  },
  actionSection: {
    marginTop: 16,
    gap: 20,
  },
  buttonWrapper: {
    borderRadius: 16,
    shadowColor: Colors.accentYellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  button: {
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  buttonText: {
    color: Colors.button.text,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  statusNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  statusNoteDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.accentBlue,
  },
  statusNoteText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});

export default ClubDetailsForm;