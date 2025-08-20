import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import tw from "twrnc";
import { Colors } from "@/constants/Colors";
import apiClient from "@/app/api/client";
import OtpScreen from "@/components/common/OtpScreen";

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetOtp = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert("Error", "Please enter your phone number");
      return;
    }

    console.log("Phone Number:", phoneNumber);
    setIsLoading(true);
    
    try {
      const res = await apiClient.post("/api/user/onboarding", {
        phone: phoneNumber.trim(),
      });
      
      if (res.status === 200) {
        console.log("OTP sent successfully");
        setShowOtp(true); // switch to OTP screen
      }
      console.log("Response:", res.data);
    } catch (error) {
      console.error("Error sending OTP:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Conditionally render Login or OTP
  if (showOtp) {
    return <OtpScreen phoneNumber={phoneNumber} onBack={() => setShowOtp(false)} />;
  }

  return (
    <View style={tw`flex-1 bg-[${Colors.background}] justify-center items-center px-6`}>
      {/* Header Section */}
      <View style={tw`items-center mb-12`}>
        <View style={tw`w-20 h-20 rounded-full bg-[${Colors.surfaceElevated}] items-center justify-center mb-8 border border-[${Colors.borderBlue}]`}>
          <Text style={tw`text-3xl`}>🔐</Text>
        </View>
        
        <Text style={tw`text-4xl font-bold text-[${Colors.textPrimary}] mb-4`}>
          Welcome Back
        </Text>
        
        <Text style={tw`text-base text-[${Colors.textSecondary}] text-center leading-6 px-4`}>
          Enter your phone number to get started with secure login
        </Text>
      </View>

      {/* Phone Input Section */}
      <View style={tw`w-full mb-8`}>
        <Text style={tw`text-sm font-semibold text-[${Colors.textSecondary}] mb-3 ml-1`}>
          Phone Number
        </Text>
        
        <View style={tw`relative`}>
          <TextInput
            style={tw`w-full h-16 bg-[${Colors.surface}] rounded-xl px-6 text-lg text-[${Colors.textPrimary}] border-2 border-[${Colors.borderBlue}] font-medium`}
            placeholder="Enter your phone number"
            placeholderTextColor={Colors.textMuted}
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            autoComplete="tel"
            textContentType="telephoneNumber"
            maxLength={15}
            selectionColor={Colors.accentBlue}
          />
          
          {/* Country code prefix indicator */}
          <View style={tw`absolute left-6 top-1/2 transform -translate-y-1/2 flex-row items-center`}>
            <Text style={tw`text-lg text-[${Colors.textMuted}] mr-2`}>🇮🇳</Text>
          </View>
          
          {phoneNumber.length > 0 && (
            <View style={tw`absolute right-4 top-1/2 transform -translate-y-1/2`}>
              <View style={tw`w-2 h-2 bg-[${Colors.accentBlue}] rounded-full`} />
            </View>
          )}
        </View>
        
        {/* Helper text */}
        <Text style={tw`text-xs text-[${Colors.textMuted}] mt-2 ml-1`}>
          We'll send you a verification code
        </Text>
      </View>

      {/* Action Button */}
      <View style={tw`w-full mb-8`}>
        <TouchableOpacity
          style={tw`w-full h-16 bg-[${Colors.button.background}] justify-center items-center rounded-xl shadow-lg ${isLoading ? 'opacity-70' : ''}`}
          onPress={handleGetOtp}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <Text style={tw`text-[${Colors.button.text}] text-lg font-bold`}>
            {isLoading ? "Sending..." : "Get Verification Code"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer Section */}
      <View style={tw`items-center`}>
        <Text style={tw`text-sm text-[${Colors.textMuted}] text-center leading-5 px-8`}>
          By continuing, you agree to our{" "}
          <Text style={tw`text-[${Colors.accentBlue}] font-semibold`}>
            Terms of Service
          </Text>
          {" "}and{" "}
          <Text style={tw`text-[${Colors.accentBlue}] font-semibold`}>
            Privacy Policy
          </Text>
        </Text>
      </View>

      {/* Bottom Spacing */}
      <View style={tw`h-10`} />
    </View>
  );
};

export default Login;