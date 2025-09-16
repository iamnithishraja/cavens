import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

export const toastConfig = {
  custom_notification: ({ text1, text2, props, hide }: any) => {
    // Extract image URL from notification data
    const imageUrl = props?.data?.image || 
                    props?.data?.imageUrl || 
                    props?.data?.picture;
    
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(0,0,0,0.95)', 'rgba(20,20,30,0.98)']}
          style={styles.notificationCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Animated border glow */}
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
                    colors={[Colors.primary, '#8B5CF6']}
                    style={styles.iconGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="notifications" size={20} color="white" />
                  </LinearGradient>
                  <View style={styles.statusDot} />
                </View>
              )}
            </View>

            {/* Center - Text content */}
            <View style={styles.textSection}>
              <Text style={styles.title} numberOfLines={1}>
                {text1}
              </Text>
              <Text style={styles.message} numberOfLines={3}>
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

          {/* Decorative elements */}
          <View style={styles.decorativeElements}>
            <View style={[styles.decorativeDot, { top: 10, right: 20 }]} />
            <View style={[styles.decorativeDot, { bottom: 15, left: 30 }]} />
          </View>
        </LinearGradient>
      </View>
    );
  },
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
    overflow: 'hidden',
    minHeight: 100,
  },
  borderGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
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
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
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
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.9)',
  },
  textSection: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.2,
    lineHeight: 20,
  },
  message: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.8)',
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
    color: 'rgba(255,255,255,0.6)',
    marginLeft: 4,
    letterSpacing: 0.3,
  },
  appBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  appName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});
