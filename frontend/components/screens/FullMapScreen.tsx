import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Platform, PixelRatio } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { darkMapStyle } from '@/utils/mapStyles';
import ClubMarker from '@/components/Map/ClubMarker';
import { extractCoordinatesFromMapLink, calculateMapRegion } from '@/utils/mapUtils';
import apiClient from '@/app/api/client';
import { Colors } from '@/constants/Colors';
import ClubQuickViewModal from '@/components/Models/ClubQuickViewModal';

type Club = {
  _id: string;
  name: string;
  mapLink?: string;
  logoUrl?: string;
  coverBannerUrl?: string;
  photos?: string[];
  clubImages?: string[];
};

const cityFallbacks: Record<string, { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number }> = {
  Dubai: { latitude: 25.2048, longitude: 55.2708, latitudeDelta: 0.3, longitudeDelta: 0.3 },
};

const FullMapScreen: React.FC = () => {
  const { city = '' } = useLocalSearchParams<{ city?: string }>();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selected, setSelected] = useState<Club | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchClubs = async () => {
      const params: Record<string, string> = {};
      if (typeof city === 'string' && city) params.city = city;
      const res = await apiClient.get('/api/club/public/approved', { params: { ...params, includeEvents: 'true' } });
      const items = (res.data?.items || []) as any[];
      setClubs(items as Club[]);
    };
    fetchClubs();
  }, [city]);

  const clubsWithCoordinates = useMemo(() => clubs
    .map((c) => ({ ...c, coordinates: extractCoordinatesFromMapLink(c.mapLink || '') }))
    .filter((c) => !!c.coordinates), [clubs]);

  const region = useMemo(() => {
    const coords = clubsWithCoordinates.map(c => c.coordinates as { latitude: number; longitude: number });
    if (coords.length > 0) return calculateMapRegion(coords);
    const fallback = cityFallbacks[(typeof city === 'string' ? city : '')] || { latitude: 28.6139, longitude: 77.2090, latitudeDelta: 0.5, longitudeDelta: 0.5 };
    return fallback;
  }, [clubsWithCoordinates, city]);

  // START OF ADDED CODE FOR PADDING
  const mapPadding = useMemo(() => {
    const paddingBottom = 900;
    const iosPadding = { top: 0, right: 0, bottom: paddingBottom, left: 0 };
    const androidPadding = {
      top: PixelRatio.getPixelSizeForLayoutSize(0),
      right: PixelRatio.getPixelSizeForLayoutSize(0),
      bottom: PixelRatio.getPixelSizeForLayoutSize(paddingBottom),
      left: PixelRatio.getPixelSizeForLayoutSize(0),
    };
    return Platform.select({ ios: iosPadding, android: androidPadding });
  }, []);
  // END OF ADDED CODE FOR PADDING

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.85}>
        <Image 
          source={{ uri: 'https://img.icons8.com/ios-filled/50/FFFFFF/left.png' }} 
          style={styles.backIcon} 
        />
      </TouchableOpacity>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        customMapStyle={darkMapStyle as any}
        showsPointsOfInterest={false}
        mapPadding={mapPadding as any}
      >
        {clubsWithCoordinates.map((club) => {
          const image = club.logoUrl || club.coverBannerUrl || club.clubImages?.[0] || club.photos?.[0] || null;
          return (
            <Marker 
              key={club._id} 
              coordinate={club.coordinates as any} 
              anchor={{ x: 0.5, y: 1 }}
              tracksViewChanges
              onPress={() => { setSelected(club); setModalVisible(true); }}
            >
              <ClubMarker title={club.name} image={image} size={56} theme={'dark'} />
            </Marker>
          );
        })}
      </MapView>
      {/* <View style={styles.clubCountBadge}>
        <Text style={styles.clubCountText}>{clubsWithCoordinates.length} of {clubs.length} clubs</Text>
      </View> */}
      <ClubQuickViewModal 
        visible={modalVisible} 
        club={selected}
        onClose={() => setModalVisible(false)}
        onView={(c) => { setModalVisible(false); router.push(`/userClubDetailsScreen?clubId=${c._id}`); }}
        inline
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  map: { flex: 1 },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 14,
    zIndex: 20,
    backgroundColor: 'transparent',
    padding: 6,
  },
  backIcon: { width: 32, height: 32, tintColor: Colors.textPrimary },
  clubCountBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(79, 70, 229, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  clubCountText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.3,
  },
});

export default FullMapScreen;


