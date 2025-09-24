import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import type { EventItem } from "./types";
import CurrencyAED from "./CurrencyAED";

type Props = {
  event: EventItem;
  onPress?: (event: EventItem) => void;
};

const EventCard: React.FC<Props> = ({ event, onPress }) => {
  const hasTickets = Array.isArray(event.tickets) && event.tickets.length > 0;
  const lowestPrice = hasTickets ? Math.min(...event.tickets.map((t) => t.price)) : 0;
  const isTicketsAvailable = hasTickets && event.tickets.some(t => (t.quantityAvailable - t.quantitySold) > 0);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    return timeString || "TBD";
  };

  return (
    <TouchableOpacity onPress={() => onPress?.(event)} activeOpacity={0.9}>
      <View style={styles.card}>
        {/* Subtle glow overlay */}
        <LinearGradient
          colors={[Colors.blueAccent + '20', 'transparent']}
          style={styles.glowOverlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.3 }}
        />
        
        {/* Main content layout */}
        <View style={styles.mainContent}>
          {/* Left side - Cover Image */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: event.coverImage }} style={styles.coverImage} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.6)']}
              style={styles.imageOverlay}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
            
            {/* Date badge on image */}
            <View style={styles.dateBadge}>
              <LinearGradient
                colors={[Colors.blueAccent, Colors.blueAccent]}
                style={styles.dateBadgeGradient}
              >
                <Text style={styles.dateText}>{formatDate(event.date)}</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Right side - Event Details */}
          <View style={styles.detailsContainer}>
            {/* Header with title and price */}
            <View style={styles.headerRow}>
              <Text style={styles.title} numberOfLines={2}>{event.name}</Text>
              {hasTickets && (
                <View style={styles.priceContainer}>
                  <Text style={styles.fromText}>From</Text>
                  <CurrencyAED 
                    amount={lowestPrice} 
                    textStyle={styles.priceAmount}
                    tint={Colors.primary}
                  />
                </View>
              )}
            </View>

            {/* Artist and venue info */}
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Image 
                  source={{ uri: "https://img.icons8.com/ios-glyphs/20/4EA2FF/microphone.png" }} 
                  style={styles.infoIcon} 
                />
                <Text style={styles.infoText} numberOfLines={1}>{event.djArtists || "Various Artists"}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Image 
                  source={{ uri: "https://img.icons8.com/ios-glyphs/20/F9D65C/clock.png" }} 
                  style={styles.infoIcon} 
                />
                <Text style={styles.infoText}>{formatTime(event.time)}</Text>
              </View>
            </View>

            {/* Description - condensed */}
            {event.description && (
              <Text style={styles.description} numberOfLines={2}>
                {event.description}
              </Text>
            )}

            {/* Bottom row - Features and status */}
            <View style={styles.bottomRow}>
              <View style={styles.featuresRow}>
                {event.happyHourTimings && (
                  <View style={styles.featureBadge}>
                    <Text style={styles.featureText}>🍻 Happy Hour</Text>
                  </View>
                )}
                {event.menuItems && event.menuItems.length > 0 && (
                  <View style={styles.featureBadge}>
                    <Text style={styles.featureText}>🍽️ Menu</Text>
                  </View>
                )}
              </View>
              
              {/* Ticket status */}
              {hasTickets && (
                <View style={[styles.statusBadge, isTicketsAvailable ? styles.availableBadge : styles.soldOutBadge]}>
                  <Text style={[styles.statusText, isTicketsAvailable ? styles.availableText : styles.soldOutText]}>
                    {isTicketsAvailable ? '🎫 Available' : '❌ Sold Out'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: Colors.background,
    position: 'relative',
    overflow: 'hidden',
    height: 160,
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    opacity: 0.1,
  },
  mainContent: {
    flexDirection: 'row',
    height: '100%',
  },
  imageContainer: {
    width: 140,
    height: '100%',
    position: 'relative',
    backgroundColor: Colors.backgroundTertiary,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  dateBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  dateBadgeGradient: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dateText: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  detailsContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    color: Colors.textPrimary,
    fontWeight: '800',
    fontSize: 16,
    lineHeight: 20,
    marginRight: 8,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  fromText: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceAmount: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  infoRow: {
    marginBottom: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    width: 14,
    height: 14,
    marginRight: 6,
    tintColor: Colors.blueAccent,
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 11,
    lineHeight: 14,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  featureBadge: {
    backgroundColor: Colors.backgroundTertiary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  featureText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  availableBadge: {
    backgroundColor: `${Colors.primary}15`,
  },
  soldOutBadge: {
    backgroundColor: `${Colors.textSecondary}15`,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  availableText: {
    color: Colors.primary,
  },
  soldOutText: {
    color: Colors.textSecondary,
  },
});

export default EventCard;