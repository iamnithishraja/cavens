import React, { useState } from "react";
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
  StatusBar,
  Dimensions,
  ScrollView
} from "react-native";
import { Colors } from "@/constants/Colors";
import apiClient from "@/app/api/client";
import { Country, DEFAULT_COUNTRY } from "@/constants/country";
import BrandHeader from "@/components/common/BrandHeader";
import OtpScreen from "@/components/OtpScreen";
import { LinearGradient } from "expo-linear-gradient";
import CountryPickerModal from "@/components/ui/CountryPickerModal";
import AnimatedGlowHeader from "@/components/ui/AnimatedGlowHeader";
import Svg, { Path } from "react-native-svg";

const { height } = Dimensions.get("window");

const Auth = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [countryQuery] = useState("");
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const handleGetOtp = async () => {
    if (isSendingOtp || phoneNumber.trim().length === 0) return;
    try {
      setIsSendingOtp(true);
      const res = await apiClient.post("/api/user/onboarding", {
        phone: phoneNumber.trim(),
      });
      if (res.status === 200 || res.status === 201) {
        setShowOtpScreen(true);
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const openLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {}
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Subtle Pattern Overlay with Animated Glow */}
      <View style={styles.patternOverlay} pointerEvents="none">
        <AnimatedGlowHeader />
      </View>

      <ScrollView 
        style={styles.keyboardContainer} 
      >
        {/* Brand Header (hidden on OTP) */}
        {!showOtpScreen && (
          <View style={styles.headerSection}>
            <BrandHeader />
            <LinearGradient
              colors={Colors.gradients.button as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.decorativeLine}
            />
          </View>
        )}

        {/* Main Content */}
        <View
          style={
            showOtpScreen ? styles.contentContainerOtp : styles.contentContainer
          }
        >
          {showOtpScreen ? (
            <OtpScreen
              phoneNumber={phoneNumber}
              onBack={() => setShowOtpScreen(false)}
            />
          ) : (
            <View style={styles.authContent}>
              {/* Welcome Section */}
              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeText}>Welcome back</Text>
                {/* Decorative cursive underline */}
                <Svg width={180} height={22} style={styles.cursiveUnderline}>
                  <Path
                    d="M2 12 C 40 24, 80 0, 118 10 S 178 22, 178 10"
                    stroke={Colors.primary}
                    strokeWidth={2}
                    fill="none"
                    strokeLinecap="round"
                    opacity={0.6}
                  />
                </Svg>
                <View style={styles.subtitleContainer}>
                  <View style={styles.subtitleDot} />
                  <Text style={styles.subtitle}>
                    Enter your mobile number to continue
                  </Text>
                </View>
              </View>

              {/* Phone Input Section (minimal, unconstrained) */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>MOBILE NUMBER</Text>

                <View style={styles.phoneContainer}>
                  <Pressable
                    style={styles.countrySelector}
                    onPress={() => setShowCountryModal(true)}
                  >
                    <LinearGradient
                      colors={[
                        Colors.backgroundSecondary,
                        Colors.backgroundTertiary,
                      ]}
                      style={styles.countrySelectorGradient}
                    >
                      <Text style={styles.countryFlag}>{country.flag}</Text>
                      <Text style={styles.countryCode}>{country.dialCode}</Text>
                    </LinearGradient>
                  </Pressable>

                  <View style={styles.phoneInputWrapper}>
                    <View style={styles.inputContainerMinimal}>
                      <TextInput
                        style={styles.phoneInput}
                        placeholder="Mobile number"
                        placeholderTextColor={Colors.textMuted}
                        keyboardType="phone-pad"
                        value={phoneNumber}
                        onChangeText={(text) =>
                          setPhoneNumber(text.replace(/[^0-9]/g, ""))
                        }
                        autoComplete="tel"
                        textContentType="telephoneNumber"
                        maxLength={12}
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* Continue Button */}
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  isSendingOtp && { opacity: 0.6 },
                ]}
                onPress={handleGetOtp}
                disabled={isSendingOtp || phoneNumber.length === 0}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={Colors.gradients.button as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.continueButtonText}>
                    {isSendingOtp ? "Sending..." : "Continue"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* OTP Info */}
              <View style={styles.otpInfo}>
                <View style={styles.otpDot} />
                <Text style={styles.otpText}>
                  We&apos;ll send you a one-time password
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Bottom Terms Section (hidden on OTP) */}
        {!showOtpScreen && (
          <View style={styles.bottomSection}>
            <LinearGradient
              colors={Colors.gradients.button as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.footerDivider}
            />
            <Text style={styles.termsIntro}>
              By continuing, you agree to our
            </Text>
            <View style={styles.termsLinks}>
              <Pressable
                onPress={() => openLink("https://example.com/terms")}
                style={styles.termsPressable}
              >
                <Text style={styles.termsLink}>Terms of Service</Text>
              </Pressable>
              <View style={styles.termsDot} />
              <Pressable
                onPress={() => openLink("https://example.com/privacy")}
                style={styles.termsPressable}
              >
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Pressable>
              <View style={styles.termsDot} />
              <Pressable
                onPress={() => openLink("https://example.com/content-policies")}
                style={styles.termsPressable}
              >
                <Text style={styles.termsLink}>Content Policies</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
      <CountryPickerModal
        visible={showCountryModal}
        onClose={() => setShowCountryModal(false)}
        onSelect={(c) => {
          setCountry(c);
          setShowCountryModal(false);
        }}
        initialQuery={countryQuery}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  patternOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  topGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
    borderRadius: 0,
  },
  keyboardContainer: {
    flex: 1,
  },
  headerSection: {
    paddingTop: Platform.OS === "ios" ? 48 : 32,
    alignItems: "center",
  },
  // removed headerLogoWrapper/glow/ring/tagline styles
  decorativeLine: {
    height: 1,
    width: 84,
    marginTop: 12,
    borderRadius: 1,
    opacity: 0.9,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "flex-start",
    paddingTop: 24,
  },
  contentContainerOtp: {
    flex: 1,
    justifyContent: "center",
  },
  authContent: {
    paddingVertical: 24,
  },
  formCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  welcomeSection: {
    marginBottom: 32,
    alignItems: "flex-start",
  },
  welcomeText: {
    fontSize: 36,
    color: Colors.textPrimary,
    fontWeight: "800",
    marginBottom: 6,
    letterSpacing: -1.2,
    textAlign: "left",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  cursiveUnderline: {
    marginBottom: 10,
    marginLeft: 2,
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  subtitleDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  subtitle: {
    fontSize: 17,
    color: Colors.textSecondary,
    lineHeight: 26,
    fontWeight: "400",
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: "700",
    marginBottom: 14,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  countrySelector: {
    borderRadius: 16,
    overflow: "hidden",
  },
  countrySelectorGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
    minWidth: 96,
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  countryFlag: {
    fontSize: 22,
    marginRight: 10,
  },
  countryCode: {
    color: Colors.textPrimary,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  phoneInputWrapper: {
    flex: 1,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    backgroundColor: Colors.backgroundSecondary,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  inputContainerMinimal: {
    borderBottomWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  phoneInput: {
    fontSize: 20,
    color: Colors.textPrimary,
    paddingVertical: 22,
    paddingHorizontal: 4,
    fontWeight: "600",
    backgroundColor: "transparent",
    letterSpacing: 0.5,
  },

  continueButton: {
    backgroundColor: "transparent",
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 20,
    minHeight: 60,
    justifyContent: "center",
    overflow: "hidden",
  },
  buttonGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  continueButtonText: {
    color: Colors.button.text,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  otpInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 6,
  },
  otpDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primary,
  },
  otpText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: "400",
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 32,
    alignItems: "center",
  },
  footerDivider: {
    height: 1,
    width: 120,
    marginBottom: 16,
    opacity: 0.9,
    borderRadius: 1,
  },
  divider: {
    height: 1,
    width: 80,
    marginBottom: 24,
  },
  termsIntro: {
    color: Colors.textMuted,
    fontSize: 13,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  termsLinks: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  termsPressable: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  termsLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
    textDecorationColor: Colors.primary,
  },
  termsDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textMuted,
    opacity: 0.6,
  },
});

export default Auth;
