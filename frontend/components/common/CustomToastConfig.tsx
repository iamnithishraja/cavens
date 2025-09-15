import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

export const toastConfig = {
  custom_notification: ({ text1, text2, props, hide }: any) => (
    <View style={styles.container}>
      <View style={styles.notificationCard}>
        {/* Border glow effect */}
        <View style={styles.borderGlow} />
        
        {/* Header with icon and close button */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="notifications" size={24} color={Colors.primary} />
            {/* Status dot */}
            <View style={styles.statusDot} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {text1}
            </Text>
            <Text style={styles.message} numberOfLines={2}>
              {text2}
            </Text>
          </View>
          <TouchableOpacity style={styles.closeContainer} onPress={hide} activeOpacity={0.7}>
            <Ionicons 
              name="close" 
              size={18} 
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
        
        {/* Bottom section with timestamp */}
        <View style={styles.bottomSection}>
          <View style={styles.decorativeLine} />
          <Text style={styles.timestamp}>
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0, // Full width
    width: '100%',
    paddingTop: 8,
  },
  notificationCard: {
    backgroundColor: Colors.background,
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 16, // Add margin for visual spacing
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
    position: 'relative',
    overflow: 'hidden',
  },
  borderGlow: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.withOpacity.black30,
    zIndex: -1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.withOpacity.black30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.withOpacity.black30,
  },
  statusDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  message: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  closeContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.withOpacity.black30,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  decorativeLine: {
    height: 1,
    backgroundColor: Colors.withOpacity.black30,
    borderRadius: 1,
    flex: 1,
    marginRight: 12,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
});
