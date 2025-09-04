import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import type { Order } from '@/types/order';

interface EventHistoryCardProps {
  order: Order;
  onPress?: (order: Order) => void;
}

export default function EventHistoryCard({ order, onPress }: EventHistoryCardProps) {
  const handlePress = () => {
    if (onPress) {
      onPress(order);
    }
  };

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

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Event Image */}
      {order.event?.coverImage && (
        <Image 
          source={{ uri: order.event.coverImage }} 
          style={styles.eventImage}
          resizeMode="cover"
        />
      )}
      
      {/* Content Container */}
      <View style={styles.content}>
        {/* Event Header */}
        <View style={styles.eventHeader}>
          <View style={styles.eventInfo}>
            <Text style={styles.eventName} numberOfLines={2}>
              {order.event?.name || 'Event Name'}
            </Text>
            <View style={styles.eventMeta}>
              <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.eventDate}>
                {order.event?.date ? formatDate(order.event.date) : 'Date not available'}
              </Text>
            </View>
            <View style={styles.eventMeta}>
              <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.eventTime}>
                {order.event?.time ? formatTime(order.event.time) : 'Time not available'}
              </Text>
            </View>
          </View>
          
          {/* Status Badge */}
          <View style={styles.statusContainer}>
            <View style={styles.statusBadge}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
              <Text style={styles.statusText}>Attended</Text>
            </View>
          </View>
        </View>

        {/* Event Details */}
        <View style={styles.eventDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color={Colors.primary} />
            <Text style={styles.detailText} numberOfLines={1}>
              {order.club?.name || 'Club Name'}
            </Text>
          </View>
          
          {order.event?.city && (
            <View style={styles.detailRow}>
              <Ionicons name="map-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.detailText} numberOfLines={1}>
                {order.event.city}
              </Text>
            </View>
          )}
        </View>

        {/* Ticket Summary */}
        <View style={styles.ticketSummary}>
          <View style={styles.ticketInfo}>
            <Text style={styles.ticketLabel}>Ticket Type:</Text>
            <Text style={styles.ticketValue}>{order.ticket?.name || 'Standard'}</Text>
          </View>
          <View style={styles.ticketInfo}>
            <Text style={styles.ticketLabel}>Quantity:</Text>
            <Text style={styles.ticketValue}>{order.quantity}</Text>
          </View>
          <View style={styles.ticketInfo}>
            <Text style={styles.ticketLabel}>Total Paid:</Text>
            <Text style={styles.totalAmount}>
              AED {(order.ticket?.price * order.quantity).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Scan Time */}
        <View style={styles.scanTimeContainer}>
          <Ionicons name="time" size={14} color={Colors.textSecondary} />
          <Text style={styles.scanTimeText}>
            Scanned on {new Date(order.updatedAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Right Arrow */}
      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  eventImage: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.backgroundTertiary,
  },
  content: {
    padding: 16,
  },
  eventHeader: {
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
    marginBottom: 8,
    lineHeight: 22,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  eventDate: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  eventTime: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventDetails: {
    marginBottom: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  ticketSummary: {
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  ticketInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  ticketValue: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '700',
  },
  scanTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.withOpacity.white10,
  },
  scanTimeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  arrowContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
