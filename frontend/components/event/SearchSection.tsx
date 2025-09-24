import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import SearchBar from "./SearchBar";
import { Filter as FilterIcon } from "lucide-react-native";
import { Colors } from "@/constants/Colors";

interface SearchSectionProps {
  value: string;
  onChangeText: (text: string) => void;
  cityName?: string;
  onFilterPress?: () => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({
  value,
  onChangeText,
  cityName,
  onFilterPress,
}) => {
  const router = useRouter();
  return (
    <View style={styles.row}>
      <View style={styles.searchContainer}>
        <SearchBar
          value={value}
          onChangeText={onChangeText}
          onFocusNavigate={() =>
            router.push(
              `/search?mode=events${
                cityName ? `&city=${encodeURIComponent(cityName)}` : ""
              }`
            )
          }
        />
      </View>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={onFilterPress}
        activeOpacity={0.85}
      >
        <FilterIcon color={Colors.textPrimary} size={18} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchContainer: {
    flex: 1,
    marginRight: 8,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.withOpacity.black60,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
});

export default SearchSection;
