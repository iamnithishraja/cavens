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
import AdminEventCard from '@/components/event/AdminEventCard';

// no-op

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

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // removed local state for deleting spinner on each card
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
      console.log('response', response.data);
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

  const handleEditEvent = (eventId: string) => {
    router.push(`/editEvent?eventId=${eventId}`);
  };

  // Delete removed per request

  const handleCreateEvent = () => {
    router.push('/create-event');
  };

  // Card handles its own formatting and price calc now

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

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <StatusBar backgroundColor={Colors.background} barStyle="light-content" />
      <View style={styles.fullBackground}>
        {/* Fixed Header */}
        <View style={[styles.fixedHeader, { paddingTop: insets.top + 8 }]}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>My Events</Text>
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={handleCreateEvent}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={Colors.gradients.button as [string, string]}
                style={styles.addButtonGradient}
              >
                <Ionicons name="add" size={24} color={Colors.button.text} />
              </LinearGradient>
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
                <Ionicons name="calendar-outline" size={80} color={Colors.textMuted} />
                <Text style={styles.emptyTitle}>No Events Yet</Text>
                <Text style={styles.emptySubtitle}>
                  You havent created any events yet. Start by creating your first event!
                </Text>
                <TouchableOpacity 
                  style={styles.createFirstButton}
                  onPress={handleCreateEvent}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={Colors.gradients.button as [string, string]}
                    style={styles.createFirstButtonGradient}
                  >
                    <Ionicons name="add" size={20} color={Colors.button.text} />
                    <Text style={styles.createFirstButtonText}>Create Your First Event</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.eventsContainer}>
              {events.map((event) => (
                <AdminEventCard
                  key={event._id}
                  event={event}
                  onEdit={handleEditEvent}
                />
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
  // Fixed Header
  fixedHeader: {
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
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addButtonGradient: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
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
    marginBottom: 32,
  },
  createFirstButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  createFirstButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  createFirstButtonText: {
    color: Colors.button.text,
    fontSize: 16,
    fontWeight: '700',
  },
  eventsContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
});
