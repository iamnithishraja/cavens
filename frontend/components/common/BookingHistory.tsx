import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl,
  TouchableOpacity
} from "react-native";
import apiClient from "@/app/api/client";
import { Colors } from "@/constants/Colors";
import BookingCard from "@/components/ui/BookingCard";
import type { Order, BookingResponse } from "@/types/order";
import { Ionicons } from "@expo/vector-icons";

interface BookingHistoryProps {
  onBookingPress?: (booking: Order) => void;
  showHeader?: boolean;
}

export default function BookingHistory({ onBookingPress, showHeader = true }: BookingHistoryProps) {
  const [bookings, setBookings] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScannedBookings = async (isRefreshing = false) => {
    try {
      setError(null);
      if (!isRefreshing) {
        setLoading(true);
      }

      // Fetch bookings with status "scanned" (history)
      const response = await apiClient.get<BookingResponse>("/api/user/bookings/scanned");
      
      if (response.data.success && response.data.data.orders) {
        setBookings(response.data.data.orders);
      } else {
        setError("Failed to fetch booking history");
      }
    } catch (err: any) {
      console.error("Error fetching booking history:", err);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchScannedBookings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchScannedBookings(true);
  };

  const handleBookingPress = (booking: Order) => {
    if (onBookingPress) {
      onBookingPress(booking);
    } else {
      // Default behavior - navigate to event details
      console.log("Booking pressed:", booking._id);
    }
  };

  const renderBookingCard = ({ item }: { item: Order }) => (
    <BookingCard 
      booking={item} 
      onPress={() => handleBookingPress(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="time-outline" size={64} color={Colors.textSecondary} />
      <Text style={styles.emptyTitle}>No History Yet</Text>
      <Text style={styles.emptySubtitle}>
        Your scanned/attended events will appear here
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="warning-outline" size={48} color={Colors.error} />
      <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => fetchScannedBookings()}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading your history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Booking History</Text>
          <Text style={styles.headerSubtitle}>
            {bookings.length} {bookings.length === 1 ? 'event' : 'events'} attended
          </Text>
        </View>
      )}

      {error ? (
        renderErrorState()
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          bounces={true}
          alwaysBounceVertical={false}
          style={styles.flatList}
          removeClippedSubviews={false}
          maxToRenderPerBatch={10}
          windowSize={10}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.withOpacity.white10,
    backgroundColor: Colors.background,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  listContainer: {
    paddingVertical: 8,
    paddingBottom: 120,
    flexGrow: 1,
    minHeight: '100%',
  },
  flatList: {
    flex: 1,
    marginBottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
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
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
