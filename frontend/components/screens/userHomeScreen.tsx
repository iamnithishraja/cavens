import React, { useMemo, useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  StatusBar, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  FlatList,
  Animated,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import EventDetailsScreen from './EventDetailsScreen';
import { SAMPLE_EVENTS } from '@/components/event/data';
import type { EventItem } from '@/components/event/types';
import { Colors } from '@/constants/Colors';
import SearchBar from '@/components/event/SearchBar';
import apiClient from '@/app/api/client';


const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
};

type GetFeaturedEventsResponse = {
  success: boolean;
  data: FeaturedEventWithDistance[];
};

const UserHomeScreen = () => {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tonight' | 'this_week' | 'next_week' | 'upcoming'>('tonight');
  const [city] = useState('Dubai');
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const carouselRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  
  // API data states
  const [featuredEvents, setFeaturedEvents] = useState<FeaturedEventWithDistance[]>([]);
  const [allEvents, setAllEvents] = useState<EventItem[]>([]);
  const [clubs, setClubs] = useState<ClubWithEvents[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Location state
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  
  // Fallback coordinates for Dubai (if location access fails)
  const FALLBACK_LATITUDE = 13.027882248674114;
  const FALLBACK_LONGITUDE = 77.60789691577324;

  // Get user's current location
  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        setLocationLoading(true);
        console.log("Requesting location permissions...");
        
        // Request permissions
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log("Location permission denied, using fallback coordinates");
          Alert.alert(
            'Location Access',
            'Location permission was denied. Using default location (Dubai).',
            [{ text: 'OK' }]
          );
          setUserLocation({ latitude: FALLBACK_LATITUDE, longitude: FALLBACK_LONGITUDE });
          setLocationLoading(false);
          return;
        }

        console.log("Getting current position...");
        // Get current position
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const currentLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        console.log("Current location obtained:", currentLocation);
        setUserLocation(currentLocation);
        setLocationLoading(false);

      } catch (error) {
        console.error('Error getting location:', error);
        Alert.alert(
          'Location Error',
          'Failed to get your location. Using default location (Dubai).',
          [{ text: 'OK' }]
        );
        setUserLocation({ latitude: FALLBACK_LATITUDE, longitude: FALLBACK_LONGITUDE });
        setLocationLoading(false);
      }
    };

    getCurrentLocation();
  }, []);

  // Fetch data from APIs when location is available
  useEffect(() => {
    if (!userLocation) return; // Wait for location
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Fetching events with user location:", userLocation);

        // Call both APIs in parallel using Promise.all with user's location
        const [allEventsResponse, featuredEventsResponse] = await Promise.all([
          apiClient.get<GetAllEventsResponse>('/api/user/getAllEvents', {
            params: {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              city: city
            }
          }),
          apiClient.get<GetFeaturedEventsResponse>('/api/event/featured-events', {
            params: {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              city: city
            }
          })
        ]);

        // Process getAllEvents response
        console.log("allEventsResponse", allEventsResponse.data);
        console.log("featuredEventsResponse", featuredEventsResponse.data);
        if (allEventsResponse.data.clubs) {
          setClubs(allEventsResponse.data.clubs);
          
          // Extract all events from clubs
          const extractedEvents: EventItem[] = [];
          allEventsResponse.data.clubs.forEach(clubData => {
            if (clubData.club.events && Array.isArray(clubData.club.events)) {
              clubData.club.events.forEach(event => {
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
        console.error('Error fetching data:', err);
        setError('Failed to load events. Please try again.');
        // Fallback to sample data on error
        setFeaturedEvents(SAMPLE_EVENTS.filter(event => event.promoVideos?.length > 0 || event.coverImage).slice(0, 3));
        setAllEvents(SAMPLE_EVENTS.slice(0, 5));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userLocation, city]); // Re-fetch when location or city changes

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

  // Helper function to get date ranges for each timeline
  const getDateRange = (timeline: 'tonight' | 'this_week' | 'next_week' | 'upcoming') => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (timeline) {
      case 'tonight':
        const tonight = new Date(today);
        tonight.setHours(23, 59, 59, 999);
        return { start: today, end: tonight };
        
      case 'this_week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Start of current week (Sunday)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // End of current week (Saturday)
        endOfWeek.setHours(23, 59, 59, 999);
        return { start: startOfWeek, end: endOfWeek };
        
      case 'next_week':
        const startOfNextWeek = new Date(today);
        startOfNextWeek.setDate(today.getDate() - today.getDay() + 7); // Start of next week
        const endOfNextWeek = new Date(startOfNextWeek);
        endOfNextWeek.setDate(startOfNextWeek.getDate() + 6); // End of next week
        endOfNextWeek.setHours(23, 59, 59, 999);
        return { start: startOfNextWeek, end: endOfNextWeek };
        
      case 'upcoming':
        const twoWeeksFromNow = new Date(today);
        twoWeeksFromNow.setDate(today.getDate() + 14);
        const farFuture = new Date(today);
        farFuture.setFullYear(today.getFullYear() + 1); // 1 year from now
        return { start: twoWeeksFromNow, end: farFuture };
        
      default:
        return { start: today, end: new Date(today.getFullYear() + 1, 11, 31) };
    }
  };

  // Filter events based on the active tab and search
  const filteredEvents = useMemo(() => {
    let events = allEvents;
    
    // Apply search filter first
    if (search) {
      const searchLower = search.toLowerCase();
      events = events.filter(event => 
        event.name.toLowerCase().includes(searchLower) ||
        event.djArtists?.toLowerCase().includes(searchLower) ||
        event.venue?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply timeline filter
    const { start, end } = getDateRange(activeTab);
    events = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= start && eventDate <= end;
    });
    
    // Sort events by date (earliest first)
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return events;
  }, [allEvents, search, activeTab]);

  // Get event counts for each tab (for displaying counts in tabs)
  const getEventCountForTab = (timeline: 'tonight' | 'this_week' | 'next_week' | 'upcoming') => {
    const { start, end } = getDateRange(timeline);
    return allEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= start && eventDate <= end;
    }).length;
  };

  if (selectedEventId) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <View style={styles.fullBackground}>
          <EventDetailsScreen 
            eventId={selectedEventId} 
            onGoBack={() => setSelectedEventId(null)}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Show loading state (location + events)
  if (locationLoading || loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <View style={[styles.fullBackground, styles.centerContent]}>
          <ActivityIndicator size="large" color={Colors.blueAccent} />
          <Text style={styles.loadingText}>
            {locationLoading ? "Getting your location..." : "Loading events..."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error && featuredEvents.length === 0 && allEvents.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <View style={[styles.fullBackground, styles.centerContent]}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              // Re-trigger the useEffect
              setLoading(true);
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Handle carousel pagination
  const handleCarouselScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const handleMomentumScrollEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveCarouselIndex(index);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.fullBackground}>
        {/* Fixed Header */}
        <View style={styles.fixedHeader}>
          {/* Location Header */}
          <View style={styles.locationHeader}>
            <TouchableOpacity 
              style={styles.locationSelector}
              onPress={() => setCityDropdownOpen(!cityDropdownOpen)}
            >
              <Image 
                source={{ uri: "https://img.icons8.com/ios/50/4EA2FF/marker.png" }}
                style={styles.locationIcon}
              />
              <Text style={styles.locationText}>{city}</Text>
              <Image 
                source={{ uri: "https://img.icons8.com/ios/50/FFFFFF/chevron-down.png" }}
                style={styles.chevronIcon}
              />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.filterButton}>
              <Image 
                source={{ uri: "https://img.icons8.com/ios/50/FFFFFF/menu--v1.png" }}
                style={styles.filterIcon}
              />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <SearchBar value={search} onChangeText={setSearch} />
          </View>
        </View>
        
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={[styles.scrollContent, { paddingTop: 110 }]}
        >

          {/* Featured Event Carousel */}
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
                      setSelectedEventId(item._id || '');
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
                        <Text style={styles.clubLocation}>{getClubName(item)}, {city}</Text>
                        <Text style={styles.distanceText}>{item.distance || `${Math.floor(Math.random() * 20) + 1} km`} away</Text>
                        <TouchableOpacity style={styles.bookButton}>
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

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'tonight' && styles.activeTab]} 
              onPress={() => setActiveTab('tonight')}
            >
              <Text style={[styles.tabText, activeTab === 'tonight' && styles.activeTabText]}>
                Tonight {!loading && `(${getEventCountForTab('tonight')})`}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'this_week' && styles.activeTab]} 
              onPress={() => setActiveTab('this_week')}
            >
              <Text style={[styles.tabText, activeTab === 'this_week' && styles.activeTabText]}>
                This Week {!loading && `(${getEventCountForTab('this_week')})`}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'next_week' && styles.activeTab]} 
              onPress={() => setActiveTab('next_week')}
            >
              <Text style={[styles.tabText, activeTab === 'next_week' && styles.activeTabText]}>
                Next Week {!loading && `(${getEventCountForTab('next_week')})`}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]} 
              onPress={() => setActiveTab('upcoming')}
            >
              <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
                Upcoming {!loading && `(${getEventCountForTab('upcoming')})`}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Club/Event List */}
          <View style={styles.clubListContainer}>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event, index) => (
                <TouchableOpacity 
                  key={`${event._id}-${index}`}
                  style={styles.clubCard}
                  onPress={() => {
                    console.log("Event clicked:", event._id, event.name);
                    setSelectedEventId(event._id || '');
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
                        <Text style={styles.clubGenre} numberOfLines={1}>{getClubName(event)}, {city}</Text>
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
              ))
            ) : (
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
                    onPress={() => setSearch('')}
                  >
                    <Text style={styles.clearSearchButtonText}>Clear Search</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

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
    shadowRadius: 3,
    elevation: 5,
  },
  // Location Header
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    width: 24,
    height: 24,
    tintColor: Colors.blueAccent,
    marginRight: 8,
  },
  locationText: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginRight: 4,
  },
  chevronIcon: {
    width: 16,
    height: 16,
    tintColor: Colors.textPrimary,
  },
  filterButton: {
    padding: 8,
  },
  filterIcon: {
    width: 24,
    height: 24,
    tintColor: Colors.textPrimary,
  },
  // Search Bar
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  // Carousel
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
  // Featured Event
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
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    height: '70%',
  },
  featuredContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  eventDate: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  venueName: {
    color: Colors.textPrimary,
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    lineHeight: 38,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  clubLocation: {
    color: Colors.textSecondary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  distanceText: {
    color: Colors.distance,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bookButton: {
    backgroundColor: Colors.button.background,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    alignSelf: 'flex-start',
  },
  bookButtonText: {
    color: Colors.button.text,
    fontSize: 16,
    fontWeight: '700',
  },
  // Tab Navigation
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.withOpacity.white10,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'relative',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.tabActive,
  },
  tabText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: Colors.textPrimary,
  },
  // Club List
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
    // backgroundColor: Colors.backgroundSecondary,
    // borderLeftWidth: 0,
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
  // Loading and Error states
  centerContent: {
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
  errorText: {
    color: Colors.textPrimary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: Colors.button.background,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: Colors.button.text,
    fontSize: 16,
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
    marginBottom: 20,
    opacity: 0.6,
  },
  noEventsTitle: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
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
    backgroundColor: Colors.withOpacity.white10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  clearSearchButtonText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default UserHomeScreen;