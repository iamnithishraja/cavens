import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Image,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import apiClient from '@/app/api/client';
import type { CompleteOrderResponse } from '@/types/order';

const { width, height } = Dimensions.get('window');

// Design constants
const SPACING = 20;
const RADIUS = 16;

export default function QRScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [orderData, setOrderData] = useState<CompleteOrderResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const scanAnimation = new Animated.Value(0);

  useEffect(() => {
    if (showCamera) {
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
    }
  }, [showCamera]);

  const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (!isScanning) {
      setIsScanning(true); // Prevent multiple scans
      handleQRScanned(data);
    }
  };

  const handleQRScanned = async (qrData: string) => {
    try {
      // Extract order ID from QR data
      let orderId = qrData;
      
      // If QR contains JSON data, parse it
      if (qrData.startsWith('{')) {
        try {
          const parsedData = JSON.parse(qrData);
          orderId = parsedData.orderId || parsedData.id || qrData;
        } catch (e) {
          orderId = qrData;
        }
      }
      
      await completeOrder(orderId);
    } catch (error) {
      console.error('Error processing QR code:', error);
      Alert.alert('Error', 'Failed to process QR code. Please try again.');
      setIsScanning(false); // Re-enable scanning on error
    }
  };

  const completeOrder = async (orderId: string) => {
    setLoading(true);
    try {
      const response = await apiClient.post<CompleteOrderResponse>('/api/club/completeOrder', {
        orderId
      });

      if (response.data.success) {
        setOrderData(response.data.data);
        setShowCamera(false);
        setIsScanning(false);
        Alert.alert(
          'Success! 🎉',
          'Order completed successfully!',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error', 
          response.data.message || 'Failed to complete order',
          [{ text: 'OK', onPress: () => setIsScanning(false) }]
        );
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to complete order. Please try again.';
      Alert.alert(
        'Error', 
        errorMessage,
        [{ text: 'OK', onPress: () => setIsScanning(false) }]
      );
    } finally {
      setLoading(false);
    }
  };

  const startScanning = () => {
    setShowCamera(true);
    setOrderData(null);
    setIsScanning(false); // Reset scanning state
  };

  const resetScanner = () => {
    setShowCamera(false);
    setOrderData(null);
    setIsScanning(false);
  };

  if (!permission) {
    // Camera permissions are still loading
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
        <LinearGradient colors={Colors.gradients.background as [string, string]} style={styles.container}>
          <View style={styles.centerContainer}>
            <View style={styles.loadingCircle}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
            <Text style={styles.loadingText}>Initializing camera...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
        <LinearGradient colors={Colors.gradients.background as [string, string]} style={styles.container}>
          <View style={styles.centerContainer}>
            <View style={styles.permissionIconContainer}>
              <Ionicons name="camera" size={64} color={Colors.primary} />
              <View style={styles.permissionBadge}>
                <Ionicons name="lock-closed" size={20} color={Colors.error} />
              </View>
            </View>
            <Text style={styles.errorTitle}>Camera Access Required</Text>
            <Text style={styles.errorMessage}>
              We need camera permissions to scan QR codes and complete ticket orders
            </Text>
            <TouchableOpacity 
              style={styles.permissionButton} 
              onPress={requestPermission}
            >
              <LinearGradient
                colors={[Colors.primary, '#4A9EFF']}
                style={styles.permissionButtonGradient}
              >
                <Ionicons name="shield-checkmark" size={20} color="#000" />
                <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (orderData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
        <LinearGradient colors={Colors.gradients.background as [string, string]} style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerBackButton} onPress={resetScanner}>
              <Ionicons name="arrow-back" size={24} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Order Details</Text>
            <View style={styles.spacer} />
          </View>

          <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
            {/* Success Badge */}
            <View style={styles.successBadge}>
              <LinearGradient
                colors={['#00FF87', '#60EFFF']}
                style={styles.successBadgeGradient}
              >
                <Ionicons name="checkmark-circle" size={32} color="#000" />
                <Text style={styles.successText}>Order Completed Successfully!</Text>
              </LinearGradient>
            </View>

            {/* Event Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Event Information</Text>
              <View style={styles.eventCard}>
                {orderData.eventDetails.coverImage && (
                  <Image 
                    source={{ uri: orderData.eventDetails.coverImage }} 
                    style={styles.eventImage}
                    resizeMode="cover"
                  />
                )}
                <View style={styles.eventInfo}>
                  <Text style={styles.eventName}>{orderData.eventDetails.name}</Text>
                  <Text style={styles.eventDateTime}>
                    {orderData.eventDetails.date} • {orderData.eventDetails.time}
                  </Text>
                  {orderData.eventDetails.djArtists && (
                    <Text style={styles.eventDetail}>
                      <Text style={styles.label}>DJ/Artists:</Text> {orderData.eventDetails.djArtists}
                    </Text>
                  )}
                  {orderData.eventDetails.description && (
                    <Text style={styles.eventDescription}>{orderData.eventDetails.description}</Text>
                  )}
                </View>
              </View>
            </View>

            {/* Ticket Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ticket Details</Text>
              <View style={styles.ticketCard}>
                <View style={styles.ticketRow}>
                  <Text style={styles.ticketLabel}>Type:</Text>
                  <Text style={styles.ticketValue}>{orderData.ticketDetails.name}</Text>
                </View>
                <View style={styles.ticketRow}>
                  <Text style={styles.ticketLabel}>Quantity:</Text>
                  <Text style={styles.ticketValue}>{orderData.order.quantity}</Text>
                </View>
                <View style={styles.ticketRow}>
                  <Text style={styles.ticketLabel}>Price per Ticket:</Text>
                  <Text style={styles.ticketValue}>AED {orderData.ticketDetails.price}</Text>
                </View>
                <View style={styles.ticketRow}>
                  <Text style={styles.ticketLabel}>Total Amount:</Text>
                  <Text style={styles.totalAmount}>
                    AED {(orderData.ticketDetails.price * orderData.order.quantity).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Guest Experience */}
            {orderData.eventDetails.guestExperience && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Guest Experience</Text>
                <View style={styles.experienceCard}>
                  {orderData.eventDetails.guestExperience.dressCode && (
                    <View style={styles.experienceRow}>
                      <Text style={styles.experienceLabel}>Dress Code:</Text>
                      <Text style={styles.experienceValue}>{orderData.eventDetails.guestExperience.dressCode}</Text>
                    </View>
                  )}
                  {orderData.eventDetails.guestExperience.entryRules && (
                    <View style={styles.experienceRow}>
                      <Text style={styles.experienceLabel}>Entry Rules:</Text>
                      <Text style={styles.experienceValue}>{orderData.eventDetails.guestExperience.entryRules}</Text>
                    </View>
                  )}
                  {orderData.eventDetails.guestExperience.parkingInfo && (
                    <View style={styles.experienceRow}>
                      <Text style={styles.experienceLabel}>Parking:</Text>
                      <Text style={styles.experienceValue}>{orderData.eventDetails.guestExperience.parkingInfo}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Order Details */}x
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order Information</Text>
              <View style={styles.orderCard}>
                <View style={styles.orderRow}>
                  <Text style={styles.orderLabel}>Order ID:</Text>
                  <Text style={styles.orderValue}>{orderData.order._id.slice(-8).toUpperCase()}</Text>
                </View>
                <View style={styles.orderRow}>
                  <Text style={styles.orderLabel}>Transaction ID:</Text>
                  <Text style={styles.orderValue}>{orderData.order.transactionId.slice(-8).toUpperCase()}</Text>
                </View>
                <View style={styles.orderRow}>
                  <Text style={styles.orderLabel}>Scan Time:</Text>
                  <Text style={styles.orderValue}>
                    {new Date(orderData.scanTime).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.orderRow}>
                  <Text style={styles.orderLabel}>Status:</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{orderData.orderStatus}</Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity style={styles.scanAgainButton} onPress={startScanning}>
              <LinearGradient
                colors={[Colors.primary, '#4A9EFF']}
                style={styles.scanAgainButtonGradient}
              >
                <Ionicons name="qr-code" size={20} color="#000" />
                <Text style={styles.scanAgainText}>Scan Another Ticket</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (showCamera) {
    return (
      <View style={styles.cameraFullContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={isScanning ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />
        
        {/* Camera Overlay */}
        <View style={styles.cameraOverlay}>
          {/* Top Bar */}
          <View style={styles.cameraTopBar}>
            <TouchableOpacity style={styles.cameraBackButton} onPress={resetScanner}>
              <View style={styles.cameraBackButtonInner}>
                <Ionicons name="close" size={24} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text style={styles.cameraTitle}>Scan QR Code</Text>
            <View style={styles.cameraTopSpacer} />
          </View>

          {/* Scanning Area */}
          <View style={styles.scanningArea}>
            <View style={styles.scanFrameContainer}>
              {/* Background Grid Pattern */}
              <View style={styles.scanGrid} />
              
              {/* Corner Brackets */}
              <View style={styles.cornerTopLeft} />
              <View style={styles.cornerTopRight} />
              <View style={styles.cornerBottomLeft} />
              <View style={styles.cornerBottomRight} />
              
              {/* Animated Scan Line */}
              <Animated.View
                style={[
                  styles.scanLine,
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
              <View style={styles.centerTarget}>
                <View style={styles.targetCircle} />
              </View>
            </View>
            
            <Text style={styles.scanInstructions}>
              Position the QR code within the frame to scan
            </Text>
            
            {isScanning && (
              <View style={styles.scanningIndicator}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.scanningText}>Reading QR Code...</Text>
              </View>
            )}
          </View>

          {/* Bottom Instructions */}
          <View style={styles.cameraBottomArea}>
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.processingText}>Processing Order...</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      <LinearGradient colors={Colors.gradients.background as [string, string]} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>QR Scanner</Text>
          <TouchableOpacity style={styles.helpButton}>
            <Ionicons name="help-circle-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Main Content with ScrollView */}
        <ScrollView 
          style={styles.scrollContainer} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.scannerPlaceholder}>
            {/* QR Icon with Glow Effect */}
            <View style={styles.qrIconContainer}>
              <View style={styles.qrIconGlow} />
              <Ionicons name="qr-code" size={100} color={Colors.primary} />
            </View>
            
            <Text style={styles.placeholderTitle}>Ready to Scan Tickets</Text>
            <Text style={styles.placeholderSubtitle}>
              Quickly verify and complete customer orders by scanning their QR codes
            </Text>

            {/* Feature Pills */}
            <View style={styles.featurePills}>
              <View style={styles.featurePill}>
                <Ionicons name="flash" size={16} color={Colors.primary} />
                <Text style={styles.featurePillText}>Instant Verification</Text>
              </View>
              <View style={styles.featurePill}>
                <Ionicons name="shield-checkmark" size={16} color={Colors.success} />
                <Text style={styles.featurePillText}>Secure Processing</Text>
              </View>
            </View>
          </View>
        

        {/* Scan Button - Fixed at bottom */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={styles.startScanButton} 
            onPress={startScanning}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.primary, '#4A9EFF']}
              style={styles.startScanButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <>
                  <View style={styles.scanButtonIconContainer}>
                    <Ionicons name="scan" size={28} color="#000" />
                  </View>
                  <Text style={styles.startScanText}>Start Scanning</Text>
                  <Ionicons name="arrow-forward" size={20} color="#000" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}




const styles = StyleSheet.create({
  /* Layout */
  container: { flex: 1, backgroundColor: Colors.background },
  headerBackButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  spacer: { width: 44 },

  /* Generic centers/loaders */
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING * 2,
  },
  loadingCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING,
  },
  loadingText: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center' },

  /* Permission */
  permissionIconContainer: { position: 'relative', marginBottom: SPACING * 1.5 },
  permissionBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING * 2,
  },
  permissionButton: {
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  permissionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: SPACING * 2,
    gap: 10,
  },
  permissionButtonText: { color: '#000', fontSize: 16, fontWeight: '700' },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.withOpacity.white10,
    backgroundColor: Colors.background,
  },
  headerTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center' },
  helpButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },

  /* Scroll */
  scrollContainer: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },

  /* Placeholder / Landing */
  scannerPlaceholder: {
    alignItems: 'center',
    paddingHorizontal: 20,
    minHeight: 360,
    justifyContent: 'center',
  },
  qrIconContainer: { position: 'relative', marginBottom: 20 },
  qrIconGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.primary,
    opacity: 0.08,
    top: -20,
    left: -20,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  featurePills: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 4 },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  featurePillText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },

  /* Bottom CTA */
  controlsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40, // safe area cushion
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.withOpacity.white10,
    width: '100%',
  },
  startScanButton: {
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
  },
  startScanButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 40,
    gap: 10,
  },
  scanButtonIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startScanText: { color: '#000', fontSize: 16, fontWeight: '700', flex: 1, textAlign: 'center' },

  /* Camera */
  cameraFullContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraOverlay: { position: 'absolute', inset: 0 },
  cameraTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  cameraBackButton: { padding: 4 },
  cameraBackButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cameraTitle: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: '800', 
    flex: 1, 
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cameraTopSpacer: { width: 44 },

  scanningArea: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  scanGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
    backgroundColor: 'transparent',
  },
  scanFrameContainer: {
    width: width - 100,
    height: width - 100,
    position: 'relative',
    marginBottom: 30,
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 50,
    height: 50,
    borderTopWidth: 5,
    borderLeftWidth: 5,
    borderColor: Colors.primary,
    borderTopLeftRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 50,
    height: 50,
    borderTopWidth: 5,
    borderRightWidth: 5,
    borderColor: Colors.primary,
    borderTopRightRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 50,
    height: 50,
    borderBottomWidth: 5,
    borderLeftWidth: 5,
    borderColor: Colors.primary,
    borderBottomLeftRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 50,
    height: 50,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderColor: Colors.primary,
    borderBottomRightRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  centerTarget: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
  },
  targetCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  scanInstructions: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 20,
  },
  scanningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 16,
    gap: 10,
  },
  scanningText: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
  cameraBottomArea: { paddingBottom: 50, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center' },
  loadingOverlay: {
    backgroundColor: 'rgba(0,0,0,0.95)',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 200,
  },
  processingText: { color: '#fff', fontSize: 16, fontWeight: '600', marginTop: 12 },

  /* Success / Order details */
  successBadge: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 6,
    shadowColor: '#00FF87',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    marginHorizontal: 20,
    marginTop: 20,
  },
  successBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    gap: 12,
  },
  successText: { color: '#000', fontSize: 18, fontWeight: '800' },

  section: { marginBottom: 24, paddingHorizontal: 20 },
  sectionTitle: { 
    color: Colors.textPrimary, 
    fontSize: 20, 
    fontWeight: '700', 
    marginBottom: 16,
    marginTop: 8,
  },

  eventCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  eventImage: { 
    width: '100%', 
    height: 220, 
    borderRadius: 16, 
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  eventInfo: { gap: 12 },
  eventName: { 
    color: Colors.textPrimary, 
    fontSize: 22, 
    fontWeight: '800',
    marginBottom: 8,
    lineHeight: 28,
  },
  eventDateTime: { 
    color: Colors.textSecondary, 
    fontSize: 16, 
    fontWeight: '600',
    marginBottom: 8,
  },
  eventDetail: { 
    color: Colors.textSecondary, 
    fontSize: 15,
    lineHeight: 22,
  },
  label: { 
    color: Colors.textPrimary, 
    fontWeight: '700',
    fontSize: 15,
  },
  eventDescription: { 
    color: Colors.textSecondary, 
    fontSize: 15, 
    lineHeight: 24, 
    marginTop: 12,
    fontStyle: 'italic',
  },

  ticketCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  ticketRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16,
    paddingVertical: 8,
  },
  ticketLabel: { color: Colors.textSecondary, fontSize: 15, fontWeight: '600' },
  ticketValue: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
  totalAmount: { color: Colors.primary, fontSize: 18, fontWeight: '800' },

  experienceCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  experienceRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 16,
    paddingVertical: 8,
  },
  experienceLabel: { color: Colors.textSecondary, fontSize: 15, fontWeight: '600', flex: 1 },
  experienceValue: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700', flex: 2, textAlign: 'right' },

  orderCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  orderLabel: { color: Colors.textSecondary, fontSize: 15, fontWeight: '600' },
  orderValue: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
  statusBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  statusText: { color: Colors.background, fontSize: 14, fontWeight: '700' },

  /* Bottom fixed on details page */
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.withOpacity.white10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  scanAgainButton: {
    borderRadius: 22,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  scanAgainButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 10,
  },
  scanAgainText: { color: '#000', fontSize: 16, fontWeight: '800' },
});
