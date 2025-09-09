import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { qrStyles } from './styles';
import type { PermissionScreenProps } from './types';

export default function PermissionScreen({ onRequestPermission }: PermissionScreenProps) {
  return (
    <SafeAreaView style={qrStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <LinearGradient colors={Colors.gradients.background as [string, string]} style={qrStyles.container}>
        <View style={qrStyles.centerContainer}>
          <View style={qrStyles.permissionIconContainer}>
            <Ionicons name="camera" size={64} color={Colors.primary} />
            <View style={qrStyles.permissionBadge}>
              <Ionicons name="lock-closed" size={20} color={Colors.error} />
            </View>
          </View>
          <Text style={qrStyles.errorTitle}>Camera Access Required</Text>
          <Text style={qrStyles.errorMessage}>
            We need camera permissions to scan QR codes and complete ticket orders
          </Text>
          <TouchableOpacity 
            style={qrStyles.permissionButton} 
            onPress={onRequestPermission}
          >
            <LinearGradient
              colors={[Colors.primary, '#4A9EFF']}
              style={qrStyles.permissionButtonGradient}
            >
              <Ionicons name="shield-checkmark" size={20} color="#000" />
              <Text style={qrStyles.permissionButtonText}>Grant Camera Access</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
