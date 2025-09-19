import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

interface ChatbotBookingCardProps {
  booking: {
    id: string;
    bookingId: string;
    name: string;
    description?: string;
    date: string;
    time: string;
    venue: string;
    city: string;
    djArtists?: string;
    coverImage?: string;
    // Booking-specific fields
    bookingStatus: 'paid' | 'scanned';
    quantity: number;
    ticketType: string;
    ticketPrice: number;
    transactionId?: string;
    isPaid: boolean;
  };
  onPress?: () => void;
}

const { width } = Dimensions.get('window');
const cardWidth = width * 0.75; // 75% of screen width

const ChatbotBookingCard: React.FC<ChatbotBookingCardProps> = ({ booking, onPress }) => {
  const isPaid = booking.bookingStatus === 'paid';
  const isScanned = booking.bookingStatus === 'scanned';

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
    // For booking cards, we don't navigate to event details
    // Instead, we could show QR code or booking details
    console.log('Booking card pressed:', booking.bookingId);
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width: cardWidth }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[Colors.backgroundSecondary, Colors.backgroundTertiary]}
        style={styles.card}
      >
        {/* Header with booking status */}
        <View style={styles.header}>
          <View style={styles.leftHeader}>
            <View style={[
              styles.bookingStatusBadge,
              isPaid ? styles.paidBadge : styles.scannedBadge
            ]}>
              <Text style={styles.bookingStatusText}>
                {isPaid ? '✅ Ready to Use' : '📱 Already Used'}
              </Text>
            </View>
          </View>
          <Text style={styles.venueText}>{booking.venue}</Text>
        </View>

        {/* Event Image */}
        <View style={styles.imageContainer}>
          {booking.coverImage ? (
            <Image 
              source={{ uri: booking.coverImage }} 
              style={styles.eventImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>🎉</Text>
            </View>
          )}
        </View>

        {/* Event Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.eventName} numberOfLines={2}>
            {booking.name}
          </Text>
          
          {booking.djArtists && (
            <Text style={styles.djText} numberOfLines={1}>
              🎵 {booking.djArtists}
            </Text>
          )}

          <View style={styles.dateTimeContainer}>
            <Text style={styles.dateText}>
              📅 {booking.date}
            </Text>
            <Text style={styles.timeText}>
              🕒 {booking.time}
            </Text>
          </View>

          {/* Booking Details */}
          <View style={styles.bookingDetailsContainer}>
            <Text style={styles.bookingDetailsText}>
              🎫 {booking.quantity}x {booking.ticketType} - AED {booking.ticketPrice}
            </Text>
            {booking.transactionId && (
              <Text style={styles.transactionText}>
                ID: {booking.transactionId}
              </Text>
            )}
          </View>

          {/* Action Hint */}
          {isPaid && (
            <View style={styles.actionHintContainer}>
              <Text style={styles.actionHintText}>
                📱 Tap to view QR code for entry
              </Text>
            </View>
          )}
          
          {isScanned && (
            <View style={styles.usedHintContainer}>
              <Text style={styles.usedHintText}>
                ✅ Ticket has been scanned at the venue
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footerContainer}>
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>📍 {booking.city}</Text>
          </View>
          
          <View style={styles.bookingIdContainer}>
            <Text style={styles.bookingIdText}>
              #{booking.bookingId.slice(-6)}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 8,
    marginVertical: 4,
  },
  card: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bookingStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paidBadge: {
    backgroundColor: '#4CAF50',
  },
  scannedBadge: {
    backgroundColor: '#FF9800',
  },
  bookingStatusText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  venueText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  imageContainer: {
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.withOpacity.white10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
    opacity: 0.5,
  },
  detailsContainer: {
    flex: 1,
  },
  eventName: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    lineHeight: 20,
  },
  djText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  timeText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  bookingDetailsContainer: {
    marginBottom: 8,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  bookingDetailsText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '500',
  },
  actionHintContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  actionHintText: {
    color: '#4CAF50',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  usedHintContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.3)',
  },
  usedHintText: {
    color: '#FF9800',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  locationContainer: {
    flex: 1,
  },
  locationText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  bookingIdContainer: {
    backgroundColor: Colors.withOpacity.white10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bookingIdText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '500',
  },
});

export default ChatbotBookingCard;
