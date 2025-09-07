import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import type { Club } from '@/components/Map/ClubCard';

type UserClubListItemProps = {
  club: Club;
  cityName: string;
  onPress: (club: Club) => void;
};

const UserClubListItem: React.FC<UserClubListItemProps> = ({ club, cityName, onPress }) => {
  const formattedDistance = React.useMemo(() => {
    const dAny: any = club as any;
    if (typeof dAny.distance === 'string' && dAny.distance.trim().length > 0) return dAny.distance;
    const meters: number | undefined = (dAny.distanceInMeters as number) ?? (dAny.distanceMeters as number);
    if (typeof meters === 'number' && isFinite(meters)) {
      const km = meters / 1000;
      return `${km.toFixed(km < 10 ? 1 : 0)} km`;
    }
    const text: string | undefined = dAny.distanceText;
    return typeof text === 'string' ? text : '';
  }, [club]);

  return (
    <TouchableOpacity style={styles.clubCard} onPress={() => onPress(club)} activeOpacity={0.9}>
      <Image source={{ uri: club.logoUrl }} style={styles.clubImage} />
      <View style={styles.cardSurface}>
        <View style={styles.clubInfo}>
          <View>
            <Text style={styles.clubName} numberOfLines={2}>
              {club.name}
            </Text>
            <Text style={styles.clubGenre} numberOfLines={1}>
              {club.typeOfVenue}, {cityName}
            </Text>
          </View>
          <View style={styles.ratingDistanceContainer}>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star, i) => (
                <Image
                  key={star}
                  source={{ uri: 'https://img.icons8.com/ios-filled/50/F9D65C/star.png' }}
                  style={[styles.starIcon, i >= 4 && { opacity: 0.5 }]}
                />
              ))}
            </View>
            <Text style={styles.clubDistanceText}>{formattedDistance}</Text>
          </View>
        </View>
        <View style={styles.ticketButtonContainer}>
          <TouchableOpacity style={styles.ticketButton}>
            <Text style={styles.ticketButtonText}>VIEW EVENTS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  clubCard: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    height: 100,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  cardSurface: {
    flex: 1,
    flexDirection: 'row',
  },
  clubImage: {
    width: 100,
    height: '100%',
    resizeMode: 'cover',
  },
  clubInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  clubName: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 22,
  },
  clubGenre: {
    color: Colors.genre,
    fontSize: 14,
  },
  ratingDistanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    width: 14,
    height: 14,
    marginRight: 2,
    tintColor: Colors.rating,
  },
  clubDistanceText: {
    color: Colors.distance,
    fontSize: 14,
    fontWeight: '500',
  },
  ticketButtonContainer: {
    justifyContent: 'center',
    paddingRight: 12,
  },
  ticketButton: {
    backgroundColor: Colors.button.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  ticketButtonText: {
    color: Colors.button.text,
    fontSize: 12,
    fontWeight: '700',
  },
});

export default UserClubListItem;

