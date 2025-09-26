import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from "react-native";
import { Colors } from "@/constants/Colors";
import type { EventItem } from "./types";

export type TimelineTab = "tonight" | "this_week" | "next_week" | "upcoming";

interface TimelineFilterTabsProps {
  activeTab: TimelineTab;
  onTabChange: (tab: TimelineTab) => void;
  allEvents: EventItem[];
  loading: boolean;
}

const TimelineFilterTabs: React.FC<TimelineFilterTabsProps> = ({
  activeTab,
  onTabChange,
  allEvents,
  loading,
}) => {
  const tabs = [
    { key: "tonight" as const, label: "Tonight" },
    { key: "this_week" as const, label: "This Week" },
    { key: "next_week" as const, label: "Next Week" },
    { key: "upcoming" as const, label: "Upcoming" },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scroll}
    >
      {tabs.map((tab, idx) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              isActive && styles.activeTab,
              idx === 0 && styles.firstTab,
            ]}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.9}
          >
            <Text
              style={[styles.tabText, isActive && styles.activeTabText]}
              numberOfLines={1}
              ellipsizeMode="tail"
              allowFontScaling={false}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  tab: {
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: "#011C51",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    marginRight: 8,
  },
  firstTab: {
    marginLeft: 4,
  },
  activeTab: {
    backgroundColor: Colors.backgroundSecondary,
    borderColor: "#011C51",
  },
  tabText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
    textAlign: "center",
  },
  activeTabText: {
    color: Colors.primary,
  },
});

export default TimelineFilterTabs;

export const getDateRange = (timeline: TimelineTab) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (timeline) {
    case "tonight": {
      const tonight = new Date(today);
      tonight.setHours(23, 59, 59, 999);
      return { start: today, end: tonight };
    }
    case "this_week": {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      return { start: startOfWeek, end: endOfWeek };
    }
    case "next_week": {
      const startOfNextWeek = new Date(today);
      startOfNextWeek.setDate(today.getDate() - today.getDay() + 7);
      const endOfNextWeek = new Date(startOfNextWeek);
      endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);
      endOfNextWeek.setHours(23, 59, 59, 999);
      return { start: startOfNextWeek, end: endOfNextWeek };
    }
    case "upcoming": {
      // Start from tomorrow to include near-future events
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const farFuture = new Date(today);
      farFuture.setFullYear(today.getFullYear() + 1);
      return { start: tomorrow, end: farFuture };
    }
    default:
      return { start: today, end: new Date(today.getFullYear() + 1, 11, 31) };
  }
};
