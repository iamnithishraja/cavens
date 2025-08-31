import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet
} from 'react-native';
import { Colors } from '@/constants/Colors';
import type { EventItem } from './types';
import type { City } from '@/components/ui/CityPickerModal';
import type { TimelineTab } from './TimelineFilterTabs';

interface EventsListProps {
  filteredEvents: EventItem[];
  selectedCity: City;
  activeTab: TimelineTab;
  search: string;
  onEventPress: (eventId: string) => void;
  onClearSearch: () => void;
}

const EventsList: React.FC<EventsListProps> = ({
  filteredEvents,
  selectedCity,
  activeTab,
  search,
  onEventPress,
  onClearSearch
}) => {
  // Get club name from event
  const getClubName = (event: EventItem) => {
    return event.venue || 'Club Name';
  };

  if (filteredEvents.length === 0) {
    return (
      <View style={styles.noEventsContainer}>
        <Image
          source={{ uri: "https://img.icons8.com/ios/100/CCCCCC/calendar--v1.png" }}
          style={styles.noEventsIcon}
        />
        <Text style={styles.noEventsTitle}>No Events Found</Text>
        <Text style={styles.noEventsSubtitle}>
          {search
            ? `No events match "${search}" for ${activeTab.replace('_', ' ')}`
            : `No events scheduled for ${activeTab.replace('_', ' ')}`
          }
        </Text>
        {search && (
          <TouchableOpacity
            style={styles.clearSearchButton}
            onPress={onClearSearch}
          >
            <Text style={styles.clearSearchButtonText}>Clear Search</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.clubListContainer}>
      {filteredEvents.map((event, index) => (
        <TouchableOpacity
          key={`${event._id}-${index}`}
          style={styles.clubCard}
          onPress={() => {
            console.log("Event clicked:", event._id, event.name);
            onEventPress(event._id || '');
          }}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: event.coverImage }}
            style={styles.clubImage}
          />
          <View style={styles.cardSurface}>
            <View style={styles.clubInfo}>
              <View>
                <Text style={styles.clubName} numberOfLines={2}>{event.name}</Text>
                <Text style={styles.clubGenre} numberOfLines={1}>{getClubName(event)}, {selectedCity.name}</Text>
              </View>
              <View style={styles.ratingDistanceContainer}>
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((star, i) => (
                    <Image
                      key={star}
                      source={{ uri: "https://img.icons8.com/ios-filled/50/F9D65C/star.png" }}
                      style={[styles.starIcon, i >= 4 && { opacity: 0.5 }]}
                    />
                  ))}
                </View>
                <Text style={styles.clubDistanceText}>{event.distance || `${Math.floor(Math.random() * 15) + 1} km`}</Text>
              </View>
            </View>
            <View style={styles.ticketButtonContainer}>
              <TouchableOpacity style={styles.ticketButton}>
                <Text style={styles.ticketButtonText}>GET TICKETS</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  clubListContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  clubCard: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    height: 100,
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  ticketButtonText: {
    color: Colors.button.text,
    fontSize: 14,
    fontWeight: '700',
  },
  // No Events state
  noEventsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  noEventsIcon: {
    width: 80,
    height: 80,
    marginBottom: 16,
    opacity: 0.5,
  },
  noEventsTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  noEventsSubtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  clearSearchButton: {
    backgroundColor: Colors.button.background,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  clearSearchButtonText: {
    color: Colors.button.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EventsList;
