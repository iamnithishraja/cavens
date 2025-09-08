import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Animated,
  Dimensions,
  StyleSheet
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import type { EventItem } from './types';
import type { City } from '@/components/ui/CityPickerModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type FeaturedEventWithDistance = EventItem & {
  distanceInMeters?: number;
  distanceText?: string;
  durationText?: string;
  durationInSeconds?: number;
  method?: string;
  distance?: string;
};

interface FeaturedEventsCarouselProps {
  featuredEvents: FeaturedEventWithDistance[];
  selectedCity: City;
  onEventPress: (eventId: string) => void;
}

const FeaturedEventsCarousel: React.FC<FeaturedEventsCarouselProps> = ({
  featuredEvents,
  selectedCity,
  onEventPress
}) => {
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const carouselRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Get club name from event
  const getClubName = (event: EventItem) => {
    return event.venue || 'Club Name';
  };

  // Handle carousel pagination
  const handleCarouselScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const handleMomentumScrollEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveCarouselIndex(index);
  };

  if (featuredEvents.length === 0) {
    return null;
  }

  return (
    <View style={styles.carouselContainer}>
      <FlatList
        ref={carouselRef}
        data={featuredEvents}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleCarouselScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        keyExtractor={(item) => item._id || item.name}
        renderItem={({ item }) => (
          <View style={styles.carouselItem}>
            <TouchableOpacity
              style={styles.featuredCard}
              onPress={() => {
                console.log("Featured event clicked:", item._id, item.name);
                onEventPress(item._id || '');
              }}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: item.coverImage }}
                style={styles.featuredImage}
              />
              <LinearGradient
                colors={Colors.gradients.overlay as [string, string]}
                style={styles.featuredOverlay}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                <View style={styles.featuredContent}>
                  <Text style={styles.eventDate}>{formatDate(item.date)}</Text>
                  <Text style={styles.venueName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.clubLocation}>{getClubName(item)}, {selectedCity.name}</Text>
                  <Text style={styles.distanceText}>{item.distance || `${Math.floor(Math.random() * 20) + 1} km`} away</Text>
                  <TouchableOpacity 
                    style={styles.bookButton}
                    onPress={() => {
                      console.log("BOOK NOW clicked for event:", item._id, item.name);
                      onEventPress(item._id || '');
                    }}
                  >
                    <Text style={styles.bookButtonText}>BOOK NOW</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Carousel Indicators */}
      <View style={styles.indicatorContainer}>
        {featuredEvents.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              activeCarouselIndex === index && styles.activeIndicator
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  carouselContainer: {
    marginTop: 30,
    height: 320,
    marginBottom: 16,
  },
  carouselItem: {
    width: SCREEN_WIDTH,
    height: 320,
    paddingHorizontal: 16,
  },
  featuredCard: {
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundSecondary,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'cover',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    justifyContent: 'flex-end',
  },
  featuredContent: {
    padding: 20,
    gap: 8,
  },
  eventDate: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  venueName: {
    color: Colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 30,
  },
  clubLocation: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  distanceText: {
    color: Colors.distance,
    fontSize: 14,
    fontWeight: '500',
  },
  bookButton: {
    backgroundColor: Colors.button.background,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  bookButtonText: {
    color: Colors.button.text,
    fontSize: 16,
    fontWeight: '700',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textSecondary,
    marginHorizontal: 4,
    opacity: 0.5,
  },
  activeIndicator: {
    width: 20,
    backgroundColor: Colors.tabActive,
    opacity: 1,
  },
});

export default FeaturedEventsCarousel;
