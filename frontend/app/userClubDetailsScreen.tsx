import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import apiClient from '@/app/api/client';
import EventCard from '@/components/event/EventCard';

export default function UserClubDetailsRoute() {
  const { clubId } = useLocalSearchParams<{ clubId: string }>();
  const router = useRouter();
  const [club, setClub] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

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

  const clubEvents = useMemo(() => {
    const events = (club?.events || []) as any[];
    return events;
  }, [club]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.missingText}>Loading...</Text>
      </View>
    );
  }

  if (!club) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.missingText}>Club not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const banner = club.coverBannerUrl || club.clubImages?.[0] || club.photos?.[0] || club.logoUrl;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      {/* Header/Banner */}
      <View style={styles.bannerContainer}>
        {banner ? (
          <Image source={{ uri: banner }} style={styles.banner} />
        ) : (
          <View style={styles.bannerPlaceholder} />
        )}
        <TouchableOpacity style={styles.backFab} onPress={() => router.back()}>
          <Text style={styles.backFabText}>‹</Text>
        </TouchableOpacity>
      </View>

      {/* Club Info */}
      <View style={styles.section}> 
        <Text style={styles.clubName}>{club.name}</Text>
        <Text style={styles.metaText}>{club.typeOfVenue} • {club.city}</Text>
        <Text style={styles.description}>{club.clubDescription}</Text>

        <View style={styles.infoGrid}>
          {club.address ? (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{club.address}</Text>
            </View>
          ) : null}
          {club.phone ? (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{club.phone}</Text>
            </View>
          ) : null}
          {club.email ? (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{club.email}</Text>
            </View>
          ) : null}
          {club.operatingDays?.length ? (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Operating Days</Text>
              <Text style={styles.infoValue}>{club.operatingDays.join(', ')}</Text>
            </View>
          ) : null}
          {club.mapLink ? (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Map</Text>
              <Text style={[styles.infoValue, { color: Colors.primary }]} numberOfLines={1}>{club.mapLink}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Events Section */}
      <View style={styles.section}> 
        <Text style={styles.sectionTitle}>Events</Text>
        {clubEvents.length === 0 ? (
          <Text style={styles.muted}>No events for this club.</Text>
        ) : (
          <View style={{ gap: 16 }}>
            {clubEvents.map(evt => (
              <EventCard key={evt._id} event={evt} />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContainer: {
    height: 220,
    backgroundColor: Colors.backgroundSecondary,
  },
  banner: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerPlaceholder: {
    flex: 1,
    backgroundColor: Colors.backgroundTertiary,
  },
  backFab: {
    position: 'absolute',
    top: 40,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.withOpacity.black80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backFabText: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  clubName: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
  },
  metaText: {
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  description: {
    color: Colors.textSecondary,
    marginTop: 8,
    lineHeight: 20,
  },
  infoGrid: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  infoItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  muted: {
    color: Colors.textMuted,
  },
  missingText: {
    color: Colors.textPrimary,
    fontSize: 16,
    marginBottom: 12,
  },
  backBtn: {
    backgroundColor: Colors.button.background,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtnText: {
    color: Colors.button.text,
    fontWeight: '700',
  },
});


