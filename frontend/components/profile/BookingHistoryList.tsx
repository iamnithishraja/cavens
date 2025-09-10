import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity
} from "react-native";
import { Colors } from "@/constants/Colors";
import EventHistoryCard from "../common/EventHistoryCard";
import type { Order } from "@/types/order";
import { Ionicons } from "@expo/vector-icons";
import { useBookingsPolling } from "@/hooks/useBookingsPolling";

interface BookingHistoryListProps {
  onBookingPress?: (booking: Order) => void;
}

export default function BookingHistoryList({ onBookingPress }: BookingHistoryListProps) {
  const { 
    bookings, 
    loading, 
    error, 
    refresh
  } = useBookingsPolling({
    status: 'scanned',
    enabled: false, // Do not poll in history
    interval: 3000, // Poll every 3 seconds
  });

  const handleBookingPress = (booking: Order) => {
    if (onBookingPress) {
      onBookingPress(booking);
    } else {
      // Default behavior - navigate to event details
      console.log("Booking pressed:", booking._id);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading your history...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning-outline" size={48} color={Colors.error} />
        <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refresh()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (bookings.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="time-outline" size={64} color={Colors.textSecondary} />
        <Text style={styles.emptyTitle}>No History Yet</Text>
        <Text style={styles.emptySubtitle}>
          Your scanned/attended events will appear here
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {bookings.map((booking) => (
        <EventHistoryCard 
          key={booking._id}
          order={booking} 
          onPress={() => handleBookingPress(booking)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  emptyContainer: {
    paddingHorizontal: 40,
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorContainer: {
    paddingHorizontal: 40,
    paddingVertical: 60,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
    marginTop: 16,
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
