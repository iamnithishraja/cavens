import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl,
  SafeAreaView,
  StatusBar 
} from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { Colors } from "@/constants/Colors";
import BookingCard from "@/components/ui/BookingCard";
import FloatingChatButton from "@/components/ui/FloatingChatButton";
import type { Order } from "@/types/order";
import { useBookingsPolling } from "@/hooks/useBookingsPolling";
import { store } from '@/utils';

export default function BookingsScreen() {
  const [isScreenFocused, setIsScreenFocused] = useState(false);

  const { 
    bookings, 
    loading, 
    error, 
    refresh, 
    refreshing
  } = useBookingsPolling({
    status: 'paid',
    enabled: isScreenFocused, // Only poll when screen is focused
    interval: 3000, // Poll every 3 seconds
  });

  // Handle screen focus/blur to control polling
  useFocusEffect(
    React.useCallback(() => {
      console.log('📱 BookingsScreen focused - starting polling');
      setIsScreenFocused(true);
      
      return () => {
        console.log('📱 BookingsScreen blurred - stopping polling');
        setIsScreenFocused(false);
      };
    }, [])
  );

  const onRefresh = () => {
    refresh();
  };

  const handleBookingPress = (booking: Order) => {
    // TODO: Navigate to booking details or event details
    console.log("Booking pressed:", booking._id);
  };

  const handleChatButtonPress = async () => {
    // Get the selected city from store, default to Dubai
    const selectedCity = await store.get('selectedCity') || 'Dubai';
    
    router.push({
      pathname: '/chatbot',
      params:{
        Screen:'BOOKINGS',
        city: selectedCity,
        hasBookings: bookings.length > 0 ? 'true' : 'false'
      }
    }
    )
  };

  const renderBookingCard = ({ item }: { item: Order }) => (
    <BookingCard 
      booking={item} 
      onPress={() => handleBookingPress(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🎫</Text>
      <Text style={styles.emptyTitle}>No Bookings Yet</Text>
      <Text style={styles.emptySubtitle}>
        Your event bookings will appear here once you purchase tickets
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
      <Text style={styles.errorMessage}>{error}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Bookings</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your bookings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <Text style={styles.headerSubtitle}>
          {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
        </Text>
      </View>

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

      <FloatingChatButton onPress={handleChatButtonPress} /> 
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingBottom: 0, // Ensure no extra padding at bottom
    minHeight: '100%', // Ensure container takes full height
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 20, // Add extra bottom padding to header
    borderBottomWidth: 1,
    borderBottomColor: Colors.withOpacity.white10,
    backgroundColor: Colors.background, // Ensure header stays above list
    zIndex: 1, // Ensure header stays above list
  },
  headerTitle: {
    fontSize: 28,
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
    paddingBottom: 120, // Increased bottom padding to ensure last card is fully visible
    flexGrow: 1,
    minHeight: '100%', // Ensure container takes full height
  },
  flatList: {
    flex: 1,
    marginBottom: 0, // Ensure no extra margin
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
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
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
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});