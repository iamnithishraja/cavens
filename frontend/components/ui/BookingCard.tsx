import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Animated, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import type { Order } from '@/types/order';
import QRCode from 'react-native-qrcode-svg';

interface BookingCardProps {
  booking: Order;
  onPress?: () => void;
}

const { width } = Dimensions.get('window');

const BookingCard: React.FC<BookingCardProps> = ({ booking, onPress }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    return { day, month, weekday };
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const formatPrice = (price: number) => {
    return `AED ${price.toFixed(0)}`;
  };

  const handleFlip = () => {
    if (loading) return;

    const toValue = isFlipped ? 0 : 1;
    setIsFlipped(!isFlipped);

    // Scale animation for premium feel
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(flipAnimation, {
          toValue,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const frontRotateY = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backRotateY = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const isUpcoming = new Date(booking.event.date) > new Date();
  const dateInfo = formatDate(booking.event.date);

  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity
        onPress={handleFlip}
        activeOpacity={0.95}
      >
        <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleAnimation }] }]}>
          {/* Front Side - Booking Details */}
          <Animated.View
            style={[
              styles.cardSide,
              styles.frontSide,
              { transform: [{ rotateY: frontRotateY }] }
            ]}
          >
        {/* Main Card with Gradient Background */}
        <LinearGradient
          colors={Colors.gradients.background as [string, string]}
          style={styles.card}
        >
          {/* Top Section with Image and Overlay Info */}
          <View style={styles.topSection}>
            <View style={styles.imageContainer}>
              {booking.event.coverImage || booking.event.image ? (
                <>
                  <Image 
                    source={{ uri: booking.event.coverImage || booking.event.image }} 
                    style={styles.eventImage}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.imageOverlay}
                  />
                </>
              ) : (
                <LinearGradient
                  colors={Colors.gradients.blue as [string, string]}
                  style={styles.placeholderImage}
                >
                  <Text style={styles.placeholderText}>🎵</Text>
                </LinearGradient>
              )}
            </View>


            {/* Status Badge - Top Right */}
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusDot, 
                booking.isPaid ? styles.statusPaid : styles.statusPending
              ]} />
              <Text style={styles.statusText}>
                {booking.isPaid ? 'Confirmed' : 'Pending'}
              </Text>
            </View>
          </View>

          {/* Content Section */}
          <View style={styles.contentSection}>
            {/* Event Title and Venue */}
            <View style={styles.titleSection}>
              <Text style={styles.eventTitle} numberOfLines={2}>
                {booking.event.name}
              </Text>
              <Text style={styles.venueText} numberOfLines={1}>
                📍 {booking.club.name}, {booking.club.city}
              </Text>
              <Text style={styles.timeText}>
                🕒 {dateInfo.weekday} • {formatTime(booking.event.time)}
              </Text>
            </View>

            {/* Ticket Details Row */}
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Ticket</Text>
                <Text style={styles.detailValue} numberOfLines={1}>
                  {booking.ticket.name}
                </Text>
              </View>
              
              <View style={styles.detailDivider} />
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Qty</Text>
                <Text style={styles.detailValue}>{booking.quantity}</Text>
              </View>
              
              <View style={styles.detailDivider} />
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Total</Text>
                <Text style={styles.priceValue}>
                  {formatPrice(booking.ticket.price * booking.quantity)}
                </Text>
              </View>
            </View>

            {/* Bottom Row - Transaction Info & QR Button */}
            <View style={styles.bottomRow}>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionText}>
                  #{booking.transactionId.slice(-6).toUpperCase()}
                </Text>
                <Text style={styles.bookingDate}>
                  {formatDate(booking.createdAt).day} {formatDate(booking.createdAt).month}
                </Text>
              </View>

              {/* Flip Hint */}
              <View style={styles.flipHint}>
                <Text style={styles.flipHintIcon}>🔄</Text>
                <Text style={styles.flipHintText}>Tap to view QR</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
          </Animated.View>

          {/* Back Side - QR Code */}
          <Animated.View
            style={[
              styles.cardSide,
              styles.backSide,
              { transform: [{ rotateY: backRotateY }] }
            ]}
          >
            <LinearGradient
              colors={Colors.gradients.background as [string, string]}
              style={styles.card}
            >
              <View style={styles.qrContainer}>
                <View style={styles.qrHeader}>
                  <Text style={styles.qrTitle}>Entry QR Code</Text>
                  <Text style={styles.qrSubtitle}>{booking.event.name}</Text>
                </View>

                <View style={styles.qrDisplay}>
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color={Colors.primary} />
                      <Text style={styles.loadingText}>Generating QR Code...</Text>
                    </View>
                  ) : (
                    <View style={styles.qrCodeWrapper}>
                      <QRCode
                        value={`${booking._id}-${booking.transactionId}`}
                        size={180}
                        color={Colors.background}
                        backgroundColor={Colors.textPrimary}
                      />
                    </View>
                  )}
                </View>

                <View style={styles.qrInfo}>
                  <Text style={styles.scanText}>Scan at entry</Text>
                  <View style={styles.ticketDetails}>
                    <Text style={styles.detailText}>{booking.ticket.name} × {booking.quantity}</Text>
                    <Text style={styles.detailText}>#{booking.transactionId.slice(-6).toUpperCase()}</Text>
                  </View>

                  {/* Flip Back Hint */}
                  <View style={styles.flipBackHint}>
                    <Text style={styles.flipHintIcon}>🔄</Text>
                    <Text style={styles.flipHintText}>Tap to see details</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Subtle Border Glow */}
          <View style={styles.borderGlow} />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  cardContainer: {
    position: 'relative',
    height: 400, // Fixed height for consistent card size
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
  card: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  borderGlow: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.withOpacity.primary10,
    zIndex: -1,
  },
  topSection: {
    height: 120,
    position: 'relative',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  statusContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.withOpacity.black80,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusPaid: {
    backgroundColor: Colors.success,
  },
  statusPending: {
    backgroundColor: Colors.warning,
  },
  statusText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  contentSection: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  titleSection: {
    flex: 1,
    marginBottom: 16,
  },
  eventTitle: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
    marginBottom: 8,
  },
  venueText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  timeText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  detailsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailDivider: {
    width: 1,
    backgroundColor: Colors.withOpacity.white10,
    marginHorizontal: 12,
  },
  detailLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailValue: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  priceValue: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  bookingDate: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  flipHint: {
    alignItems: 'center',
    marginLeft: 16,
  },
  flipHintIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  flipHintText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  qrContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  qrHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  qrSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  qrDisplay: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrCodeWrapper: {
    backgroundColor: Colors.textPrimary,
    padding: 16,
    borderRadius: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 12,
    fontWeight: '500',
  },
  qrInfo: {
    alignItems: 'center',
  },
  flipBackHint: {
    marginTop: 16,
    alignItems: 'center',
  },
  scanText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  ticketDetails: {
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default BookingCard;