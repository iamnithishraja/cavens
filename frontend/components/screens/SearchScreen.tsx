import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import apiClient from '@/app/api/client';
import type { EventItem } from '@/components/event/types';
import type { Club } from '@/components/Map/ClubCard';
import UserClubListItem from '@/components/screens/UserClub/UserClubListItem';
import { SafeAreaView } from 'react-native-safe-area-context';
import { store } from '@/utils';
import EventDetailsScreen from '@/components/screens/EventDetailsScreen';

type Mode = 'events' | 'clubs';

const buildRegex = (input: string) => {
  const trimmed = input.trim();
  if (trimmed.length === 0) return null;
  const escaped = trimmed
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\s+/g, ".*?");
  return new RegExp(escaped, 'i');
};

export default function SearchScreen() {
  const router = useRouter();
  const { mode = 'events', city = '' } = useLocalSearchParams<{ mode?: Mode; city?: string }>();

  const [query, setQuery] = useState('');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<string[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const cityParam = typeof city === 'string' ? city : '';
        if (mode === 'events') {
          const publicClubsRes = await apiClient.get('/api/club/public/approved', {
            params: { city: cityParam, includeEvents: 'true' }
          });
          const clubsWithEvents = (publicClubsRes.data?.items || []) as any[];
          const aggregated: EventItem[] = [];
          clubsWithEvents.forEach((c: any) => {
            if (Array.isArray(c.events)) {
              c.events.forEach((evt: any) => aggregated.push({ ...evt, venue: c.name }));
            }
          });
          setEvents(aggregated);
        } else {
          const res = await apiClient.get('/api/club/public/approved', {
            params: { city: cityParam, includeEvents: 'false' }
          });
          setClubs(res.data?.items || []);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [mode, city]);

  // Load search history on mount for current mode
  useEffect(() => {
    const loadHistory = async () => {
      const key = mode === 'events' ? 'search_history_events' : 'search_history_clubs';
      const raw = await store.get(key);
      try {
        const arr = raw ? JSON.parse(raw) : [];
        setHistory(Array.isArray(arr) ? arr.slice(0, 5) : []);
      } catch {
        setHistory([]);
      }
    };
    const loadSelections = async () => {
      const key = mode === 'events' ? 'selected_history_events' : 'selected_history_clubs';
      const raw = await store.get(key);
      try {
        const arr = raw ? JSON.parse(raw) : [];
        setSelectedHistory(Array.isArray(arr) ? arr.slice(0, 5) : []);
      } catch {
        setSelectedHistory([]);
      }
    };
    loadHistory();
    loadSelections();
  }, [mode]);

  const saveToHistory = async (text: string) => {
    const key = mode === 'events' ? 'search_history_events' : 'search_history_clubs';
    const existing = history.filter((h) => h.toLowerCase() !== text.trim().toLowerCase());
    const next = [text.trim(), ...existing].slice(0, 5);
    setHistory(next);
    await store.set(key, JSON.stringify(next));
  };

  const saveSelection = async (id: string, name: string) => {
    const key = mode === 'events' ? 'selected_history_events' : 'selected_history_clubs';
    const filtered = selectedHistory.filter((s) => s.id !== id && s.name.toLowerCase() !== name.trim().toLowerCase());
    const next = [{ id, name: name.trim() }, ...filtered].slice(0, 5);
    setSelectedHistory(next);
    await store.set(key, JSON.stringify(next));
  };

  const deleteHistoryItem = async (text: string) => {
    const key = mode === 'events' ? 'search_history_events' : 'search_history_clubs';
    const next = history.filter((h) => h !== text);
    setHistory(next);
    await store.set(key, JSON.stringify(next));
  };

  const deleteSelectionItem = async (id: string) => {
    const key = mode === 'events' ? 'selected_history_events' : 'selected_history_clubs';
    const next = selectedHistory.filter((s) => s.id !== id);
    setSelectedHistory(next);
    await store.set(key, JSON.stringify(next));
  };

  const clearAllHistory = async () => {
    const key = mode === 'events' ? 'search_history_events' : 'search_history_clubs';
    setHistory([]);
    await store.set(key, JSON.stringify([]));
  };

  const clearAllSelections = async () => {
    const key = mode === 'events' ? 'selected_history_events' : 'selected_history_clubs';
    setSelectedHistory([]);
    await store.set(key, JSON.stringify([]));
  };

  const filteredEvents = useMemo(() => {
    if (mode !== 'events') return [];
    const pattern = buildRegex(query);
    if (!pattern) return events;
    return events.filter((e) => [e.name, e.djArtists, e.venue].some((f) => pattern.test(f || '')));
  }, [events, query, mode]);

  const filteredClubs = useMemo(() => {
    if (mode !== 'clubs') return [];
    const pattern = buildRegex(query);
    if (!pattern) return clubs;
    return clubs.filter((c) => [c.name, c.clubDescription, c.address, c.typeOfVenue].some((f) => pattern.test(f || '')));
  }, [clubs, query, mode]);

  const handlePressEvent = (event: EventItem) => {
    if (event._id) {
      saveSelection(event._id, event.name || 'Event');
      setSelectedEventId(event._id);
    }
  };

  const handlePressClub = (club: Club) => {
    if (club?._id) {
      saveSelection(club._id, club.name || 'Club');
      router.push(`/userClubDetailsScreen?clubId=${club._id}`);
    }
  };

  const placeholder = useMemo(() => {
    const cityName = (typeof city === 'string' && city) ? city : 'your city';
    return mode === 'events' ? `Search events in ${cityName}` : `Search clubs in ${cityName}`;
  }, [mode, city]);

  const renderHeader = (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity style={styles.headerBack} onPress={() => router.back()} activeOpacity={0.8}>
          <Image 
            source={{ uri: 'https://img.icons8.com/ios-filled/50/FFFFFF/left.png' }}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.title}>{mode === 'events' ? 'Search Events' : 'Search Clubs'}</Text>
        <View style={styles.headerRightSpacer} />
      </View>
      <View style={styles.searchBarRow}>
        <Image 
          source={{ uri: 'https://img.icons8.com/ios-filled/50/FFFFFF/search.png' }}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={({ nativeEvent }) => {
            const text = nativeEvent.text || query;
            if (text.trim().length > 0) saveToHistory(text);
          }}
          autoFocus
          autoCorrect={false}
          autoCapitalize="none"
          selectionColor={Colors.primary}
        />
      </View>
      {query.trim().length === 0 && history.length > 0 && (
        <View style={styles.historyContainer}>
          <View style={styles.historyHeaderRow}>
            <Text style={styles.historyTitle}>Recent searches</Text>
            <TouchableOpacity onPress={clearAllHistory} activeOpacity={0.8}>
              <Text style={styles.clearAllText}>Clear</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.historyChips}>
            {history.map((h) => (
              <View key={h} style={styles.historyChip}>
                <TouchableOpacity style={styles.historyChipPress} onPress={() => setQuery(h)} activeOpacity={0.8}>
                  <Text style={styles.historyChipText} numberOfLines={1}>{h}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.historyDeleteBtn} onPress={() => deleteHistoryItem(h)} activeOpacity={0.8}>
                  <Image source={{ uri: 'https://img.icons8.com/ios-glyphs/30/777777/macos-close.png' }} style={styles.historyDeleteIcon} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}
      {query.trim().length === 0 && selectedHistory.length > 0 && (
        <View style={styles.historyContainer}>
          <View style={styles.historyHeaderRow}>
            <Text style={styles.historyTitle}>Recently viewed</Text>
            <TouchableOpacity onPress={clearAllSelections} activeOpacity={0.8}>
              <Text style={styles.clearAllText}>Clear</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.historyChips}>
            {selectedHistory.map((s) => (
              <View key={s.id} style={styles.historyChip}>
                <TouchableOpacity
                  style={styles.historyChipPress}
                  onPress={() => {
                    if (mode === 'events') {
                      setSelectedEventId(s.id);
                    } else {
                      router.push(`/userClubDetailsScreen?clubId=${s.id}`);
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.historyChipText} numberOfLines={1}>{s.name}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.historyDeleteBtn} onPress={() => deleteSelectionItem(s.id)} activeOpacity={0.8}>
                  <Image source={{ uri: 'https://img.icons8.com/ios-glyphs/30/777777/macos-close.png' }} style={styles.historyDeleteIcon} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderEventTile = (item: EventItem) => (
    <TouchableOpacity
      style={styles.tileCard}
      onPress={() => handlePressEvent(item)}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.coverImage }} style={styles.tileImage} />
      <View style={styles.tileSurface}>
        <View style={styles.tileInfo}>
          <View>
            <Text style={styles.tileTitle} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.tileSubtitle} numberOfLines={1}>{item.venue || ''}{typeof city === 'string' && city ? `, ${city}` : ''}</Text>
          </View>
        </View>
        <View style={styles.tileCtaContainer}>
          <TouchableOpacity style={styles.tileCta} activeOpacity={0.85}>
            <Text style={styles.tileCtaText}>GET TICKETS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Show event details inline (same behavior as userHomeScreen)
  if (selectedEventId) {
    return (
      <EventDetailsScreen eventId={selectedEventId} onGoBack={() => setSelectedEventId(null)} />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {mode === 'events' ? (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item, idx) => item._id || `${idx}-${item.name}`}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              {renderEventTile(item)}
            </View>
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={!loading ? (
            <View style={styles.empty}><Text style={styles.emptyText}>No events found</Text></View>
          ) : null}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      ) : (
        <FlatList
          data={filteredClubs}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <UserClubListItem club={item} cityName={(typeof city === 'string' && city) || ''} onPress={handlePressClub} />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={!loading ? (
            <View style={styles.empty}><Text style={styles.emptyText}>No clubs found</Text></View>
          ) : null}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 16, borderBottomWidth: 0.5, borderBottomColor: Colors.withOpacity.white10 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  headerBack: { position: 'absolute', left: 0, padding: 6 },
  backIcon: { width: 28, height: 28, tintColor: Colors.textPrimary },
  headerRightSpacer: { width: 24 },
  title: { color: Colors.textPrimary, fontSize: 18, fontWeight: '800' ,paddingLeft: 15},
  searchBarRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.withOpacity.white10, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  searchIcon: { width: 16, height: 16, tintColor: Colors.textMuted, marginRight: 8 },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 16,
    paddingVertical: 2,
  },
  historyContainer: { marginTop: 16 },
  historyHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  historyTitle: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700' },
  clearAllText: { color: Colors.textMuted, fontSize: 12, fontWeight: '700' },
  historyChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  historyChip: { flexDirection: 'row', alignItems: 'center', maxWidth: '100%', backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.withOpacity.white10, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 6 },
  historyChipPress: { maxWidth: '85%' },
  historyChipText: { color: Colors.textPrimary, fontWeight: '600', fontSize: 12 },
  historyDeleteBtn: { marginLeft: 6, paddingLeft: 6, justifyContent: 'center' },
  historyDeleteIcon: { width: 14, height: 14, tintColor: Colors.textMuted },
  cardWrapper: { paddingHorizontal: 16, paddingTop: 12 },
  empty: { alignItems: 'center', padding: 24 },
  emptyText: { color: Colors.textSecondary },
  
  // Event tile (matching home list style)
  tileCard: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    height: 100,
    backgroundColor: 'transparent',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  tileImage: { width: 100, height: '100%', resizeMode: 'cover' },
  tileSurface: { flex: 1, flexDirection: 'row' },
  tileInfo: { flex: 1, padding: 12, justifyContent: 'space-between' },
  tileTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 4, lineHeight: 22 },
  tileSubtitle: { color: Colors.genre, fontSize: 14 },
  tileCtaContainer: { justifyContent: 'center', paddingRight: 12 },
  tileCta: { backgroundColor: Colors.button.background, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  tileCtaText: { color: Colors.button.text, fontSize: 12, fontWeight: '700' },
});


