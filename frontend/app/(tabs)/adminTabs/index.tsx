import { store } from '@/utils';
import { router } from 'expo-router';
import React from 'react';
import { Button, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AnalyticsScreen() {
  return (
    <SafeAreaView>
      <Text>Analytics Screen</Text>
      <Button title="Logout" onPress={() => {
        store.delete('user');
        store.delete('token');
        router.replace('/auth/Auth');
      }} />
    </SafeAreaView>
  );
}
