import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
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
  onFilterPress?: () => void;
}

const LocationHeader: React.FC<LocationHeaderProps> = ({
  selectedCity,
  onLocationPress,
  userLocation,
  locationLoading,
  onFilterPress
}) => {
  return (
    <View style={styles.locationHeader}>
      <TouchableOpacity 
        style={styles.locationSelector}
        onPress={onLocationPress}
      >
        <Image 
          source={{ uri: "https://img.icons8.com/ios/50/4EA2FF/marker.png" }}
          style={styles.locationIcon}
        />
        <Text style={styles.locationText}>{selectedCity.name}</Text>
        <Image 
          source={{ uri: "https://img.icons8.com/ios/50/FFFFFF/chevron-down.png" }}
          style={styles.chevronIcon}
        />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
        <Image 
          source={{ uri: "https://img.icons8.com/ios/50/FFFFFF/menu--v1.png" }}
          style={styles.filterIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
    tintColor: Colors.textSecondary,
    marginLeft: 4,
  },
  filterButton: {
    padding: 8,
  },
  filterIcon: {
    width: 24,
    height: 24,
    tintColor: Colors.textPrimary,
  },
});

export default LocationHeader;
