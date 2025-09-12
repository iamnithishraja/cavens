import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Linking, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import apiClient from '@/app/api/client';
import Background from '@/components/common/Background';
import LoadingScreen from '@/components/common/LoadingScreen';
import TimelineFilterTabs, { type TimelineTab, getDateRange } from '@/components/event/TimelineFilterTabs';
import EventsList from '@/components/event/EventsList';
import type { EventItem } from '@/components/event/types';
import type { City } from '@/components/ui/CityPickerModal';

export default function UserClubDetailsRoute() {
  const { clubId } = useLocalSearchParams<{ clubId: string }>();
  const router = useRouter();
  const [club, setClub] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TimelineTab>('tonight');

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const res = await apiClient.get(`/api/club/public/${clubId}`);
        setClub(res.data?.club || null);
      } catch (e) {
        console.error('Failed to load club details', e);
        setClub(null);
      } finally {
        setLoading(false);
      }
    };
    if (clubId) fetchClub();
  }, [clubId]);

  const allEvents: EventItem[] = useMemo(() => {
    const events = (club?.events || []) as EventItem[];
    return events.map((e) => ({ ...e, venue: club?.name || e.venue }));
  }, [club]);

  const filteredEvents: EventItem[] = useMemo(() => {
    const { start, end } = getDateRange(activeTab);
    const withinRange = (allEvents || []).filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate >= start && eventDate <= end;
    });
    return withinRange.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [allEvents, activeTab]);

  const openMaps = () => {
    if (!club) return;
    const url = club.mapLink && club.mapLink.length > 0
      ? club.mapLink
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(club.name || '')}`;
    Linking.openURL(url).catch(() => {});
  };

  const { width } = Dimensions.get('window');
  const heroHeight = Math.round(width * 0.56);

  const selectedCity: City = useMemo(() => {
    const name = (club?.city || 'Dubai').trim();
    const normalized = name.toLowerCase();
    if (normalized.includes('abu')) return { id: 'abu_dhabi', name: 'Abu Dhabi', emoji: '🕌', country: 'United Arab Emirates' };
    return { id: 'dubai', name: 'Dubai', emoji: '🏙️', country: 'United Arab Emirates' };
  }, [club?.city]);

  const coverImage = club?.coverBannerUrl || (Array.isArray(club?.photos) && club.photos[0]) || '';
  const logoUrl = club?.logoUrl || '';

  if (loading) {
    return <LoadingScreen />;
  }
  return (
    <Background>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        stickyHeaderIndices={[2]}
      >
        {/* Hero (safe area to avoid notch) */}
        <SafeAreaView edges={["top"]}>
          <View style={[styles.mediaContainer, { height: heroHeight }]}>
            {coverImage ? (
              <Image source={{ uri: coverImage }} style={{ width, height: heroHeight }} resizeMode="cover" />
            ) : (
              <View style={[styles.fallbackHero, { width, height: heroHeight }]} />
            )}
            <LinearGradient
              colors={[Colors.withOpacity.black60, 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 0.6 }}
              style={StyleSheet.absoluteFill}
            />
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.9}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            {!!logoUrl && (
              <View style={[styles.logoWrap, { bottom: -32 }]}> 
                <Image source={{ uri: logoUrl }} style={styles.logo} />
              </View>
            )}
          </View>
        </SafeAreaView>

        {/* Club Info */}
        <View style={styles.headerSection}>
          <View style={styles.titleRow}>
            <Text style={styles.clubName}>{club?.name || 'Club'}</Text>
            {!!club?.city && (
              <Text style={styles.cityPill}>{selectedCity.name}</Text>
            )}
          </View>
          <View style={styles.metaRow}>
            {!!club?.address && (
              <TouchableOpacity onPress={openMaps} activeOpacity={0.8} style={{ maxWidth: '75%' }}>
                <Text style={styles.venueLink} numberOfLines={1}>{club.address} →</Text>
              </TouchableOpacity>
            )}
            {!!club?.typeOfVenue && (
              <Text style={styles.venueType}>{club.typeOfVenue}</Text>
            )}
          </View>
          {!!club?.clubDescription && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.description}>{club.clubDescription}</Text>
            </View>
          )}
        </View>

        {/* Sticky Tabs */}
        <View style={styles.stickyWrap}>
          <TimelineFilterTabs activeTab={activeTab} onTabChange={setActiveTab} allEvents={allEvents} loading={false} />
        </View>

        {/* Events */}
        <EventsList
          filteredEvents={filteredEvents}
          selectedCity={selectedCity}
          activeTab={activeTab}
          search={''}
          onEventPress={(eventId: string) => router.push(`/event/${eventId}`)}
          onClearSearch={() => {}}
        />
      </ScrollView>
    </Background>
  );
}

const styles = StyleSheet.create({
  mediaContainer: {
    backgroundColor: Colors.backgroundSecondary,
    position: 'relative',
  },
  fallbackHero: {
    backgroundColor: Colors.backgroundSecondary,
  },
  backBtn: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: Colors.withOpacity.black60,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  backIcon: {
    color: Colors.textPrimary,
    fontWeight: '900',
    fontSize: 16,
  },
  logoWrap: {
    position: 'absolute',
    left: 16,
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: Colors.withOpacity.white30,
    backgroundColor: Colors.background,
  },
  headerSection: {
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 10,
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  clubName: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    flex: 1,
  },
  cityPill: {
    alignSelf: 'flex-start',
    color: Colors.textPrimary,
    backgroundColor: Colors.withOpacity.white10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    fontWeight: '800',
    fontSize: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  venueLink: {
    color: Colors.blueAccent,
    fontWeight: '700',
  },
  venueType: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  description: {
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  stickyWrap: {
    backgroundColor: Colors.background,
  },
});
