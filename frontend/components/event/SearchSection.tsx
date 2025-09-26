import React from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import SearchBar from "./SearchBar";
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
      <View style={styles.searchContainerFull}>
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
  searchContainerFull: {
    flex: 1,
  },
});

export default SearchSection;
