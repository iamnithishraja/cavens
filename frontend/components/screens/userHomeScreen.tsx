import React, { useMemo, useState, useEffect } from 'react';
import { 
  StyleSheet, 
  StatusBar, 
  View, 
  ScrollView
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import EventDetailsScreen from './EventDetailsScreen';
import { SAMPLE_EVENTS } from '@/components/event/data';
import type { EventItem } from '@/components/event/types';
import { Colors } from '@/constants/Colors';
import apiClient from '@/app/api/client';
import CityPickerModal, { CITIES, type City } from '@/components/ui/CityPickerModal';
import TimelineFilterTabs, { type TimelineTab, getDateRange } from '@/components/event/TimelineFilterTabs';
import LocationHeader from '@/components/event/LocationHeader';
import FilterModal from '@/components/Models/filterModel';
import FeaturedEventsCarousel from '@/components/event/FeaturedEventsCarousel';
import EventsList from '@/components/event/EventsList';
import SearchSection from '@/components/event/SearchSection';
import { LoadingState, ErrorState } from '@/components/event/LoadingStates';

// Types for API responses
type ClubWithEvents = {
  club: {
    _id: string;
    name: string;
    city: string;
    mapLink: string;
    events: EventItem[];
  };
  distanceInMeters: number;
  distanceText: string;
  durationText?: string;
  durationInSeconds?: number;
  method: string;
};

type GetAllEventsResponse = {
  userLocation: {
    latitude: number;
    longitude: number;
  };
  clubs: ClubWithEvents[];
};

type FeaturedEventWithDistance = EventItem & {
  distanceInMeters?: number;
  distanceText?: string;
  durationText?: string;
  durationInSeconds?: number;
  method?: string;
  distance?: string;
};

type GetFeaturedEventsResponse = {
  success: boolean;
  data: FeaturedEventWithDistance[];
};

const UserHomeScreen = () => {
  const insets = useSafeAreaInsets();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TimelineTab>('tonight');
  const [selectedCity, setSelectedCity] = useState<City>(CITIES[0]); // Default to Dubai
  const [cityPickerVisible, setCityPickerVisible] = useState(false);
  const [search, setSearch] = useState('');
  
  // API data states
  const [featuredEvents, setFeaturedEvents] = useState<FeaturedEventWithDistance[]>([]);
  const [allEvents, setAllEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [eventFilters, setEventFilters] = useState<{ maxPrice?: number; featured?: boolean; hasMenu?: boolean; ticketsAvailable?: boolean; soldOut?: boolean; mostPopular?: boolean; distanceKm?: number | null; sameCity?: boolean; walkingDistance?: boolean }>({ maxPrice: 100000, distanceKm: null });
  
  // Location state
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  
  // Fallback coordinates for Dubai (if location access fails)
  const FALLBACK_LATITUDE = 25.2048;
  const FALLBACK_LONGITUDE = 55.2708;

  // Get user's current location
  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        console.log("Requesting location permissions...");
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          console.log("Location permission denied, using fallback coordinates");
          setUserLocation({
            latitude: FALLBACK_LATITUDE,
            longitude: FALLBACK_LONGITUDE
          });
          setLocationLoading(false);
          return;
        }

        console.log("Getting current location...");
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        console.log("Current location:", location.coords.latitude, location.coords.longitude);
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
      } catch (error) {
        console.error("Error getting location:", error);
        // Use fallback coordinates
        setUserLocation({
          latitude: FALLBACK_LATITUDE,
          longitude: FALLBACK_LONGITUDE
        });
      } finally {
        setLocationLoading(false);
      }
    };

    getCurrentLocation();
  }, []);

  // Fetch events data when location or city changes
  useEffect(() => {
    if (!userLocation) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching data for location:", userLocation, "city:", selectedCity.name);

        // Call both APIs in parallel using Promise.all with user's location
        const [allEventsResponse, featuredEventsResponse] = await Promise.all([
          apiClient.get<GetAllEventsResponse>('/api/user/getAllEvents', {
            params: {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              city: selectedCity.name
            }
          }),
          apiClient.get<GetFeaturedEventsResponse>('/api/event/featured-events', {
            params: {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              city: selectedCity.name
            }
          })
        ]);

        // Process getAllEvents response
        console.log("allEventsResponse", allEventsResponse.data);
        if (allEventsResponse.data.clubs) {
          // Extract all events from clubs and enrich with distance data
          const extractedEvents: EventItem[] = [];
          allEventsResponse.data.clubs.forEach((clubData) => {
            if (clubData.club.events && clubData.club.events.length > 0) {
              clubData.club.events.forEach((event) => {
                extractedEvents.push({
                  ...event,
                  venue: clubData.club.name,
                  distance: clubData.distanceText,
                  distanceInMeters: clubData.distanceInMeters
                } as EventItem);
              });
            }
          });
          setAllEvents(extractedEvents);
          console.log("Extracted events with dates:", extractedEvents.map(e => ({ name: e.name, date: e.date, venue: e.venue })));
        }

        // Process getFeaturedEvents response
        if (featuredEventsResponse.data.success && featuredEventsResponse.data.data) {
          const featuredWithDistances = featuredEventsResponse.data.data.map(event => ({
            ...event,
            distance: event.distanceText,
            venue: event.venue || 'Unknown Venue'
          }));
          setFeaturedEvents(featuredWithDistances.slice(0, 3)); // Limit to 3 for carousel
          console.log("Featured events with distances:", featuredWithDistances.map(e => ({ 
            name: e.name, 
            distance: e.distanceText,
            venue: e.venue 
          })));
        }

      } catch (err) {
        console.error('Error fetching data (auth endpoints):', err);
        // Fallback to public clubs endpoint
        try {
          const publicClubsRes = await apiClient.get('/api/club/public/approved', {
            params: { city: selectedCity.name, includeEvents: 'true' }
          });
          const clubsWithEvents = (publicClubsRes.data?.items || []) as any[];
          // Build events list
          const aggregatedEvents: EventItem[] = [];
          clubsWithEvents.forEach((club: any) => {
            if (Array.isArray(club.events)) {
              club.events.forEach((evt: any) => {
                aggregatedEvents.push({
                  ...evt,
                  venue: club.name,
                } as EventItem);
              });
            }
          });
          setAllEvents(aggregatedEvents);
          // Derive featured from aggregated events if available
          const derivedFeatured = aggregatedEvents
            .filter((e: any) => e.isFeatured)
            .sort((a: any, b: any) => (a.featuredNumber || 0) - (b.featuredNumber || 0))
            .slice(0, 3) as any[];
          setFeaturedEvents(derivedFeatured);
          setError(null);
        } catch (fallbackErr) {
          console.error('Fallback public clubs fetch failed:', fallbackErr);
          setError('Failed to load events. Please try again.');
          // Final fallback to sample data
          setFeaturedEvents(SAMPLE_EVENTS.filter(event => event.promoVideos?.length > 0 || event.coverImage).slice(0, 3));
          setAllEvents(SAMPLE_EVENTS.slice(0, 5));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userLocation, selectedCity]); // Re-fetch when location or city changes

  // Filter events based on the active tab, search (regex) and filters
  const filteredEvents = useMemo(() => {
    let events = allEvents;
    
    // Apply regex-based search filter first
    if (search.trim().length > 0) {
      // Escape regex special characters in input to avoid invalid patterns but allow simple regex-like usage
      const escaped = search
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        .replace(/\s+/g, ".*?"); // treat spaces as fuzzy gaps
      const pattern = new RegExp(escaped, 'i');
      events = events.filter((event) => {
        const fields = [
          event.name || '',
          event.djArtists || '',
          event.venue || '',
        ];
        return fields.some((f) => pattern.test(f));
      });
    }
    
    // Apply timeline filter
    const { start, end } = getDateRange(activeTab);
    events = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= start && eventDate <= end;
    });

    // Apply eventFilters
    events = events.filter(event => {
      // price filter
      const minTicket = event.tickets && event.tickets.length > 0 ? Math.min(...event.tickets.map(t => t.price)) : 0;
      if (eventFilters.maxPrice !== undefined && minTicket > (eventFilters.maxPrice ?? 100000)) return false;
      // has menu
      if (eventFilters.hasMenu && (!event.menuItems || event.menuItems.length === 0)) return false;
      // featured
      if (eventFilters.featured && !event.isFeatured) return false;
      // tickets available
      if (eventFilters.ticketsAvailable) {
        const anyAvailable = (event.tickets || []).some(t => (t.quantityAvailable - t.quantitySold) > 0);
        if (!anyAvailable) return false;
      }
      // sold out
      if (eventFilters.soldOut) {
        const allSold = (event.tickets || []).every(t => (t.quantityAvailable - t.quantitySold) <= 0);
        if (!allSold) return false;
      }
      // distance
      if (eventFilters.distanceKm != null && event.distanceInMeters != null) {
        if (event.distanceInMeters > eventFilters.distanceKm * 1000) return false;
      }
      return true;
    });
    
    // Sort events by date (earliest first)
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return events;
  }, [allEvents, activeTab, search, eventFilters]);

  // Handle city selection
  const handleCitySelect = (city: City) => {
    console.log("Selected city:", city.name);
    setSelectedCity(city);
    setCityPickerVisible(false);
  };

  // Event handlers
  const handleEventPress = (eventId: string) => {
    console.log("Event clicked:", eventId);
    setSelectedEventId(eventId);
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
  };

  // Show event details modal
  if (selectedEventId) {
    return (
      <EventDetailsScreen
        eventId={selectedEventId}
        onGoBack={() => setSelectedEventId(null)}
      />
    );
  }

  // Show loading state
  if (loading && featuredEvents.length === 0 && allEvents.length === 0) {
    return <LoadingState locationLoading={locationLoading} />;
  }

  // Show error state
  if (error && featuredEvents.length === 0 && allEvents.length === 0) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.fullBackground}>
        {/* Fixed Header */}
        <View style={styles.fixedHeader}>
          <LocationHeader
            selectedCity={selectedCity}
            onLocationPress={() => setCityPickerVisible(true)}
            userLocation={userLocation}
            locationLoading={locationLoading}
            onFilterPress={() => setFiltersVisible(true)}
          />
          <SearchSection
            value={search}
            onChangeText={setSearch}
            cityName={selectedCity.name}
          />
        </View>
        
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: 110, paddingBottom: insets.bottom + 120 }
          ]}
          stickyHeaderIndices={[1]}
          scrollIndicatorInsets={{ top: 110, bottom: insets.bottom + 80 }}
        >
          {/* Featured Event Carousel */}
          <FeaturedEventsCarousel
            featuredEvents={featuredEvents}
            selectedCity={selectedCity}
            onEventPress={handleEventPress}
          />

          {/* Timeline Filter Tabs */}
          <TimelineFilterTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            allEvents={allEvents}
            loading={loading}
          />

          {/* Events List */}
          <EventsList
            filteredEvents={filteredEvents}
            selectedCity={selectedCity}
            activeTab={activeTab}
            search={search}
            onEventPress={handleEventPress}
            onClearSearch={() => setSearch('')}
          />
        </ScrollView>

        {/* City Picker Modal */}
        <CityPickerModal
          visible={cityPickerVisible}
          onClose={() => setCityPickerVisible(false)}
          onSelect={handleCitySelect}
          selectedCityId={selectedCity.id}
        />

        {/* Filters Modal */}
        <FilterModal
          visible={filtersVisible}
          onClose={() => setFiltersVisible(false)}
          type="events"
          initialEventFilters={eventFilters}
          onApply={({ event }) => setEventFilters(event)}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  fullBackground: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  // Fixed Header
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: Colors.background,
    paddingTop: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default UserHomeScreen;
