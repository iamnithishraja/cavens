import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Linking,
  StatusBar
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import apiClient from "@/app/api/client";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Country, DEFAULT_COUNTRY } from "@/constants/country";
import BrandHeader from "@/components/common/BrandHeader";
import OtpScreen from "@/components/OtpScreen";

const Auth = () => {
  const router = useRouter();
  useLocalSearchParams<{ code?: string; dialCode?: string; flag?: string }>();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country] = useState<Country>(DEFAULT_COUNTRY);
  const [countryQuery] = useState("");
  const [showOtpScreen, setShowOtpScreen] = useState(false);

  const handleGetOtp = async () => {
    console.log("Phone Number:", phoneNumber);
    try {
      const res = await apiClient.post("/api/user/onboarding", {
        phone: phoneNumber.trim()
      });
      if (res.status === 200) {
        console.log("OTP sent successfully");
        setShowOtpScreen(true);
      } 
      console.log("Response:", res.data);
    } catch (error) {
      console.error("Error sending OTP:", error);
    }
  };


  const openLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {}
  };

  return (
    <LinearGradient
      colors={Colors.gradients.background as [string, string]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView 
        style={styles.keyboardContainer} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Enhanced Brand Header with more space */}
        <View style={styles.headerSection}>
          <BrandHeader />
        </View>

        {/* Main Content Card with better spacing */}
        <View style={styles.contentContainer}>
          {showOtpScreen ? (
            <OtpScreen phoneNumber={phoneNumber} onBack={() => setShowOtpScreen(false)} />
          ) : (
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
                <Text style={styles.title}>Log in or sign up</Text>
                <Text style={styles.subtitle}>Enter your mobile number to continue</Text>

                {/* Phone Input Section */}
                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>Mobile Number</Text>
                  
                  <View style={styles.phoneRow}>
                    <Pressable
                      style={styles.countryBox}
                      onPress={() => router.push({ pathname: "../auth/country", params: { q: countryQuery } })}
                      accessibilityRole="button"
                    >
                      <LinearGradient
                        colors={[Colors.surfaceElevated, Colors.surface]}
                        style={styles.countryBoxGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Text style={styles.countryFlag}>{country.flag}</Text>
                        <Text style={styles.countryCode}>{country.dialCode}</Text>
                      </LinearGradient>
                    </Pressable>

                    <View style={styles.phoneInputContainer}>
                      <TextInput
                        style={styles.phoneInput}
                        placeholder="Mobile number"
                        placeholderTextColor={Colors.textMuted}
                        keyboardType="phone-pad"
                        value={phoneNumber}
                        onChangeText={(text) => setPhoneNumber(text.replace(/[^0-9]/g, ""))}
                        autoComplete="tel"
                        textContentType="telephoneNumber"
                        maxLength={12}
                      />
                      <LinearGradient
                        colors={[Colors.borderBlue, 'transparent']}
                        style={styles.inputUnderline}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      />
                    </View>
                  </View>
                </View>

                {/* Action Section */}
                <View style={styles.actionSection}>
                  <TouchableOpacity style={styles.buttonWrapper} onPress={handleGetOtp}>
                    <LinearGradient
                      colors={[Colors.accentYellow, '#F7C84A']}
                      style={styles.button}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.buttonText}>Continue</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <View style={styles.otpNote}>
                    <View style={styles.otpNoteDot} />
                    <Text style={styles.otpNoteText}>We will send you a one-time password (OTP)</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          )}

          {/* Terms Section - Outside the card for better separation */}
          <View style={styles.termsSection}>
            <View style={styles.termsDivider} />
            <Text style={styles.termsIntro}>By continuing, you agree to our</Text>
            <View style={styles.termsLinks}>
              <Pressable onPress={() => openLink("https://example.com/terms")}> 
                <Text style={styles.link}>Terms of Service</Text>
              </Pressable>
              <Text style={styles.termsSeparator}>•</Text>
              <Pressable onPress={() => openLink("https://example.com/privacy")}> 
                <Text style={styles.link}>Privacy Policy</Text>
              </Pressable>
              <Text style={styles.termsSeparator}>•</Text>
              <Pressable onPress={() => openLink("https://example.com/content-policies")}>
                <Text style={styles.link}>Content Policies</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  headerSection: {
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
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
    position: 'relative',
    overflow: 'hidden',
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    opacity: 0.3,
  },
  cardContent: {
    padding: 32,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    color: Colors.textPrimary,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 40,
    lineHeight: 22,
  },
  inputSection: {
    marginBottom: 48,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  countryBox: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderBlue,
  },
  countryBoxGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 18,
    minWidth: 100,
    justifyContent: 'center',
  },
  countryFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  countryCode: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  phoneInputContainer: {
    flex: 1,
    position: 'relative',
  },
  phoneInput: {
    fontSize: 18,
    color: Colors.textPrimary,
    paddingVertical: 20,
    paddingHorizontal: 4,
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
  inputUnderline: {
    height: 2,
    borderRadius: 1,
    marginTop: 4,
  },
  actionSection: {
    gap: 24,
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
  otpNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  otpNoteDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.accentBlue,
  },
  otpNoteText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  termsSection: {
    marginTop: 32,
    alignItems: 'center',
    gap: 16,
  },
  termsDivider: {
    height: 1,
    width: 60,
    backgroundColor: Colors.borderBlue,
    opacity: 0.5,
  },
  termsIntro: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
  termsLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  link: {
    color: Colors.accentBlue,
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: "underline",
  },
  termsSeparator: {
    color: Colors.textMuted,
    fontSize: 12,
    opacity: 0.6,
  },
});

export default Auth;