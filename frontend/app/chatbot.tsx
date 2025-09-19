import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import Chatbot from '@/components/ui/Chatbot';


export default function ChatbotScreen() {
  const [isChatbotVisible, setIsChatbotVisible] = useState(true);
  
  const params = useLocalSearchParams();
  const screen = (params.Screen as string) || 'GENERAL';
  const city = (params.city as string) || 'Dubai';
  const hasBookings = params.hasBookings === 'true';
  
  // Parse location data if available (only for MAP screen)
  const userLocation = (params.latitude && params.longitude) ? {
    latitude: parseFloat(params.latitude as string),
    longitude: parseFloat(params.longitude as string)
  } : undefined;
  const handleClose = () => {
    setIsChatbotVisible(false);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <LinearGradient
        colors={Colors.gradients.background as [string, string]}
        style={styles.background}
      >
        <Chatbot
          isVisible={isChatbotVisible}
          onClose={handleClose}
          city={city}
          screen={screen as 'HOME' | 'MAP' | 'BOOKINGS' | 'PROFILE' | 'GENERAL'}
          userLocation={userLocation}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  background: {
    flex: 1,
  },
});
