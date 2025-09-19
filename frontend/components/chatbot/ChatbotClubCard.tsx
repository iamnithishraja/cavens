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

interface ChatbotClubCardProps {
  club: {
    id: string;
    name: string;
    description?: string;
    type: string;
    city: string;
    address?: string;
    phone?: string;
    rating?: number;
    photos?: string[];
    operatingDays?: string[];
    eventsCount?: number;
    coverImage?: string;
  };
  onPress?: () => void;
}

const { width } = Dimensions.get('window');
const cardWidth = width * 0.75; // 75% of screen width

const ChatbotClubCard: React.FC<ChatbotClubCardProps> = ({ club, onPress }) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/club/details?id=${club.id}`);
    }
  };

  const getOperatingDays = () => {
    if (!club.operatingDays || club.operatingDays.length === 0) return 'Check venue';
    
    const days = club.operatingDays.slice(0, 2).join(', ');
    return club.operatingDays.length > 2 ? `${days}...` : days;
  };

  const getRatingStars = () => {
    if (!club.rating || isNaN(club.rating)) return '★☆☆☆☆';
    const rating = Math.round(Number(club.rating));
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
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
        {/* Header with events count */}
        <View style={styles.header}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{club.type}</Text>
          </View>
          {club.eventsCount && !isNaN(club.eventsCount) && club.eventsCount > 0 && (
            <View style={styles.eventsBadge}>
              <Text style={styles.eventsText}>{Number(club.eventsCount)} events</Text>
            </View>
          )}
        </View>

        {/* Club Image */}
        <View style={styles.imageContainer}>
          {club.coverImage ? (
            <Image 
              source={{ uri: club.coverImage }} 
              style={styles.clubImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>🏢</Text>
            </View>
          )}
        </View>

        {/* Club Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.clubName} numberOfLines={2}>
            {club.name}
          </Text>
          
          {club.description && (
            <Text style={styles.description} numberOfLines={2}>
              {club.description}
            </Text>
          )}

          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>
              {getRatingStars()}
            </Text>
            {club.rating && !isNaN(club.rating) && (
              <Text style={styles.ratingNumber}>
                {Number(club.rating).toFixed(1)}
              </Text>
            )}
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>📍</Text>
              <Text style={styles.infoText} numberOfLines={1}>
                {club.address || club.city}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>📅</Text>
              <Text style={styles.infoText} numberOfLines={1}>
                {getOperatingDays()}
              </Text>
            </View>
          </View>

          {club.phone && club.phone.toString().trim() && (
            <View style={styles.phoneContainer}>
              <Text style={styles.phoneLabel}>📞</Text>
              <Text style={styles.phoneText}>{club.phone.toString()}</Text>
            </View>
          )}
        </View>

        {/* Tap indicator */}
        <View style={styles.tapIndicator}>
          <Text style={styles.tapText}>Tap to view venue →</Text>
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
  typeBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeText: {
    color: Colors.button.text,
    fontSize: 10,
    fontWeight: '600',
  },
  eventsBadge: {
    backgroundColor: Colors.withOpacity.primary10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  eventsText: {
    color: Colors.primary,
    fontSize: 9,
    fontWeight: '600',
  },
  imageContainer: {
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  clubImage: {
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
  clubName: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 20,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    color: Colors.primary,
    fontSize: 12,
    marginRight: 6,
  },
  ratingNumber: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  infoContainer: {
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoLabel: {
    marginRight: 6,
    fontSize: 12,
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
    flex: 1,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneLabel: {
    marginRight: 6,
    fontSize: 12,
  },
  phoneText: {
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

export default ChatbotClubCard;
