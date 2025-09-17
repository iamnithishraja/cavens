import React from 'react';
import { View } from 'react-native';
import UserHomeScreen from '@/components/screens/userHomeScreen';
import FloatingChatButton from '@/components/ui/FloatingChatButton';
import { store } from '@/utils';
import { router } from 'expo-router';

export default function HomeScreen() {
  
  const handleChatButtonPress = async () => {
    console.log('🎫 Bookings Screen Navigation');
    
    // Get the selected city from store, default to Dubai
    const selectedCity = await store.get('selectedCity') || 'Dubai';
    console.log('selectedCity is ',selectedCity);
    
    router.push({
      pathname: '/chatbot',
      params:{
        Screen:'home',
        city: selectedCity,
      }
    }
    )
  };
  return (
    <View style={{ flex: 1 }}>
      <UserHomeScreen />
      <FloatingChatButton  onPress={handleChatButtonPress}/>
    </View>
  )
}