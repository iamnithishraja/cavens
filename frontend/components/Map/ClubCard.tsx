import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Colors } from '@/constants/Colors';

export type Club = {
  _id: string;
  name: string;
  clubDescription: string;
  typeOfVenue: string;
  logoUrl?: string;
  coverBannerUrl?: string;
  photos?: string[];
  clubImages?: string[];
  city: string;
  rating: number;
  address: string;
  distance?: string;
  distanceInMeters?: number;
  isApproved: boolean;
  // Extended fields from backend model
  operatingDays?: string[];
  phone?: string;
  mapLink?: string;
  email?: string;
  events?: string[];
};

type Props = {
  club: Club;
  onPress: (club: Club) => void;
};

const ClubCard: React.FC<Props> = ({ 
  club, 
  onPress
}) => {
  const [imageError, setImageError] = useState(false);

  const getClubImage = () => {
    if (imageError) return null;
    
    return club.coverBannerUrl || 
           club.clubImages?.[0] || 
           club.photos?.[0] || 
           club.logoUrl || 
           null;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Image 
            key={i}
            source={{ uri: "https://img.icons8.com/ios-filled/50/F9D65C/star.png" }}
            style={styles.starIcon}
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Image 
            key={i}
            source={{ uri: "https://img.icons8.com/ios-filled/50/F9D65C/star-half-empty.png" }}
            style={styles.starIcon}
          />
        );
      } else {
        stars.push(
          <Image 
            key={i}
            source={{ uri: "https://img.icons8.com/ios/50/666666/star.png" }}
            style={[styles.starIcon, { opacity: 0.3 }]}
          />
        );
      }
    }
    return stars;
  };

  const clubImage = getClubImage();

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => onPress(club)}
      activeOpacity={0.9}
    >
      {/* Club Image */}
      <View style={styles.imageContainer}>
        {clubImage && !imageError ? (
          <Image 
            source={{ uri: clubImage }}
            style={styles.clubImage}
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Image 
              source={{ uri: "https://img.icons8.com/ios/50/CCCCCC/nightclub.png" }}
              style={styles.placeholderIcon}
            />
          </View>
        )}
      </View>

      {/* Club Info */}
      <View style={styles.clubInfo}>
        <View style={styles.headerRow}>
          <Text style={styles.clubName} numberOfLines={1}>
            {club.name}
          </Text>
        </View>

        <View style={styles.typeRow}>
          <Text style={styles.typeBadge} numberOfLines={1}>{club.typeOfVenue}</Text>
          <Text style={styles.cityText} numberOfLines={1}>• {club.city}</Text>
        </View>

        <View style={styles.ratingRow}>
          <View style={styles.ratingContainer}>
            {renderStars(club.rating)}
            <Text style={styles.ratingText}>{club.rating.toFixed(1)}</Text>
          </View>
          <Text style={styles.distancePill}>
            {club.distance || `${Math.floor(Math.random() * 20) + 1} km`}
          </Text>
        </View>
      </View>

      {/* CTA Button */}
      <TouchableOpacity 
        style={styles.ctaButton}
        onPress={() => onPress(club)}
        activeOpacity={0.9}
      >
        <Text style={styles.ctaText}>VIEW EVENTS</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    minHeight: 90,
  },

  imageContainer: {
    width: 90,
    height: 97,
  },
  clubImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    width: 28,
    height: 28,
    tintColor: Colors.textMuted,
  },
  clubInfo: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clubName: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 0,
    flex: 1,
  },
  distancePill: {
    color: Colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
    borderRadius: 10,
    backgroundColor: Colors.withOpacity.black80,
    paddingHorizontal: 8,
    paddingVertical: 3,
    paddingLeft:15,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeBadge: {
    color: Colors.primary,
    borderColor: Colors.primary,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  cityText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  ratingRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  starIcon: {
    width: 12,
    height: 12,
    marginRight: 1,
  },
  ratingText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 3,
  },
  ctaButton: {
    position: 'absolute',
    right: 10,
    top: '50%',
    marginTop: -14,
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.button.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  ctaText: {
    color: Colors.button.text,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  ctaGetTickets: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  ctaGetTicketsText: {
    color: Colors.button.text,
  },
});

export default ClubCard;
