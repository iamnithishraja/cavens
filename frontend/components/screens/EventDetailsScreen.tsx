import React, { useMemo, useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import Background from "../common/Background";
import BookingActions from "@/components/event/BookingActions";
import CurrencyAED from "@/components/event/CurrencyAED";
import type { EventItem } from "@/components/event/types";
import apiClient from "@/app/api/client";

type Props = {
  event?: EventItem; // Make event optional for backward compatibility
  eventId?: string; // New prop for fetching event details
  onGoBack?: () => void;
};

type EventDetailsResponse = {
  success: boolean;
  data: EventItem;
};

const EventDetailsScreen: React.FC<Props> = ({ event: initialEvent, eventId, onGoBack }) => {
  const [event, setEvent] = useState<EventItem | null>(initialEvent || null);
  const [loading, setLoading] = useState<boolean>(!initialEvent && !!eventId);
  const [error, setError] = useState<string | null>(null);

  // Fetch event details if eventId is provided but no initial event
  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId || initialEvent) return; // Skip if we already have event data
      
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching event details for ID:", eventId, "using public user route");
        
        const response = await apiClient.get<EventDetailsResponse>(`/api/user/event/${eventId}`);
        
        if (response.data.success && response.data.data) {
          setEvent(response.data.data);
          console.log("Event details fetched:", response.data.data);
          console.log("Menu Items:", response.data.data.menuItems?.length || 0);
          console.log("Gallery Photos:", response.data.data.galleryPhotos?.length || 0);
          console.log("Promo Videos:", response.data.data.promoVideos?.length || 0);
          console.log("Tickets:", response.data.data.tickets?.length || 0);
        } else {
          setError("Failed to load event details");
        }
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError("Failed to load event details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId, initialEvent]);

  const lowestTicket = useMemo(() => {
    if (!event || !event.tickets || event.tickets.length === 0) return 0;
    return Math.min(...event.tickets.map((t) => t.price));
  }, [event]);

  // Show loading state
  if (loading) {
    return (
      <Background>
        <View style={styles.centerContent}>
          {/* Go Back Button */}
          <TouchableOpacity 
            style={[styles.backButton, { position: 'absolute', top: 60, left: 16, zIndex: 10 }]} 
            onPress={onGoBack}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.backgroundSecondary, Colors.backgroundTertiary]}
              style={styles.backButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Image 
                source={{ uri: "https://img.icons8.com/ios-filled/50/FFFFFF/back.png" }} 
                style={styles.backIcon} 
              />
              <Text style={styles.backText}>Back</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <ActivityIndicator size="large" color={Colors.blueAccent} />
          <Text style={styles.loadingText}>Loading event details...</Text>
        </View>
      </Background>
    );
  }

  // Show error state
  if (error || !event) {
    return (
      <Background>
        <View style={styles.centerContent}>
          {/* Go Back Button */}
          <TouchableOpacity 
            style={[styles.backButton, { position: 'absolute', top: 60, left: 16, zIndex: 10 }]} 
            onPress={onGoBack}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.backgroundSecondary, Colors.backgroundTertiary]}
              style={styles.backButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Image 
                source={{ uri: "https://img.icons8.com/ios-filled/50/FFFFFF/back.png" }} 
                style={styles.backIcon} 
              />
              <Text style={styles.backText}>Back</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <Image 
            source={{ uri: "https://img.icons8.com/ios/100/CCCCCC/error.png" }}
            style={styles.errorIcon}
          />
          <Text style={styles.errorText}>{error || "Event not found"}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setLoading(true);
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </Background>
    );
  }

  return (
    <Background>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Go Back Button */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={onGoBack}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[Colors.backgroundSecondary, Colors.backgroundTertiary]}
            style={styles.backButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Image 
              source={{ uri: "https://img.icons8.com/ios-filled/50/FFFFFF/back.png" }} 
              style={styles.backIcon} 
            />
            <Text style={styles.backText}>Back</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.heroImage}>
          <Image source={{ uri: event.coverImage }} style={styles.coverImage} />
        </View>
        <View style={styles.pad}>
          <Text style={styles.name}>{event.name}</Text>
          <Text style={styles.meta}>{event.djArtists}</Text>
          <Text style={styles.meta}>{event.date} • {event.time}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.pricePrefix}>From</Text>
            <CurrencyAED amount={lowestTicket} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.body}>{event.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Guest Experience</Text>
            <Text style={styles.body}>Dress Code: {event.guestExperience.dressCode}</Text>
            <Text style={styles.body}>Entry Rules: {event.guestExperience.entryRules}</Text>
            <Text style={styles.body}>Parking: {event.guestExperience.parkingInfo}</Text>
            <Text style={styles.body}>Accessibility: {event.guestExperience.accessibilityInfo}</Text>
          </View>

          {event.happyHourTimings && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Happy Hour</Text>
              <Text style={styles.body}>{event.happyHourTimings}</Text>
            </View>
          )}

          {/* Menu Items Section */}
          {event.menuItems && event.menuItems.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Menu Items</Text>
              <View style={styles.menuGrid}>
                {event.menuItems.map((item, index) => (
                  <View key={item._id || index} style={styles.menuItem}>
                    {item.itemImage && (
                      <Image source={{ uri: item.itemImage }} style={styles.menuItemImage} />
                    )}
                    <View style={styles.menuItemInfo}>
                      <Text style={styles.menuItemName}>{item.name}</Text>
                      <Text style={styles.menuItemDescription}>{item.description}</Text>
                      <View style={styles.menuItemPriceRow}>
                        <Text style={styles.menuItemCategory}>{item.category}</Text>
                        <Text style={styles.menuItemPrice}>AED {item.price}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Gallery Photos Section */}
          {event.galleryPhotos && event.galleryPhotos.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Gallery</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryContainer}>
                {event.galleryPhotos.map((photo, index) => (
                  <TouchableOpacity key={index} style={styles.galleryImageContainer}>
                    <Image source={{ uri: photo }} style={styles.galleryImage} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Promo Videos Section */}
          {event.promoVideos && event.promoVideos.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Promo Videos</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.videoContainer}>
                {event.promoVideos.map((video, index) => (
                  <TouchableOpacity key={index} style={styles.videoThumbnailContainer}>
                    {/* For now, we'll show a placeholder. You can integrate a video player later */}
                    <View style={styles.videoPlaceholder}>
                      <Image 
                        source={{ uri: "https://img.icons8.com/ios-filled/100/FFFFFF/play-button-circled.png" }}
                        style={styles.playIcon}
                      />
                      <Text style={styles.videoText}>Video {index + 1}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Tickets Section */}
          {event.tickets && event.tickets.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tickets</Text>
              <View style={styles.ticketsContainer}>
                {event.tickets.map((ticket, index) => (
                  <View key={ticket._id || index} style={styles.ticketItem}>
                    <View style={styles.ticketInfo}>
                      <Text style={styles.ticketName}>{ticket.name}</Text>
                      <Text style={styles.ticketDescription}>{ticket.description}</Text>
                      <Text style={styles.ticketAvailability}>
                        Available: {ticket.quantityAvailable - ticket.quantitySold} / {ticket.quantityAvailable}
                      </Text>
                    </View>
                    <View style={styles.ticketPriceContainer}>
                      <Text style={styles.ticketPrice}>AED {ticket.price}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          <BookingActions onBookTickets={() => {}} onBookTable={() => {}} />
        </View>
      </ScrollView>
    </Background>
  );
};

const styles = StyleSheet.create({
  container: { paddingBottom: 24 },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 1000,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.blueAccent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  backButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
    tintColor: Colors.textPrimary,
  },
  backText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  heroImage: { width: "100%", height: 250, backgroundColor: Colors.backgroundSecondary },
  coverImage: { width: "100%", height: "100%" },
  pad: { paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  name: { color: Colors.textPrimary, fontWeight: "800", fontSize: 22 },
  meta: { color: Colors.textSecondary },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  pricePrefix: { color: Colors.textSecondary, fontWeight: "700" },
  section: { marginTop: 16, gap: 8 },
  sectionTitle: { color: Colors.textPrimary, fontWeight: "800", fontSize: 16 },
  body: { color: Colors.textSecondary, lineHeight: 20 },
  // Loading and Error states
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  errorIcon: {
    width: 80,
    height: 80,
    marginBottom: 20,
    opacity: 0.6,
  },
  errorText: {
    color: Colors.textPrimary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: Colors.button?.background || Colors.blueAccent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: Colors.button?.text || Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  // Menu Items Styles
  menuGrid: {
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  menuItemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  menuItemName: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  menuItemDescription: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 6,
  },
  menuItemPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemCategory: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  menuItemPrice: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  // Gallery Styles
  galleryContainer: {
    marginTop: 8,
  },
  galleryImageContainer: {
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  galleryImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  // Video Styles
  videoContainer: {
    marginTop: 8,
  },
  videoThumbnailContainer: {
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  videoPlaceholder: {
    width: 150,
    height: 120,
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  playIcon: {
    width: 40,
    height: 40,
    marginBottom: 8,
    opacity: 0.8,
  },
  videoText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  // Tickets Styles
  ticketsContainer: {
    gap: 12,
    marginTop: 8,
  },
  ticketItem: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketInfo: {
    flex: 1,
    marginRight: 16,
  },
  ticketName: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  ticketDescription: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 6,
  },
  ticketAvailability: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  ticketPriceContainer: {
    alignItems: 'flex-end',
  },
  ticketPrice: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
});

export default EventDetailsScreen;


