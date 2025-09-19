
import { AppRegistry } from 'react-native';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';

// Prevent multiple registrations using global flag
const HEADLESS_TASK_KEY = 'ReactNativeFirebaseMessagingHeadlessTask';
const GLOBAL_REGISTRATION_KEY = '__CAVENS_HEADLESS_TASK_REGISTERED__';

// Initialize global object if it doesn't exist
if (typeof global === 'undefined') {
  global = globalThis;
}

if (!global[GLOBAL_REGISTRATION_KEY]) {
  try {
    const app = getApp();
    const messaging = getMessaging(app);

    const backgroundMessageHandler = async (remoteMessage) => {
      return Promise.resolve();
    };

    AppRegistry.registerHeadlessTask(HEADLESS_TASK_KEY, () => {
      return backgroundMessageHandler;
    });
    
    global[GLOBAL_REGISTRATION_KEY] = true;
    setBackgroundMessageHandler(messaging, backgroundMessageHandler);
  } catch (_error) {
    console.error('❌ Notifications: Headless task registration failed');
  }
}
