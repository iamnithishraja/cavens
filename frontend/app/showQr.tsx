import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Image,
  Animated,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

const ShowQRScreen = () => {
  const { orderId, eventName, ticketType, quantity, transactionId, eventImage } = useLocalSearchParams<{
    orderId: string;
    eventName: string;
    ticketType: string;
    quantity: string;
    transactionId: string;
    eventImage: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleFlip = () => {
    if (loading) return;

    const toValue = isFlipped ? 0 : 1;
    setIsFlipped(!isFlipped);

    Animated.timing(flipAnimation, {
      toValue,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const frontRotateY = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backRotateY = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
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
        
        {/* Enhanced Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.8}>
            <View style={styles.backButtonContent}>
              <Text style={styles.backButtonIcon}>←</Text>
              <Text style={styles.backButtonText}>Back</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Your Ticket</Text>
            <Text style={styles.headerSubtitle}>Digital Entry Pass</Text>
          </View>
          <View style={styles.spacer} />
        </View>

        {/* Enhanced Ticket Card Container */}
        <View style={styles.ticketContainer}>
          <TouchableOpacity onPress={handleFlip} activeOpacity={0.9} style={styles.cardContainer}>
            
            {/* Front Side - Ticket Details */}
            <Animated.View 
              style={[
                styles.cardSide,
                styles.frontSide,
                { transform: [{ rotateY: frontRotateY }] }
              ]}
            >
              <View style={styles.ticketCard}>
                {/* Card Header with Badge */}
                <View style={styles.cardHeader}>
                  <View style={styles.ticketBadge}>
                    <Text style={styles.ticketBadgeText}>TICKET</Text>
                  </View>
                  <View style={styles.statusIndicator}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>Valid</Text>
                  </View>
                </View>
                
                {/* Event Image with Enhanced Styling */}
                <View style={styles.eventImageContainer}>
                  {eventImage ? (
                    <Image 
                      source={{ uri: eventImage }} 
                      style={styles.eventImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Text style={styles.placeholderText}>🎫</Text>
                    </View>
                  )}
                  <View style={styles.imageOverlay} />
                </View>

                {/* Enhanced Event Info */}
                <View style={styles.eventInfo}>
                  <Text style={styles.eventName} numberOfLines={2}>
                    {eventName}
                  </Text>
                  <View style={styles.eventMeta}>
                    <View style={styles.datePill}>
                      <Text style={styles.datePillText}>
                        {new Date().toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </Text>
                    </View>
                    <Text style={styles.eventTime}>
                      {new Date().toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Text>
                  </View>
                </View>

                {/* Enhanced Ticket Information */}
                <View style={styles.ticketInfo}>
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Ticket Details</Text>
                    <View style={styles.infoGrid}>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Type</Text>
                        <Text style={styles.infoValue} numberOfLines={1}>
                          {ticketType.length > 15 ? `${ticketType.substring(0, 15)}...` : ticketType}
                        </Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Quantity</Text>
                        <Text style={styles.infoValue}>{quantity}</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Order ID</Text>
                        <Text style={styles.infoValue} numberOfLines={1}>
                          {orderId ? `${orderId.slice(0, 8)}...` : 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Transaction</Text>
                        <Text style={styles.infoValue} numberOfLines={1}>
                          {transactionId ? `${transactionId.slice(0, 6)}...` : 'N/A'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Enhanced Flip Hint */}
                <View style={styles.flipHint}>
                  <View style={styles.flipHintIcon}>
                    <Text style={styles.flipHintIconText}>👆</Text>
                  </View>
                  <Text style={styles.flipHintText}>Tap to reveal QR code</Text>
                </View>

              </View>
            </Animated.View>

            {/* Back Side - QR Code */}
            <Animated.View 
              style={[
                styles.cardSide,
                styles.backSide,
                { transform: [{ rotateY: backRotateY }] }
              ]}
            >
              <View style={styles.qrCard}>
                {/* QR Header */}
                <View style={styles.qrHeader}>
                  <Text style={styles.qrTitle}>Entry QR Code</Text>
                  <Text style={styles.qrSubtitle}>{eventName}</Text>
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
                      <View style={styles.qrCodeWrapper}>
                        <QRCode
                          value={`${orderId}-${transactionId}`}
                          size={200}
                          color={Colors.background}
                          backgroundColor={Colors.textPrimary}
                        />
                      </View>
                      <Text style={styles.qrCodeSubtext}>Scan at entry</Text>
                    </View>
                  )}
                </View>

                {/* Validity Info */}
                <View style={styles.validityInfo}>
                  <Text style={styles.validityText}>✓ Valid for entry</Text>
                </View>

                {/* Flip Back Hint */}
                <View style={styles.flipHint}>
                  <View style={styles.flipHintIcon}>
                    <Text style={styles.flipHintIconText}>👆</Text>
                  </View>
                  <Text style={styles.flipHintText}>Tap to see ticket details</Text>
                </View>

              </View>
            </Animated.View>

          </TouchableOpacity>
        </View>

      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
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
    marginBottom: 8,
  },
  backButton: {
    backgroundColor: Colors.backgroundTertiary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backButtonIcon: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
    opacity: 0.8,
  },
  spacer: {
    width: 80,
  },
  ticketContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  cardContainer: {
    height: 620,
    position: 'relative',
  },
  cardSide: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
  },
  frontSide: {
    // Front side styling
  },
  backSide: {
    // Back side styling  
  },
  ticketCard: {
    flex: 1,
    borderRadius: 28,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.withOpacity.white10,
  },
  ticketBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ticketBadgeText: {
    color: Colors.button.text,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  statusText: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: '600',
  },
  eventImageContainer: {
    position: 'relative',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 220,
    borderRadius: 20,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  placeholderImage: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.withOpacity.white10,
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: Colors.textSecondary,
    fontSize: 32,
    fontWeight: '400',
  },
  eventInfo: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  eventName: {
    color: Colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 12,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  datePill: {
    backgroundColor: Colors.withOpacity.primary10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.withOpacity.primary10,
  },
  datePillText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  eventTime: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  ticketInfo: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  infoSection: {
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoItem: {
    flex: 1,
    minWidth: '45%',
  },
  infoLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  flipHint: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  flipHintIcon: {
    marginBottom: 8,
  },
  flipHintIconText: {
    fontSize: 24,
  },
  flipHintText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
    textAlign: 'center',
  },
  qrCard: {
    flex: 1,
    borderRadius: 28,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  qrHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  qrTitle: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  qrSubtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
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
    backgroundColor: Colors.textPrimary,
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  qrCodeSubtext: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  validityInfo: {
    backgroundColor: Colors.withOpacity.primary10,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.withOpacity.primary10,
  },
  validityText: {
    color: Colors.success,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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
    color: Colors.button.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ShowQRScreen;