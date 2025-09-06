import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  RefreshControl,
  StatusBar
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import apiClient from '@/app/api/client';
import { store } from '@/utils';

interface Event {
  _id: string;
  name: string;
  date: string;
  time: string;
  djArtists: string;
  description: string;
  coverImage: string;
  tickets: { _id: string; name: string; price: number }[];
  venue?: string;
}

export default function AnalyticsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = await store.get('token');
      
      if (!token) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      const response = await apiClient.get('/api/event/club-events', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setEvents(response.data.data);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to fetch events');
      }
    } catch (error: any) {
      console.error('Error fetching events:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEventPress = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleLogout = async () => {
    await store.delete('user');
    await store.delete('token');
    router.replace('/auth/Auth');
  };

  const getLowestPrice = (tickets?: Event['tickets']) => {
    if (!tickets || tickets.length === 0) return 0;
    return Math.min(...tickets.map(t => t.price));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <View style={styles.fullBackground}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Show analytics message for selected event
  if (selectedEvent) {
    return (
      <SafeAreaView style={styles.safeArea} edges={[]}>
        <StatusBar backgroundColor={Colors.background} barStyle="light-content" />
        <View style={styles.fullBackground}>
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => setSelectedEvent(null)}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Analytics</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Analytics Content */}
          <View style={styles.analyticsContainer}>
            <View style={styles.analyticsCard}>
              <View style={styles.analyticsIconContainer}>
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryDark]}
                  style={styles.analyticsIconGradient}
                >
                  <Ionicons name="analytics-outline" size={48} color={Colors.button.text} />
                </LinearGradient>
              </View>
              
              <Text style={styles.analyticsTitle}>Hi, this is analytics for your</Text>
              <Text style={styles.analyticsEventName}>{selectedEvent.name}</Text>
              <Text style={styles.analyticsSubtitle}>event</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <StatusBar backgroundColor={Colors.background} barStyle="light-content" />
      <View style={styles.fullBackground}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Analytics</Text>
            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Ionicons name="log-out-outline" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={[styles.scrollView, { marginTop: 88 + insets.top }]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
        >
          {events.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyCard}>
                <Ionicons name="analytics-outline" size={80} color={Colors.textMuted} />
                <Text style={styles.emptyTitle}>No Events for Analytics</Text>
                <Text style={styles.emptySubtitle}>
                  You haven't created any events yet. Create events to view their analytics!
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.eventsContainer}>
              <Text style={styles.sectionTitle}>Select an event to view analytics</Text>
              {events.map((event) => (
                <TouchableOpacity
                  key={event._id}
                  style={styles.eventCard}
                  onPress={() => handleEventPress(event)}
                  activeOpacity={0.8}
                >
                  <View style={styles.eventImageContainer}>
                    <Text style={styles.eventImagePlaceholder}>📅</Text>
                  </View>
                  
                  <View style={styles.eventContent}>
                    <Text style={styles.eventName} numberOfLines={2}>{event.name}</Text>
                    <Text style={styles.eventDate}>
                      {new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })} • {event.time}
                    </Text>
                    {event.djArtists && (
                      <Text style={styles.eventArtist} numberOfLines={1}>{event.djArtists}</Text>
                    )}
                    {event.tickets && event.tickets.length > 0 && (
                      <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>From</Text>
                        <Text style={styles.priceValue}>AED {getLowestPrice(event.tickets)}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.analyticsButton}>
                    <Ionicons name="analytics-outline" size={24} color={Colors.primary} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  fullBackground: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Header
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: Colors.background,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginTop: 16,
  },
  // Analytics View
  analyticsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 88 + 40,
  },
  analyticsCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  analyticsIconContainer: {
    marginBottom: 24,
  },
  analyticsIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyticsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  analyticsEventName: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  analyticsSubtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  // Events List
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  emptyCard: {
    padding: 40,
    borderRadius: 24,
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  eventsContainer: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  eventImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  eventImagePlaceholder: {
    fontSize: 24,
  },
  eventContent: {
    flex: 1,
    justifyContent: 'center',
  },
  eventName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
    lineHeight: 22,
  },
  eventDate: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  eventArtist: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '700',
  },
  analyticsButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 16,
  },
});
