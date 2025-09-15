import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import Toast from 'react-native-toast-message';
import { fcmService } from '@/utils/fcm';

export default function NotificationService() {
  useEffect(() => {
    async function setupNotifications() {
      try {
        // Initialize FCM service
        await fcmService.initialize();
        
        // Get the token and send to server if needed
        const token = await fcmService.getToken();
        if (token) {
          // TODO: Send token to your backend when user logs in
          // await fcmService.sendTokenToServer(token, userId);
        }

        // Foreground message handling
        const unsubscribe = messaging().onMessage(async remoteMessage => {
          console.log('Foreground message received:', remoteMessage);
          
          // Show custom styled toast notification for foreground messages
          Toast.show({
            type: 'custom_notification',
            text1: remoteMessage.notification?.title || 'New Message',
            text2: remoteMessage.notification?.body || 'You have a new notification',
            visibilityTime: 5000,
            autoHide: true,
            topOffset: 50,
            bottomOffset: 40,
            props: {
              data: remoteMessage.data,
            },
          });
        });

        // Handle notification tap when app is in background
        messaging().onNotificationOpenedApp(remoteMessage => {
          console.log('Notification caused app to open from background state:', remoteMessage);
          // Handle navigation based on notification data
        });

        // Handle notification tap when app is completely closed
        messaging()
          .getInitialNotification()
          .then(remoteMessage => {
            if (remoteMessage) {
              console.log('Notification caused app to open from quit state:', remoteMessage);
              // Handle navigation based on notification data
            }
          });

        return unsubscribe;
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    }

    setupNotifications();
  }, []);

  return null; // This component doesn't render anything
}
