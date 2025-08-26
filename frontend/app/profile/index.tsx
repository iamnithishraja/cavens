import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, StatusBar } from "react-native";
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
    <View style={styles.container}>
      <BrandHeader />

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleSection}>
          <View style={styles.yellowLine} />
          <Text style={styles.title}>Complete your profile</Text>
          <Text style={styles.subtitle}>
            • Enter your personal details to continue
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>FULL NAME</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Full name"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
              selectionColor={Colors.primary}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>EMAIL</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Email address"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
              selectionColor={Colors.primary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity 
          style={[styles.continueButton, isLoading && styles.buttonDisabled]} 
          onPress={handleCompleteProfile}
          disabled={isLoading}
        >
          <Text style={styles.continueButtonText}>
            {isLoading ? "Setting up..." : "Continue"}
          </Text>
        </TouchableOpacity>

        {/* Footer Note */}
        <View style={styles.footerSection}>
          <Text style={styles.footerText}>
            • By continuing, you agree to our{" "}
            <Text style={styles.footerLink}>Terms of Service</Text> •{" "}
            <Text style={styles.footerLink}>Privacy Policy</Text> •{" "}
            <Text style={styles.footerLink}>Content Policies</Text>
          </Text>
        </View>
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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandIcon: {
    color: Colors.primary,
    fontSize: 20,
    fontWeight: '800',
    marginRight: 8,
  },
  brandText: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginLeft: 28,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
  formSection: {
    marginBottom: 40,
    gap: 32,
  },
  fieldGroup: {
    gap: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: 1,
  },
  textInput: {
    height: 56,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  continueButtonText: {
    color: Colors.button.text,
    fontSize: 18,
    fontWeight: '700',
  },
  footerSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  footerLink: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
});

export default ProfileScreen;