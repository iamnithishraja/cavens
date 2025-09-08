import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import SearchBar from './SearchBar';

interface SearchSectionProps {
  value: string;
  onChangeText: (text: string) => void;
  cityName?: string;
}

const SearchSection: React.FC<SearchSectionProps> = ({ value, onChangeText, cityName }) => {
  const router = useRouter();
  return (
    <View style={styles.searchContainer}>
      <SearchBar
        value={value}
        onChangeText={onChangeText}
        onFocusNavigate={() => router.push(`/search?mode=events${cityName ? `&city=${encodeURIComponent(cityName)}` : ''}`)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
});

export default SearchSection;
