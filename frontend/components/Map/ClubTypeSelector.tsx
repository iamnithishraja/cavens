import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { Colors } from '@/constants/Colors';

export type VenueType = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export const VENUE_TYPES: VenueType[] = [
  {
    id: 'all',
    name: 'All',
    icon: 'https://img.icons8.com/ios-filled/50/FFFFFF/categorize.png',
    color: Colors.primary,
  },
  {
    id: 'nightclub',
    name: 'Nightclub',
    icon: 'https://img.icons8.com/ios-filled/50/FFFFFF/music-record.png',
    color: Colors.primary,
  },
  {
    id: 'rooftop',
    name: 'Rooftop',
    icon: 'https://img.icons8.com/ios-filled/50/FFFFFF/city-buildings.png',
    color: Colors.blueAccent,
  },
  {
    id: 'bar',
    name: 'Bar',
    icon: 'https://img.icons8.com/ios-filled/50/FFFFFF/beer.png',
    color: Colors.warning,
  },
  {
    id: 'lounge',
    name: 'Lounge',
    icon: 'https://img.icons8.com/ios-filled/50/FFFFFF/sofa.png',
    color: Colors.success,
  },
  {
    id: 'pool_club',
    name: 'Pool Club',
    icon: 'https://img.icons8.com/ios-filled/50/FFFFFF/swimming-pool.png',
    color: Colors.info,
  },
];

type Props = {
  selectedTypes: string[];
  onTypeSelect: (typeId: string) => void;
};

const ClubTypeSelector: React.FC<Props> = ({ selectedTypes, onTypeSelect }) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.typesContainer}
      >
        {VENUE_TYPES.map((type) => {
          const isSelected = type.id === 'all' ? selectedTypes.length === 0 : selectedTypes.includes(type.id);
          return (
            <TouchableOpacity
              key={type.id}
              style={styles.typeTab}
              onPress={() => onTypeSelect(type.id)}
              activeOpacity={0.8}
            >
              <View style={styles.tabContent}>
                <Image 
                  source={{ uri: type.icon }}
                  style={[
                    styles.typeIcon,
                    { tintColor: isSelected ? Colors.primary : Colors.textSecondary }
                  ]}
                />
                <Text style={[styles.typeName, { color: isSelected ? Colors.primary : Colors.textSecondary }]}>
                  {type.name}
                </Text>
              </View>
              <View style={[styles.indicator, isSelected && { backgroundColor: Colors.primary, width: 36 }]} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.withOpacity.white10,
  },
  typesContainer: {
    paddingHorizontal: 12,
    gap: 8,
  },
  typeTab: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  tabContent: {
    alignItems: 'center',
    gap: 8,
  },
  typeIcon: {
    width: 26,
    height: 26,
  },
  typeName: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  indicator: {
    marginTop: 8,
    height: 3,
    width: 0,
    backgroundColor: 'transparent',
    borderRadius: 1,
  },
});

export default ClubTypeSelector;
