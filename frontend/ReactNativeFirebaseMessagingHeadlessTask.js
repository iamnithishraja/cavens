
import { AppRegistry } from 'react-native';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';

// Prevent multiple registrations using global flag
const HEADLESS_TASK_KEY = 'ReactNativeFirebaseMessagingHeadlessTask';
const GLOBAL_REGISTRATION_KEY = '__CAVENS_HEADLESS_TASK_REGISTERED__';

// Check if already registered globally
if (global[GLOBAL_REGISTRATION_KEY]) {
  console.log('🔔 Headless task already registered globally, skipping...');
} else {

const app = getApp();
const messaging = getMessaging(app);

// Background message handler function
const backgroundMessageHandler = async (remoteMessage) => {
  console.log('🔔 Background notification received');

  // Do not store anything; let the system display the notification.
  // Ensure we return quickly so Android can show the notification reliably.
  return Promise.resolve();
};

  // Register the headless task
  try {
    AppRegistry.registerHeadlessTask(HEADLESS_TASK_KEY, () => {

      return backgroundMessageHandler;
    });
    
    // Mark as registered globally
    global[GLOBAL_REGISTRATION_KEY] = true;
    console.log('🔔 Headless task registration completed');
  } catch (error) {
    console.error('🔔 Error registering headless task:', error);
  }

  // Set the background message handler
  setBackgroundMessageHandler(messaging, backgroundMessageHandler);
}
