import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { qrStyles } from './styles';
import type { LoadingScreenProps } from './types';

export default function LoadingScreen({ message = "Initializing camera..." }: LoadingScreenProps) {
  return (
    <SafeAreaView style={qrStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <LinearGradient colors={Colors.gradients.background as [string, string]} style={qrStyles.container}>
        <View style={qrStyles.centerContainer}>
          <View style={qrStyles.loadingCircle}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
          <Text style={qrStyles.loadingText}>{message}</Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
