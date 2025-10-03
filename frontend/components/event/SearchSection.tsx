import React from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import SearchBar from "./SearchBar";
import { Colors } from "@/constants/Colors";
import AnimatedGlow from "react-native-animated-glow";
import SearchFilterPreset from "@/components/ui/presets/searchFilter";

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
        <AnimatedGlow preset={SearchFilterPreset}>
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
            onFilterPress={onFilterPress}
          />
        </AnimatedGlow>
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
