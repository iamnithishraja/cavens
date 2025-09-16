import { getMessaging, getToken, requestPermission, hasPermission, AuthorizationStatus } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import { store } from './index';

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
      await store.set('fcm_token', token);
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
      const token = await store.get('fcm_token');
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
      // TODO: Implement API call to send token to your backend
      console.log('FCM: Token ready for backend integration:', { token: token.substring(0, 20) + '...', userId });
      return true;
    } catch (error) {
      console.error('FCM: Error sending token to server:', error);
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
      console.log('FCM: Initializing service...');
      
      // Request permission
      const hasPermission = await this.requestPermission();
      
      if (hasPermission) {
        console.log('FCM: Permission granted');
        
        // Get and save token
        const token = await this.getToken();
        if (token) {
          await this.saveTokenToStorage(token);
          console.log('FCM: Service initialized successfully');
          console.log('FCM: Token available for backend integration');
        } else {
          console.warn('FCM: Failed to get token after permission granted');
        }
      } else {
        console.log('FCM: Permission denied');
      }
    } catch (error) {
      console.error('FCM: Error initializing service:', error);
    }
  }
}

// Export singleton instance
export const fcmService = FCMService.getInstance();
