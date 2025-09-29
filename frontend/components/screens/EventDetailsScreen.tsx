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

const EventDetailsScreen: React.FC<Props> = ({ eventId, onGoBack }) => {
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState<boolean>(!!eventId);
  const [error, setError] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [rulesVisible, setRulesVisible] = useState<boolean>(false);
  const [clubName, setClubName] = useState<string>("");
  const [clubMapLink, setClubMapLink] = useState<string>("");

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
  
  // Calculate total tickets remaining
  const ticketsRemaining = useMemo(() => {
    if (!event || !event.tickets || event.tickets.length === 0) return 0;
    return event.tickets.reduce((sum, t) => sum + (t.quantityAvailable - t.quantitySold), 0);
  }, [event]);
  
  // Check if tickets are selling fast (less than 20% remaining)
  const sellingFast = useMemo(() => {
    if (!event || !event.tickets || event.tickets.length === 0) return false;
    const totalAvailable = event.tickets.reduce((sum, t) => sum + t.quantityAvailable, 0);
    const remaining = ticketsRemaining;
    return totalAvailable > 0 && (remaining / totalAvailable) < 0.2;
  }, [event, ticketsRemaining]);
  
  // Calculate total attendees (tickets sold)
  const totalAttendees = useMemo(() => {
    if (!event || !event.tickets || event.tickets.length === 0) return 0;
    return event.tickets.reduce((sum, t) => sum + t.quantitySold, 0);
  }, [event]);
  
  // Calculate crowd level (percentage of capacity filled)
  const crowdLevel = useMemo(() => {
    if (!event || !event.tickets || event.tickets.length === 0) return 0;
    const totalCapacity = event.tickets.reduce((sum, t) => sum + t.quantityAvailable, 0);
    if (totalCapacity === 0) return 0;
    return Math.round((totalAttendees / totalCapacity) * 100);
  }, [event, totalAttendees]);
  
  // Get crowd status
  const getCrowdStatus = () => {
    if (crowdLevel >= 80) return { text: '🔥 Almost Full', color: Colors.error };
    if (crowdLevel >= 60) return { text: '⚡ Getting Busy', color: Colors.warning };
    if (crowdLevel >= 30) return { text: '👥 Moderate Crowd', color: Colors.primary };
    if (crowdLevel > 0) return { text: '✨ Just Started', color: Colors.accentBlue };
    return { text: '🎉 Be the First!', color: Colors.textSecondary };
  };

  // Determine if there are any explicit table options
  const hasTables = useMemo(() => {
    if (!event || !Array.isArray(event.tickets)) return false;
    return event.tickets.some((t: any) => {
      const norm = (s?: string) => (s || "").toLowerCase();
      const hay = `${norm(t.name)} ${norm(t.description)}`;
      return /\btable\b/i.test(hay);
    });
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
  const autoRotateTimerRef = useRef<NodeJS.Timeout | null>(null);

  const onScroll = (e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / width);
    if (idx !== activeIndex) setActiveIndex(idx);
  };
  
  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    if (mediaItems.length <= 1) return; // Don't rotate if only one item
    
    // Clear existing timer
    if (autoRotateTimerRef.current) {
      clearTimeout(autoRotateTimerRef.current);
    }
    
    // Set up auto-rotation
    autoRotateTimerRef.current = setTimeout(() => {
      const nextIndex = (activeIndex + 1) % mediaItems.length;
      setActiveIndex(nextIndex);
      carouselRef.current?.scrollTo({ x: nextIndex * width, animated: true });
    }, 5000); // 5 seconds
    
    // Cleanup on unmount
    return () => {
      if (autoRotateTimerRef.current) {
        clearTimeout(autoRotateTimerRef.current);
      }
    };
  }, [activeIndex, mediaItems.length, width]);

  const openMaps = () => {
    if (!event) return;
    const url =
      clubMapLink && clubMapLink.length > 0
        ? clubMapLink
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            clubName || event.name
          )}`;
    Linking.openURL(url).catch(() => {});
  };

  const handleBook = (mode: "tickets" | "tables") => {
    if (!event) return;
    router.push({
      pathname: "/payment",
      params: {
        eventId: event._id || "",
        eventName: event.name,
        eventDate: event.date,
        eventTime: event.time,
        tickets: JSON.stringify(event.tickets || []),
        coverImage: event.coverImage || "",
        mode,
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
          const res = await apiClient.get("/api/user/getAllEvents");
          clubs = res.data?.clubs?.map((c: any) => c.club) || [];
        } catch {
          const res = await apiClient.get("/api/club/public/approved", {
            params: { includeEvents: "true" },
          });
          clubs = res.data?.items || [];
        }
        const ownerClub = clubs.find(
          (c: any) =>
            Array.isArray(c.events) &&
            c.events.some(
              (ev: any) => (ev._id || ev).toString?.() === event._id
            )
        );
        if (ownerClub) {
          setClubName(ownerClub.name || "");
          setClubMapLink(ownerClub.mapLink || "");
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
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
              <TouchableOpacity
                style={styles.backBtn}
                onPress={onGoBack || (() => router.back())}
                activeOpacity={0.9}
              >
                <Text style={styles.backIcon}>←</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Header: Title, Venue link, DJs */}
          <View style={styles.headerSection}>
            <Text style={styles.eventName}>{event.name}</Text>
            <View style={styles.metaRow}>
              {!!(clubName || clubMapLink) && (
                <TouchableOpacity
                  onPress={openMaps}
                  activeOpacity={0.8}
                  style={{ maxWidth: "70%" }}
                >
                  <Text style={styles.venueLink} numberOfLines={1}>
                    📍 {clubName || "View on Maps"} →
                  </Text>
                </TouchableOpacity>
              )}
              {!!event.time && (
                <Text style={styles.timePill}>
                  {formatTime(event.time)} onwards
                </Text>
              )}
            </View>
            
            {/* Quick Highlights Row */}
            <View style={styles.highlightsSection}>
              {/* Starting Price */}
              <View style={styles.highlightChip}>
                <Text style={styles.highlightChipText}>💰 From د.إ {lowestTicket}</Text>
              </View>
              
              {/* Dress Code */}
              {!!event.guestExperience?.dressCode && (
                <View style={styles.highlightChip}>
                  <Text style={styles.highlightChipText}>👔 {event.guestExperience.dressCode}</Text>
                </View>
              )}
              
              {/* Happy Hour */}
              {!!event.happyHourTimings && (
                <View style={styles.highlightChip}>
                  <Text style={styles.highlightChipText}>🍹 {event.happyHourTimings}</Text>
                </View>
              )}
              
              {/* Featured Badge */}
              {event.isFeatured && (
                <View style={[styles.highlightChip, styles.featuredChip]}>
                  <Text style={styles.highlightChipText}>⭐ Featured</Text>
                </View>
              )}
              
              {/* Selling Fast */}
              {sellingFast && (
                <View style={[styles.highlightChip, styles.urgentChip]}>
                  <Text style={styles.highlightChipText}>🔥 Only {ticketsRemaining} left!</Text>
                </View>
              )}
            </View>
            
            {/* DJ/Artists Line-up */}
            {!!event.djArtists && (
              <View style={styles.lineupSection}>
                <Text style={styles.lineupTitle}>🎧 Line-up</Text>
                <Text style={styles.djText}>{event.djArtists}</Text>
              </View>
            )}
            
            {/* Crowd Info */}
            {totalAttendees > 0 && (
              <View style={styles.crowdSection}>
                <View style={styles.crowdHeader}>
                  <Text style={styles.crowdTitle}>👥 Crowd Status</Text>
                  <Text style={[styles.crowdStatus, { color: getCrowdStatus().color }]}>
                    {getCrowdStatus().text}
                  </Text>
                </View>
                
                {/* Heat Map Bar */}
                <View style={styles.heatMapContainer}>
                  <View style={styles.heatMapBackground}>
                    <View style={[styles.heatMapFill, { width: `${crowdLevel}%` }]} />
                  </View>
                  <Text style={styles.heatMapText}>{crowdLevel}% capacity</Text>
                </View>
                
                {/* Attendees Count */}
                <View style={styles.attendeesRow}>
                  <Text style={styles.attendeesText}>
                    🎫 {totalAttendees} {totalAttendees === 1 ? 'person' : 'people'} attending
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Description */}
          {!!event.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About This Event</Text>
              <Text style={styles.sectionText}>{event.description}</Text>
            </View>
          )}
          
          {/* Gallery Section */}
          {event.galleryPhotos && event.galleryPhotos.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📸 Gallery</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.galleryScroll}
                contentContainerStyle={styles.galleryContent}
              >
                {event.galleryPhotos.map((photo, idx) => (
                  <Image 
                    key={`gallery-${idx}`}
                    source={{ uri: photo }} 
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Event Map/Layout */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🗺️ Venue Layout</Text>
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
          
          {/* Extra Details */}
          {(event.guestExperience?.parkingInfo || event.guestExperience?.accessibilityInfo) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ℹ️ Important Info</Text>
              
              <View style={styles.infoGrid}>
                {/* Row 1 */}
                <View style={styles.infoGridRow}>
                  {!!event.guestExperience.parkingInfo && (
                    <View style={styles.infoItem}>
                      <Text style={styles.infoIcon}>🅿️</Text>
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Parking</Text>
                        <Text style={styles.infoText}>{event.guestExperience.parkingInfo}</Text>
                      </View>
                    </View>
                  )}
                  
                  {!!event.guestExperience.accessibilityInfo && (
                    <View style={styles.infoItem}>
                      <Text style={styles.infoIcon}>♿</Text>
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Accessibility</Text>
                        <Text style={styles.infoText}>{event.guestExperience.accessibilityInfo}</Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}

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

          {/* Book Tickets & Tables CTA (non-sticky) */}
          <View style={styles.bookCtaWrap}>
            <View style={styles.bookButtonsRow}>
              <TouchableOpacity
                style={styles.bookBtn}
                onPress={() => handleBook("tickets")}
                activeOpacity={0.9}
              >
                <Text style={styles.bookText}>🎫 Book Tickets</Text>
                <Text style={styles.bookSubText}>from د.إ {lowestTicket}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.bookBtn, !hasTables && { opacity: 0.5 }]}
                onPress={() => handleBook("tables")}
                disabled={!hasTables}
                activeOpacity={0.9}
              >
                <Text style={styles.bookText}>🍽️ Book Tables</Text>
                <Text style={styles.bookSubText}>from د.إ {lowestTicket}</Text>
              </TouchableOpacity>
            </View>
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
    position: "absolute",
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
    fontWeight: "900",
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
    fontSize: 14,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  highlightsSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  highlightChip: {
    backgroundColor: Colors.withOpacity.white10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  featuredChip: {
    backgroundColor: Colors.withOpacity.primary10,
    borderColor: Colors.primary,
  },
  urgentChip: {
    backgroundColor: Colors.withOpacity.error10,
    borderColor: Colors.error,
  },
  highlightChipText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: "700",
  },
  lineupSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.withOpacity.white10,
  },
  lineupTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 6,
  },
  crowdSection: {
    marginTop: 12,
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.withOpacity.white10,
    backgroundColor: Colors.withOpacity.white10,
    borderRadius: 12,
  },
  crowdHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  crowdTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  crowdStatus: {
    fontSize: 12,
    fontWeight: "700",
  },
  heatMapContainer: {
    marginBottom: 8,
  },
  heatMapBackground: {
    height: 8,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 6,
  },
  heatMapFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  heatMapText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  attendeesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  attendeesText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontWeight: "800",
    marginBottom: 12,
    fontSize: 18,
  },
  sectionText: {
    color: Colors.textSecondary,
    lineHeight: 22,
    fontSize: 15,
  },
  galleryScroll: {
    marginTop: 8,
  },
  galleryContent: {
    gap: 12,
    paddingRight: 16,
  },
  galleryImage: {
    width: 240,
    height: 160,
    borderRadius: 12,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  infoGrid: {
    marginTop: 8,
  },
  infoGridRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  infoIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: 14,
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
  bookButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  bookBtn: {
    flex: 1,
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
  bookSubText: {
    color: Colors.button.text,
    fontWeight: "600",
    fontSize: 12,
    marginTop: 2,
    opacity: 0.9,
  },
  bottomBarSafe: {
    position: "absolute",
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
