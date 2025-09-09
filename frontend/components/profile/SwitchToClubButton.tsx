import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { profileStyles } from './styles';
import type { SwitchToClubButtonProps } from './types';

const SwitchToClubButton: React.FC<SwitchToClubButtonProps> = ({
  onSwitchToClub,
  isSwitching
}) => {
  return (
    <TouchableOpacity
      style={profileStyles.switchButton}
      onPress={onSwitchToClub}
      disabled={isSwitching}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={Colors.gradients.button as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={profileStyles.switchGradient}
      >
        {isSwitching ? (
          <ActivityIndicator color={Colors.button.text} />
        ) : (
          <>
            <Ionicons name="business" size={24} color={Colors.button.text} />
            <Text style={profileStyles.switchButtonText}>Switch to Club Mode</Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default SwitchToClubButton;
