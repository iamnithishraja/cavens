// ReactNativeFirebaseMessagingHeadlessTask.js
// This file is automatically detected by React Native Firebase
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import * as SecureStore from 'expo-secure-store';

// Initialize Firebase
const app = getApp();
const messaging = getMessaging(app);

// Register the background message handler
setBackgroundMessageHandler(messaging, async remoteMessage => {
  console.log('🔔 Background notification received');
  
  try {
    // Store notification data for when app reopens
    if (remoteMessage.data) {
      const notificationData = {
        ...remoteMessage.data,
        timestamp: new Date().toISOString(),
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        fromBackground: true,
      };
      
      // Store in SecureStore for when app reopens
      await SecureStore.setItemAsync('last_notification', JSON.stringify(notificationData));
      
      // Also store in a list of recent notifications
      try {
        const existingNotifications = await SecureStore.getItemAsync('recent_notifications');
        const notifications = existingNotifications ? JSON.parse(existingNotifications) : [];
        
        // Add new notification to the beginning of the array
        notifications.unshift(notificationData);
        
        // Keep only the last 10 notifications
        const recentNotifications = notifications.slice(0, 10);
        
        await SecureStore.setItemAsync('recent_notifications', JSON.stringify(recentNotifications));
      } catch (listError) {
        console.error('🔔 Error updating notifications list:', listError);
      }
    }
  } catch (error) {
    console.error('🔔 Error storing notification:', error);
  }
});
