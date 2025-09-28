import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Colors } from "@/constants/Colors";
import type { City } from "@/components/ui/CityPickerModal";
import { Filter as FilterIcon, MapPin } from "lucide-react-native";
import { ChevronDown } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

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
  onFilterPress,
}) => {
  return (
    <View style={styles.locationHeader}>
      {/* Left: Location Selector */}
      <LinearGradient
        colors={[Colors.withOpacity.white10, Colors.withOpacity.white10]}
        style={styles.gradientPill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity
          style={styles.locationSelector}
          onPress={onLocationPress}
          activeOpacity={0.85}
        >
          <MapPin
            color={Colors.primary}
            size={16}
            style={styles.locationIcon}
          />
          <Text style={styles.locationText}>{selectedCity.name}</Text>
          <ChevronDown
            color={Colors.textPrimary}
            size={14}
            style={styles.chevron}
          />
        </TouchableOpacity>
      </LinearGradient>

      {/* Center: Dubai Skyline */}
      <View style={styles.skylineContainer}>
        <Image
          source={require("@/assets/images/dubai-skyline.png")}
          style={styles.skylineImage}
          resizeMode="contain"
        />
      </View>

      {/* Right: Filter Button */}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={onFilterPress}
        activeOpacity={0.85}
      >
        <FilterIcon color={Colors.primary} size={18} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  locationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 56,
  },
  logo: {
    width: 22,
    height: 22,
    borderRadius: 6,
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.withOpacity.black60,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  gradientPill: {
    borderRadius: 999,
    padding: 1,
  },
  locationSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.withOpacity.black60,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 999,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
    minHeight: 34,
    maxWidth: 120,
  },
  locationIcon: {
    width: 14,
    height: 14,
    tintColor: Colors.textPrimary,
  },
  locationText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
    lineHeight: 16,
  },
  chevron: { marginLeft: 2 },
  skylineContainer: {
    position: "absolute",
    left: "65%",
    top: "68%",
    transform: [{ translateX: -100 }, { translateY: -20 }],
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    zIndex: 1,
  },
  skylineImage: {
    width: 200,
    height: 40,
    opacity: 0.75,
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
    zIndex: 2,
  },
});

export default LocationHeader;
