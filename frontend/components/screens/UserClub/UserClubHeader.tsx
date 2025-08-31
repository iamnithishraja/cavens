import React from 'react';
import { View, StyleSheet } from 'react-native';
import LocationHeader from '@/components/event/LocationHeader';
import SearchBar from '@/components/event/SearchBar';
import { Colors } from '@/constants/Colors';
import type { City } from '@/components/ui/CityPickerModal';

type UserClubHeaderProps = {
  selectedCity: City;
  onLocationPress: () => void;
  search: string;
  onSearchChange: (text: string) => void;
};

const UserClubHeader: React.FC<UserClubHeaderProps> = ({
  selectedCity,
  onLocationPress,
  search,
  onSearchChange,
}) => {
  return (
    <View style={styles.fixedHeader}>
      <LocationHeader
        selectedCity={selectedCity}
        onLocationPress={onLocationPress}
        userLocation={null}
        locationLoading={false}
      />
      <View style={styles.searchContainer}>
        <SearchBar
          value={search}
          onChangeText={onSearchChange}
          placeholder="Search clubs, venues..."
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
});

export default UserClubHeader;

