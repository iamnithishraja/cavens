import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import apiClient from "@/app/api/client";
import { useRouter } from "expo-router";
import BrandHeader from "@/components/common/BrandHeader";


const ProfileScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCompleteProfile = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      
      
      const res = await apiClient.post("/api/user/completeProfile", {
        name: name.trim(),
        email: email.trim(),
      });

      if (res.data.success) {        
        Alert.alert(
          "Success",
          "Profile completed successfully!",
          [
            {
              text: "Continue",
              onPress: () => {
                router.push('/(tabs)/userTabs');
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", res.data.message || "Failed to complete profile");
      }
    } catch (error: any) {
      console.error("Error completing profile:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setIsLoading(false);
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
      <BrandHeader subtitle="Let's complete your profile ✨" />
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
              <Text style={styles.title}>Personal Details</Text>
              <Text style={styles.subtitle}>
                Let's complete your profile to get started
              </Text>
            </View>

            {/* Form Fields */}
            <View style={styles.formContainer}>
              {/* Name Field */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}> Name</Text>
                <View style={styles.inputWrapper}>
                  <LinearGradient
                    colors={name ? [Colors.surfaceElevated, Colors.surface] : [Colors.surface, Colors.surfaceElevated]}
                    style={[styles.inputGradient, name && styles.inputFilled]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <TextInput
                      style={styles.textInput}
                      placeholder="John Doe"
                      placeholderTextColor={Colors.textMuted}
                      value={name}
                      onChangeText={setName}
                      selectionColor={Colors.accentBlue}
                      autoCapitalize="words"
                    />
                    {/* Enhanced glow effect when filled */}
                    {name && (
                      <LinearGradient
                        colors={['rgba(78, 162, 255, 0.15)', 'transparent']}
                        style={styles.inputGlow}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      />
                    )}
                  </LinearGradient>
                </View>
              </View>

              {/* Email Field */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Email</Text>
                <View style={styles.inputWrapper}>
                  <LinearGradient
                    colors={email ? [Colors.surfaceElevated, Colors.surface] : [Colors.surface, Colors.surfaceElevated]}
                    style={[styles.inputGradient, email && styles.inputFilled]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <TextInput
                      style={styles.textInput}
                      placeholder="abc@example.com"
                      placeholderTextColor={Colors.textMuted}
                      value={email}
                      onChangeText={setEmail}
                      selectionColor={Colors.accentBlue}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {/* Enhanced glow effect when filled */}
                    {email && (
                      <LinearGradient
                        colors={['rgba(78, 162, 255, 0.15)', 'transparent']}
                        style={styles.inputGlow}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      />
                    )}
                  </LinearGradient>
                </View>
              </View>
            </View>

            {/* Action Button */}
            <View style={styles.actionSection}>
              <TouchableOpacity 
                style={styles.buttonWrapper} 
                onPress={handleCompleteProfile}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={[Colors.accentYellow, '#F7C84A']}
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? "Completing..." : "Complete Profile"}
                  </Text>
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
    justifyContent:"flex-start",
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
  formContainer: {
    gap: 24,
    marginBottom: 40,
  },
  fieldContainer: {
    gap: 12,
  },
  fieldLabel: {
    fontSize: 18,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginLeft: 4,
  },
  inputWrapper: {
    position: 'relative',
  },
  inputGradient: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.borderBlue,
    overflow: 'hidden',
    height: 56,
    justifyContent: 'center',
  },
  inputFilled: {
    borderColor: Colors.accentBlue,
  },
  textInput: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.textPrimary,
    backgroundColor: 'transparent',
    height: '100%',
  },
  inputGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  actionSection: {
    marginTop: 20,
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
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.button.text,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});

export default ProfileScreen;