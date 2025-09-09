import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Animated,
  Dimensions
} from 'react-native';
import { CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { qrStyles } from './styles';
import type { QRScannerProps } from './types';

const { width } = Dimensions.get('window');

export default function QRScanner({ onQRScanned, onClose, isScanning, loading }: QRScannerProps) {
  const scanAnimation = new Animated.Value(0);

  useEffect(() => {
    // Start scan line animation
    const animateScanner = () => {
      scanAnimation.setValue(0);
      Animated.timing(scanAnimation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }).start(() => animateScanner());
    };
    animateScanner();
  }, []);

  const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (!isScanning) {
      onQRScanned(data);
    }
  };

  return (
    <View style={qrStyles.cameraFullContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <CameraView
        style={qrStyles.camera}
        facing="back"
        onBarcodeScanned={isScanning ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />
      
      {/* Camera Overlay */}
      <View style={qrStyles.cameraOverlay}>
        {/* Top Bar */}
        <View style={qrStyles.cameraTopBar}>
          <TouchableOpacity style={qrStyles.cameraBackButton} onPress={onClose}>
            <View style={qrStyles.cameraBackButtonInner}>
              <Ionicons name="close" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={qrStyles.cameraTitle}>Scan QR Code</Text>
          <View style={qrStyles.cameraTopSpacer} />
        </View>

        {/* Scanning Area */}
        <View style={qrStyles.scanningArea}>
          <View style={qrStyles.scanFrameContainer}>
            {/* Background Grid Pattern */}
            <View style={qrStyles.scanGrid} />
            
            {/* Corner Brackets */}
            <View style={qrStyles.cornerTopLeft} />
            <View style={qrStyles.cornerTopRight} />
            <View style={qrStyles.cornerBottomLeft} />
            <View style={qrStyles.cornerBottomRight} />
            
            {/* Animated Scan Line */}
            <Animated.View
              style={[
                qrStyles.scanLine,
                {
                  transform: [{
                    translateY: scanAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, width - 100], // Scan frame height
                    }),
                  }],
                },
              ]}
            />
            
            {/* Center Target */}
            <View style={qrStyles.centerTarget}>
              <View style={qrStyles.targetCircle} />
            </View>
          </View>
          
          <Text style={qrStyles.scanInstructions}>
            Position the QR code within the frame to scan
          </Text>
          
          {isScanning && (
            <View style={qrStyles.scanningIndicator}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={qrStyles.scanningText}>Reading QR Code...</Text>
            </View>
          )}
        </View>

        {/* Bottom Instructions */}
        <View style={qrStyles.cameraBottomArea}>
          {loading && (
            <View style={qrStyles.loadingOverlay}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={qrStyles.processingText}>Processing Order...</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
