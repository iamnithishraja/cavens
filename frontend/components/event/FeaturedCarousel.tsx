import React, { useEffect, useRef, useState } from "react";
import { View, Text, FlatList, StyleSheet, useWindowDimensions, ViewToken, NativeSyntheticEvent, NativeScrollEvent, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import { VideoView, useVideoPlayer } from "expo-video";
import type { EventItem } from "./types";

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    weekday: 'short'
  });
};

// 🔹 Single carousel item with video and event details
const CarouselVideoItem: React.FC<{ 
  event: EventItem; 
  width: number; 
  active: boolean; 
  idKey: string; 
  index: number; 
  onVideoComplete?: () => void 
}> = ({ event, width, active, idKey, index, onVideoComplete }) => {
  const uniqueUri = `${event.promoVideos[0]}${event.promoVideos[0].includes("?") ? "&" : "?"}vuid=${encodeURIComponent(idKey)}`;
  const player = useVideoPlayer(uniqueUri, (player) => {
    player.loop = false; // Don't loop - we want to know when it completes
    player.muted = true; // Ensure videos can autoplay
    
    // Set up status listener to detect when video ends
    player.addListener('statusChange', (status) => {
      console.log(`[Video ${index}] Status changed:`, status.status);
      if (status.status === 'idle' && active) {
        console.log(`[Video ${index}] Video completed for ${idKey}`);
        onVideoComplete?.();
      }
    });

    // Start paused; we'll control playback based on visibility
    try { 
      player.pause(); 
      console.log(`[Video ${index}] Player initialized for ${idKey}`);
    } catch (e) {
      console.log(`[Video ${index}] Error initializing player:`, e);
    }
  });

  useEffect(() => {
    const togglePlayback = async () => {
      try {
        if (active) {
          console.log(`[Video ${index}] Activating video ${idKey}`);
          try { 
            player.replace(uniqueUri); 
            console.log(`[Video ${index}] Source replaced`);
          } catch (e) {
            console.log(`[Video ${index}] Error replacing source:`, e);
          }
          
          // Start playing immediately
          setTimeout(async () => { 
            try { 
              await player.play(); 
              console.log(`[Video ${index}] Playback started immediately`);
            } catch (e) {
              console.log(`[Video ${index}] Error starting playback:`, e);
            }
          }, 100);
        } else {
          console.log(`[Video ${index}] Deactivating video ${idKey}`);
          try {
            await player.pause();
            console.log(`[Video ${index}] Playback paused`);
          } catch (e) {
            console.log(`[Video ${index}] Error pausing:`, e);
          }
        }
      } catch (error) {
        console.log(`[Video ${index}] Error toggling video playback:`, error);
      }
    };
    togglePlayback();
  }, [active, uniqueUri, player]);

  return (
    <View style={[styles.videoContainer, { width, height: Math.round(width * 0.6) }]}>
      {active ? (
        <VideoView
          key={`video-${idKey}`}
          style={styles.video}
          player={player}
          contentFit="cover"
          nativeControls={false}
        />
      ) : (
        <Image 
          key={`thumb-${idKey}`} 
          source={{ uri: event.coverImage }} 
          style={styles.videoPlaceholder}
          resizeMode="cover"
        />
      )}
      
      {/* Event Details Overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.detailsOverlay}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.detailsContent}>
          {/* Club Name */}
          <Text style={styles.clubName} numberOfLines={1}>
            {event.name}
          </Text>
          
          {/* Date and Time */}
          <View style={styles.dateTimeRow}>
            <Text style={styles.dateText}>{formatDate(event.date)}</Text>
            <Text style={styles.timeText}>• {event.time}</Text>
          </View>
          
          {/* DJ Artists */}
          <Text style={styles.artistsText} numberOfLines={1}>
            {event.djArtists}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

type Props = {
  events: EventItem[];
  onPressEvent?: (e: EventItem) => void;
};

const FeaturedCarousel: React.FC<Props> = ({ events }) => {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList>(null);
  const indexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const autoScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // only pick top 3 featured that have a video source
  const featured = events
    .filter((e) => e.promoVideos && e.promoVideos.length > 0)
    .sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0))
    .slice(0, 3);

  const advanceToNextVideo = () => {
    console.log(`[Carousel] Advancing to next video from index ${activeIndex}`);
    const nextIndex = (activeIndex + 1) % featured.length;
    indexRef.current = nextIndex;
    setActiveIndex(nextIndex);
    
    // Smooth scroll to next video
    listRef.current?.scrollToIndex({
      index: nextIndex,
      animated: true,
    });
  };

  const handleVideoComplete = () => {
    console.log(`[Carousel] Video completed, scheduling next video`);
    // Clear any existing timeout
    if (autoScrollTimeoutRef.current) {
      clearTimeout(autoScrollTimeoutRef.current);
    }
    
    // Schedule next video after a short delay
    autoScrollTimeoutRef.current = setTimeout(() => {
      advanceToNextVideo();
    }, 1000); // 0.1 second delay after video completion
  };

  // 🔹 Auto-scroll every 10 seconds as fallback (in case video completion detection fails)
  useEffect(() => {
    if (featured.length === 0) return;
    
    const fallbackInterval = setInterval(() => {
      console.log(`[Carousel] Fallback auto-scroll triggered`);
      advanceToNextVideo();
    }, 10000); // 10 seconds fallback

    return () => {
      clearInterval(fallbackInterval);
      if (autoScrollTimeoutRef.current) {
        clearTimeout(autoScrollTimeoutRef.current);
      }
    };
  }, [featured.length, activeIndex]);

  const viewabilityConfig = { itemVisiblePercentThreshold: 60 } as const;
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems && viewableItems.length > 0) {
      const nextIndex = viewableItems[0].index ?? 0;
      console.log(`[Carousel] Viewability changed to index ${nextIndex}`);
      setActiveIndex(nextIndex);
      indexRef.current = nextIndex;
      
      // Clear any pending auto-scroll when user manually scrolls
      if (autoScrollTimeoutRef.current) {
        clearTimeout(autoScrollTimeoutRef.current);
        autoScrollTimeoutRef.current = null;
      }
    }
  }).current;

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const itemWidthWithGap = width - 32 + 12;
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / itemWidthWithGap);
    const bounded = Math.max(0, Math.min(idx, featured.length - 1));
    console.log(`[Carousel] Momentum scroll ended at index ${bounded}`);
    setActiveIndex(bounded);
    indexRef.current = bounded;
    
    // Clear any pending auto-scroll when user manually scrolls
    if (autoScrollTimeoutRef.current) {
      clearTimeout(autoScrollTimeoutRef.current);
      autoScrollTimeoutRef.current = null;
    }
  };

  if (featured.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Featured</Text>
      <FlatList
        ref={listRef}
        data={featured}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item._id || item.name}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        renderItem={({ item, index }) => (
          <CarouselVideoItem
            event={item}
            width={width - 32}
            active={index === activeIndex}
            idKey={`${item._id}-${index}`}
            index={index}
            onVideoComplete={handleVideoComplete}
          />
        )}
        initialNumToRender={3}
        extraData={activeIndex}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        pagingEnabled={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: width - 32 + 12, // item + separator
          offset: (width - 32 + 12) * index,
          index,
        })}
        // Enable smooth looping by allowing scroll beyond bounds
        decelerationRate="fast"
        snapToInterval={width - 32 + 12}
        snapToAlignment="start"
      />
      
      {/* Navigation Dots */}
      <View style={styles.dotsContainer}>
        {featured.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === activeIndex && styles.activeDot
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  title: {
    color: Colors.textPrimary,
    fontWeight: "800",
    fontSize: 18,
    marginBottom: 12,
    marginLeft: 16,
  },
  videoContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.surfaceElevated,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 20,
  },
  detailsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 24,
  },
  detailsContent: {
    gap: 8,
  },
  clubName: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    color: Colors.accentBlue,
    fontSize: 14,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  timeText: {
    color: Colors.accentYellow,
    fontSize: 14,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  artistsText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textMuted,
    opacity: 0.5,
  },
  activeDot: {
    backgroundColor: Colors.accentYellow,
    opacity: 1,
    width: 24,
  },
});

export default FeaturedCarousel;
