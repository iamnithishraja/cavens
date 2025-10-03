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
import AnimatedGlow, { type PresetConfig } from "react-native-animated-glow";
import { Colors } from "@/constants/Colors";
import { Asset } from "expo-asset";
import type { EventItem } from "./types";
import type { City } from "@/components/ui/CityPickerModal";
import FeaturedItemPreset from "../ui/presets/featuredItem";
import Reanimated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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

  const clearAutoRotation = useCallback(() => {
    if (autoRotateTimerRef.current) {
      clearTimeout(autoRotateTimerRef.current);
      autoRotateTimerRef.current = null;
    }
  }, []);

  const startAutoRotation = useCallback(() => {
    if (featuredEvents.length <= 1) return;
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
      startAutoRotation();
    }, 15000);
  }, [featuredEvents.length, clearAutoRotation]);

  const restartAutoRotation = useCallback(() => {
    clearAutoRotation();
    startAutoRotation();
  }, [clearAutoRotation, startAutoRotation]);

  useEffect(() => {
    startAutoRotation();
    return () => {
      clearAutoRotation();
    };
  }, [startAutoRotation, clearAutoRotation]);

  useEffect(() => {
    Object.values(videoTimerRefs.current).forEach((timer) =>
      clearTimeout(timer)
    );
    videoTimerRefs.current = {};

    featuredEvents.forEach((event) => {
      if (event._id) {
        if (!videoOpacityRefs.current[event._id]) {
          videoOpacityRefs.current[event._id] = new Animated.Value(0);
        } else {
          videoOpacityRefs.current[event._id].setValue(0);
        }
      }
    });

    const newShowingVideo: { [key: string]: boolean } = {};
    featuredEvents.forEach((event) => {
      if (event._id) {
        newShowingVideo[event._id] = false;
      }
    });
    setShowingVideo(newShowingVideo);

    const activeEvent = featuredEvents[activeCarouselIndex];
    if (
      activeEvent &&
      activeEvent._id &&
      activeEvent.promoVideos &&
      activeEvent.promoVideos.length > 0
    ) {
      videoTimerRefs.current[activeEvent._id] = setTimeout(() => {
        Animated.timing(videoOpacityRefs.current[activeEvent._id!], {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
        setShowingVideo((prev) => ({ ...prev, [activeEvent._id!]: true }));
      }, 1000);
    }

    return () => {
      Object.values(videoTimerRefs.current).forEach((timer) =>
        clearTimeout(timer)
      );
    };
  }, [featuredEvents, activeCarouselIndex]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getClubName = (event: EventItem) => {
    return event.venue || "Club Name";
  };

  const handleCarouselScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const handleMomentumScrollEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveCarouselIndex(index);
    restartAutoRotation();
  };

  const handleTouchStart = () => {
    clearAutoRotation();
  };

  const handleTouchEnd = () => {
    restartAutoRotation();
  };

  if (featuredEvents.length === 0) {
    return null;
  }

  const FeaturedItem: React.FC<{ item: FeaturedEventWithDistance }> = ({
    item,
  }) => {
    const angle = useSharedValue(0);
    const scale = useSharedValue(1);
    const pulseOpacity = useSharedValue(0.6);

    useEffect(() => {
      // Main spinning animation
      angle.value = withRepeat(
        withTiming(360, { duration: 3000, easing: Easing.linear }),
        -1,
        false
      );

      // Random speed changes for surprise effect
      const speedVariation = setInterval(() => {
        const randomDuration = Math.random() * 2000 + 2000; // 2-4 seconds
        angle.value = withRepeat(
          withTiming(360, {
            duration: randomDuration,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          }),
          -1,
          false
        );
      }, 8000);

      // Pulsing scale effect
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, {
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );

      // Opacity pulse for glow effect
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.6, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );

      return () => clearInterval(speedVariation);
    }, []);

    const animatedBorderStyle = useAnimatedStyle(() => {
      return {
        transform: [{ rotate: `${-angle.value}deg` }, { scale: scale.value }],
        opacity: pulseOpacity.value,
      };
    });
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

    return (
      <View style={styles.carouselItem}>
        <AnimatedGlow preset={FeaturedItemPreset}>
          <TouchableOpacity
            style={styles.featuredCard}
            onPress={() => {
              console.log("Featured event clicked:", item._id, item.name);
              onEventPress(item._id || "");
            }}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: item.coverImage }}
              style={styles.featuredImage}
            />

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
                <Text
                  style={styles.venueName}
                  adjustsFontSizeToFit
                  numberOfLines={2}
                  minimumFontScale={0.8}
                >
                  {item.name}
                </Text>

                <View style={styles.bottomSection}>
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
          </TouchableOpacity>
        </AnimatedGlow>
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
    marginTop: 0,
    height: 420,
    marginBottom: 0,
    position: "relative",
    overflow: "visible",
  },
  carouselItem: {
    marginTop: 10,
    width: SCREEN_WIDTH,
    height: "100%",
    paddingHorizontal: 16,
    paddingVertical: 20,
    position: "relative",
    top: -10,
  },
  featuredCard: {
    height: "100%",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: Colors.backgroundSecondary,
    position: "relative",
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
  spinningLight: {
    position: "absolute",
    top: -100,
    left: -40,
    right: -40,
    bottom: -120,
    borderRadius: 2,
    zIndex: 0,
  },
  sparkleLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  sparkle: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
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
