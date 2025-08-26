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
  Dimensions
} from "react-native";
import { Colors } from "@/constants/Colors";
import apiClient from "@/app/api/client";
import { Country, DEFAULT_COUNTRY } from "@/constants/country";
import BrandHeader from "@/components/common/BrandHeader";
import OtpScreen from "@/components/OtpScreen";
import { LinearGradient } from 'expo-linear-gradient';
import CountryPickerModal from "@/components/ui/CountryPickerModal";

const { height } = Dimensions.get('window');

const Auth = () => {
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [countryQuery] = useState("");
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);


  const handleGetOtp = async () => {
    try {
      const res = await apiClient.post("/api/user/onboarding", {
        phone: phoneNumber.trim()
      });
      if (res.status === 200) {
        setShowOtpScreen(true);
      } 
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
  
      {/* Subtle Pattern Overlay - Top 20% Glow */}
      <View style={styles.patternOverlay}>
        <LinearGradient
          colors={['rgba(43, 44, 20, 0.5)', 'transparent', 'transparent']}
          locations={[0.1, 0.3, 1]}
          style={styles.topGlow}
        />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Brand Header (hidden on OTP) */}
        {!showOtpScreen && (
          <View style={styles.headerSection}>
            <BrandHeader />
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark, Colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.decorativeLine}
            />
          </View>
        )}

        {/* Main Content */}
        <View style={showOtpScreen ? styles.contentContainerOtp : styles.contentContainer}>
          {showOtpScreen ? (
            <OtpScreen phoneNumber={phoneNumber} onBack={() => setShowOtpScreen(false)} />
          ) : (
            <View style={styles.authContent}>
              {/* Welcome Section */}
              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeText}>Welcome back</Text>
                <View style={styles.subtitleContainer}>
                  <View style={styles.subtitleDot} />
                  <Text style={styles.subtitle}>Enter your mobile number to continue</Text>
                </View>
              </View>

              {/* Phone Input Section */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>MOBILE NUMBER</Text>
                
                <View style={styles.phoneContainer}>
                  <Pressable
                    style={styles.countrySelector}
                    onPress={() => setShowCountryModal(true)}
                  >
                    <LinearGradient
                      colors={[Colors.backgroundSecondary, Colors.backgroundTertiary]}
                      style={styles.countrySelectorGradient}
                    >
                      <Text style={styles.countryFlag}>{country.flag}</Text>
                      <Text style={styles.countryCode}>{country.dialCode}</Text>
                    </LinearGradient>
                  </Pressable>

                  <View style={styles.phoneInputWrapper}>
                    <View style={styles.inputContainer}>
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
                    </View>
                  </View>
                </View>
              </View>

              {/* Continue Button */}
              <TouchableOpacity 
                style={styles.continueButton} 
                onPress={handleGetOtp}
                disabled={phoneNumber.length === 0}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={Colors.gradients.button as [string, string]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.continueButtonText}>
                    Continue
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* OTP Info */}
              <View style={styles.otpInfo}>
                <View style={styles.otpDot} />
                <Text style={styles.otpText}>We&apos;ll send you a one-time password</Text>
              </View>
            </View>
          )}
        </View>

        {/* Bottom Terms Section (hidden on OTP) */}
        {!showOtpScreen && (
          <View style={styles.bottomSection}>
            <LinearGradient
              colors={[Colors.primary, 'transparent', Colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.divider}
            />
            <Text style={styles.termsIntro}>By continuing, you agree to our</Text>
            <View style={styles.termsLinks}>
              <Pressable onPress={() => openLink("https://example.com/terms")} style={styles.termsPressable}> 
                <Text style={styles.termsLink}>Terms of Service</Text>
              </Pressable>
              <View style={styles.termsDot} />
              <Pressable onPress={() => openLink("https://example.com/privacy")} style={styles.termsPressable}> 
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Pressable>
              <View style={styles.termsDot} />
              <Pressable onPress={() => openLink("https://example.com/content-policies")} style={styles.termsPressable}>
                <Text style={styles.termsLink}>Content Policies</Text>
              </Pressable>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
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
    backgroundColor: 'transparent',
  },
  topGlow: {
    position: 'absolute',
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  decorativeLine: {
    height: 2,
    width: 60,
    marginHorizontal: 24,
    marginTop: 12,
    borderRadius: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  contentContainerOtp: {
    flex: 1,
    justifyContent: 'center',
  },
  authContent: {
    paddingVertical: 40,
  },
  welcomeSection: {
    marginBottom: 80,
  },
  welcomeText: {
    fontSize: 42,
    color: Colors.textPrimary,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: -1.2,
    textAlign: 'left',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: '400',
  },
  inputSection: {
    marginBottom: 50,
  },
  inputLabel: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '700',
    marginBottom: 20,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  countrySelector: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  countrySelectorGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    minWidth: 100,
    justifyContent: 'center',
    borderRadius: 16,
  },
  countryFlag: {
    fontSize: 22,
    marginRight: 10,
  },
  countryCode: {
    color: Colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
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
    overflow: 'hidden',
  },
  phoneInput: {
    fontSize: 19,
    color: Colors.textPrimary,
    paddingVertical: 20,
    paddingHorizontal: 20,
    fontWeight: '600',
    backgroundColor: 'transparent',
    letterSpacing: 0.5,
  },

  continueButton: {
    backgroundColor: 'transparent',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 32,
    minHeight: 64,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  buttonGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  continueButtonText: {
    color: Colors.button.text,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  otpInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 8,
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
    fontWeight: '400',
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 50 : 40,
    alignItems: 'center',
  },
  divider: {
    height: 1,
    width: 80,
    marginBottom: 32,
  },
  termsIntro: {
    color: Colors.textMuted,
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '400',
  },
  termsLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  termsPressable: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  termsLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
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