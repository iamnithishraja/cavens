import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Colors } from "@/constants/Colors";
import type { City } from "@/components/ui/CityPickerModal";
import { Filter as FilterIcon, MapPin } from "lucide-react-native";
import { ChevronDown } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

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
          <LinearGradient
            colors={[
              Colors.primary + '20',
              Colors.primary + '12',
              Colors.primary + '08',
              'transparent'
            ]}
            locations={[0, 0.3, 0.7, 1]}
            style={styles.shineOverlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
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
      <LinearGradient
        colors={[Colors.withOpacity.white10, Colors.withOpacity.white10]}
        style={styles.gradientPill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity
          style={styles.filterButton}
          onPress={onFilterPress}
          activeOpacity={0.85}
        >
          <BlurView style={styles.filterBlur} intensity={18} tint="dark" />
          <LinearGradient
            colors={[
              Colors.primary + '18',
              Colors.primary + '10',
              Colors.primary + '08',
              'transparent'
            ]}
            locations={[0, 0.3, 0.7, 1]}
            style={styles.filterShineOverlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          <FilterIcon color={Colors.primary} size={18} />
        </TouchableOpacity>
      </LinearGradient>
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
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
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
    borderColor: "rgba(1,28,81,0.35)",
    minHeight: 34,
    maxWidth: 120,
    position: "relative",
    shadowColor: "#011C51",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  shineOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 999,
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
    left: "55%",
    top: "68%",
    transform: [{ translateX: -100 }, { translateY: -20 }],
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    zIndex: 1,
  },
  skylineImage: {
    width: 400,
    height: 40,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.withOpacity.black60,
    borderWidth: 1,
    borderColor: "rgba(1,28,81,0.35)",
    zIndex: 2,
    shadowColor: "#011C51",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    position: "relative",
  },
  filterBlur: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 18,
  },
  filterShineOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 18,
  },
});

export default LocationHeader;
