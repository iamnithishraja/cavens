import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Dimensions } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

// Enhanced Toast Component with Swipe-to-Dismiss
const SwipeableToast = ({ text1, text2, props, hide }: any) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const { width: screenWidth } = Dimensions.get('window');
  
  // Extract image URL from notification data
  const imageUrl = props?.data?.image || 
                  props?.data?.imageUrl || 
                  props?.data?.picture;

  const handlePanGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const handlePanStateChange = (event: any) => {
    if (event.nativeEvent.state === 5) { // END state
      const { translationX, velocityX } = event.nativeEvent;
      
      // If swiped more than 100px or with high velocity, dismiss
      if (Math.abs(translationX) > 100 || Math.abs(velocityX) > 500) {
        // Animate out
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: translationX > 0 ? screenWidth : -screenWidth,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          hide();
        });
      } else {
        // Snap back to original position
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={handlePanGestureEvent}
      onHandlerStateChange={handlePanStateChange}
      activeOffsetX={[-10, 10]}
    >
      <Animated.View 
        style={[
          styles.container,
          {
            transform: [{ translateX }],
            opacity,
          }
        ]}
      >
        <LinearGradient
          colors={[Colors.background, Colors.backgroundSecondary]}
          style={styles.notificationCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Enhanced border glow with theme colors */}
          <View style={styles.borderGlow} />
          
          {/* Main content */}
          <View style={styles.contentContainer}>
            {/* Left side - Image or Icon */}
            <View style={styles.leftSection}>
              {imageUrl ? (
                <View style={styles.imageContainer}>
                  <Image 
                    source={{ uri: imageUrl }} 
                    style={styles.notificationImage}
                    resizeMode="cover"
                  />
                  <View style={styles.imageOverlay} />
                </View>
              ) : (
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={[Colors.primary, Colors.primaryDark]}
                    style={styles.iconGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="notifications" size={20} color={Colors.button.text} />
                  </LinearGradient>
                  <View style={styles.statusDot} />
                </View>
              )}
            </View>

            {/* Center - Text content */}
            <View style={styles.textSection}>
              <Text style={styles.title} numberOfLines={2}>
                {text1}
              </Text>
              <Text style={styles.message} numberOfLines={4}>
                {text2}
              </Text>
              
              {/* Bottom info */}
              <View style={styles.bottomInfo}>
                <View style={styles.timeContainer}>
                  <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
                  <Text style={styles.timestamp}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <View style={styles.appBadge}>
                  <Text style={styles.appName}>Cavens</Text>
                </View>
              </View>
            </View>

            {/* Right side - Close button */}
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={hide} 
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Enhanced decorative elements */}
          <View style={styles.decorativeElements}>
            <View style={[styles.decorativeDot, { top: 10, right: 20, backgroundColor: Colors.primary }]} />
            <View style={[styles.decorativeDot, { bottom: 15, left: 30, backgroundColor: Colors.blueAccent }]} />
          </View>
        </LinearGradient>
      </Animated.View>
    </PanGestureHandler>
  );
};

export const toastConfig = {
  custom_notification: SwipeableToast,
  // Fallback configurations for other toast types
  success: ({ text1, text2, hide }: any) => (
    <View style={styles.fallbackContainer}>
      <View style={[styles.fallbackToast, { backgroundColor: Colors.success }]}>
        <Text style={styles.fallbackText}>{text1}</Text>
        {text2 && <Text style={styles.fallbackSubtext}>{text2}</Text>}
      </View>
    </View>
  ),
  error: ({ text1, text2, hide }: any) => (
    <View style={styles.fallbackContainer}>
      <View style={[styles.fallbackToast, { backgroundColor: Colors.error }]}>
        <Text style={styles.fallbackText}>{text1}</Text>
        {text2 && <Text style={styles.fallbackSubtext}>{text2}</Text>}
      </View>
    </View>
  ),
  info: ({ text1, text2, hide }: any) => (
    <View style={styles.fallbackContainer}>
      <View style={[styles.fallbackToast, { backgroundColor: Colors.info }]}>
        <Text style={styles.fallbackText}>{text1}</Text>
        {text2 && <Text style={styles.fallbackSubtext}>{text2}</Text>}
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    width: '100%',
    paddingTop: 8,
  },
  notificationCard: {
    borderRadius: 20,
    marginHorizontal: 12,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 110,
  },
  borderGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Colors.withOpacity.primary30,
    zIndex: -1,
  },
  contentContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  leftSection: {
    marginRight: 12,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  notificationImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.withOpacity.black30,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    position: 'relative',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  textSection: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: 0.2,
    lineHeight: 20,
  },
  message: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.textSecondary,
    lineHeight: 18,
    letterSpacing: 0.1,
    marginBottom: 8,
  },
  bottomInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
    marginLeft: 4,
    letterSpacing: 0.3,
  },
  appBadge: {
    backgroundColor: Colors.backgroundTertiary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white30,
  },
  appName: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 16,
    backgroundColor: Colors.withOpacity.white10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
  },
  decorativeElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  decorativeDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.withOpacity.white30,
  },
  // Fallback toast styles
  fallbackContainer: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  fallbackToast: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fallbackText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  fallbackSubtext: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
});
