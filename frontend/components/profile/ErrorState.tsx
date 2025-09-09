import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { profileStyles } from './styles';
import type { ErrorStateProps } from './types';

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <View style={profileStyles.centered}>
      <View style={profileStyles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
        <Text style={profileStyles.errorText}>{message}</Text>
        <TouchableOpacity style={profileStyles.retryButton} onPress={onRetry}>
          <LinearGradient
            colors={Colors.gradients.button as [string, string]}
            style={profileStyles.retryGradient}
          >
            <Text style={profileStyles.retryButtonText}>Retry</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ErrorState;
