// firebase-messaging.js - Firebase messaging setup
// This file provides the messaging instance for foreground use
import { getMessaging } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';

// Initialize Firebase messaging for foreground use
const app = getApp();
const messaging = getMessaging(app);

// Export the messaging instance for use in other parts of the app
export { messaging };
