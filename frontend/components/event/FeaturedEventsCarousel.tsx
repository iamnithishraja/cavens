import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Animated,
  Dimensions,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { VideoView, useVideoPlayer } from "expo-video";
import Svg, { Rect as SvgRect } from "react-native-svg";
import Reanimated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedProps,
  Easing,
} from "react-native-reanimated";
import { Colors } from "@/constants/Colors";
import { Asset } from "expo-asset";
import type { EventItem } from "./types";
import type { City } from "@/components/ui/CityPickerModal";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Hardcoded local video asset for featured cards
const LOCAL_VIDEO_URI = Asset.fromModule(
  require("@/assets/images/club.mp4")
).uri;

type FeaturedEventWithDistance = EventItem & {
  distanceInMeters?: number;
  distanceText?: string;
  durationText?: string;
  durationInSeconds?: number;
  method?: string;
  distance?: string;
};

interface FeaturedEventsCarouselProps {
  featuredEvents: FeaturedEventWithDistance[];
  selectedCity: City;
  onEventPress: (eventId: string) => void;
}

const FeaturedEventsCarousel: React.FC<FeaturedEventsCarouselProps> = ({
  featuredEvents,
  selectedCity,
  onEventPress,
}) => {
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const [showingVideo, setShowingVideo] = useState<{ [key: string]: boolean }>(
    {}
  );
  const carouselRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const autoRotateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoTimerRefs = useRef<{
    [key: string]: ReturnType<typeof setTimeout>;
  }>({});
  const videoOpacityRefs = useRef<{ [key: string]: Animated.Value }>({});

  // Auto-rotation functions
  const clearAutoRotation = useCallback(() => {
    if (autoRotateTimerRef.current) {
      clearTimeout(autoRotateTimerRef.current);
      autoRotateTimerRef.current = null;
    }
  }, []);

  const startAutoRotation = useCallback(() => {
    if (featuredEvents.length <= 1) return; // No need to rotate if only one item

    clearAutoRotation();
    autoRotateTimerRef.current = setTimeout(() => {
      setActiveCarouselIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % featuredEvents.length;
        carouselRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
      // Continue the rotation
      startAutoRotation();
    }, 15000); // 15 seconds
  }, [featuredEvents.length, clearAutoRotation]);

  const restartAutoRotation = useCallback(() => {
    clearAutoRotation();
    startAutoRotation();
  }, [clearAutoRotation, startAutoRotation]);

  // Auto-rotation effect
  useEffect(() => {
    startAutoRotation();

    return () => {
      clearAutoRotation();
    };
  }, [startAutoRotation, clearAutoRotation]);

  // Handle video timing based on active carousel item
  useEffect(() => {
    // Clear existing timers
    Object.values(videoTimerRefs.current).forEach((timer) =>
      clearTimeout(timer)
    );
    videoTimerRefs.current = {};

    // Initialize/reset opacity values for all events
    featuredEvents.forEach((event) => {
      if (event._id) {
        if (!videoOpacityRefs.current[event._id]) {
          videoOpacityRefs.current[event._id] = new Animated.Value(0);
        } else {
          // Reset to 0 (hidden video) for all events
          videoOpacityRefs.current[event._id].setValue(0);
        }
      }
    });

    // Reset all videos to show images first
    const newShowingVideo: { [key: string]: boolean } = {};
    featuredEvents.forEach((event) => {
      if (event._id) {
        newShowingVideo[event._id] = false;
      }
    });
    setShowingVideo(newShowingVideo);

    // Set up timer only for the currently active event
    const activeEvent = featuredEvents[activeCarouselIndex];
    if (
      activeEvent &&
      activeEvent._id &&
      activeEvent.promoVideos &&
      activeEvent.promoVideos.length > 0
    ) {
      videoTimerRefs.current[activeEvent._id] = setTimeout(() => {
        // Start fade-in animation
        Animated.timing(videoOpacityRefs.current[activeEvent._id!], {
          toValue: 1,
          duration: 500, // 500ms fade transition
          useNativeDriver: true,
        }).start();

        setShowingVideo((prev) => ({ ...prev, [activeEvent._id!]: true }));
      }, 1000);
    }

    return () => {
      // Cleanup timers
      Object.values(videoTimerRefs.current).forEach((timer) =>
        clearTimeout(timer)
      );
    };
  }, [featuredEvents, activeCarouselIndex]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Get club name from event
  const getClubName = (event: EventItem) => {
    return event.venue || "Club Name";
  };

  // Handle carousel pagination
  const handleCarouselScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const handleMomentumScrollEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveCarouselIndex(index);
    restartAutoRotation(); // Restart auto-rotation when user manually scrolls
  };

  const handleTouchStart = () => {
    clearAutoRotation(); // Pause auto-rotation when user touches
  };

  const handleTouchEnd = () => {
    restartAutoRotation(); // Resume auto-rotation when user stops touching
  };

  if (featuredEvents.length === 0) {
    return null;
  }

  // Child component to leverage expo-video hooks per item
  const FeaturedItem: React.FC<{ item: FeaturedEventWithDistance }> = ({
    item,
  }) => {
    const AnimatedSvgRect = Reanimated.createAnimatedComponent(SvgRect);
    const dashOffset = useSharedValue(0);
    const [cardSize, setCardSize] = useState<{ width: number; height: number }>(
      { width: 0, height: 0 }
    );
    const cornerRadius = 17; // match styles.featuredCard borderRadius
    // Simplified perimeter calculation - just use the basic rectangle perimeter
    const perimeter = Math.max(1, 2 * (cardSize.width + cardSize.height));
    const dashLength = Math.max(20, perimeter * 0.4); // 40% of perimeter for the dash
    const dashGap = Math.max(1, perimeter - dashLength); // ensure only one dash
    // Use local hardcoded video (overrides event data)
    const firstVideo = LOCAL_VIDEO_URI;
    const player = useVideoPlayer(firstVideo || "", (p) => {
      p.loop = true;
      p.muted = true;
    });

    useEffect(() => {
      try {
        player.play();
      } catch {}
    }, [player]);

    useEffect(() => {
      if (perimeter <= 1) return;
      dashOffset.value = 0;
      dashOffset.value = withRepeat(
        withTiming(perimeter, { duration: 3000, easing: Easing.linear }),
        -1
      );
    }, [perimeter]);

    const animatedStrokeProps = useAnimatedProps(
      () =>
        ({
          // advance the dash so it appears to orbit the card
          strokeDashoffset: dashOffset.value,
        } as any)
    );

    // Track video opacity for internal fade, but don't crossfade image
    const videoOpacity =
      videoOpacityRefs.current[item._id || ""] || new Animated.Value(0);

    return (
      <View style={styles.carouselItem}>
        <View style={styles.gradientBorder}>
          <TouchableOpacity
            style={styles.featuredCard}
            onLayout={(e) => {
              const { width, height } = e.nativeEvent.layout;
              setCardSize({ width, height });
            }}
            onPress={() => {
              console.log("Featured event clicked:", item._id, item.name);
              onEventPress(item._id || "");
            }}
            activeOpacity={0.9}
          >
            {/* Always show image as background */}
            <Image
              source={{ uri: item.coverImage }}
              style={styles.featuredImage}
            />

            {/* Show video with fade transition if available */}
            {firstVideo && showingVideo[item._id || ""] && (
              <Animated.View
                style={[
                  styles.featuredImage,
                  styles.videoOverlay,
                  { opacity: videoOpacityRefs.current[item._id || ""] || 0 },
                ]}
              >
                <VideoView
                  style={styles.featuredImage}
                  player={player}
                  allowsFullscreen={false}
                  allowsPictureInPicture={false}
                  nativeControls={false}
                  contentFit="cover"
                />
              </Animated.View>
            )}

            <LinearGradient
              colors={Colors.gradients.overlay as [string, string]}
              style={styles.featuredOverlay}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              <View style={styles.featuredContent}>
                {/* Title at the top */}
                <Text
                  style={styles.venueName}
                  adjustsFontSizeToFit
                  numberOfLines={2}
                  minimumFontScale={0.8}
                >
                  {item.name}
                </Text>

                {/* Bottom section */}
                <View style={styles.bottomSection}>
                  {/* Bottom left - Date and location */}
                  <View style={styles.bottomLeftInfo}>
                    <Text
                      style={styles.eventDate}
                      adjustsFontSizeToFit
                      numberOfLines={1}
                      minimumFontScale={0.9}
                    >
                      {formatDate(item.date)}
                    </Text>
                    <Text
                      style={styles.clubLocation}
                      adjustsFontSizeToFit
                      numberOfLines={2}
                      minimumFontScale={0.9}
                    >
                      {getClubName(item)}
                    </Text>
                  </View>

                  {/* Bottom right - Distance and Book button */}
                  <View style={styles.bottomRightInfo}>
                    <Text
                      style={styles.distanceText}
                      adjustsFontSizeToFit
                      numberOfLines={1}
                      minimumFontScale={0.9}
                    >
                      {item.distance ||
                        `${Math.floor(Math.random() * 20) + 1} km`}{" "}
                      away
                    </Text>
                    <TouchableOpacity
                      style={styles.bookButton}
                      onPress={() => {
                        console.log(
                          "BOOK NOW clicked for event:",
                          item._id,
                          item.name
                        );
                        onEventPress(item._id || "");
                      }}
                    >
                      <Text style={styles.bookButtonText}>BOOK NOW</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </LinearGradient>

            {/* Animated tracing border overlay */}
            <Reanimated.View
              pointerEvents="none"
              style={StyleSheet.absoluteFill}
            >
              <Svg width={cardSize.width || 0} height={cardSize.height || 0}>
                <AnimatedSvgRect
                  x={0.5}
                  y={0.5}
                  width={Math.max(0, cardSize.width - 3)}
                  height={Math.max(0, cardSize.height - 3)}
                  rx={cornerRadius - 0.5}
                  ry={cornerRadius - 0.5}
                  fill="none"
                  stroke={Colors.primary}
                  strokeWidth={3}
                  strokeDasharray={`${dashLength} ${dashGap}`}
                  animatedProps={animatedStrokeProps}
                />
              </Svg>
            </Reanimated.View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.carouselContainer}>
      <FlatList
        ref={carouselRef}
        data={featuredEvents}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 4 }}
        onScroll={handleCarouselScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        keyExtractor={(item) => item._id || item.name}
        renderItem={({ item }) => <FeaturedItem item={item} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  carouselContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    height: 330,
    marginBottom: 10,
  },
  carouselItem: {
    width: SCREEN_WIDTH,
    height: 316,
    paddingHorizontal: 16,
    position: "relative",
  },
  gradientBorder: {
    height: "100%",
    borderRadius: 20,
    padding: 3, // Creates the border width
  },
  featuredCard: {
    height: "100%",
    borderRadius: 17, // Slightly smaller to show the gradient border
    overflow: "hidden",
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: "rgba(1,28,81,0.35)",
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    resizeMode: "cover",
  },
  videoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  featuredOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "70%",
    justifyContent: "flex-end",
  },
  featuredContent: {
    padding: 20,
  },
  bottomSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  bottomLeftInfo: {
    flex: 1,
    gap: 4,
  },
  bottomRightInfo: {
    alignItems: "flex-end",
    gap: 8,
  },
  eventDate: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "400",
    textTransform: "uppercase",
  },
  venueName: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "900",
    lineHeight: 44,
    letterSpacing: -0.5,
    textTransform: "uppercase",
  },
  clubLocation: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    textTransform: "uppercase",
    flexShrink: 1,
  },
  distanceText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  bookButton: {
    backgroundColor: Colors.button.background,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  bookButtonText: {
    color: Colors.button.text,
    fontSize: 12,
    fontWeight: "700",
  },
});

export default FeaturedEventsCarousel;
