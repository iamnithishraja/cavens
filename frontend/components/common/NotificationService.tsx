import { useEffect } from 'react';
import { getMessaging, onMessage, onNotificationOpenedApp, getInitialNotification } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import Toast from 'react-native-toast-message';
import { fcmService } from '@/utils/fcm';

export default function NotificationService() {
  useEffect(() => {
    async function setupNotifications() {
      try {
        console.log('Notifications: Setting up service...');
        
        // Initialize FCM service
        await fcmService.initialize();
        
        // Get the token for backend integration
        const token = await fcmService.getToken();
        if (token) {
          console.log('Notifications: Token obtained, ready for backend integration');
          // TODO: Send token to your backend when user logs in
          // await fcmService.sendTokenToServer(token, userId);
        } else {
          console.warn('Notifications: Failed to get FCM token');
        }

        // Get messaging instance
        const app = getApp();
        const messaging = getMessaging(app);

        // Foreground message handling
        const unsubscribe = onMessage(messaging, async remoteMessage => {
          console.log('Notifications: Foreground message received');
          
          // Extract image URL from various possible locations
          const notificationImageUrl = (remoteMessage.notification as any)?.imageUrl || 
                                     (remoteMessage.notification as any)?.image ||
                                     (remoteMessage.notification as any)?.picture ||
                                     (remoteMessage.notification as any)?.android?.imageUrl ||
                                     (remoteMessage.notification as any)?.ios?.imageUrl;
          
          const dataImageUrl = remoteMessage.data?.image || 
                             remoteMessage.data?.imageUrl || 
                             remoteMessage.data?.picture;
          
          const finalImageUrl = notificationImageUrl || dataImageUrl;
          
          // Show custom styled toast notification for foreground messages
          Toast.show({
            type: 'custom_notification',
            text1: remoteMessage.notification?.title || 'New Message',
            text2: remoteMessage.notification?.body || 'You have a new notification',
            visibilityTime: 6000,
            autoHide: true,
            topOffset: 50,
            bottomOffset: 40,
            props: {
              data: {
                ...remoteMessage.data,
                // Pass the image URL for the toast to display
                image: finalImageUrl,
                imageUrl: finalImageUrl,
                picture: finalImageUrl,
              },
            },
          });
        });

        // Handle notification tap when app is in background
        onNotificationOpenedApp(messaging, remoteMessage => {
          console.log('Notifications: App opened from background notification');
          // TODO: Handle navigation based on notification data
        });

        // Handle notification tap when app is completely closed
        getInitialNotification(messaging)
          .then(remoteMessage => {
            if (remoteMessage) {
              console.log('Notifications: App opened from quit state notification');
              // TODO: Handle navigation based on notification data
            }
          });

        console.log('Notifications: Setup completed successfully');
        return unsubscribe;
      } catch (error) {
        console.error('Notifications: Error setting up service:', error);
      }
    }

    setupNotifications();
  }, []);

  return null; // This component doesn't render anything
}
