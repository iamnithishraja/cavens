import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';

interface LoadingStateProps {
  locationLoading: boolean;
}

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ locationLoading }) => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={[styles.fullBackground, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.blueAccent} />
        <Text style={styles.loadingText}>
          {locationLoading ? "Getting your location..." : "Loading events..."}
        </Text>
      </View>
    </SafeAreaView>
  );
};

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={[styles.fullBackground, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  fullBackground: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    color: Colors.textPrimary,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: Colors.button.background,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  retryButtonText: {
    color: Colors.button.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
