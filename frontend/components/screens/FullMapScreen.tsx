import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Platform, PixelRatio, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router';  
import ClubMarker from '@/components/Map/ClubMarker';
import { extractCoordinatesFromMapLink, calculateMapRegion } from '@/utils/mapUtils';
import darkMapStyle from '@/utils/mapStyles';
import apiClient from '@/app/api/client';
import { Colors } from '@/constants/Colors';
import ClubQuickViewModal from '@/components/Models/ClubQuickViewModal';
import { useBookingHeatmap } from '@/hooks/useBookingHeatmap';

type Club = {
  _id: string;
  name: string;
  mapLink?: string;
  logoUrl?: string;
  coverBannerUrl?: string;
  photos?: string[];
  clubImages?: string[];
  typeOfVenue?: string;
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

  const [mapRegion, setMapRegion] = useState(region);
  useEffect(() => { setMapRegion(region); }, [region]);

  const [heatmapEnabled, setHeatmapEnabled] = useState(true);
  const { points: heatPoints } = useBookingHeatmap({
    city: typeof city === 'string' ? city : undefined,
    region: mapRegion,
    enabled: heatmapEnabled,
  });

  // Scale heatmap visibility based on zoom level (latitudeDelta)
  // Boosted curve so heat remains prominent even when zoomed out
  const zoomScale = useMemo(() => {
    const d = (mapRegion as any)?.latitudeDelta || 0.5;
    // Gentle exponential scaling; keeps heat visible at wide deltas
    const s = Math.pow(d / 0.18, 1.05);
    return Math.min(Math.max(s, 1), 18);
  }, [mapRegion]);

  const minRadius = useMemo(() => {
    const d = (mapRegion as any)?.latitudeDelta || 0.5;
    if (d > 4) return 1200;
    if (d > 2) return 800;
    if (d > 1) return 450;
    if (d > 0.5) return 240;
    return 120;
  }, [mapRegion]);

  const getCircleVisuals = (weight: number) => {
    // Blended heat with softer falloff: outer layers very transparent for smoother gradients
    const intensity = Math.max(1, Math.min(weight, 100));
    const baseRadius = Math.min(380 + intensity * 24, 4600);

    if (intensity >= 70) {
      return {
        radius: baseRadius,
        layers: [
          { scale: 1.55, color: 'rgba(0, 122, 255, 0.06)' },
          { scale: 1.38, color: 'rgba(0, 122, 255, 0.08)' },
          { scale: 1.18, color: 'rgba(255, 204, 0, 0.14)' },
          { scale: 0.98, color: 'rgba(255, 159, 10, 0.18)' },
          { scale: 0.78, color: 'rgba(255, 99, 71, 0.22)' },
          { scale: 0.60, color: 'rgba(255, 59, 48, 0.28)' },
        ],
      };
    }
    if (intensity >= 30) {
      return {
        radius: Math.min(340 + intensity * 22, 3800),
        layers: [
          { scale: 1.45, color: 'rgba(0, 122, 255, 0.06)' },
          { scale: 1.22, color: 'rgba(0, 122, 255, 0.08)' },
          { scale: 1.02, color: 'rgba(0, 122, 255, 0.10)' },
          { scale: 0.84, color: 'rgba(255, 204, 0, 0.16)' },
          { scale: 0.66, color: 'rgba(255, 159, 10, 0.18)' },
        ],
      };
    }
    return {
      radius: Math.min(280 + intensity * 16, 3200),
      layers: [
        { scale: 1.35, color: 'rgba(0, 122, 255, 0.06)' },
        { scale: 1.10, color: 'rgba(0, 122, 255, 0.08)' },
        { scale: 0.88, color: 'rgba(0, 122, 255, 0.10)' },
      ],
    };
  };

  // START OF ADDED CODE FOR PADDING
  const mapPadding = useMemo(() => {
    const paddingBottom = 0;
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
        region={mapRegion}
        customMapStyle={darkMapStyle}
        mapPadding={mapPadding as any}
        showsCompass={false}
        showsMyLocationButton={false}
        showsScale={false}
        showsTraffic={false}
        showsBuildings={false}
        showsIndoors={false}
        showsIndoorLevelPicker={false}
        toolbarEnabled={false}
        showsPointsOfInterest={false}
      >
        {heatmapEnabled && heatPoints.map((p, idx) => {
          const { radius, layers } = getCircleVisuals(p.weight) as any;
          return (
            <React.Fragment key={`fm-hm-${idx}`}>
              {layers.map((layer: any, i: number) => (
                <Circle
                  key={`fm-hm-${idx}-${i}`}
                  center={{ latitude: p.latitude, longitude: p.longitude }}
                  radius={Math.max(radius * (layer.scale ?? 1) * zoomScale, minRadius)}
                  fillColor={layer.color}
                  strokeColor={layer.color}
                  strokeWidth={0}
                />
              ))}
            </React.Fragment>
          );
        })}
        {/* Club-centered halos to place clubs in the middle of a visible heat area */}
        {clubsWithCoordinates.map((club, cIdx) => {
          const center = club.coordinates as any;
          const base = Math.max(280 * zoomScale, minRadius * 0.9);
          return (
            <React.Fragment key={`fm-halo-${club._id}-${cIdx}`}>
              <Circle
                center={center}
                radius={base * 1.55}
                fillColor={'rgba(0, 122, 255, 0.06)'}
                strokeColor={'rgba(0, 122, 255, 0.06)'}
                strokeWidth={0}
              />
              <Circle
                center={center}
                radius={base * 1.18}
                fillColor={'rgba(0, 122, 255, 0.08)'}
                strokeColor={'rgba(0, 122, 255, 0.08)'}
                strokeWidth={0}
              />
              <Circle
                center={center}
                radius={base * 0.78}
                fillColor={'rgba(255, 204, 0, 0.16)'}
                strokeColor={'rgba(255, 204, 0, 0.16)'}
                strokeWidth={0}
              />
            </React.Fragment>
          );
        })}
        {clubsWithCoordinates.map((club) => {
          const image = club.logoUrl || club.coverBannerUrl || club.clubImages?.[0] || club.photos?.[0] || null;
          return (
            <Marker 
              key={club._id} 
              coordinate={club.coordinates as any} 
              anchor={{ x: 0.5, y: 0.9 }}
              centerOffset={{ x: 0, y: 0 }}
              onPress={() => { setSelected(club); setModalVisible(true); }}
            >
              <ClubMarker title={club.name} image={image} size={56} theme={'dark'} clubType={club.typeOfVenue} />
            </Marker>
          );
        })}
      </MapView>
      <ClubQuickViewModal 
        visible={modalVisible} 
        club={selected}
        onClose={() => setModalVisible(false)}
        onView={(c) => { setModalVisible(false); router.push(`/club/userClubDetailsScreen?clubId=${c._id}`); }}
        inline
      />
      <TouchableOpacity
        onPress={() => setHeatmapEnabled(v => !v)}
        style={styles.heatmapBtn}
        activeOpacity={0.85}
      >
        <Text style={styles.heatmapText}>{heatmapEnabled ? 'Heatmap: ON' : 'Heatmap: OFF'}</Text>
      </TouchableOpacity>
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
  heatmapBtn: {
    position: 'absolute',
    top: 50,
    right: 14,
    zIndex: 30,
    backgroundColor: Colors.withOpacity.white10,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white30,
  },
  heatmapText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
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


