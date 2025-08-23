import React, { useMemo, useState } from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import EventDiscoveryScreen from './EventDiscoveryScreen';
import EventDetailsScreen from './EventDetailsScreen';
import { SAMPLE_EVENTS } from '@/components/event/data';
import type { EventItem } from '@/components/event/types';
import { Colors } from '@/constants/Colors';

const UserHomeScreen = () => {
  const [selected, setSelected] = useState<EventItem | null>(null);
  const initial = useMemo(() => SAMPLE_EVENTS[0], []);

  if (selected) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <LinearGradient
          colors={Colors.gradients.background as [string, string]}
          style={styles.fullBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <EventDetailsScreen event={selected} />
        </LinearGradient>
      </SafeAreaView>
    );
  }

    return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <LinearGradient
        colors={[
          'rgba(78, 162, 255, 0.15)',
          'rgba(78, 162, 255, 0.08)', 
          'rgba(7, 11, 20, 0.95)',
          'rgba(7, 11, 20, 1)'
        ]}
        style={styles.fullBackground}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        locations={[0, 0.3, 0.7, 1]}
      >
        {/* Greeting Header */}
        {/* <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>
            {getGreeting()}, there! 
          </Text>
          <Text style={styles.subtitleText}>
            Discover amazing events happening around you
          </Text>
        </View> */}
        
        <EventDiscoveryScreen onSelectEvent={setSelected} />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  fullBackground: {
    flex: 1,
  },
  greetingContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  greetingText: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitleText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default UserHomeScreen;
