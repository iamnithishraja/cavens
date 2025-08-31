import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';

type Props = {
  title?: string;
  subtitle?: string;
  onRetry?: () => void;
  showRetryButton?: boolean;
};

const EmptyClubsView: React.FC<Props> = ({ 
  title = "No Clubs Found",
  subtitle = "No clubs match your current filters. Try adjusting your search or filters.",
  onRetry,
  showRetryButton = false
}) => {
  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: "https://img.icons8.com/ios/100/CCCCCC/nightclub.png" }}
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>
      
      {showRetryButton && onRetry && (
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginVertical: 32,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    marginBottom: 20,
    opacity: 0.6,
    tintColor: Colors.textMuted,
  },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.button.background,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: Colors.button.text,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default EmptyClubsView;
