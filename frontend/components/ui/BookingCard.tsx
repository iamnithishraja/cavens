import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import type { Order } from '@/types/order';

interface BookingCardProps {
  booking: Order;
  onPress?: () => void;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onPress }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const formatPrice = (price: number) => {
    return `AED ${price.toFixed(2)}`;
  };

  const handleShowQR = () => {
    router.push({
      pathname: '/showQr',
      params: {
        orderId: booking._id,
        eventName: booking.event.name,
        ticketType: booking.ticket.name,
        quantity: booking.quantity.toString(),
        transactionId: booking.transactionId
      }
    });
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.eventInfo}>
          <Text style={styles.eventName} numberOfLines={2}>
            {booking.event.name}
          </Text>
          <Text style={styles.clubName}>
            {booking.club.name} • {booking.club.city}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, booking.isPaid ? styles.paidBadge : styles.pendingBadge]}>
            <Text style={[styles.statusText, booking.isPaid ? styles.paidText : styles.pendingText]}>
              {booking.isPaid ? 'Paid' : 'Pending'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date & Time:</Text>
          <Text style={styles.detailValue}>
            {formatDate(booking.event.date)} • {formatTime(booking.event.time)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Ticket Type:</Text>
          <Text style={styles.detailValue}>{booking.ticket.name}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Quantity:</Text>
          <Text style={styles.detailValue}>{booking.quantity}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total Price:</Text>
          <Text style={styles.totalPrice}>
            {formatPrice(booking.ticket.price * booking.quantity)}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={styles.transactionId}>
            TXN: {booking.transactionId.slice(-8).toUpperCase()}
          </Text>
          <Text style={styles.orderDate}>
            {formatDate(booking.createdAt)}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.qrButton}
          onPress={handleShowQR}
          activeOpacity={0.7}
        >
          <Text style={styles.qrButtonText}>Show QR</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventInfo: {
    flex: 1,
    marginRight: 12,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  clubName: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  paidBadge: {
    backgroundColor: Colors.success,
  },
  pendingBadge: {
    backgroundColor: Colors.warning,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paidText: {
    color: Colors.background,
  },
  pendingText: {
    color: Colors.textPrimary,
  },
  details: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 8,
  },
  totalPrice: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '700',
    textAlign: 'right',
    flex: 1,
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.withOpacity.white10,
  },
  footerLeft: {
    flex: 1,
  },
  transactionId: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  orderDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  qrButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  qrButtonText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BookingCard;
