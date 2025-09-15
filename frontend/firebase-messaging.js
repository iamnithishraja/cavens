// firebase-messaging.js
import messaging from '@react-native-firebase/messaging';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  
  // Background messages are automatically displayed as system notifications
  // by Firebase when the app is in background or killed state
  // No additional action needed here
});
