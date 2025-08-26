import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Colors } from "@/constants/Colors";
import apiClient, { baseUrl } from "@/app/api/client";

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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (key: string) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "Club name is required";
    if (!email.trim()) nextErrors.email = "Email is required";
    if (!description.trim()) nextErrors.description = "Description is required";
    if (!typeOfVenue) nextErrors.typeOfVenue = "Please select a venue type";
    if (typeOfVenue === "Other" && !otherVenue.trim()) nextErrors.otherVenue = "Please specify the venue type";
    if (operatingDays.length === 0) nextErrors.operatingDays = "Select at least one operating day";
    if (!address.trim()) nextErrors.address = "Address is required";
    if (!mapLink.trim()) nextErrors.mapLink = "Maps link is required";
    if (!phone.trim()) nextErrors.phone = "Phone number is required";

    setErrors(nextErrors);
    const isValid = Object.keys(nextErrors).length === 0;
    if (!isValid) {
      console.warn("[ClubDetails] Validation failed", nextErrors);
    }
    return isValid;
  };

  const handleSubmit = async () => {
    console.log("[ClubDetails] Submit pressed", { submitting });
    if (!validate()) return;

    const payload = {
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
    };

    const endpoint = "/api/club";
    const url = `${baseUrl}${endpoint}`;
    console.log("[ClubDetails] Calling backend", { method: "POST", baseUrl, endpoint, url, payload });

    const startTime = Date.now();
    try {
      setSubmitting(true);
      const response = await apiClient.post(endpoint, payload);
      const durationMs = Date.now() - startTime;
      console.log("[ClubDetails] Backend response", {
        status: response.status,
        durationMs,
        data: response.data,
      });
      
      if (response.data.success) {
        Alert.alert("Success", "Club details submitted successfully! Please wait for admin approval.");
        // Refresh user profile to get updated club status
        
      }
    } catch (error: unknown) {
      const durationMs = Date.now() - startTime;
      if (error && typeof error === "object" && (error as any).response) {
        const err = error as any;
        console.error("[ClubDetails] Backend error", {
          durationMs,
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        });
        Alert.alert("Error", err.response?.data?.message || "Failed to submit club details");
      } else {
        console.error("[ClubDetails] Unexpected error", { durationMs, error });
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
      console.log("[ClubDetails] Submit finished", { submitting: false });
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
            
            {/* Club Name and Logo Row */}
            <View style={styles.section}>
              <View style={styles.rowAlignTop}>
                <View style={styles.nameInputContainer}>
                  <TextField
                    label="Club Name"
                    value={name}
                    onChangeText={(t) => {
                      setName(t);
                      if (t.trim()) clearError("name");
                    }}
                    placeholder="Enter club name"
                  />
                  {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
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
            </View>

            {/* Contact Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              
              <View style={styles.inputSpacing}>
                <TextField
                  label="Email"
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (t.trim()) clearError("email");
                  }}
                  placeholder="contact@club.com"
                  keyboardType="email-address"
                />
                {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
              </View>

              <View style={styles.inputSpacing}>
                <PhoneInput 
                  label="Phone" 
                  value={phone} 
                  onChangeText={(t: string) => {
                    setPhone(t);
                    if (t.trim()) clearError("phone");
                  }} 
                />
                {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
              </View>
            </View>

            {/* Media */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Media</Text>
              
              <View style={styles.inputSpacing}>
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

              <View style={styles.inputSpacing}>
                <ImageUploader
                  label="Photos (crowd shots, interiors, stage)"
                  multiple
                  onUploaded={(urls) => setPhotos(urls)}
                  existingUrls={photos}
                  fullWidth
                  aspectRatio={16 / 9}
                />
              </View>
            </View>

            {/* About */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              
              <View style={styles.inputSpacing}>
                <TextArea
                  label="Short Description / Vibe"
                  value={description}
                  onChangeText={(t) => {
                    setDescription(t);
                    if (t.trim()) clearError("description");
                  }}
                  placeholder="e.g. Luxury rooftop lounge with house & techno beats"
                />
                {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}
              </View>

              <View style={styles.inputSpacing}>
                <ChipSelector
                  label="Type of Venue"
                  options={[...VENUE_TYPES]}
                  value={typeOfVenue}
                  onChange={(v) => {
                    setTypeOfVenue(v);
                    clearError("typeOfVenue");
                    if (v !== "Other") clearError("otherVenue");
                  }}
                />
                {typeOfVenue === "Other" && (
                  <View style={{ marginTop: 12 }}>
                    <TextField
                      label="Specify Venue Type"
                      value={otherVenue}
                      onChangeText={(t) => {
                        setOtherVenue(t);
                        if (t.trim()) clearError("otherVenue");
                      }}
                      placeholder="Enter venue type"
                    />
                    {errors.otherVenue ? <Text style={styles.errorText}>{errors.otherVenue}</Text> : null}
                  </View>
                )}
                {errors.typeOfVenue ? <Text style={styles.errorText}>{errors.typeOfVenue}</Text> : null}
              </View>
            </View>

            {/* Location */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location</Text>
              
              <View style={styles.inputSpacing}>
                <TextField
                  label="Address"
                  value={address}
                  onChangeText={(t) => {
                    setAddress(t);
                    if (t.trim()) clearError("address");
                  }}
                  placeholder="Street, City, Country"
                />
                {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}
              </View>

              <View style={styles.inputSpacing}>
                <TextField
                  label="Maps Link"
                  value={mapLink}
                  onChangeText={(t) => {
                    setMapLink(t);
                    if (t.trim()) clearError("mapLink");
                  }}
                  placeholder="https://maps.google.com/..."
                />
                {errors.mapLink ? <Text style={styles.errorText}>{errors.mapLink}</Text> : null}
              </View>
            </View>

            {/* Operating Schedule */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Operating Schedule</Text>
              
              <View style={styles.inputSpacing}>
                <DaysSelector 
                  value={operatingDays} 
                  onChange={(days) => {
                    setOperatingDays(days);
                    if (days && days.length > 0) clearError("operatingDays");
                  }} 
                />
                {errors.operatingDays ? <Text style={styles.errorText}>{errors.operatingDays}</Text> : null}
              </View>
            </View>

            {/* Submit Button */}
            <View style={styles.submitSection}>
              <TouchableOpacity
                disabled={submitting}
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                activeOpacity={0.8}
              >
                <Text style={styles.submitButtonText}>
                  {submitting ? "Submitting..." : "Save Club Details"}
                </Text>
              </TouchableOpacity>

              {/* Status Note */}
              <View style={styles.statusNote}>
                <Text style={styles.statusNoteText}>
                  • Your club details will be reviewed before going live
                </Text>
              </View>
            </View>
            
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    color: Colors.textPrimary,
    fontWeight: "600",
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  rowAlignTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  nameInputContainer: {
    flex: 1,
    marginRight: 16,
  },
  logoContainer: {
    width: 110,
  },
  inputSpacing: {
    marginBottom: 16,
  },
  submitSection: {
    marginTop: 16,
    gap: 16,
  },
  submitButton: {
    height: 56,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 28,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.textMuted,
  },
  submitButtonText: {
    color: Colors.button.text,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  statusNote: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  statusNoteText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 20,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 6,
    fontWeight: "500",
  },
});

export default ClubDetailsForm;