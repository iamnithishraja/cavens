import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Colors';
import { profileStyles } from './styles';
import type { LoadingStateProps } from './types';

const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading profile...' }) => {
  return (
    <View style={profileStyles.centered}>
      <View style={profileStyles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={profileStyles.loadingText}>{message}</Text>
      </View>
    </View>
  );
};

export default LoadingState;
