import React, { useMemo, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

interface EventFilters {
  featured?: boolean;
  free?: boolean;
  paid?: boolean;
  hasMenu?: boolean;
  ticketsAvailable?: boolean;
  mostPopular?: boolean;
  distanceKm?: number | null;
  // removed from UI
  walkingDistance?: boolean;
  maxPrice?: number;
}

interface ClubFilters {
  hasUpcomingEvents?: boolean;
  // removed from UI
  mostPopular?: boolean;
  distanceKm?: number | null;
  clubTypes?: string[];
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'events' | 'clubs';
  initialEventFilters?: EventFilters;
  initialClubFilters?: ClubFilters;
  onApply: (filters: { event: EventFilters; club: ClubFilters }) => void;
}

// Common club types based on the data
const CLUB_TYPES = [
  'bar',
  'lounge', 
  'nightclub',
  'rooftop',
  'pool_club',
  'restaurant',
];

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  type,
  initialEventFilters,
  initialClubFilters,
  onApply,
}) => {
  const [eventFilters, setEventFilters] = useState<EventFilters>(initialEventFilters || { maxPrice: 10000, distanceKm: null });
  const [clubFilters, setClubFilters] = useState<ClubFilters>(initialClubFilters || { distanceKm: null, clubTypes: [] });
  const insets = useSafeAreaInsets();

  const title = useMemo(() => type === 'events' ? 'Filter Events' : 'Filter Clubs', [type]);

  const apply = () => { 
    onApply({ event: eventFilters, club: clubFilters });
    onClose();
  };

  const clear = () => {
    const defaultEventFilters = { maxPrice: 10000, distanceKm: null };
    const defaultClubFilters = { distanceKm: null, clubTypes: [] };
    setEventFilters(defaultEventFilters);
    setClubFilters(defaultClubFilters);
    onApply({ event: defaultEventFilters, club: defaultClubFilters });
    onClose();
  };

  const toggleClubType = (clubType: string) => {
    setClubFilters(prev => ({
      ...prev,
      clubTypes: prev.clubTypes?.includes(clubType)
        ? prev.clubTypes.filter(type => type !== clubType)
        : [...(prev.clubTypes || []), clubType]
    }));
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    if (price >= 10000) return 'AED 10,000+';
    return `AED ${price.toLocaleString()}`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        {/* Close on tapping outside */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={clear}>
                <Text style={styles.secondaryText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={apply}>
                <Text style={styles.primaryText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView 
            contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]} 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Location Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location</Text>
              <View style={styles.chipsRow}>
                {[1,5,10,50,100].map((km) => (
                  <TouchableOpacity key={km} style={[styles.chip, ((type==='events'?eventFilters.distanceKm:clubFilters.distanceKm)===km) && styles.chipActive]} onPress={() => type==='events' ? setEventFilters((p)=>({ ...p, distanceKm: km })) : setClubFilters((p)=>({ ...p, distanceKm: km }))}>
                    <Text style={[styles.chipText, ((type==='events'?eventFilters.distanceKm:clubFilters.distanceKm)===km) && styles.chipTextActive]}>
                      {km === 100 ? '100+ km' : `${km} km`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Club Type Section (clubs only) */}
            {type === 'clubs' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Club Type</Text>
                <View style={styles.chipsRow}>
                  {CLUB_TYPES.map((clubType) => (
                    <TouchableOpacity 
                      key={clubType} 
                      style={[styles.chip, clubFilters.clubTypes?.includes(clubType) && styles.chipActive]} 
                      onPress={() => toggleClubType(clubType)}
                    >
                      <Text style={[styles.chipText, clubFilters.clubTypes?.includes(clubType) && styles.chipTextActive]}>
                        {clubType.charAt(0).toUpperCase() + clubType.slice(1).replace('_', ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Type Section */}
            {type === 'events' ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Event Type</Text>
                <View style={styles.chipsRow}>
                  {[
                    { key: 'featured', label: 'Featured' },
                    { key: 'hasMenu', label: 'Has Menu' },
                    { key: 'ticketsAvailable', label: 'Tickets Available' },
                    { key: 'mostPopular', label: 'Most Popular' },
                  ].map(({ key, label }) => (
                    <TouchableOpacity key={key} style={[styles.chip, (eventFilters as any)[key] && styles.chipActive]} onPress={() => setEventFilters((p:any)=>({ ...p, [key]: !p[key] }))}>
                      <Text style={[styles.chipText, (eventFilters as any)[key] && styles.chipTextActive]}>{label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Club Status</Text>
                <View style={styles.chipsRow}>
                  {[
                    { key: 'hasUpcomingEvents', label: 'Has Upcoming' },
                    { key: 'mostPopular', label: 'Most Popular' },
                  ].map(({ key, label }) => (
                    <TouchableOpacity key={key} style={[styles.chip, (clubFilters as any)[key] && styles.chipActive]} onPress={() => setClubFilters((p:any)=>({ ...p, [key]: !p[key] }))}>
                      <Text style={[styles.chipText, (clubFilters as any)[key] && styles.chipTextActive]}>{label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Pricing Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price Select (AED)</Text>
              <View style={styles.sliderContainer}>
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>AED 0</Text>
                  <Text style={styles.sliderLabel}>AED 10,000</Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={10000}
                  value={type === 'events' ? (eventFilters.maxPrice ?? 10000) : 10000}
                  onValueChange={(value) => {
                    if (type === 'events') {
                      setEventFilters((p) => ({ ...p, maxPrice: Math.round(value) }));
                    }
                  }}
                  minimumTrackTintColor={Colors.primary}
                  maximumTrackTintColor={Colors.withOpacity.white10}
                  thumbTintColor={Colors.primary}
                />
                <Text style={styles.priceValue}>
                  {formatPrice(type === 'events' ? (eventFilters.maxPrice ?? 10000) : 10000)}
                </Text>
              </View>
            </View>

            {/* Time Section (events only) */}
            {type==='events' && (
              <View style={[styles.section, styles.lastSection]}>
                <Text style={styles.sectionTitle}>Date & Time</Text>
                <View style={styles.chipsRow}>
                  {['Today','Tomorrow','This Weekend','Next 7 Days','This Month'].map((label) => (
                    <TouchableOpacity key={label} style={styles.chip}>
                      <Text style={styles.chipText}>{label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheet: {
    height: '80%',
    width: '100%',
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 0,
    paddingBottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.2,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  primaryText: {
    color: Colors.button.text,
    fontSize: 14,
    fontWeight: '500',
  },
  secondaryBtn: {
    backgroundColor: Colors.backgroundTertiary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  secondaryText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  lastSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: Colors.withOpacity.black30,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: Colors.button.text,
  },
  sliderContainer: {
    marginBottom: 16,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  priceValue: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 8,
  },
});

export default FilterModal;