import React, { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import apiClient from "@/app/api/client";
import { useRouter } from "expo-router";
import { store } from "@/utils";
import BrandHeader from "@/components/common/BrandHeader";

const OtpScreen = ({
  phoneNumber,
  onBack,
}: {
  phoneNumber: string;
  onBack: () => void;
}) => {
  
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const router = useRouter();

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
        } else if (role === "admin") {
          router.replace("/adminTabs");
        } else {
          router.replace("/userTabs");
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
        phone: phoneNumber.trim()
      });
      if (res.status === 200) {
        Alert.alert("Success", "OTP sent successfully to " + getMaskedPhoneNumber(phoneNumber));
      } 
    } catch (error) {
      console.error("Error sending OTP:", error);
    }
  };

  return (
    <View style={styles.container}>
      <BrandHeader />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Go back">
          <View style={styles.backPill}>
            <Text style={styles.backArrow}>←</Text>
          </View>
          <Text style={styles.backText}>caVén</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleSection}>
          <View style={styles.yellowLine} />
          <Text style={styles.title}>Verification Code</Text>
          <Text style={styles.subtitle}>
            • Enter the 4-digit code sent to {getMaskedPhoneNumber(phoneNumber)}
          </Text>
        </View>

        {/* OTP Input */}
        <View style={styles.otpSection}>
          <Text style={styles.otpLabel}>VERIFICATION CODE</Text>
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent }) =>
                  handleKeyPress(nativeEvent.key, index)
                }
                selectionColor={Colors.primary}
                placeholderTextColor={Colors.textMuted}
              />
            ))}
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={handleVerifyOtp} activeOpacity={0.85}>
          <LinearGradient
            colors={Colors.gradients.button as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          />
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        {/* Resend Section */}
        <TouchableOpacity onPress={handleResendOtp} style={styles.resendSection}>
          <Text style={styles.resendText}>
            • Didn&apos;t receive the code? <Text style={styles.resendLink}>Resend</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backArrow: {
    color: Colors.textPrimary,
    fontSize: 18,
  },
  backPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.withOpacity.white10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backText: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  titleSection: {
    marginBottom: 60,
  },
  yellowLine: {
    width: 60,
    height: 4,
    backgroundColor: Colors.primary,
    marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 20,
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  otpSection: {
    marginBottom: 40,
  },
  otpLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 16,
    letterSpacing: 1,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  otpInput: {
    flex: 1,
    height: 64,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  continueButton: {
    backgroundColor: 'transparent',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    overflow: 'hidden',
  },
  buttonGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
  },
  continueButtonText: {
    color: Colors.button.text,
    fontSize: 18,
    fontWeight: '700',
  },
  resendSection: {
    alignItems: 'flex-start',
  },
  resendText: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  resendLink: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
});

export default OtpScreen;