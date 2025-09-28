import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Colors } from "@/constants/Colors";
import type { EventItem } from "./types";
import type { City } from "@/components/ui/CityPickerModal";
import type { TimelineTab } from "./TimelineFilterTabs";
import { Calendar, Music2, MapPin } from "lucide-react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";

interface EventsListProps {
  filteredEvents: EventItem[];
  selectedCity: City;
  activeTab: TimelineTab;
  search: string;
  onEventPress: (eventId: string) => void;
  onClearSearch: () => void;
}

const EventsList: React.FC<EventsListProps> = ({
  filteredEvents,
  selectedCity,
  activeTab,
  search,
  onEventPress,
  onClearSearch,
}) => {
  console.log("EventsList received:", filteredEvents.length, "events");
  const getClubName = (event: EventItem) => event.venue || "Club Name";
  const getArtist = (event: EventItem) => (event as any).djArtists || "";
  const getGenres = (event: EventItem) => {
    const g = (event as any).genres || (event as any).musicGenres || "";
    if (Array.isArray(g)) return g.join(", ");
    return g as string;
  };
  const getDistance = (event: EventItem) => {
    if (event.distanceInMeters != null) {
      console.log("Distance in meters:", event.distanceInMeters);
      // Check if the value is already in km (if it's less than 1000, it might be km)
      const km =
        event.distanceInMeters < 1000
          ? event.distanceInMeters
          : event.distanceInMeters / 1000;
      return `${km.toFixed(1)} km away`;
    }
    if (event.distance) {
      return event.distance;
    }
    return null;
  };
  const getDayAndVenue = (event: EventItem) => {
    try {
      const d = new Date(event.date);
      const day = d.toLocaleDateString("en-US", { weekday: "short" });
      return `${day} • ${getClubName(event)}`;
    } catch {
      return getClubName(event);
    }
  };

  if (filteredEvents.length === 0) {
    return (
      <View style={styles.noEventsContainer}>
        <Image
          source={{
            uri: "https://img.icons8.com/ios/100/CCCCCC/calendar--v1.png",
          }}
          style={styles.noEventsIcon}
        />
        <Text style={styles.noEventsTitle}>No Events Found</Text>
        <Text style={styles.noEventsSubtitle}>
          {search
            ? `No events match "${search}" for ${activeTab.replace("_", " ")}`
            : `No events scheduled for ${activeTab.replace("_", " ")}`}
        </Text>
        {search && (
          <TouchableOpacity
            style={styles.clearSearchButton}
            onPress={onClearSearch}
          >
            <Text style={styles.clearSearchButtonText}>Clear Search</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.listContainer}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {filteredEvents.map((event, index) => (
        <TouchableOpacity
          key={`${event._id}-${index}`}
          style={styles.card}
          onPress={() => onEventPress(event._id || "")}
          activeOpacity={0.9}
        >
          <BlurView
            style={StyleSheet.absoluteFill}
            intensity={28}
            tint="dark"
          />
          <LinearGradient
            colors={["rgba(255,255,255,0.06)", "rgba(255,255,255,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />

          <Image source={{ uri: event.coverImage }} style={styles.cover} />

          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={1}>
              {event.name}
            </Text>
            {!!getArtist(event) && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {getArtist(event)}
              </Text>
            )}

            <View style={styles.metaRow}>
              <Calendar
                color={Colors.textPrimary}
                size={16}
                style={styles.metaIcon}
              />
              <Text style={styles.metaText} numberOfLines={1}>
                {getDayAndVenue(event)}
              </Text>
            </View>

            {!!getGenres(event) && (
              <View style={styles.metaRow}>
                <Music2
                  color={Colors.textPrimary}
                  size={16}
                  style={styles.metaIcon}
                />
                <Text style={styles.metaText} numberOfLines={1}>
                  {getGenres(event)}
                </Text>
              </View>
            )}

            {getDistance(event) && (
              <View style={styles.metaRow}>
                <MapPin
                  color={Colors.primary}
                  size={16}
                  style={styles.metaIcon}
                />
                <Text
                  style={[styles.metaText, { color: Colors.primary }]}
                  numberOfLines={1}
                >
                  {getDistance(event)}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.28)",
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
    padding: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    overflow: "hidden",
  },
  cover: {
    width: 72,
    height: 72,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: Colors.backgroundSecondary,
  },
  content: {
    flex: 1,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.2,
    marginBottom: 1,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  metaIcon: {
    marginRight: 6,
    opacity: 0.9,
  },
  metaText: {
    color: Colors.textPrimary,
    fontSize: 14,
    opacity: 0.95,
  },
  // Empty state
  noEventsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  noEventsIcon: {
    width: 80,
    height: 80,
    marginBottom: 16,
    opacity: 0.5,
  },
  noEventsTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  noEventsSubtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  clearSearchButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  },
  clearSearchButtonText: {
    color: Colors.button.text,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EventsList;
