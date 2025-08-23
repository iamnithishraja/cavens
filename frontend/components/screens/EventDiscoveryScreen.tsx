import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import CityDropdown from "@/components/event/CityDropdown";
import SearchBar from "@/components/event/SearchBar";
import FilterDropdown from "@/components/event/FilterDropdown";
import FeaturedCarousel from "@/components/event/FeaturedCarousel";
import EventCard from "@/components/event/EventCard";
import { SAMPLE_EVENTS } from "@/components/event/data";
import type { City, EventItem } from "@/components/event/types";
import GlowingText from "@/components/ui/GlowingText";

type Props = {
  onSelectEvent?: (e: EventItem) => void;
};

const EventDiscoveryScreen: React.FC<Props> = ({ onSelectEvent }) => {
  const [city, setCity] = useState<City>("Dubai");
  const [search, setSearch] = useState("");
  const [cityOpen, setCityOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined);

  const filtered = useMemo(() => {
    const base = SAMPLE_EVENTS;
    if (!search.trim()) return base;
    const q = search.trim().toLowerCase();
    return base.filter((e) =>
      e.name.toLowerCase().includes(q) ||
      e.djArtists.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Header with location and filter - styled like ClubDetailsHeader */}
        <LinearGradient
          colors={Colors.gradients.dark as [string, string]}
          style={styles.headerSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <LinearGradient
            colors={Colors.gradients.blueGlow as [string, string]}
            style={styles.headerGlow}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0.4 }}
          />
          <View style={styles.headerContent}>
            <View style={styles.locationSection}>
              <TouchableOpacity 
                style={styles.locationBtn} 
                onPress={() => setCityOpen((v) => !v)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[Colors.surfaceElevated, Colors.surface]}
                  style={styles.locationBtnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Image 
                    source={{ uri: "https://img.icons8.com/ios/50/4EA2FF/marker.png" }} 
                    style={styles.locationIcon} 
                  />
                  <Text style={styles.locationText}>{city}</Text>
                  <Image 
                    source={{ uri: "https://img.icons8.com/ios/50/FFFFFF/chevron-down.png" }} 
                    style={styles.chevron} 
                  />
                </LinearGradient>
              </TouchableOpacity>
              {cityOpen && (
                <View style={styles.cityDropdownContainer}>
                  <CityDropdown 
                    open={cityOpen} 
                    value={city} 
                    onChange={setCity} 
                    onClose={() => setCityOpen(false)} 
                  />
                </View>
              )}
            </View>

            <View style={styles.filterSection}>
              <TouchableOpacity 
                style={styles.filterBtn} 
                onPress={() => setFilterOpen((v) => !v)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[Colors.surfaceElevated, Colors.surface]}
                  style={styles.filterBtnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Image 
                    source={{ uri: "https://img.icons8.com/ios/50/F9D65C/filter.png" }} 
                    style={styles.filterIcon} 
                  />
                </LinearGradient>
              </TouchableOpacity>
              {filterOpen && (
                <View style={styles.filterDropdownContainer}>
                  <FilterDropdown 
                    open={filterOpen} 
                    selected={activeCategory} 
                    onSelect={(c) => setActiveCategory(c)} 
                    onClose={() => setFilterOpen(false)} 
                  />
                </View>
              )}
            </View>
          </View>
          <LinearGradient
            colors={[Colors.accentBlue + "40", "transparent"]}
            style={styles.headerBottomAccent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </LinearGradient>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <SearchBar value={search} onChangeText={setSearch} />
        </View>

        {/* Content */}
        <View style={{ marginBottom: 16 }}>
          <FeaturedCarousel events={SAMPLE_EVENTS} onPressEvent={onSelectEvent} />
          <View style={{ marginLeft: 16, marginBottom: 12 }}>
            <GlowingText>All Events</GlowingText>
          </View>
        </View>
        
        <View style={styles.eventsContainer}>
          {filtered.map((item, index) => (
            <View key={`${item._id}-${index}`} style={{ marginBottom: 12 }}>
              <EventCard event={item} onPress={onSelectEvent} />
            </View>
          ))}
        </View>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingTop: 0 
  },
  scrollContent: {
    paddingBottom: 24,
  },
  headerSection: {
    marginTop: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    zIndex: 2000,
    elevation: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderBlue,
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  headerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.25,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerBottomAccent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
  },
  locationSection: {
    flex: 1,
    position: 'relative',
    zIndex: 2001,
    elevation: 21,
  },
  locationBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.accentBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  locationBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  locationIcon: { 
    width: 20, 
    height: 20, 
    tintColor: Colors.accentBlue, 
    marginRight: 8 
  },
  locationText: { 
    color: Colors.textPrimary, 
    fontWeight: "800", 
    fontSize: 16,
    flex: 1,
  },
  chevron: { 
    width: 16, 
    height: 16, 
    tintColor: Colors.textSecondary 
  },
  cityDropdownContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 2002,
    elevation: 22,
  },
  filterSection: {
    marginLeft: 12,
    position: 'relative',
    zIndex: 2001,
    elevation: 21,
  },
  filterBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.accentYellow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  filterBtnGradient: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: { 
    width: 22, 
    height: 22, 
    tintColor: Colors.accentYellow 
  },
  filterDropdownContainer: {
    position: 'absolute',
    top: '100%',
    right: 0,
    zIndex: 2002,
    elevation: 22,
    marginTop: 2,
    minWidth: 200,
  },
  searchSection: { 
    paddingHorizontal: 16, 
    marginBottom: 16,
    zIndex: 1000,
    elevation: 10,
  },
  sectionTitle: { 
    color: Colors.textPrimary, 
    fontWeight: "800", 
    fontSize: 18, 
    marginBottom: 12,
    marginLeft: 16,
  },
  eventsContainer: {
    paddingHorizontal: 16,
  },
});

export default EventDiscoveryScreen;
