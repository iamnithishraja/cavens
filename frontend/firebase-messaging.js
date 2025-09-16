// firebase-messaging.js - Background message handler
// This file must be in the root directory for React Native Firebase to detect it
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';

const app = getApp();
const messaging = getMessaging(app);

setBackgroundMessageHandler(messaging, async remoteMessage => {
  console.log('Notifications: Background message handled');
  console.log('Notifications: Message data:', remoteMessage.data);
  console.log('Notifications: Message notification:', remoteMessage.notification);
  
  // When app is completely closed, Firebase automatically shows system notifications
  // if the notification payload contains title and body
  // The system will handle displaying the notification
  
  // Optional: You can perform additional processing here
  // For example, save notification data to local storage
  if (remoteMessage.data) {
    // Store notification data for when app reopens
    console.log('Notifications: Storing notification data for app reopen');
  }
});
