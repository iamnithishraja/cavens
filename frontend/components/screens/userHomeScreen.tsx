import React, { useMemo, useState, useRef } from 'react';
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
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import EventDetailsScreen from './EventDetailsScreen';
import { SAMPLE_EVENTS } from '@/components/event/data';
import type { EventItem } from '@/components/event/types';
import { Colors } from '@/constants/Colors';
import SearchBar from '@/components/event/SearchBar';


const { width: SCREEN_WIDTH } = Dimensions.get('window');

const UserHomeScreen = () => {
  const [selected, setSelected] = useState<EventItem | null>(null);
  const [activeTab, setActiveTab] = useState<'tonight' | 'this_week' | 'next_week' | 'upcoming'>('tonight');
  const [city] = useState('Dubai');
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const carouselRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  
  // Get featured events for carousel
  const featuredEvents = useMemo(() => {
    return SAMPLE_EVENTS
      .filter(event => event.promoVideos?.length > 0 || event.coverImage)
      .slice(0, 3);
  }, []);

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

  // Filter events based on the active tab
  const filteredEvents = useMemo(() => {
    return SAMPLE_EVENTS.filter(event => {
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          event.name.toLowerCase().includes(searchLower) ||
          event.djArtists.toLowerCase().includes(searchLower)
        );
      }
      return true;
    }).slice(0, 5); // Limit to 5 events for demo
  }, [search]);

  if (selected) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <View style={styles.fullBackground}>
          <EventDetailsScreen event={selected} />
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
                    onPress={() => setSelected(item)}
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
                        <Text style={styles.distanceText}>{Math.floor(Math.random() * 20) + 1} km away</Text>
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
              <Text style={[styles.tabText, activeTab === 'tonight' && styles.activeTabText]}>Tonight</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'this_week' && styles.activeTab]} 
              onPress={() => setActiveTab('this_week')}
            >
              <Text style={[styles.tabText, activeTab === 'this_week' && styles.activeTabText]}>This Week</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'next_week' && styles.activeTab]} 
              onPress={() => setActiveTab('next_week')}
            >
              <Text style={[styles.tabText, activeTab === 'next_week' && styles.activeTabText]}>Next Week</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]} 
              onPress={() => setActiveTab('upcoming')}
            >
              <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>Upcoming</Text>
            </TouchableOpacity>
          </View>

          {/* Club/Event List */}
          <View style={styles.clubListContainer}>
            {filteredEvents.map((event, index) => (
              <TouchableOpacity 
                key={`${event._id}-${index}`}
                style={styles.clubCard}
                onPress={() => setSelected(event)}
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
                    <Text style={styles.clubDistanceText}>{Math.floor(Math.random() * 15) + 1} km</Text>
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
});

export default UserHomeScreen;