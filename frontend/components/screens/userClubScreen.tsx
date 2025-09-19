import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { 
  StyleSheet, 
  StatusBar, 
  View, 
  ScrollView
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Colors } from '@/constants/Colors';
import CityPickerModal, { CITIES, type City } from '@/components/ui/CityPickerModal';
import type { Club } from '@/components/Map/ClubCard';
import EmptyClubsView from '@/components/Map/EmptyClubsView';
import apiClient from '@/app/api/client';
import { useRouter } from 'expo-router';
import UserClubHeader from '@/components/screens/UserClub/UserClubHeader';
import UserClubListHeader from '@/components/screens/UserClub/UserClubListHeader';
import MapViewCard from '@/components/Map/MapViewCard';
import UserClubListItem from '@/components/screens/UserClub/UserClubListItem';
import FilterModal from '@/components/Models/filterModel';
import FloatingChatButton from '@/components/ui/FloatingChatButton';
import { store } from '@/utils';

// Placeholder: screen only shows header and search now

const HEADER_SPACING = 328;

const UserClubScreen = () => {
  const insets = useSafeAreaInsets();
  const [selectedCity, setSelectedCity] = useState<City>(CITIES[0]); // Default to Dubai
  const [cityPickerVisible, setCityPickerVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const router = useRouter();
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [clubFilters, setClubFilters] = useState<{ distanceKm?: number | null; hasUpcomingEvents?: boolean; mostPopular?: boolean; clubTypes?: string[] }>({ distanceKm: null, clubTypes: [] });
  const [scrollEnabled, setScrollEnabled] = useState(true);

  // Location state
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  // const [locationLoading, setLocationLoading] = useState(true);
  
  // Fallback coordinates for Dubai (if location access fails)
  const FALLBACK_LATITUDE = 25.2048;
  const FALLBACK_LONGITUDE = 55.2708;

  // Get user's current location (mirrors userHomeScreen logic with fallback)
  useEffect(() => {
    let isMounted = true;
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (!isMounted) return;
          setUserLocation({ latitude: FALLBACK_LATITUDE, longitude: FALLBACK_LONGITUDE });
          return;
        }
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (!isMounted) return;
        setUserLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
      } catch {
        if (!isMounted) return;
        setUserLocation({ latitude: FALLBACK_LATITUDE, longitude: FALLBACK_LONGITUDE });
      }
    };
    getCurrentLocation();
    return () => { isMounted = false; };
  }, []);

  // Handle city selection
  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    setCityPickerVisible(false);
  };

  const handleToggleType = (typeId: string) => {
    setSelectedTypes((prev) => {
      if (typeId === 'all') return [];
      if (prev.length === 1 && prev[0] === typeId) return [];
      return [typeId];
    });
  };

  const handleViewEvents = (club: Club) => {
    router.push(`/club/userClubDetailsScreen?clubId=${club._id}`);
  };

  const handleMapMarkerPress = useCallback((club: Club) => {
    router.push(`/club/userClubDetailsScreen?clubId=${club._id}`);
  }, [router]);

  const buildRegex = (input: string) => {
    const trimmed = input.trim();
    if (trimmed.length === 0) return null;
    const escaped = trimmed
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\s+/g, ".*?");
    return new RegExp(escaped, 'i');
  };

  const clubMatchesSelectedTypes = useCallback((club: Club) => {
    if (selectedTypes.length === 0) return true;
    const raw = (club.typeOfVenue || '').toLowerCase();
    const types = raw.split(',').map((t) => t.trim().replace(/\s+/g, '_')).filter(Boolean);
    return types.some((t) => selectedTypes.includes(t));
  }, [selectedTypes]);

  const [clubs, setClubs] = useState<Club[]>([]);
  const [clubsLoading, setClubsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setClubsLoading(true);
        
        // If user location is available, fetch clubs with distance in one call
        if (userLocation) {
          const params: Record<string, string> = {
            latitude: userLocation.latitude.toString(),
            longitude: userLocation.longitude.toString(),
          };
          if (selectedCity?.name) params.city = selectedCity.name;
          if (selectedTypes.length === 1) params.type = selectedTypes[0];
          
          const res = await apiClient.get('/api/user/getAllEvents', { params });
          const clubsWithDistance = (res.data?.clubs || []) as any[];
          const clubs = clubsWithDistance.map((c: any) => ({
            ...c.club,
            distance: c.distanceText,
            distanceInMeters: c.distanceInMeters,
            durationText: c.durationText,
            durationInSeconds: c.durationInSeconds,
          }));
          setClubs(clubs as Club[]);
        } else {
          // Fallback to public clubs without distance
          const params: Record<string, string> = {};
          if (selectedCity?.name) params.city = selectedCity.name;
          if (selectedTypes.length === 1) params.type = selectedTypes[0];
          const res = await apiClient.get('/api/club/public/approved', { params: { ...params, includeEvents: 'true' } });
          const items = (res.data?.items || []) as any[];
          setClubs(items as Club[]);
        }
      } catch (e) {
        console.error('Failed to load clubs', e);
        setClubs([]);
      } finally {
        setClubsLoading(false);
      }
    };
    fetchClubs();
  }, [selectedCity, selectedTypes, userLocation]);

  const handleChatButtonPress = async () => {
    console.log('🎫 Bookings Screen Navigation');
    
    // Get the selected city from store, default to Dubai
    const selectedCity = await store.get('selectedCity') || 'Dubai';
    
    router.push({
      pathname: '/chatbot',
      params:{
        Screen:'PROFILE',
        city: selectedCity,
      }
    }
    )
  };


  const filteredClubs = useMemo(() => {
    const pattern = buildRegex(search);
    return clubs.filter((club) => {
      const cityOk = !selectedCity?.name || club.city.toLowerCase() === selectedCity.name.toLowerCase();
      const searchOk = !pattern || [
        club.name || '',
        club.clubDescription || '',
        club.address || '',
        club.typeOfVenue || '',
      ].some((f) => pattern.test(f));
      const typeOk = clubMatchesSelectedTypes(club);

      // Apply filter modal selections
      if (clubFilters.distanceKm != null && club.distanceInMeters != null) {
        if (club.distanceInMeters > (clubFilters.distanceKm * 1000)) return false;
      }
      if (clubFilters.clubTypes && clubFilters.clubTypes.length > 0) {
        const raw = (club.typeOfVenue || '').toLowerCase();
        const types = raw.split(',').map((t) => t.trim().replace(/\s+/g, '_')).filter(Boolean);
        const hasType = types.some(t => clubFilters.clubTypes?.includes(t));
        if (!hasType) return false;
      }
      return cityOk && searchOk && typeOk;
    });
  }, [clubs, selectedCity, search, clubMatchesSelectedTypes, clubFilters]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.fullBackground}>
        {/* Fixed Header */}
        <UserClubHeader
          selectedCity={selectedCity}
          onLocationPress={() => setCityPickerVisible(true)}
          search={search}
          onSearchChange={setSearch}
          onFilterPress={() => setFiltersVisible(true)}
        />

        {/* Content */}
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: 130, paddingBottom: insets.bottom + 120 }
          ]}
          showsVerticalScrollIndicator={false}
          scrollIndicatorInsets={{ top: 130, bottom: insets.bottom + 80 }}
          scrollEnabled={scrollEnabled}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          {/* Map View Card */}
          <MapViewCard 
            clubs={filteredClubs.length ? filteredClubs : clubs} 
            loading={clubsLoading}
            onMarkerPress={handleMapMarkerPress}
            cityName={selectedCity.name}
            height={190}
            onMapInteractionStart={() => setScrollEnabled(false)}
            onMapInteractionEnd={() => setScrollEnabled(true)}
          />
          
          {/* User Club List Header */}
          <UserClubListHeader
            headerSpacing={HEADER_SPACING}
            selectedTypes={selectedTypes}
            onTypeSelect={handleToggleType}
          />

          {/* Clubs List */}
          {filteredClubs.length > 0 ? (
            filteredClubs.map((club) => (
              <UserClubListItem
                key={club._id}
                club={club}
                cityName={selectedCity.name}
                onPress={handleViewEvents}
              />
            ))
          ) : (
            <EmptyClubsView 
              title="No clubs found"
              subtitle="Try changing city, types or search keywords."
            />
          )}
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
          type="clubs"
          initialClubFilters={clubFilters}
          onApply={({ club }) => setClubFilters(club)}
        />
      </View>
      <FloatingChatButton onPress={handleChatButtonPress} /> 
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
  mapViewContainer: {
    backgroundColor: Colors.background,
  },
  mapCardShell: {},
  mapCardClip: {},
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
  // Search Bar
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  // Content Sections
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20, 
    paddingHorizontal: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  // Enhanced Category Selector Container
  categoryContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  // Clubs Header Section
  clubsHeaderContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: Colors.backgroundSecondary,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  clubsHeaderTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center',
  },
  clubsHeaderSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Club Cards - Matching EventsList styling
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
  // Original styles (keeping these for compatibility)
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
    flex: 1,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cityEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  locationTexts: {
    flex: 1,
  },
  locationText: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  locationSubtext: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
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
  sectionContainer: {
    marginVertical: 8,
  },
  clubsListContainer: {
    marginTop: 16,
  },
  clubsList: {
    paddingHorizontal: 0,
  },
  clubCardWrapper: {
    marginBottom: 8,
  },
  // Test styles (keeping for compatibility)
  testContainer: {
    backgroundColor: Colors.backgroundSecondary,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  testText: {
    color: Colors.textPrimary,
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
  },
  typesTestContainer: {
    backgroundColor: Colors.backgroundTertiary,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  simpleCard: {
    backgroundColor: Colors.backgroundTertiary,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  simpleClubCard: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
    alignItems: 'center',
  },
  simpleClubImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: Colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  imageText: {
    fontSize: 24,
  },
  simpleClubInfo: {
    flex: 1,
  },
  clubNameSimple: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  clubTypeSimple: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  clubDistanceSimple: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  simpleFavoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.withOpacity.black30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteText: {
    fontSize: 20,
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
  // New styles for FlatList and EmptyClubsView
  heroBanner: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  heroTitle: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
    marginHorizontal: 16,
  },
  bottomTestSection: {
    padding: 16,
    alignItems: 'center',
  },
  bottomTestText: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },

});

export default UserClubScreen;