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
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, useCameraDevices, useCodeScanner ,useCameraDevice} from 'react-native-vision-camera';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import apiClient from '@/app/api/client';
import type { CompleteOrderResponse } from '@/types/order';

const { width, height } = Dimensions.get('window');

export default function QRScreen() {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [showCamera, setShowCamera] = useState(false);
  const [orderData, setOrderData] = useState<CompleteOrderResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  const devices = useCameraDevices();
  // const abc = devices.back;
  // const device = devices.find(d => d.position === 'back');
  const device= useCameraDevice('back');

  // Code scanner hook
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'], // Add other code types if needed
    onCodeScanned: (codes) => {
      if (!isScanning && codes.length > 0) {
        const qrData = codes[0].value;
        if (qrData) {
          setIsScanning(true); // Prevent multiple scans
          handleQRScanned(qrData);
        }
      }
    },
  });

  useEffect(() => {
    const getCameraPermission = async () => {
      const cameraPermission = await Camera.requestCameraPermission();
      setHasPermission(cameraPermission === 'granted');
    };

    getCameraPermission();
  }, []);

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

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        
        <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
        <LinearGradient colors={Colors.gradients.background as [string, string]} style={styles.container}>
          <View style={styles.centerContainer}>
            <Ionicons name="camera" size={64} color={Colors.error} />
            <Text style={styles.errorTitle}>Camera Permission Required</Text>
            <Text style={styles.errorMessage}>
              This app needs camera access to scan QR codes. Please enable camera permissions in your device settings.
            </Text>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={async () => {
                const permission = await Camera.requestCameraPermission();
                setHasPermission(permission === 'granted');
              }}
            >
              <Text style={styles.retryButtonText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
        <LinearGradient colors={Colors.gradients.background as [string, string]} style={styles.container}>
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading camera...</Text>
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
            <TouchableOpacity style={styles.backButton} onPress={resetScanner}>
              <Ionicons name="arrow-back" size={24} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Order Details</Text>
            <View style={styles.spacer} />
          </View>

          <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
            {/* Success Badge */}
            <View style={styles.successBadge}>
              <Ionicons name="checkmark-circle" size={32} color={Colors.success} />
              <Text style={styles.successText}>Order Completed Successfully!</Text>
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

            {/* Order Details */}
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
              <Ionicons name="qr-code" size={20} color={Colors.primary} />
              <Text style={styles.scanAgainText}>Scan Another Ticket</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (showCamera) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
        <LinearGradient colors={Colors.gradients.background as [string, string]} style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={resetScanner}>
              <Ionicons name="arrow-back" size={24} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Scan QR Code</Text>
            <View style={styles.spacer} />
          </View>

          {/* Camera View */}
          <View style={styles.cameraContainer}>
            <Camera
              style={styles.camera}
              device={device}
              isActive={true}
              codeScanner={codeScanner}
            />
            <View style={styles.cameraOverlay}>
              {/* Back Button Overlay */}
              <TouchableOpacity style={styles.cameraBackButton} onPress={resetScanner}>
                <View style={styles.cameraBackButtonInner}>
                  <Ionicons name="arrow-back" size={20} color="#000000" />
                </View>
              </TouchableOpacity>
              
              <View style={styles.scanFrame} />
              <Text style={styles.scanInstructions}>
                Position the QR code within the frame
              </Text>
              {loading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                  <Text style={styles.processingText}>Processing QR Code...</Text>
                </View>
              )}
              {isScanning && !loading && (
                <View style={styles.scanningIndicator}>
                  <Text style={styles.scanningText}>Scanning...</Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      <LinearGradient colors={Colors.gradients.background as [string, string]} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Scan QR Code</Text>
          <TouchableOpacity style={styles.helpButton}>
            <Ionicons name="help-circle" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.mainContainer}>
          <View style={styles.scannerPlaceholder}>
            <Ionicons name="qr-code" size={120} color={Colors.primary} />
            <Text style={styles.placeholderTitle}>Ready to Scan</Text>
            <Text style={styles.placeholderSubtitle}>
              Tap the button below to start scanning QR codes from user tickets
            </Text>

          </View>
        </View>

        {/* Scan Button */}
        <ScrollView style={styles.controlsContainer}>
          <TouchableOpacity 
            style={styles.startScanButton} 
            onPress={startScanning}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={Colors.background} />
            ) : (
              <>
                <Ionicons name="camera" size={24} color={Colors.background} />
                <Text style={styles.startScanText}>Start Scanning</Text>
              </>
            )}
          </TouchableOpacity>
          

        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  retryButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.withOpacity.white10,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.backgroundSecondary,
  },
  helpButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.backgroundSecondary,
  },
  spacer: {
    width: 40,
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20, // Add bottom padding to ensure space for button
  },
  scannerPlaceholder: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  placeholderSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },

  controlsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: Colors.background, // Add background to ensure visibility
    borderTopWidth: 1,
    borderTopColor: Colors.withOpacity.white10,
  },
  startScanButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 25,
    gap: 12,
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startScanText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '700',
  },

  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: width - 120,
    height: width - 120,
    borderWidth: 3,
    borderColor: Colors.primary,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  scanInstructions: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  loadingOverlay: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  processingText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  scanningIndicator: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  scanningText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.success + '20',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 24,
    gap: 12,
  },
  successText: {
    color: Colors.success,
    fontSize: 18,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  eventCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  eventImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  eventInfo: {
    gap: 8,
  },
  eventName: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  eventDateTime: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  eventDetail: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  label: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  eventDescription: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  ticketCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  ticketValue: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  totalAmount: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  experienceCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  experienceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  experienceLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  experienceValue: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  orderCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  orderValue: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: '600',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.withOpacity.white10,
  },
  scanAgainButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 25,
    gap: 12,
  },
  scanAgainText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '700',
  },
  cameraBackButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  cameraBackButtonInner: {
    backgroundColor: Colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
});