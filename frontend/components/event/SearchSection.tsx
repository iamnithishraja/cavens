import React from 'react';
import { View, StyleSheet } from 'react-native';
import SearchBar from './SearchBar';

interface SearchSectionProps {
  value: string;
  onChangeText: (text: string) => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({ value, onChangeText }) => {
  return (
    <View style={styles.searchContainer}>
      <SearchBar value={value} onChangeText={onChangeText} />
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
