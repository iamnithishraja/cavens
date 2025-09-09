import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { qrStyles } from './styles';
import type { QRScannerLandingProps } from './types';

export default function QRScannerLanding({ onStartScanning, loading }: QRScannerLandingProps) {
  return (
    <SafeAreaView style={qrStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      <LinearGradient colors={Colors.gradients.background as [string, string]} style={qrStyles.container}>
        {/* Header */}
        <View style={qrStyles.header}>
          <Text style={qrStyles.headerTitle}>QR Scanner</Text>
          <TouchableOpacity style={qrStyles.helpButton}>
            <Ionicons name="help-circle-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Main Content with ScrollView */}
        <ScrollView 
          style={qrStyles.scrollContainer} 
          contentContainerStyle={qrStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={qrStyles.scannerPlaceholder}>
            {/* QR Icon with Glow Effect */}
            <View style={qrStyles.qrIconContainer}>
              <View style={qrStyles.qrIconGlow} />
              <Ionicons name="qr-code" size={100} color={Colors.primary} />
            </View>
            
            <Text style={qrStyles.placeholderTitle}>Ready to Scan Tickets</Text>
            <Text style={qrStyles.placeholderSubtitle}>
              Quickly verify and complete customer orders by scanning their QR codes
            </Text>

            {/* Feature Pills */}
            <View style={qrStyles.featurePills}>
              <View style={qrStyles.featurePill}>
                <Ionicons name="flash" size={16} color={Colors.primary} />
                <Text style={qrStyles.featurePillText}>Instant Verification</Text>
              </View>
              <View style={qrStyles.featurePill}>
                <Ionicons name="shield-checkmark" size={16} color={Colors.success} />
                <Text style={qrStyles.featurePillText}>Secure Processing</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Scan Button - Fixed at bottom */}
        <View style={qrStyles.controlsContainer}>
          <TouchableOpacity 
            style={qrStyles.startScanButton} 
            onPress={onStartScanning}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.primary, '#4A9EFF']}
              style={qrStyles.startScanButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <>
                  <View style={qrStyles.scanButtonIconContainer}>
                    <Ionicons name="scan" size={28} color="#000" />
                  </View>
                  <Text style={qrStyles.startScanText}>Start Scanning</Text>
                  <Ionicons name="arrow-forward" size={20} color="#000" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
