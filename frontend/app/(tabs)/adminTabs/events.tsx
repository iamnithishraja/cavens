import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert, 
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import apiClient from '@/app/api/client';
import { store } from '@/utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Event {
  _id: string;
  name: string;
  date: string;
  time: string;
  djArtists: string;
  description: string;
  coverImage: string;
  tickets: Array<{
    _id: string;
    name: string;
    price: number;
  }>;
  venue?: string;
}

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState<string | null>(null);
  const router = useRouter();

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

  const handleEventPress = (eventId: string) => {
    router.push(`/event-details?eventId=${eventId}`);
  };

  const handleDeleteEvent = async (eventId: string, eventName: string) => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${eventName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingEvent(eventId);
              const token = await store.get('token');
              
              const response = await apiClient.delete(`/api/event/event/${eventId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });

              if (response.data.success) {
                Alert.alert('Success', 'Event deleted successfully');
                fetchEvents(); // Refresh the list
              } else {
                Alert.alert('Error', response.data.message || 'Failed to delete event');
              }
            } catch (error: any) {
              console.error('Error deleting event:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete event');
            } finally {
              setDeletingEvent(null);
            }
          }
        }
      ]
    );
  };

  const handleCreateEvent = () => {
    router.push('/create-event');
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      const dayDiff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (dayDiff <= 7) {
        return date.toLocaleDateString('en-US', { 
          weekday: 'short',
          month: 'short', 
          day: 'numeric'
        });
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        });
      }
    }
  };

  // Get lowest ticket price
  const getLowestPrice = (tickets: Event['tickets']) => {
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.fullBackground}>
        {/* Fixed Header */}
        <View style={styles.fixedHeader}>
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
          style={styles.scrollView}
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
                  You haven't created any events yet. Start by creating your first event!
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
                <TouchableOpacity 
                  key={event._id} 
                  style={styles.eventCard}
                  onPress={() => handleEventPress(event._id)}
                  activeOpacity={0.9}
                >
                  <Image 
                    source={{ uri: event.coverImage }}
                    style={styles.eventImage}
                  />
                  <View style={styles.cardContent}>
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventName} numberOfLines={2}>
                        {event.name}
                      </Text>
                      <Text style={styles.eventDate}>
                        {formatDate(event.date)} • {event.time}
                      </Text>
                      <Text style={styles.eventArtist} numberOfLines={1}>
                        {event.djArtists}
                      </Text>
                      
                      {event.tickets && event.tickets.length > 0 && (
                        <View style={styles.priceContainer}>
                          <Text style={styles.priceLabel}>From</Text>
                          <Text style={styles.priceValue}>
                            AED {getLowestPrice(event.tickets)}
                          </Text>
                        </View>
                      )}
                    </View>
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
  // Fixed Header
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: Colors.background,
    paddingTop: 8,
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
    marginTop: 80, // Account for fixed header
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
  eventCard: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    height: 120,
    backgroundColor: Colors.backgroundSecondary,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  eventImage: {
    width: 120,
    height: '100%',
    resizeMode: 'cover',
  },
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    lineHeight: 22,
  },
  eventDate: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 6,
  },
  eventArtist: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  priceContainer: {
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
});
