import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity, Platform, PixelRatio } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { extractCoordinatesFromMapLink, calculateMapRegion } from '@/utils/mapUtils';
import { darkMapStyle } from '@/utils/mapStyles';
import ClubMarker from '@/components/Map/ClubMarker';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { Maximize2 } from 'lucide-react-native';

type Club = {
  _id: string;
  name: string;
  typeOfVenue?: string;
  address?: string;
  mapLink?: string;
  logoUrl?: string;
  coverBannerUrl?: string;
  photos?: string[];
  clubImages?: string[];
};

type MapViewCardProps = {
  clubs: Club[];
  loading?: boolean;
  height?: number;
  onMarkerPress?: (club: any) => void;
  cityName?: string;
};

const MapViewCard: React.FC<MapViewCardProps> = ({ 
  clubs, 
  loading = false, 
  height = 190,
  onMarkerPress,
  cityName,
}) => {
  const clubsWithCoordinates = useMemo(() => {
    return (clubs || [])
      .map((club) => ({
        ...club,
        coordinates: extractCoordinatesFromMapLink(club.mapLink || ''),
      }))
      .filter((c) => !!c.coordinates);
  }, [clubs]);

  const region = useMemo(() => {
    const coords = clubsWithCoordinates
      .map((c) => c.coordinates!)
      .filter(Boolean);
    return calculateMapRegion(coords);
  }, [clubsWithCoordinates]);

  const handleMarkerPress = useCallback((club: Club) => {
    if (onMarkerPress) {
      onMarkerPress(club);
    }
  }, [onMarkerPress]);

  const [mapReady, setMapReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setMapReady(true), 1500);
    return () => clearTimeout(t);
  }, []);

  // START OF ADDED CODE FOR PADDING
  const mapPadding = useMemo(() => {
    const paddingBottom = 90; // You can adjust this value as needed

    const iosPadding = {
      top: 0,
      right: 0,
      bottom: paddingBottom,
      left: 0,
    };

    const androidPadding = {
      top: PixelRatio.getPixelSizeForLayoutSize(0),
      right: PixelRatio.getPixelSizeForLayoutSize(0),
      bottom: PixelRatio.getPixelSizeForLayoutSize(paddingBottom),
      left: PixelRatio.getPixelSizeForLayoutSize(0),
    };

    return Platform.select({
      ios: iosPadding,
      android: androidPadding,
    });
  }, []);
  // END OF ADDED CODE FOR PADDING

  if (loading && !mapReady) {
    return (
      <View style={[styles.cardContainer, { height }]}>        
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.cardOuter, { height }]}>      
      <LinearGradient
        colors={[Colors.withOpacity.white10, Colors.withOpacity.black30]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.cardContainer}>
          <View style={styles.mapWrapper}>
            <TouchableOpacity
              onPress={() => router.push(cityName ? `/fullMap?city=${encodeURIComponent(cityName)}` : '/fullMap')}
              activeOpacity={0.85}
              style={styles.fullscreenBtn}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
              onLayout={() => setMapReady(true)}
            >
              <Maximize2 size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              region={region}
              showsUserLocation={false}
              showsCompass={false}
              mapType="standard"
              customMapStyle={darkMapStyle as any}
              moveOnMarkerPress={false}
              onMapReady={() => setMapReady(true)}
              showsMyLocationButton={true}
              showsScale={false}
              showsTraffic={false}
              showsBuildings={false}
              showsPointsOfInterest={false}
              showsIndoors={false}
              showsIndoorLevelPicker={false}
              toolbarEnabled={false}
              mapPadding={mapPadding}
            >
              {clubsWithCoordinates.map((club) => {
                const image = club.logoUrl || club.coverBannerUrl || club.clubImages?.[0] || club.photos?.[0] || null;
                return (
                  <Marker
                    key={club._id}
                    coordinate={club.coordinates as any}
                    anchor={{ x: 0.5, y: 1 }}
                    centerOffset={{ x: 0, y: 0 }}
                    onPress={() => handleMarkerPress(club)}
                  >
                    <ClubMarker 
                      title={club.name} 
                      image={image} 
                      size={50}
                      theme={'dark'}
                      clubType={club.typeOfVenue}
                    />
                  </Marker>
                );
              })}
            </MapView>
          </View>
          <LinearGradient
            pointerEvents="none"
            colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0)"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.topLight}
          />
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  cardOuter: {
    marginHorizontal: 16,
    marginTop: 2,
    borderRadius: 18,
    paddingBottom: 0,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 18,
    padding: 1.5,
  },
  cardContainer: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 0.5,
    borderColor: Colors.withOpacity.black30,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  mapWrapper: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0,
  },
  map: {
    flex: 1,
    backgroundColor: '#0B0B0F'
  },
  fullscreenBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: Colors.withOpacity.white10,
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.withOpacity.white30,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
  },
  fullscreenIcon: {
    width: 20,
    height: 20,
    tintColor: Colors.textPrimary,
  },
  topLight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  clubCountText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  loadingText: {
    color: '#9CA3AF',
    marginTop: 12,
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default MapViewCard;