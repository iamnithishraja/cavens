import { getMessaging, getToken, requestPermission, hasPermission, AuthorizationStatus } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import { store } from './index';
import apiClient from '@/app/api/client';

export class FCMService {
  private static instance: FCMService;
  private fcmToken: string | null = null;

  static getInstance(): FCMService {
    if (!FCMService.instance) {
      FCMService.instance = new FCMService();
    }
    return FCMService.instance;
  }

  /**
   * Get the current FCM token
   */
  async getToken(): Promise<string | null> {
    try {
      const app = getApp();
      const messaging = getMessaging(app);
      const token = await getToken(messaging);
      this.fcmToken = token;
      return token;
    } catch (error) {
      console.error('FCM: Error getting token:', error);
      return null;
    }
  }

  /**
   * Save FCM token to local storage
   */
  async saveTokenToStorage(token: string): Promise<void> {
    try {
      await store.set('fcmToken', token);
      this.fcmToken = token;
    } catch (error) {
      console.error('FCM: Error saving token to storage:', error);
    }
  }

  /**
   * Get FCM token from local storage
   */
  async getTokenFromStorage(): Promise<string | null> {
    try {
      // Try both keys for compatibility
      let token = await store.get('fcmToken');
      if (!token) {
        token = await store.get('fcm_token');
      }
      if (!token) {
        token = await store.get('fcmToken');
      }
      if (!token) {
        token = await store.get('fcm_token');
      }
      return token;
    } catch (error) {
      console.error('FCM: Error getting token from storage:', error);
      return null;
    }
  }

  /**
   * Send FCM token to backend server
   */
  async sendTokenToServer(token: string, userId?: string): Promise<boolean> {
    try {
      
      const response = await apiClient.post('/api/notifications/fcm-token', {
        fcmToken: token,
      });

      if (response.data.success) {
        return true;
      } else {
        console.error('🔔 Token registration failed:', response.data.message);
        return false;
      }
    } catch (error) {
      console.error('🔔 Error registering token:', error);
      return false;
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermission(): Promise<boolean> {
    try {
      const app = getApp();
      const messaging = getMessaging(app);
      const authStatus = await requestPermission(messaging);
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      return enabled;
    } catch (error) {
      console.error('FCM: Error requesting permission:', error);
      return false;
    }
  }

  /**
   * Check if notifications are enabled
   */
  async isNotificationEnabled(): Promise<boolean> {
    try {
      const app = getApp();
      const messaging = getMessaging(app);
      const authStatus = await hasPermission(messaging);
      return authStatus === AuthorizationStatus.AUTHORIZED;
    } catch (error) {
      console.error('FCM: Error checking permission:', error);
      return false;
    }
  }

  /**
   * Initialize FCM service
   */
  async initialize(): Promise<void> {
    try {
      // Request permission
      const hasPermission = await this.requestPermission();
      
      if (hasPermission) {
        // Get and save token
        const token = await this.getToken();
        if (token) {
          await this.saveTokenToStorage(token);
          
          // Send token to backend
          const sentToServer = await this.sendTokenToServer(token);
          if (!sentToServer) {
            console.warn('🔔 Failed to register FCM token');
          }
        } else {
          console.warn('🔔 Failed to get FCM token');
        }
      } else {
        console.log('🔔 Notification permission denied');
      }
    } catch (error) {
      console.error('🔔 Error initializing FCM:', error);
    }
  }

  /**
   * Refresh FCM token and send to backend
   */
  async refreshToken(): Promise<boolean> {
    try {
      
      const token = await this.getToken();
      if (token) {
        await this.saveTokenToStorage(token);
        const sentToServer = await this.sendTokenToServer(token);
        
        if (sentToServer) {
          return true;
        } else {
          console.warn('FCM: Failed to send refreshed token to backend');
          return false;
        }
      } else {
        console.warn('FCM: Failed to get refreshed token');
        return false;
      }
    } catch (error) {
      console.error('FCM: Error refreshing token:', error);
      return false;
    }
  }


}

// Export singleton instance
export const fcmService = FCMService.getInstance();
