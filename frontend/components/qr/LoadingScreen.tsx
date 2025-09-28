import React from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import { qrStyles } from "./styles";
import type { LoadingScreenProps } from "./types";

export default function LoadingScreen({
  message = "Initializing camera...",
}: LoadingScreenProps) {
  const getLoadingMessage = () => {
    if (message !== "Initializing camera...") {
      return message; // Use custom message if provided
    }

    const messages = [
      "Getting ready to scan your way in...",
      "Preparing your entry scanner...",
      "Setting up the party scanner...",
      "Almost ready to scan your ticket...",
      "Getting the scanner ready for tonight...",
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <SafeAreaView style={qrStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <LinearGradient
        colors={Colors.gradients.background as [string, string]}
        style={qrStyles.container}
      >
        <View style={qrStyles.centerContainer}>
          <View style={qrStyles.loadingCircle}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
          <Text style={qrStyles.loadingText}>{getLoadingMessage()}</Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
