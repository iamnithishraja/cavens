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

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  return (
    <TouchableOpacity onPress={() => onPress?.(event)} activeOpacity={0.9}>
      <LinearGradient
        colors={Colors.gradients.card as [string, string]}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <LinearGradient
          colors={Colors.gradients.blue as [string, string]}
          style={styles.glowOverlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.3 }}
        />
        
        {/* Cover Image Section */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: event.coverImage }} style={styles.coverImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageOverlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          
          {/* Date Badge */}
          <View style={styles.dateBadge}>
            <LinearGradient
              colors={[Colors.blueAccent, Colors.blueAccent]}
              style={styles.dateBadgeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.dateText}>{formatDate(event.date)}</Text>
            </LinearGradient>
          </View>

          {/* Price Badge */}
          {hasTickets && (
            <View style={styles.priceBadge}>
              <LinearGradient
                colors={[Colors.primary, Colors.primary]}
                style={styles.priceBadgeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.priceText}>From</Text>
                <CurrencyAED 
                  amount={lowestPrice} 
                  textStyle={styles.priceAmount}
                  tint={Colors.button.text}
                />
              </LinearGradient>
            </View>
          )}
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>{event.name}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Image 
                source={{ uri: "https://img.icons8.com/ios-glyphs/30/4EA2FF/marker--v1.png" }} 
                style={styles.metaIcon} 
              />
              <Text style={styles.metaText} numberOfLines={1}>{event.djArtists}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Image 
                source={{ uri: "https://img.icons8.com/ios-glyphs/30/F9D65C/clock.png" }} 
                style={styles.metaIcon} 
              />
              <Text style={styles.metaText}>{event.time}</Text>
            </View>
          </View>

          {event.happyHourTimings && (
            <View style={styles.happyHourContainer}>
              <LinearGradient
                colors={Colors.gradients.button as [string, string]}
                style={styles.happyHourBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.happyHourText}>🎉 {event.happyHourTimings}</Text>
              </LinearGradient>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.blueAccent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    opacity: 0.2,
  },
  imageContainer: {
    height: 200,
    position: 'relative',
    backgroundColor: Colors.backgroundSecondary,
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
    height: 80,
  },
  dateBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.blueAccent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  dateBadgeGradient: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dateText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  priceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  priceBadgeGradient: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  priceText: {
    color: Colors.button.text,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceAmount: {
    color: Colors.button.text,
    fontSize: 14,
    fontWeight: '800',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  title: {
    color: Colors.textPrimary,
    fontWeight: '800',
    fontSize: 18,
    lineHeight: 24,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metaIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
    tintColor: Colors.blueAccent,
  },
  metaText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  happyHourContainer: {
    marginTop: 4,
  },
  happyHourBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignSelf: 'flex-start',
  },
  happyHourText: {
    color: Colors.button.text,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default EventCard;


