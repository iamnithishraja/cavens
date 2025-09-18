import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';

interface ChatbotEventCardProps {
  event: {
    id: string;
    name: string;
    description?: string;
    date: string;
    time: string;
    venue: string;
    city: string;
    djArtists?: string;
    tickets?: Array<{
      name: string;
      price: number;
      quantityAvailable: number;
      quantitySold: number;
    }>;
    coverImage?: string;
    isFeatured?: boolean;
  };
  onPress?: () => void;
}

const { width } = Dimensions.get('window');
const cardWidth = width * 0.75; // 75% of screen width

const ChatbotEventCard: React.FC<ChatbotEventCardProps> = ({ event, onPress }) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/event/${event.id}`);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };


  const isSoldOut = () => {
    if (!event.tickets || event.tickets.length === 0) return false;
    return event.tickets.every(ticket => ticket.quantityAvailable <= ticket.quantitySold);
  };

  return (
    <TouchableOpacity 
      style={styles.cardContainer}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[Colors.backgroundSecondary, Colors.backgroundTertiary]}
        style={styles.card}
      >
        {/* Header with featured badge */}
        <View style={styles.header}>
          {event.isFeatured && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredText}>⭐ Featured</Text>
            </View>
          )}
          <Text style={styles.venueText}>{event.venue}</Text>
        </View>

        {/* Event Image */}
        <View style={styles.imageContainer}>
          {event.coverImage ? (
            <Image 
              source={{ uri: event.coverImage }} 
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
            {event.name}
          </Text>
          
          {event.djArtists && (
            <Text style={styles.djArtists} numberOfLines={1}>
              🎵 {event.djArtists}
            </Text>
          )}

          <View style={styles.dateTimeContainer}>
            <Text style={styles.dateText}>
              📅 {formatDate(event.date)}
            </Text>
            <Text style={styles.timeText}>
              🕒 {event.time}
            </Text>
          </View>

          <View style={styles.footerContainer}>
            <View style={styles.locationContainer}>
              <Text style={styles.locationText}>📍 {event.city}</Text>
            </View>
            
            {isSoldOut() && (
              <View style={styles.soldOutContainer}>
                <Text style={styles.soldOutText}>Sold Out</Text>
              </View>
            )}
          </View>
        </View>

        {/* Tap indicator */}
        <View style={styles.tapIndicator}>
          <Text style={styles.tapText}>Tap to view details →</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 8,
    marginVertical: 4,
  },
  card: {
    width: cardWidth,
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
  featuredBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  featuredText: {
    color: Colors.button.text,
    fontSize: 10,
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
    overflow: 'hidden',
    marginBottom: 12,
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  detailsContainer: {
    flex: 1,
  },
  eventName: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 20,
  },
  djArtists: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  soldOutContainer: {
    alignItems: 'flex-end',
  },
  soldOutText: {
    color: Colors.error || '#FF6B6B',
    fontSize: 10,
    fontWeight: '600',
  },
  locationContainer: {
    flex: 1,
  },
  locationText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  tapIndicator: {
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.withOpacity.white10,
  },
  tapText: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '500',
  },
});

export default ChatbotEventCard;
