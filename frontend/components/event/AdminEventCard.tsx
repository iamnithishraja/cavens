import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

export interface AdminEventCardProps {
  event: {
    _id: string;
    name: string;
    date: string;
    time: string;
    djArtists: string;
    description?: string;
    coverImage: string;
    tickets?: Array<{ _id: string; name: string; price: number }>;    
  };
  onEdit: (eventId: string) => void;
}

const AdminEventCard: React.FC<AdminEventCardProps> = ({ event, onEdit }) => {
  const getLowestPrice = (tickets?: AdminEventCardProps['event']['tickets']) => {
    if (!tickets || tickets.length === 0) return 0;
    return Math.min(...tickets.map(t => t.price));
  };

  return (
    <View style={styles.card}>
      <Image source={{ uri: event.coverImage }} style={styles.image} />

      <View style={styles.content}>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>{event.name}</Text>
          <Text style={styles.date}>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} • {event.time}</Text>
          {!!event.djArtists && (
            <Text style={styles.artist} numberOfLines={1}>{event.djArtists}</Text>
          )}
          {event.tickets && event.tickets.length > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>From</Text>
              <Text style={styles.priceValue}>AED {getLowestPrice(event.tickets)}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity onPress={() => onEdit(event._id)} style={styles.editBtn} activeOpacity={0.8}>
          <Ionicons name="create-outline" size={20} color={Colors.success} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    height: 120,
    backgroundColor: Colors.background, // same as app bg
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: 120,
    height: '100%',
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  info: {
    paddingRight: 8,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    lineHeight: 22,
  },
  date: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 6,
  },
  artist: {
    color: Colors.textSecondary,
    fontSize: 14,
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
  editBtn: {
    position: 'absolute',
    right: 12,
    top: '50%',
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: Colors.button.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.separator,
    transform: [{ translateY: -18 }],
  },
});

export default AdminEventCard;


