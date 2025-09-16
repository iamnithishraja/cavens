import admin from '../config/firebase.js';
import User from '../models/userModel.js';
import Club from '../models/clubModel.js';

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

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

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

      // Send notification
      const message = {
        token: user.fcmToken,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl,
        },
        data: payload.data || {},
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#FF6B35',
            sound: 'default',
            channelId: 'club_notifications',
            priority: 'high' as const,
            defaultSound: true,
            defaultVibrateTimings: true,
            defaultLightSettings: true,
          },
          priority: 'high' as const,
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
              alert: {
                title: payload.title,
                body: payload.body,
              },
              contentAvailable: true,
              mutableContent: true,
            },
          },
          headers: {
            'apns-priority': '10',
          },
        },
        // Ensure notification is shown even when app is closed
        webpush: {
          notification: {
            title: payload.title,
            body: payload.body,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            requireInteraction: true,
          },
        },
      };

      const response = await admin.messaging().send(message as any);
      console.log('Successfully sent message:', response);

      return { success: true, messageId: response };
    } catch (error: any) {
      console.error('Error sending notification:', error);
      
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
   * Update user's FCM token
   */
  async updateUserFCMToken(userId: string, fcmToken: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Update user's FCM token
      await User.findByIdAndUpdate(userId, { 
        fcmToken,
        updatedAt: new Date(),
      });

      console.log(`FCM token updated for user ${userId}`);
      return { success: true };
    } catch (error) {
      console.error('Error updating FCM token:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
