import { useEffect } from 'react';
import { getMessaging, onMessage, onNotificationOpenedApp, getInitialNotification } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import Toast from 'react-native-toast-message';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { fcmService } from '@/utils/fcm';

export default function NotificationService() {
  // Helper function to handle notification navigation
  const handleNotificationNavigation = (data: any) => {
    if (!data) return;
    
    try {
      // Handle club approval notifications
      if (data.type === 'club_approval') {
        if (data.approvalStatus === 'approved') {
          console.log('🔔 Club approved - navigating to details');
          
          // Show success toast
          Toast.show({
            type: 'success',
            text1: '🎉 Club Approved!',
            text2: `Your club "${data.clubName}" has been approved and is now live!`,
            visibilityTime: 5000,
          });
          
          // Navigate to club details or switch to club role
          setTimeout(() => {
            if (data.clubId) {
              router.push(`/club/details`);
            } else {
              router.push('/club/userClubDetailsScreen');
            }
          }, 1000);
          
        } else if (data.approvalStatus === 'rejected') {
          console.log('🔔 Club rejected - navigating to registration');
          
          // Show info toast
          Toast.show({
            type: 'info',
            text1: 'Club Registration Update',
            text2: `Your club registration for "${data.clubName}" has been reviewed. Please check for details.`,
            visibilityTime: 5000,
          });
          
          // Navigate to club registration screen
          setTimeout(() => {
            router.push('/club-registration');
          }, 1000);
        }
      }
      
      // Handle other notification types
      else if (data.type === 'event_reminder') {
        if (data.eventId) {
          router.push(`/event/${data.eventId}`);
        }
      }
      
      else if (data.type === 'booking_confirmation') {
        router.push('/profile');
      }
      
      else if (data.type === 'general') {
        // For general notifications, just show toast and stay on current screen
        Toast.show({
          type: 'info',
          text1: data.title || 'Notification',
          text2: data.body || 'You have a new notification',
          visibilityTime: 4000,
        });
      }
      
      // Handle deep links
      else if (data.deepLink) {
        // Parse deep link and navigate accordingly
        if (data.deepLink.startsWith('cavens://club/')) {
          const clubId = data.deepLink.split('/').pop();
          if (clubId && clubId !== 'test_club_123') {
            router.push(`/club/details`);
          }
        } else if (data.deepLink.startsWith('cavens://event/')) {
          const eventId = data.deepLink.split('/').pop();
          if (eventId) {
            router.push(`/event/${eventId}`);
          }
        }
      }
      
    } catch (error) {
      console.error('🔔 Error handling notification:', error);
      // Fallback: show a generic toast
      Toast.show({
        type: 'info',
        text1: 'New Notification',
        text2: 'You have a new notification',
        visibilityTime: 3000,
      });
    }
  };

  // Helper function to check for stored notification data
  const checkStoredNotification = async () => {
    try {
      // Check for the most recent notification
      const storedNotification = await SecureStore.getItemAsync('last_notification');
      if (storedNotification) {
        const notificationData = JSON.parse(storedNotification);
        console.log('🔔 Processing stored notification');
        
        // Clear the stored notification
        await SecureStore.deleteItemAsync('last_notification');
        
        // Handle the stored notification
        handleNotificationNavigation(notificationData);
        return;
      }
      
      // If no recent notification, check for any unread notifications in the list
      const recentNotifications = await SecureStore.getItemAsync('recent_notifications');
      if (recentNotifications) {
        const notifications = JSON.parse(recentNotifications);
        
        // Find the most recent unread notification
        const unreadNotification = notifications.find((notif: any) => !notif.read);
        if (unreadNotification) {
          console.log('🔔 Processing unread notification');
          
          // Mark as read
          unreadNotification.read = true;
          await SecureStore.setItemAsync('recent_notifications', JSON.stringify(notifications));
          
          // Handle the notification
          handleNotificationNavigation(unreadNotification);
        }
      }
    } catch (error) {
      console.error('🔔 Error checking stored notification:', error);
    }
  };


  useEffect(() => {
    async function setupNotifications() {
      try {
        console.log('🔔 Setting up notification service...');
        
        // Initialize FCM service
        await fcmService.initialize();
        
        // Get the token for backend integration
        const token = await fcmService.getToken();
        if (token) {
          console.log('Notifications: Token obtained and sent to backend');
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
          console.log('🔔 App opened from background notification');
          handleNotificationNavigation(remoteMessage.data);
        });

        // Handle notification tap when app is completely closed
        getInitialNotification(messaging)
          .then(remoteMessage => {
            if (remoteMessage) {
              console.log('🔔 App opened from quit state notification');
              handleNotificationNavigation(remoteMessage.data);
            }
          });

        // Check for stored notification data from background handler with a delay
        // This ensures the app is fully loaded before processing notifications
        setTimeout(() => {
          checkStoredNotification();
        }, 2000);

        console.log('🔔 Notification service ready');
        return unsubscribe;
      } catch (error) {
        console.error('Notifications: Error setting up service:', error);
      }
    }

    setupNotifications();
  }, []);

  return null; // This component doesn't render anything
}
