import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import apiClient from "@/app/api/client";
import { useRouter } from "expo-router";
import { store } from "@/utils";
import { KeyboardAvoidingView, Platform } from "react-native";
import BrandHeader from "@/components/common/BrandHeader";
import { Ionicons } from "@expo/vector-icons";
import AnimatedGlowHeader from "@/components/ui/AnimatedGlowHeader";

const OtpScreen = ({
  phoneNumber,
  onBack,
}: {
  phoneNumber: string;
  onBack: () => void;
}) => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnims = useRef([...Array(4)].map(() => new Animated.Value(1))).current;
  
  // Fade in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    
    // Auto focus first input
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 400);
  }, []);

  // Function to mask phone number (show first 2 and last 2 digits)
  const getMaskedPhoneNumber = (phone: string) => {
    if (phone.length <= 4) return phone;
    const visibleStart = phone.slice(0, 2);
    const visibleEnd = phone.slice(-2);
    const maskedMiddle = "*".repeat(phone.length - 4);
    return `${visibleStart}${maskedMiddle}${visibleEnd}`;
  };

  const handleOtpChange = (value: string, index: number) => {
    // Only allow single digit
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Scale animation on input
    if (value) {
      Animated.sequence([
        Animated.spring(scaleAnims[index], {
          toValue: 1.1,
          useNativeDriver: true,
          speed: 50,
        }),
        Animated.spring(scaleAnims[index], {
          toValue: 1,
          useNativeDriver: true,
          speed: 50,
        }),
      ]).start();
    }

    // Auto focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    // Handle backspace to go to previous input
    if (key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join("");

    if (otpString.length !== 4) {
      Alert.alert("Error", "Please enter complete OTP");
      return;
    }

    try {
      const res = await apiClient.post("/api/user/verify-otp", {
        phone: phoneNumber.trim(),
        otp: otpString,
      });

      if (res.data.success) {
        const { token, user, role, isProfileComplete } = res.data;
        const userData = { ...user, role, isProfileComplete };
        await store.set("token", token);
        await store.set("user", JSON.stringify(userData));

        if (!isProfileComplete) {
          router.replace("/profile");
        } else if (role === "club" || role === "admin") {
          router.replace("/(tabs)/adminTabs");
        } else if (role === "user") {
          router.replace("/(tabs)/userTabs");
        } else {
          // Default fallback
          router.replace("/(tabs)/userTabs");
        }
      } else {
        Alert.alert("Error", res.data.message || "Invalid OTP");
      }
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Something went wrong"
      );
    }
  };

  const handleResendOtp = async () => {
    try {
      const res = await apiClient.post("/api/user/onboarding", {
        phone: phoneNumber.trim(),
      });
      if (res.status === 200) {
        Alert.alert(
          "Success",
          "OTP sent successfully to " + getMaskedPhoneNumber(phoneNumber)
        );
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Animated background glow */}
      <View style={styles.patternOverlay} pointerEvents="none">
        <AnimatedGlowHeader />
      </View>
      <View style={styles.container}>
        <BrandHeader />
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <View style={styles.backPill}>
              <Ionicons
                name="chevron-back"
                size={18}
                color={Colors.textPrimary}
              />
            </View>
            <Text style={styles.backText}>Back to sign-in</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.titleSection}>
            <Text style={styles.titleSmall}>Verify your number</Text>
            <Text style={styles.title}>Enter Code</Text>
            <View style={styles.titleDivider} />
            <View style={styles.subtitleContainer}>
              <View style={styles.subtitleDot} />
              <Text style={styles.subtitle}>
                We sent a 4-digit code to {getMaskedPhoneNumber(phoneNumber)}
              </Text>
            </View>
          </View>

          {/* OTP Input */}
          <View style={styles.otpSection}>
            <Text style={styles.otpLabel}>VERIFICATION CODE</Text>
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <Animated.View
                  key={index}
                  style={[{ flex: 1 }, { transform: [{ scale: scaleAnims[index] }] }]}
                >
                  <TextInput
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    style={[
                      styles.otpInput,
                      focusedIndex === index && styles.otpInputFocused,
                    ]}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={(value) => handleOtpChange(value, index)}
                    onKeyPress={({ nativeEvent }) =>
                      handleKeyPress(nativeEvent.key, index)
                    }
                    onFocus={() => setFocusedIndex(index)}
                    onBlur={() =>
                      setFocusedIndex((prev) => (prev === index ? null : prev))
                    }
                    selectionColor={Colors.primary}
                    placeholderTextColor={Colors.textMuted}
                  />
                </Animated.View>
              ))}
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleVerifyOtp}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={Colors.gradients.button as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.continueButtonText}>VERIFY CODE</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Resend Section */}
          <View style={styles.resendSection}>
            <View style={styles.resendDot} />
            <Text style={styles.resendText}>Didn&apos;t receive it? </Text>
            <TouchableOpacity
              onPress={handleResendOtp}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.resendLink}>Send again</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  patternOverlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: "none",
  },
  header: {
    paddingTop: 48,
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backArrow: {
    color: Colors.textPrimary,
    fontSize: 16,
  },
  backPill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  backText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  titleSection: {
    marginBottom: 40,
    alignItems: "flex-start",
  },
  titleSmall: {
    fontSize: 28,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 48,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginBottom: 12,
    lineHeight: 52,
    letterSpacing: -2,
  },
  titleDivider: {
    width: 100,
    height: 2.5,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    marginBottom: 16,
    opacity: 0.8,
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  subtitleDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    marginTop: 9,
  },
  subtitle: {
    flex: 1,
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  otpSection: {
    marginBottom: 36,
  },
  otpLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 12,
    letterSpacing: 1.2,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  otpInput: {
    width: "100%",
    height: 68,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    fontSize: 26,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
    marginHorizontal: 6,
    borderWidth: 1.5,
    borderColor: Colors.withOpacity.white10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  otpInputFocused: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: Colors.withOpacity.white05,
    shadowColor: Colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
    transform: [{ scale: 1.02 }],
  },
  continueButton: {
    backgroundColor: "transparent",
    height: 62,
    borderRadius: 31,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 36,
    overflow: "hidden",
    shadowColor: Colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  buttonGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 31,
    justifyContent: "center",
    alignItems: "center",
  },
  continueButtonText: {
    color: Colors.button.text,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  resendSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  resendDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primary,
    opacity: 0.6,
  },
  resendText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  resendLink: {
    color: Colors.primary,
    fontWeight: "700",
    marginTop: 0,
  },
});

export default OtpScreen;
