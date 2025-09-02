import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { Colors } from '@/constants/Colors';

const ShowQRScreen = () => {
  const { orderId, eventName, ticketType, quantity, transactionId } = useLocalSearchParams<{
    orderId: string;
    eventName: string;
    ticketType: string;
    quantity: string;
    transactionId: string;
  }>();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for QR generation
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    router.back();
  };

  // Create QR code data with order information
  const qrData = JSON.stringify({
    orderId: orderId,
    eventName: eventName,
    ticketType: ticketType,
    quantity: quantity,
    transactionId: transactionId,
    timestamp: new Date().toISOString()
  });

  if (!orderId || !eventName || !ticketType || !quantity) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <LinearGradient colors={Colors.gradients.background as [string, string]} style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Invalid ticket data</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleBack}>
              <Text style={styles.retryButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <LinearGradient colors={Colors.gradients.background as [string, string]} style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ticket QR Code</Text>
          <View style={styles.spacer} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          
          {/* Event Info */}
          <View style={styles.eventInfo}>
            <Text style={styles.eventName}>{eventName}</Text>
            <Text style={styles.ticketType}>{ticketType}</Text>
          </View>

          {/* QR Code Display */}
          <View style={styles.qrContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Generating QR Code...</Text>
              </View>
            ) : (
              <View style={styles.qrCodeContainer}>
                {/* Real QR Code */}
                <View style={styles.qrCodeWrapper}>
                  <QRCode
                    value={qrData}
                    size={200}
                    color={Colors.textPrimary}
                    backgroundColor={Colors.background}
                    logoSize={30}
                    logoBackgroundColor={Colors.background}
                    logoBorderRadius={15}
                    logoMargin={2}
                    enableLinearGradient={false}
                  />
                </View>
                
                <Text style={styles.qrCodeSubtext}>Scan at entry</Text>
              </View>
            )}
          </View>

          {/* Validity Note */}
          <View style={styles.validityContainer}>
            <Text style={styles.validityTitle}>Important Note</Text>
            <Text style={styles.validityText}>
              This QR code is valid for {quantity} {parseInt(quantity) === 1 ? 'person' : 'people'} only.
            </Text>
            <Text style={styles.validitySubtext}>
              Present this QR code at the event entrance for entry.
            </Text>
          </View>

          {/* Transaction Info */}
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionLabel}>Transaction ID:</Text>
            <Text style={styles.transactionId}>
              {transactionId ? transactionId.slice(-8).toUpperCase() : 'N/A'}
            </Text>
          </View>

          {/* Order ID Info */}
          <View style={styles.orderInfo}>
            <Text style={styles.orderLabel}>Order ID:</Text>
            <Text style={styles.orderId}>
              {orderId ? orderId.slice(-8).toUpperCase() : 'N/A'}
            </Text>
          </View>

        </View>

      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  spacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  eventInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  eventName: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  ticketType: {
    color: Colors.textSecondary,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  qrCodeContainer: {
    alignItems: 'center',
  },
  qrCodeWrapper: {
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  qrCodeSubtext: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  validityContainer: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  validityTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  validityText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 22,
  },
  validitySubtext: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  transactionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  transactionLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  transactionId: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
  },
  orderLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  orderId: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ShowQRScreen;
