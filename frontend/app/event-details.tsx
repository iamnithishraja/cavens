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
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
    description: string;
  }>;
  venue?: string;
  galleryPhotos?: string[];
  happyHourTimings?: string;
  menuItems?: Array<{
    name: string;
    price: number;
    description: string;
  }>;
}

export default function EventDetailsScreen() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      
      console.log(eventId);
      const response = await apiClient.get(`/api/event/event/${eventId}`);
      console.log(response.data.data);


      if (response.data.success) {
        setEvent(response.data.data);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to fetch event details');
      }
    } catch (error: any) {
      console.error('Error fetching event details:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to fetch event details');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = () => {
    if (event) {
      router.push(`/editEvent?eventId=${event._id}`);
    }
  };

  const handleDeleteEvent = () => {
    if (!event) return;
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${event.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              const response = await apiClient.delete(`/api/event/event/${event._id}`);

              if (response.data.success) {
                Alert.alert('Success', 'Event deleted successfully', [
                  { text: 'OK', onPress: () => router.back() }
                ]);
              } else {
                Alert.alert('Error', response.data.message || 'Failed to delete event');
              }
            } catch (error: any) {
              console.error('Error deleting event:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete event');
            } finally {
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  const getLowestPrice = (tickets: Event['tickets']) => {
    if (!tickets || tickets.length === 0) return 0;
    return Math.min(...tickets.map(t => t.price));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={Colors.gradients.background as [string, string]}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading event details...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={Colors.gradients.background as [string, string]}
          style={styles.gradient}
        >
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={64} color={Colors.error} />
            <Text style={styles.errorTitle}>Event Not Found</Text>
            <Text style={styles.errorSubtitle}>The event you're looking for doesn't exist or has been removed.</Text>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={Colors.gradients.background as [string, string]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Event Details</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={handleEditEvent}
              activeOpacity={0.8}
            >
              <Ionicons name="pencil" size={20} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={handleDeleteEvent}
              disabled={deleting}
              activeOpacity={0.8}
            >
              {deleting ? (
                <ActivityIndicator size="small" color={Colors.error} />
              ) : (
                <Ionicons name="trash" size={20} color={Colors.error} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Cover Image */}
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: event.coverImage }}
              style={styles.coverImage}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.imageOverlay}
            >
              <View style={styles.imageContent}>
                <Text style={styles.eventName}>{event.name}</Text>
                <Text style={styles.eventDate}>{formatDate(event.date)} • {event.time}</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Event Info */}
          <View style={styles.contentContainer}>
            {/* DJ/Artists */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>DJ/Artists</Text>
              <Text style={styles.sectionContent}>{event.djArtists}</Text>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.sectionContent}>{event.description}</Text>
            </View>

            {/* Venue */}
            {event.venue && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Venue</Text>
                <Text style={styles.sectionContent}>{event.venue}</Text>
              </View>
            )}

            {/* Happy Hour Timings */}
            {event.happyHourTimings && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Happy Hour</Text>
                <Text style={styles.sectionContent}>{event.happyHourTimings}</Text>
              </View>
            )}

            {/* Menu Items */}
            {event.menuItems && event.menuItems.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Menu Items</Text>
                <View style={styles.menuContainer}>
                  {event.menuItems.map((item, index) => (
                    <View key={index} style={styles.menuCard}>
                      <View style={styles.menuInfo}>
                        <Text style={styles.menuName}>{item.name}</Text>
                        <Text style={styles.menuDescription}>{item.description}</Text>
                      </View>
                      <Text style={styles.menuPrice}>AED {item.price}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Gallery Photos */}
            {event.galleryPhotos && event.galleryPhotos.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Gallery</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.galleryContainer}
                >
                  {event.galleryPhotos.map((photo, index) => (
                    <Image 
                      key={index}
                      source={{ uri: photo }}
                      style={styles.galleryImage}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Tickets */}
            {event.tickets && event.tickets.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tickets</Text>
                <View style={styles.ticketsContainer}>
                  {event.tickets.map((ticket, index) => (
                    <View key={ticket._id || index} style={styles.ticketCard}>
                      <View style={styles.ticketInfo}>
                        <Text style={styles.ticketName}>{ticket.name}</Text>
                        <Text style={styles.ticketDescription}>{ticket.description}</Text>
                      </View>
                      <Text style={styles.ticketPrice}>AED {ticket.price}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.priceSummary}>
                  <Text style={styles.priceLabel}>Starting from</Text>
                  <Text style={styles.priceValue}>AED {getLowestPrice(event.tickets)}</Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.withOpacity.white10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: 'flex-end',
    padding: 20,
  },
  imageContent: {
    gap: 8,
  },
  eventName: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  eventDate: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  ticketsContainer: {
    gap: 12,
  },
  ticketCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  ticketInfo: {
    flex: 1,
  },
  ticketName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  ticketDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  ticketPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  priceSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.withOpacity.white10,
  },
  priceLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  menuContainer: {
    gap: 12,
  },
  menuCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  menuInfo: {
    flex: 1,
  },
  menuName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  menuPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  galleryContainer: {
    marginTop: 12,
  },
  galleryImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
    resizeMode: 'cover',
  },
});
