import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

// Fallback coordinates for Dubai (if location access fails)
const FALLBACK_LATITUDE = 25.2048;
const FALLBACK_LONGITUDE = 55.2708;

interface UserLocation {
  latitude: number;
  longitude: number;
}

export const useLocation = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          if (!isMounted) return;
          setUserLocation({
            latitude: FALLBACK_LATITUDE,
            longitude: FALLBACK_LONGITUDE
          });
          setLocationLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        if (!isMounted) return;
        
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
      } catch (error) {
        // Use fallback coordinates
        if (!isMounted) return;
        setUserLocation({
          latitude: FALLBACK_LATITUDE,
          longitude: FALLBACK_LONGITUDE
        });
      } finally {
        if (isMounted) {
          setLocationLoading(false);
        }
      }
    };

    getCurrentLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    userLocation,
    locationLoading,
    hasLocation: !!userLocation,
    isFallbackLocation: userLocation?.latitude === FALLBACK_LATITUDE && userLocation?.longitude === FALLBACK_LONGITUDE
  };
};

export default useLocation;
