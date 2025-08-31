import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import type { City } from '@/components/ui/CityPickerModal';

interface LocationHeaderProps {
  selectedCity: City;
  onLocationPress: () => void;
  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
  locationLoading: boolean;
}

const LocationHeader: React.FC<LocationHeaderProps> = ({
  selectedCity,
  onLocationPress,
  userLocation,
  locationLoading
}) => {
  return (
    <TouchableOpacity style={styles.locationContainer} onPress={onLocationPress}>
      <View style={styles.locationInfo}>
        <Text style={styles.cityEmoji}>{selectedCity.emoji}</Text>
        <View style={styles.locationTexts}>
          <Text style={styles.locationText}>
            {selectedCity.name}
          </Text>
          <Text style={styles.locationSubtext}>
            {locationLoading ? 'Getting location...' : 'Tap to change city'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
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
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  locationSubtext: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default LocationHeader;
