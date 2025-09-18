import { useEffect } from 'react';
import { getMessaging, onMessage, onNotificationOpenedApp, getInitialNotification } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';
import { fcmService } from '@/utils/fcm';
import { geofencingService } from '@/utils/geofencing';
export default function NotificationService() {

  // Helper function to handle notification navigation
  const handleNotificationNavigation = (data: any) => {
    if (!data) return;
    
    try {
      // Handle club approval notifications
      if (data.type === 'club_approval') {
        if (data.approvalStatus === 'approved') {
          console.log('🔔 Club approved - navigating to details');
          
          // Show professional success toast
          Toast.show({
            type: 'custom_notification',
            text1: '✅ Club Verified',
            text2: `${data.clubName} is now live • Start hosting events • Welcome to Cavens`,
            visibilityTime: 6000,
            position: 'top',
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
          
          // Show professional info toast
          Toast.show({
            type: 'custom_notification',
            text1: '📋 Registration Review',
            text2: `${data.clubName} application reviewed • Check details • Resubmit if needed`,
            visibilityTime: 6000,
            position: 'top',
          });
          
          // Navigate to club registration screen
          setTimeout(() => {
            router.push('/club-registration');
          }, 1000);
        }
      }
      
      // Handle city event recommendation notifications
      else if (data.type === 'city_event_recommendation') {
        console.log('🔔 City event recommendation received:', data);
        
        // Show modern, professional toast notification
        Toast.show({
          type: 'custom_notification',
          text1: '🎯 Exclusive Event Alert',
          text2: `${data.eventName} at ${data.clubName} • Limited spots available`,
          visibilityTime: 6000,
          autoHide: true,
          topOffset: 50,
          bottomOffset: 40,
          position: 'top',
        });
        
        // Navigate to event details after a short delay
        setTimeout(() => {
          if (data.eventId) {
            router.push(`/event/${data.eventId}`);
          }
        }, 2000);
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
          type: 'custom_notification',
          text1: data.title || 'Notification',
          text2: data.body || 'You have a new notification',
          visibilityTime: 4000,
          position: 'top',
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
            console.log('🔔 Navigating to event via deep link:', eventId);
            router.push(`/event/${eventId}`);
          }
        }
      }
      
    } catch (error) {
      console.error('🔔 Error handling notification:', error);
      // Fallback: show a generic toast
      Toast.show({
        type: 'custom_notification',
        text1: 'New Notification',
        text2: 'You have a new notification',
        visibilityTime: 3000,
        position: 'top',
      });
    }
  };



  useEffect(() => {
    async function setupNotifications() {
      try {
        
        // Initialize FCM service
        await fcmService.initialize();
        
        // Get the token for backend integration
        const token = await fcmService.getToken();
        if (!token) {
          console.warn('Notifications: Failed to get FCM token');
        }

        // Initialize geofencing service (without requesting permissions)
        // Permissions will be requested later on home screen
        await geofencingService.initializeWithoutPermissions();

        // Do not process pending city updates; no storage/replay

        // Refresh FCM token to ensure it's up to date
        try {
          await fcmService.refreshToken();
        } catch (error) {
          console.error('🔔 Error refreshing FCM token:', error);
        }

        // Get messaging instance
        const app = getApp();
        const messaging = getMessaging(app);

        // Foreground message handling with better error handling
        const unsubscribe = onMessage(messaging, async remoteMessage => {
          
          try {
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
            
            console.log('🔔 Showing toast notification...');
            
            // Show custom styled toast notification for foreground messages
            Toast.show({
              type: 'custom_notification',
              text1: remoteMessage.notification?.title || 'New Message',
              text2: remoteMessage.notification?.body || 'You have a new notification',
              visibilityTime: 8000, // Increased time for better readability
              autoHide: true,
              topOffset: 50,
              bottomOffset: 40,
              // Enhanced animation settings
              position: 'top',
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
            
          } catch (error) {
            console.error('❌ Error handling foreground message:', error);
          }
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
        return unsubscribe;
      } catch (error) {
        console.error('Notifications: Error setting up service:', error);
      }
    }

    setupNotifications();
  }, []);

  return null; // This component doesn't render anything
}
