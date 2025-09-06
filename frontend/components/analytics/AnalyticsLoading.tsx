import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const AnalyticsLoading: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.loadingCard}>
        <View style={styles.iconContainer}>
          <Ionicons name="analytics-outline" size={48} color={Colors.primary} />
        </View>
        <Text style={styles.loadingTitle}>Loading Analytics</Text>
        <Text style={styles.loadingSubtitle}>Analyzing your event data...</Text>
        <ActivityIndicator size="large" color={Colors.primary} style={styles.spinner} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.withOpacity.white10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  spinner: {
    marginTop: 8,
  },
});

export default AnalyticsLoading;
