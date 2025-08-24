import React, { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import apiClient from "@/app/api/client";
import { useRouter } from "expo-router";
import { store } from "@/utils";


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
  
        
  
        // Save token and user (merge role + completion flag into user for later use)
        const userData = { ...user, role, isProfileComplete };
        await store.set("token", token);
        await store.set("user", JSON.stringify(userData));
  
        // Handle navigation
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
  
  
  const handleResendOtp=async()=>{
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
    <LinearGradient
      colors={Colors.gradients.background as [string, string]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Main Content Card */}
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
            {/* Header Section */}
            <View style={styles.headerSection}>
              <Text style={styles.title}>Verification Code</Text>
              <Text style={styles.subtitle}>
                We've sent a 4-digit verification code to
              </Text>
              <Text style={styles.phoneNumber}>
                {getMaskedPhoneNumber(phoneNumber)}
              </Text>
            </View>

            {/* OTP Input Boxes */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <View key={index} style={styles.otpInputWrapper}>
                  <LinearGradient
                    colors={digit ? [Colors.surfaceElevated, Colors.surface] : [Colors.surface, Colors.surfaceElevated]}
                    style={[styles.otpInputGradient, digit && styles.otpInputFilled]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <TextInput
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
                      selectionColor={Colors.accentBlue}
                    />
                    {/* Enhanced glow effect when filled */}
                    {digit && (
                      <LinearGradient
                        colors={['rgba(78, 162, 255, 0.15)', 'transparent']}
                        style={styles.inputGlow}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      />
                    )}
                  </LinearGradient>
                </View>
              ))}
            </View>

            {/* Resend Code */}
            <TouchableOpacity style={styles.resendContainer} onPress={handleResendOtp}>
              <Text style={styles.resendText}>
                Didn't receive code?{" "}
                <Text style={styles.resendLink}>Resend</Text>
              </Text>
            </TouchableOpacity>

            {/* Action Buttons */}
            <View style={styles.actionSection}>
              <TouchableOpacity style={styles.buttonWrapper} onPress={handleVerifyOtp}>
                <LinearGradient
                  colors={[Colors.accentYellow, '#F7C84A']}
                  style={styles.button}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.buttonText}>Verify & Continue</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.backButtonWrapper} onPress={onBack}>
                <LinearGradient
                  colors={[Colors.surfaceElevated, Colors.surface]}
                  style={styles.backButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.backButtonText}>Back</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    paddingTop: 60,
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
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    color: Colors.textPrimary,
    fontWeight: "800",
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  phoneNumber: {
    fontSize: 18,
    color: Colors.accentBlue,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
  },
  otpInputWrapper: {
    position: 'relative',
  },
  otpInputGradient: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.borderBlue,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  otpInputFilled: {
    borderColor: Colors.accentBlue,
  },
  otpInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    backgroundColor: 'transparent',
  },
  inputGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  resendText: {
    color: Colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
  },
  resendLink: {
    color: Colors.accentYellow,
    fontWeight: '700',
  },
  actionSection: {
    gap: 16,
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
  backButtonWrapper: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.borderBlue,
    overflow: 'hidden',
  },
  backButton: {
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    color: Colors.textSecondary,
    fontSize: 18,
    fontWeight: "700",
  },
});

export default OtpScreen;