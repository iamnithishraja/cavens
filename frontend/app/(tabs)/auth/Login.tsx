import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import tw from "twrnc";
import { Colors } from "@/constants/Colors";
import apiClient from "@/app/api/client";
import { useEffect } from "react";

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleGetOtp = async () => {
    console.log("Phone Number:", phoneNumber);
    try {
      const res = await apiClient.post("/api/user/onboarding", {
        phone: phoneNumber.trim(),
      });
      if (res.status === 200) {
        console.log("OTP sent successfully");
      } 
      console.log("Response:", res.data);
    } catch (error) {
      console.error("Error sending OTP:", error);
    }
   };

  useEffect(() => {
    async function test() {
      try {
        console.log("Testing API client...");
        const res = await apiClient.get("/");
        console.log("Server response:", res.data);
      } catch (err) {
        console.log(err);
      }
    }
    test();
  }, []);

  return (
    <View
      style={tw`flex-1 bg-[${Colors.background}] justify-center items-center p-5`}
    >
      <Text style={tw`text-2xl text-[${Colors.textPrimary}] mb-5`}>Login</Text>
      <TextInput
        style={tw`w-full h-12 bg-[${Colors.surface}] rounded-lg px-4 text-[${Colors.textPrimary}] mb-5 border border-[${Colors.borderBlue}]`}
        placeholder="Enter phone number"
        placeholderTextColor={Colors.textMuted}
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={(text) => {
          console.log("Input text:", text); // Debug log
          setPhoneNumber(text);
        }}
        autoComplete="tel" // Add this for better UX
        textContentType="telephoneNumber" // Add this for iOS
        maxLength={15} // Reasonable limit for phone numbers
      />
      <TouchableOpacity
        style={tw`w-full h-12 bg-[${Colors.button.background}] justify-center items-center rounded-lg`}
        onPress={handleGetOtp}
      >
        <Text style={tw`text-[${Colors.button.text}] text-lg font-bold`}>
          Get OTP
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;