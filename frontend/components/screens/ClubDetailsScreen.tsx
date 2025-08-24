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
import { LinearGradient } from "expo-linear-gradient";
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

                  {/* Contact Information */}
                  <View style={styles.sectionSpacing}>
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

                  <View style={styles.sectionSpacing}>
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
                      onChangeText={(t) => {
                        setDescription(t);
                        if (t.trim()) clearError("description");
                      }}
                      placeholder="e.g. Luxury rooftop lounge with house & techno beats"
                    />
                    {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}
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

                  {/* Location */}
                  <View style={styles.sectionSpacing}>
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

                  <View style={styles.sectionSpacing}>
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

                  {/* Operating Days */}
                  <View style={styles.sectionSpacing}>
                    <DaysSelector 
                      value={operatingDays} 
                      onChange={(days) => {
                        setOperatingDays(days);
                        if (days && days.length > 0) clearError("operatingDays");
                      }} 
                    />
                    {errors.operatingDays ? <Text style={styles.errorText}>{errors.operatingDays}</Text> : null}
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
  errorText: {
    color: "#FF6B6B",
    fontSize: 12,
    marginTop: 6,
    fontWeight: "600",
  },
});

export default ClubDetailsForm;