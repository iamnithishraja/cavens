import admin from '../config/firebase.js';
import User from '../models/userModel.js';
import Club from '../models/clubModel.js';
import { cityEventService } from './cityEventService.js';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

export interface ClubApprovalNotificationData {
  clubId: string;
  clubName: string;
  approvalStatus: 'approved' | 'rejected';
  timestamp: string;
  deepLink?: string;
}

export class NotificationService {
  private static instance: NotificationService;
  private failedNotifications: Array<{userId: string, payload: NotificationPayload, timestamp: Date, retryCount: number}> = [];

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Rate limiting functions removed - notifications sent for every city change

  /**
   * Send push notification to a specific user by user ID
   */
  async sendNotificationToUser(
    userId: string,
    payload: NotificationPayload
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Get user's FCM token
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      if (!user.fcmToken) {
        return { success: false, error: 'User has no FCM token' };
      }

       // Validate and clean the payload
       const cleanPayload = {
         title: payload.title || 'Notification',
         body: payload.body || 'You have a new notification',
         data: payload.data || {}
       };

      // Send notification with proper configuration for background delivery
      const message = {
        token: user.fcmToken,
        notification: {
          title: cleanPayload.title,
          body: cleanPayload.body,
          imageUrl: payload.imageUrl,
        },
        data: {
          // Convert all data values to strings (Firebase requirement)
          ...Object.fromEntries(
            Object.entries(cleanPayload.data || {}).map(([key, value]) => [
              key, 
              value !== null && value !== undefined ? String(value) : ''
            ])
          ),
          // Add timestamp to ensure uniqueness
          timestamp: Date.now().toString(),
          // Ensure data is present for background handling
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
          // Add message type for better handling
          messageType: 'city_notification',
        },
         android: {
           notification: {
             channelId: 'high_importance_channel',
             icon: 'ic_launcher',
             color: '#0B1120',
             sound: 'default',
             priority: 'high' as const,
             defaultSound: true,
             defaultVibrateTimings: true,
             defaultLightSettings: true,
             visibility: 'public' as const,
             notificationPriority: 'PRIORITY_HIGH' as const,
             tag: `city_event_${Date.now()}`,
             sticky: false,
             clickAction: 'FLUTTER_NOTIFICATION_CLICK',
             localOnly: false,
             notificationCount: 1,
           },
           priority: 'high' as const,
           ttl: 86400000, // 24 hours
           collapseKey: `city_notification_${Date.now()}`,
         },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
               alert: {
                 title: cleanPayload.title,
                 body: cleanPayload.body,
               },
              // Critical for background notifications
              contentAvailable: 1,
              mutableContent: 1,
              // Ensure notification shows when app is closed
              category: 'CITY_EVENT_NOTIFICATION',
            },
          },
          headers: {
            'apns-priority': '10',
            'apns-push-type': 'alert',
          },
        },
      };

      const response = await admin.messaging().send(message as any);

      return { success: true, messageId: response };
    } catch (error: any) {
      console.error(`❌ FCM error:`, error.message);
      
      // Handle specific Firebase errors
      if (error.code === 'messaging/invalid-registration-token' || 
          error.code === 'messaging/registration-token-not-registered') {
        // Token is invalid, remove it from user record
        await User.findByIdAndUpdate(userId, { 
          fcmToken: null,
          updatedAt: new Date(),
        });
        return { 
          success: false, 
          error: 'Invalid FCM token - removed from user record' 
        };
      }
      
      if (error.code === 'messaging/quota-exceeded') {
        return { 
          success: false, 
          error: 'Notification quota exceeded' 
        };
      }
      
      if (error.code === 'messaging/device-message-rate-exceeded') {
        return { 
          success: false, 
          error: 'Device message rate exceeded' 
        };
      }

      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Send club approval notification to club owner
   */
  async sendClubApprovalNotification(
    clubId: string,
    approvalStatus: 'approved' | 'rejected'
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Get club details
      const club = await Club.findById(clubId).populate('owner');
      if (!club) {
        return { success: false, error: 'Club not found' };
      }

      const owner = club.owner as any;
      if (!owner) {
        return { success: false, error: 'Club owner not found' };
      }

      // Prepare notification payload
      const title = approvalStatus === 'approved' 
        ? '🎉 Club Registration Approved!' 
        : '❌ Club Registration Update';
      
      const body = approvalStatus === 'approved'
        ? `Great news! Your club "${club.name}" has been approved and is now live on the platform.`
        : `Your club registration for "${club.name}" has been reviewed. Please check your account for details.`;

      const notificationData: ClubApprovalNotificationData = {
        clubId: club._id.toString(),
        clubName: club.name,
        approvalStatus,
        timestamp: new Date().toISOString(),
        deepLink: approvalStatus === 'approved' 
          ? `cavens://club/${club._id}` 
          : `cavens://club-registration`,
      };

      const payload: NotificationPayload = {
        title,
        body,
        data: {
          type: 'club_approval',
          ...notificationData,
        },
      };

      // Send notification to club owner
      return await this.sendNotificationToUser(owner._id.toString(), payload);
    } catch (error) {
      console.error('Error sending club approval notification:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }


  /**
   * Send city-based event recommendation notification with retry logic
   */
  async sendCityEventNotification(
    userId: string,
    city: string,
    retryCount: number = 0
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const maxRetries = 3;
    const retryDelays = [5000, 15000, 45000]; // 5s, 15s, 45s

    try {
      console.log(`🔔 Sending notification for ${city}`);
      const topEventData = await cityEventService.getTopEventByCity(city);
      
      if (!topEventData) {
        console.log(`🔔 Sending welcome notification for ${city}`);
         
         // Create modern, professional welcome message
         const cityName = city.charAt(0).toUpperCase() + city.slice(1);
         // const cityEmoji = city.toLowerCase() === 'dubai' ? '🏙️' : '🌆';
         const welcomeNotification = {
           title: ` Welcome to ${cityName}`,
           body: "🎯 Premium events & exclusive venues await • Discover curated experiences • Tap to explore your city's nightlife",
           data: {
             type: 'city_welcome',
             city: city,
             timestamp: new Date().toISOString()
           }
         };
        
        const result = await this.sendNotificationToUser(userId, welcomeNotification);
        if (result.success) {
          console.log(`✅ Welcome notification sent`);
        }
        return result;
      }

      // Format the notification
      const notificationContent = cityEventService.formatEventForNotification(topEventData);

      // Send the notification
      const result = await this.sendNotificationToUser(userId, notificationContent);
      
      if (result.success) {
        console.log(`✅ Event notification sent`);
        return result;
      } else {
        console.log(`❌ Event notification failed: ${result.error}`);
        
        // Retry logic for certain errors
        if (retryCount < maxRetries && this.shouldRetry(result.error)) {
          const delay = retryDelays[retryCount] || retryDelays[retryDelays.length - 1];
          console.log(`🔄 Retrying notification...`);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return await this.sendCityEventNotification(userId, city, retryCount + 1);
        }
        
        return result;
      }
    } catch (error) {
      console.error('Error sending city event notification:', error);
      
      // Retry logic for exceptions
      if (retryCount < maxRetries) {
        const delay = retryDelays[retryCount] || retryDelays[retryDelays.length - 1];
        console.log(`🔄 Retrying after exception in ${delay}ms... (attempt ${retryCount + 2}/${maxRetries + 1})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return await this.sendCityEventNotification(userId, city, retryCount + 1);
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Determine if a notification should be retried based on error type
   */
  private shouldRetry(error?: string): boolean {
    if (!error) return false;
    
    // Retry for network-related errors
    const retryableErrors = [
      'network',
      'timeout',
      'connection',
      'unavailable',
      'quota-exceeded',
      'device-message-rate-exceeded'
    ];
    
    return retryableErrors.some(retryableError => 
      error.toLowerCase().includes(retryableError)
    );
  }

  /**
   * Update user's FCM token
   */
  async updateUserFCMToken(userId: string, fcmToken: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`🔑 Updating FCM token for user ${userId}`);
      console.log(`🔑 Token: ${fcmToken.substring(0, 20)}...`);
      
      // Update user's FCM token
      const result = await User.findByIdAndUpdate(userId, { 
        fcmToken,
        updatedAt: new Date(),
      }, { new: true });

      if (result) {
        console.log(`✅ FCM token updated successfully for user ${userId}`);
        console.log(`✅ User now has token: ${result.fcmToken ? result.fcmToken.substring(0, 20) + '...' : 'NO TOKEN'}`);
        return { success: true };
      } else {
        console.log(`❌ User not found: ${userId}`);
        return { success: false, error: 'User not found' };
      }
    } catch (error) {
      console.error(`❌ Error updating FCM token for user ${userId}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Add failed notification to retry queue
   */
  private addToFailedQueue(userId: string, payload: NotificationPayload): void {
    this.failedNotifications.push({
      userId,
      payload,
      timestamp: new Date(),
      retryCount: 0
    });
    console.log(`📝 Added to retry queue`);
  }

  /**
   * Retry failed notifications
   */
  async retryFailedNotifications(): Promise<void> {
    if (this.failedNotifications.length === 0) {
      return;
    }

    console.log(`🔄 Retrying ${this.failedNotifications.length} notifications...`);
    
    const notificationsToRetry = [...this.failedNotifications];
    this.failedNotifications = [];

    for (const notification of notificationsToRetry) {
      if (notification.retryCount < 3) {
        try {
          console.log(`🔄 Retrying notification (attempt ${notification.retryCount + 1})`);
          const result = await this.sendNotificationToUser(notification.userId, notification.payload);
          
          if (!result.success) {
            // Add back to queue with incremented retry count
            this.failedNotifications.push({
              ...notification,
              retryCount: notification.retryCount + 1
            });
          }
        } catch (error) {
          console.error(`❌ Error retrying notification:`, error);
          // Add back to queue with incremented retry count
          this.failedNotifications.push({
            ...notification,
            retryCount: notification.retryCount + 1
          });
        }
      } else {
          console.log(`❌ Max retries reached, dropping notification`);
      }
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
