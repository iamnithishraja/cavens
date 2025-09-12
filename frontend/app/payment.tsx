import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import apiClient from '@/app/api/client';
import TicketCounter from '../components/ui/TicketCounter';

type TicketType = {
  _id?: string;
  name: string;
  price: number;
  description: string;
  quantityAvailable: number;
  quantitySold: number;
};

type PurchaseTicketRequest = {
  eventId: string;
  ticketType: string;
  quantity: number;
};

type PurchaseTicketResponse = {
  success: boolean;
  message: string;
  data: {
    ordersCreated: number;
    ordersUpdated: number;
    ticketType: string;
    pricePerTicket: number;
    totalAmount: number;
    finalQuantity: number;
    event: {
      id: string;
      name: string;
      date: string;
      time: string;
    };
    club: {
      id: string;
      name: string;
      city: string;
    };
    order: {
      id: string;
      transactionId: string;
      isPaid: boolean;
      quantity: number;
      createdAt: string;
      updatedAt: string;
    } | null;
  };
};

const PaymentScreen = () => {
  const { eventId, eventName, eventDate, eventTime, tickets, coverImage } = useLocalSearchParams<{
    eventId: string;
    eventName: string;
    eventDate: string;
    eventTime: string;
    tickets: string;
    coverImage?: string;
  }>();

  const [purchasing, setPurchasing] = useState(false);
  const [selectedTicketType, setSelectedTicketType] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  // Parse tickets from navigation params
  const eventTickets: TicketType[] = useMemo(() => {
    try {
      return tickets ? JSON.parse(tickets) : [];
    } catch {
      return [];
    }
  }, [tickets]);

  // Set default ticket type to first available ticket
  useEffect(() => {
    if (eventTickets.length > 0) {
      const firstAvailableTicket = eventTickets.find(ticket => 
        (ticket.quantityAvailable - ticket.quantitySold) > 0
      );
      if (firstAvailableTicket) {
        setSelectedTicketType(firstAvailableTicket.name);
      }
    }
  }, [eventTickets]);

  // Get selected ticket details
  const selectedTicket = eventTickets.find(ticket => ticket.name === selectedTicketType);
  const availableTickets = selectedTicket ? selectedTicket.quantityAvailable - selectedTicket.quantitySold : 0;
  const totalAmount = selectedTicket ? selectedTicket.price * quantity : 0;

  // Handle ticket purchase
  const handlePurchase = async () => {
    if (!selectedTicket) {
      Alert.alert('Error', 'Please select a ticket type');
      return;
    }

    if (quantity > availableTickets) {
      Alert.alert('Error', `Only ${availableTickets} tickets available`);
      return;
    }

    setPurchasing(true);
    try {
      const purchaseData: PurchaseTicketRequest = {
        eventId: eventId!,
        ticketType: selectedTicketType,
        quantity: quantity
      };

      const response = await apiClient.post<PurchaseTicketResponse>('/api/user/purchase-ticket', purchaseData);
      
      if (response.data.success) {
        const { totalAmount } = response.data.data;
        router.navigate('/userTabs/bookings');
      } else {
        Alert.alert('Purchase Failed', response.data.message || 'Something went wrong');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to purchase tickets. Please try again.';
      Alert.alert('Purchase Failed', errorMessage);
    } finally {
      setPurchasing(false);
    }
  };

  if (!eventId || !eventName || eventTickets.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top','bottom']}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <LinearGradient colors={Colors.gradients.background as [string, string]} style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Invalid event data</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
              <Text style={styles.retryButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top','bottom']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Buy Tickets</Text>
          <View style={styles.spacer} />
        </View>

        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          {/* Event Info */}
          <View style={styles.eventInfoContainer}>
            <View style={styles.eventRow}>
              {!!coverImage && (
                <Image source={{ uri: String(coverImage) }} style={styles.eventImage} resizeMode="cover" />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.eventName} numberOfLines={2}>{eventName}</Text>
                <Text style={styles.eventDate}>{eventDate} • {eventTime}</Text>
              </View>
            </View>
          </View>

          {/* Ticket Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Ticket Type</Text>
            <View style={styles.ticketOptions}>
              {eventTickets.map((ticket, index) => {
                const available = ticket.quantityAvailable - ticket.quantitySold;
                const isSelected = selectedTicketType === ticket.name;
                const isAvailable = available > 0;
                
                return (
                  <TouchableOpacity
                    key={ticket._id || `${ticket.name}-${index}`}
                    style={[
                      styles.ticketOption,
                      isSelected && styles.selectedTicketOption,
                      !isAvailable && styles.unavailableTicketOption
                    ]}
                    onPress={() => isAvailable && setSelectedTicketType(ticket.name)}
                    disabled={!isAvailable}
                  >
                    <View style={styles.ticketOptionLeft}>
                      <Text style={[styles.ticketOptionName, isSelected && styles.selectedTicketText]}>
                        {ticket.name}
                      </Text>
                      <Text style={styles.ticketOptionDescription}>{ticket.description}</Text>
                      <Text style={[styles.ticketAvailability, !isAvailable && styles.unavailableText]}>
                        {isAvailable ? `${available} available` : 'Sold Out'}
                      </Text>
                    </View>
                    <Text style={[styles.ticketOptionPrice, isSelected && styles.selectedTicketText]}>
                      AED {ticket.price}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Quantity Selection */}
          {selectedTicket && availableTickets > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Number of Tickets</Text>
              <TicketCounter
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={Math.min(10, availableTickets)}
              />
            </View>
          )}

          {/* Price Summary */}
          {selectedTicket && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order Summary</Text>
              <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{selectedTicket.name} × {quantity}</Text>
                  <Text style={styles.summaryValue}>AED {selectedTicket.price * quantity}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>AED {totalAmount}</Text>
                </View>
              </View>
            </View>
          )}
                      <TouchableOpacity
              style={[styles.purchaseButton, purchasing && styles.purchaseButtonDisabled]}
              onPress={handlePurchase}
              disabled={purchasing}
            >
              {purchasing ? (
                <ActivityIndicator size="small" color={Colors.textPrimary} />
              ) : (
                <Text style={styles.purchaseButtonText}>
                  Confirm Payment • AED {totalAmount}
                </Text>
              )}
            </TouchableOpacity>
        </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    color: Colors.textPrimary,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  retryButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.withOpacity.black60,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    zIndex: -1,
  },
  spacer: {
    width: 80,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  eventInfoContainer: {
    backgroundColor: Colors.withOpacity.white10,
    borderRadius: 16,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  eventImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: Colors.backgroundSecondary,
  },
  eventName: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  eventDate: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
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
  ticketOptions: {
    gap: 12,
  },
  ticketOption: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.withOpacity.white10,
  },
  selectedTicketOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.withOpacity.primary10,
  },
  unavailableTicketOption: {
    opacity: 0.5,
    backgroundColor: Colors.backgroundTertiary,
  },
  ticketOptionLeft: {
    flex: 1,
  },
  ticketOptionName: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  selectedTicketText: {
    color: Colors.primary,
  },
  ticketOptionDescription: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 6,
  },
  ticketAvailability: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  unavailableText: {
    color: Colors.error,
  },
  ticketOptionPrice: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'right',
  },
  summaryContainer: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  summaryValue: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.withOpacity.white10,
    marginVertical: 12,
  },
  totalLabel: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  totalValue: {
    color: Colors.primary,
    fontSize: 20,
    fontWeight: '700',
  },
  purchaseButton: {
    backgroundColor: Colors.primary,
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  purchaseButtonDisabled: {
    opacity: 0.6,
  },
  purchaseButtonText: {
    color: Colors.button.text,
    fontSize: 18,
    fontWeight: '700',
  },
});

export default PaymentScreen;