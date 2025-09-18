
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';

const app = getApp();
const messaging = getMessaging(app);

// This file is imported in _layout.tsx to register the background message handler
// The actual headless task is handled by ReactNativeFirebaseMessagingHeadlessTask.js

setBackgroundMessageHandler(messaging, async (remoteMessage) => {
  console.log('🔔 Background notification received (firebase-messaging.js):', remoteMessage);
  
  // For background notifications, we should NOT interfere with the automatic display
  // The system will automatically show the notification when app is closed
  // We only store data for additional processing when app becomes active
  
  if (remoteMessage.data && Object.keys(remoteMessage.data).length > 0) {
    try {
      await AsyncStorage.setItem('last_notification', JSON.stringify(remoteMessage.data));
      console.log('🔔 Background notification data stored for processing');
    } catch (error) {
      console.error('🔔 Error storing background notification:', error);
    }
  }
  
  // Return void to allow Firebase to handle the notification display automatically
  return Promise.resolve();
});

export { messaging };
