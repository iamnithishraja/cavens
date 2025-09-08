import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import apiClient from '@/app/api/client';
import EventCard from '@/components/event/EventCard';
import EventDetailsScreen from '@/components/screens/EventDetailsScreen';
import Background from '@/components/common/Background';

export default function UserClubDetailsRoute() {
  const { clubId } = useLocalSearchParams<{ clubId: string }>();
  const router = useRouter();
  const [club, setClub] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

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

  const handleEventPress = (event: any) => {
    setSelectedEventId(event._id);
  };

  // Show event details screen if an event is selected
  if (selectedEventId) {
    return (
      <EventDetailsScreen
        eventId={selectedEventId}
        onGoBack={() => setSelectedEventId(null)}
      />
    );
  }

  if (loading) {
    return (
      <Background>
        <View style={styles.centerContent}>
          {/* Go Back Button */}
          <TouchableOpacity 
            style={[styles.backButton, { position: 'absolute', top: 60, left: 16, zIndex: 10 }]} 
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.backgroundSecondary, Colors.backgroundTertiary]}
              style={styles.backButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Image 
                source={{ uri: "https://img.icons8.com/ios-filled/50/FFFFFF/back.png" }} 
                style={styles.backIcon} 
              />
              <Text style={styles.backText}>Back</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <ActivityIndicator size="large" color={Colors.blueAccent} />
          <Text style={styles.loadingText}>Loading club details...</Text>
        </View>
      </Background>
    );
  }

  if (!club) {
    return (
      <Background>
        <View style={styles.centerContent}>
          {/* Go Back Button */}
          <TouchableOpacity 
            style={[styles.backButton, { position: 'absolute', top: 60, left: 16, zIndex: 10 }]} 
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.backgroundSecondary, Colors.backgroundTertiary]}
              style={styles.backButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Image 
                source={{ uri: "https://img.icons8.com/ios-filled/50/FFFFFF/back.png" }} 
                style={styles.backIcon} 
              />
              <Text style={styles.backText}>Back</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <Image 
            source={{ uri: "https://img.icons8.com/ios/100/CCCCCC/error.png" }}
            style={styles.errorIcon}
          />
          <Text style={styles.errorText}>Club not found</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </Background>
    );
  }

  const banner = club.coverBannerUrl || club.clubImages?.[0] || club.photos?.[0] || club.logoUrl;

  return (
    <Background>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Go Back Button */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[Colors.backgroundSecondary, Colors.backgroundTertiary]}
            style={styles.backButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Image 
              source={{ uri: "https://img.icons8.com/ios-filled/50/FFFFFF/back.png" }} 
              style={styles.backIcon} 
            />
            <Text style={styles.backText}>Back</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Hero Image */}
        <View style={styles.heroImage}>
          {banner ? (
            <Image source={{ uri: banner }} style={styles.coverImage} />
          ) : (
            <View style={styles.placeholderImage} />
          )}
        </View>

        {/* Club Info */}
        <View style={styles.pad}>
          <Text style={styles.name}>{club.name}</Text>
          <Text style={styles.meta}>{club.typeOfVenue} • {club.city}</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.body}>{club.clubDescription}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Club Information</Text>
            {club.address && (
              <Text style={styles.body}>📍 Address: {club.address}</Text>
            )}
            {club.phone && (
              <Text style={styles.body}>📞 Phone: {club.phone}</Text>
            )}
            {club.email && (
              <Text style={styles.body}>✉️ Email: {club.email}</Text>
            )}
            {club.operatingDays?.length && (
              <Text style={styles.body}>🕒 Operating Days: {club.operatingDays.join(', ')}</Text>
            )}
          </View>

          {club.mapLink && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location</Text>
              <TouchableOpacity 
                style={styles.mapButton}
                onPress={() => {
                  // Navigate to fullscreen map with club location
                  router.push({
                    pathname: '/fullMap',
                    params: { 
                      clubId: club._id,
                      clubName: club.name,
                      mapLink: club.mapLink
                    }
                  });
                }}
              >
                <Text style={styles.mapButtonText}> View on Map</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Events Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          {clubEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No events scheduled for this club.</Text>
            </View>
          ) : (
            <View style={styles.eventsContainer}>
              {clubEvents.map(evt => (
                <EventCard key={evt._id} event={evt} onPress={handleEventPress} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 24 },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 1000,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.blueAccent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  backButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
    tintColor: Colors.textPrimary,
  },
  backText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  heroImage: { 
    width: "100%", 
    height: 250, 
    backgroundColor: Colors.backgroundSecondary 
  },
  coverImage: { 
    width: "100%", 
    height: "100%",
    resizeMode: 'cover'
  },
  placeholderImage: {
    flex: 1,
    backgroundColor: Colors.backgroundTertiary,
  },
  pad: { 
    paddingHorizontal: 16, 
    paddingTop: 12, 
    gap: 8 
  },
  name: { 
    color: Colors.textPrimary, 
    fontWeight: "800", 
    fontSize: 22 
  },
  meta: { 
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '500'
  },
  body: { 
    color: Colors.textSecondary, 
    lineHeight: 20,
    fontSize: 14
  },
  section: { 
    marginTop: 16, 
    gap: 8 
  },
  sectionTitle: { 
    color: Colors.textPrimary, 
    fontWeight: "800", 
    fontSize: 16 
  },
  infoItem: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  infoLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '600',
  },
  infoValue: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  eventsContainer: {
    gap: 16,
    marginTop: 8,
  },
  emptyState: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyStateText: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
  // Loading and Error states
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  errorIcon: {
    width: 80,
    height: 80,
    marginBottom: 20,
    opacity: 0.6,
  },
  errorText: {
    color: Colors.textPrimary,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: Colors.button?.background || Colors.blueAccent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: Colors.button?.text || Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  mapButton: {
    backgroundColor: Colors.button?.background || Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 8,
  },
  mapButtonText: {
    color: Colors.button?.text || Colors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
});


