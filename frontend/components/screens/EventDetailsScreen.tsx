import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import Background from "../common/Background";
import MenuModal from "@/components/Models/menuModel";
import type { EventItem } from "@/components/event/types";
import apiClient from "@/app/api/client";
import { router } from "expo-router";
import LoadingScreen from "../common/LoadingScreen";
import GuestRulesModal from "../Models/guestRulesModal";
import { VideoView, useVideoPlayer } from "expo-video";

type Props = {
  eventId?: string; // New prop for fetching event details
  onGoBack?: () => void;
};

type EventDetailsResponse = {
  success: boolean;
  data: EventItem;
};

const EventDetailsScreen: React.FC<Props> = ({
  eventId,
  onGoBack,
}) => {
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState<boolean>(!!eventId);
  const [error, setError] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [rulesVisible, setRulesVisible] = useState<boolean>(false);
  const [clubName, setClubName] = useState<string>('');
  const [clubMapLink, setClubMapLink] = useState<string>('');

  // Fetch event details if eventId is provided but no initial event
  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) return; // Skip if we already have event data

      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get<EventDetailsResponse>(
          `/api/user/event/${eventId}`
        );

        if (response.data.success && response.data.data) {
          setEvent(response.data.data);
        } else {
          setError("Failed to load event details");
        }
      } catch {
        setError("Failed to load event details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const lowestTicket = useMemo(() => {
    if (!event || !event.tickets || event.tickets.length === 0) return 0;
    return Math.min(...event.tickets.map((t) => t.price));
  }, [event]);

  const mediaItems = useMemo(() => {
    if (!event) return [] as { type: "image" | "video"; uri: string }[];
    const items: { type: "image" | "video"; uri: string }[] = [];
    if (event.coverImage) items.push({ type: "image", uri: event.coverImage });
    if (Array.isArray(event.galleryPhotos)) {
      for (const p of event.galleryPhotos)
        items.push({ type: "image", uri: p });
    }
    if (Array.isArray(event.promoVideos)) {
      for (const v of event.promoVideos) items.push({ type: "video", uri: v });
    }
    return items;
  }, [event]);

  const { width } = Dimensions.get("window");
  const carouselRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const onScroll = (e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / width);
    if (idx !== activeIndex) setActiveIndex(idx);
  };

  const openMaps = () => {
    if (!event) return;
    const url = clubMapLink && clubMapLink.length > 0 
      ? clubMapLink 
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clubName || event.name)}`;
    Linking.openURL(url).catch(() => {});
  };

  const handleBook = () => {
    if (!event) return;
    router.push({
      pathname: "/payment",
      params: {
        eventId: event._id || "",
        eventName: event.name,
        eventDate: event.date,
        eventTime: event.time,
        tickets: JSON.stringify(event.tickets || []),
        coverImage: event.coverImage || '',
      },
    });
  };

  const height = Math.round(width * 0.56);

  const HeroImage: React.FC<{ uri: string }> = ({ uri }) => (
    <Image source={{ uri }} style={{ width, height }} resizeMode="cover" />
  );

  const HeroVideo: React.FC<{ uri: string; active: boolean }> = ({
    uri,
    active,
  }) => {
    const player = useVideoPlayer(uri, (p) => {
      p.muted = true;
      p.loop = true;
    });
    useEffect(() => {
      if (active) player.play();
      else player.pause();
    }, [active, player]);
    return (
      <VideoView
        player={player}
        style={{ width, height }}
        contentFit="cover"
        nativeControls={false}
      />
    );
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "";
    try {
      // Handle common inputs like "18:30" or "6:30 pm"
      const date = new Date(
        `1970-01-01T${timeStr.replace(/\s*(am|pm)$/i, "")}:00`
      );
      const isPM = /pm$/i.test(timeStr.trim());
      if (!isNaN(date.getTime())) {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        if (isPM && hours < 12) hours += 12;
        const d2 = new Date(1970, 0, 1, hours, minutes);
        return d2.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        });
      }
      return timeStr;
    } catch {
      return timeStr;
    }
  };

  // Load club details (name and mapLink) that contain this event for map navigation
  useEffect(() => {
    const loadClubForEvent = async () => {
      try {
        if (!event?._id) return;
        // Try authorized endpoint first; fall back to public clubs
        let clubs: any[] = [];
        try {
          const res = await apiClient.get('/api/user/getAllEvents');
          clubs = res.data?.clubs?.map((c: any) => c.club) || [];
        } catch {
          const res = await apiClient.get('/api/club/public/approved', { params: { includeEvents: 'true' } });
          clubs = res.data?.items || [];
        }
        const ownerClub = clubs.find((c: any) => Array.isArray(c.events) && c.events.some((ev: any) => (ev._id || ev).toString?.() === event._id));
        if (ownerClub) {
          setClubName(ownerClub.name || '');
          setClubMapLink(ownerClub.mapLink || '');
        }
      } catch {}
    };
    loadClubForEvent();
  }, [event?._id]);

  return (
    <Background>
      {loading ? (
        <LoadingScreen />
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : !event ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Event not found</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Media Carousel in Safe Area with top blend */}
          <SafeAreaView edges={["top"]}>
            <View style={styles.mediaContainer}>
              <ScrollView
                ref={carouselRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
              >
                {mediaItems.map((m, idx) =>
                  m.type === "image" ? (
                    <HeroImage key={`${m.type}-${idx}`} uri={m.uri} />
                  ) : (
                    <HeroVideo
                      key={`${m.type}-${idx}`}
                      uri={m.uri}
                      active={idx === activeIndex}
                    />
                  )
                )}
              </ScrollView>
              {mediaItems.length > 1 && (
                <View style={styles.dots}>
                  {mediaItems.map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.dot,
                        i === activeIndex && styles.dotActive,
                      ]}
                    />
                  ))}
                </View>
              )}
              {/* Back Button */}
              <TouchableOpacity style={styles.backBtn} onPress={onGoBack || (() => router.back())} activeOpacity={0.9}>
                <Text style={styles.backIcon}>←</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Header: Title, Venue link, DJs */}
          <View style={styles.headerSection}>
            <Text style={styles.eventName}>{event.name}</Text>
            <View style={styles.metaRow}>
              {!!(clubName || clubMapLink) && (
                <TouchableOpacity onPress={openMaps} activeOpacity={0.8} style={{ maxWidth: '70%' }}>
                  <Text style={styles.venueLink} numberOfLines={1}>
                    {clubName || 'View on Maps'} →
                  </Text>
                </TouchableOpacity>
              )}
              {!!event.time && (
                <Text style={styles.timePill}>
                  {formatTime(event.time)} onwards
                </Text>
              )}
            </View>
            {!!event.djArtists && (
              <View style={{ marginTop: 4 }}>
                <Text style={styles.djText}>DJ: {event.djArtists}</Text>
              </View>
            )}
          </View>

          {/* Description */}
          {!!event.description && (
            <View style={styles.section}>
              <Text style={styles.sectionText}>{event.description}</Text>
            </View>
          )}

          <View style={styles.section}>
            {event.eventMap ? (
              <Image
                source={{ uri: event.eventMap }}
                style={styles.mapImage}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={require("../../assets/images/map.png")}
                style={styles.mapImage}
                resizeMode="cover"
              />
            )}
          </View>

          {/* Actions Row */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.smallBtn}
              onPress={() => setMenuVisible(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.smallBtnText}>View Menu</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.smallBtn}
              onPress={() => setRulesVisible(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.smallBtnText}>Guest Rules</Text>
            </TouchableOpacity>
          </View>

          {/* Book Tickets CTA (non-sticky) */}
          <View style={styles.bookCtaWrap}>
            <TouchableOpacity style={styles.bookBtn} onPress={handleBook} activeOpacity={0.9}>
              <Text style={styles.bookText}>Book tickets from AED {lowestTicket}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      {/* Menu Modal */}
      {event && (
        <MenuModal
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          title="Menu"
          items={event.menuItems || []}
        />
      )}

      {/* Guest Rules Modal */}
      {event && (
        <GuestRulesModal
          visible={rulesVisible}
          onClose={() => setRulesVisible(false)}
          guestExperience={event.guestExperience}
        />
      )}
    </Background>
  );
};
export default EventDetailsScreen;

const styles = StyleSheet.create({
  // topBlend: {
  //   position: 'absolute',
  //   top: 0,
  //   left: 0,
  //   right: 0,
  //   height: 40,
  // },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorText: {
    color: Colors.error,
    fontWeight: "700",
  },
  mediaContainer: {
    backgroundColor: Colors.backgroundSecondary,
  },
  dots: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textMuted,
    opacity: 0.5,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    opacity: 1,
    width: 20,
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
  headerSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 8,
  },
  eventName: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: "800",
  },
  timePill: {
    alignSelf: "flex-start",
    color: Colors.textPrimary,
    backgroundColor: Colors.withOpacity.white10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    fontWeight: "800",
    fontSize: 12,
  },
  venueLink: {
    color: Colors.blueAccent,
    fontWeight: "700",
  },
  djText: {
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontWeight: "800",
    marginBottom: 8,
    fontSize: 16,
  },
  sectionText: {
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  mapImage: {
    width: Dimensions.get("window").width - 32,
    height: Math.round((Dimensions.get("window").width - 32) * 0.56),
    borderRadius: 14,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 8,
  },
  smallBtn: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  smallBtnText: {
    color: Colors.textPrimary,
    fontWeight: "800",
  },
  bookCtaWrap: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  bookBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bookText: {
    color: Colors.button.text,
    fontWeight: "900",
    fontSize: 16,
  },
  bottomBarSafe: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomBar: {
    padding: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.withOpacity.white10,
  },
});
