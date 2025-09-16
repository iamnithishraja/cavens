import React from 'react';
import { View } from 'react-native';
import UserHomeScreen from '@/components/screens/userHomeScreen';
import FloatingChatButton from '@/components/ui/FloatingChatButton';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1 }}>
      <UserHomeScreen />
      <FloatingChatButton />
    </View>
  )
}