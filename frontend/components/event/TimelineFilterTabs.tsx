import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import type { EventItem } from './types';

export type TimelineTab = 'tonight' | 'this_week' | 'next_week' | 'upcoming';

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
  loading
}) => {


  // Get event count for a specific timeline tab
  const getEventCountForTab = (timeline: TimelineTab): number => {
    const { start, end } = getDateRange(timeline);
    return allEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= start && eventDate <= end;
    }).length;
  };

  const tabs = [
    { key: 'tonight' as const, label: 'Tonight' },
    { key: 'this_week' as const, label: 'This Week' },
    { key: 'next_week' as const, label: 'Next Week' },
    { key: 'upcoming' as const, label: 'Upcoming' },
  ];

  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, activeTab === tab.key && styles.activeTab]}
          onPress={() => onTabChange(tab.key)}
        >
          <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.withOpacity.white10,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'relative',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.tabActive,
  },
  tabText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabText: {
    color: Colors.textPrimary,
  },
});

// Helper function to get date ranges for each timeline - exported for use in other components  
export const getDateRange = (timeline: TimelineTab) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (timeline) {
    case 'tonight':
      const tonight = new Date(today);
      tonight.setHours(23, 59, 59, 999);
      return { start: today, end: tonight };
      
    case 'this_week':
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Start of current week (Sunday)
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // End of current week (Saturday)
      endOfWeek.setHours(23, 59, 59, 999);
      return { start: startOfWeek, end: endOfWeek };
      
    case 'next_week':
      const startOfNextWeek = new Date(today);
      startOfNextWeek.setDate(today.getDate() - today.getDay() + 7); // Start of next week
      const endOfNextWeek = new Date(startOfNextWeek);
      endOfNextWeek.setDate(startOfNextWeek.getDate() + 6); // End of next week
      endOfNextWeek.setHours(23, 59, 59, 999);
      return { start: startOfNextWeek, end: endOfNextWeek };
      
    case 'upcoming':
      const twoWeeksFromNow = new Date(today);
      twoWeeksFromNow.setDate(today.getDate() + 14);
      const farFuture = new Date(today);
      farFuture.setFullYear(today.getFullYear() + 1); // 1 year from now
      return { start: twoWeeksFromNow, end: farFuture };
      
    default:
      return { start: today, end: new Date(today.getFullYear() + 1, 11, 31) };
  }
};

export default TimelineFilterTabs;
