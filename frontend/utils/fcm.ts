import messaging from '@react-native-firebase/messaging';
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
      const token = await messaging().getToken();
      this.fcmToken = token;
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
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
      console.error('Error saving FCM token:', error);
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
      console.error('Error getting FCM token from storage:', error);
      return null;
    }
  }

  /**
   * Send FCM token to your backend server (implement when needed)
   */
  async sendTokenToServer(token: string, userId?: string): Promise<boolean> {
    // TODO: Implement when you need to send tokens to your backend
    console.log('FCM token ready for backend:', token);
    return true;
  }

  /**
   * Request notification permissions
   */
  async requestPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      return enabled;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Check if notifications are enabled
   */
  async isNotificationEnabled(): Promise<boolean> {
    try {
      const authStatus = await messaging().hasPermission();
      return authStatus === messaging.AuthorizationStatus.AUTHORIZED;
    } catch (error) {
      console.error('Error checking notification permission:', error);
      return false;
    }
  }

  /**
   * Subscribe to a topic (implement when needed)
   */
  async subscribeToTopic(topic: string): Promise<void> {
    // TODO: Implement when you need topic subscriptions
    console.log(`Topic subscription ready: ${topic}`);
  }

  /**
   * Unsubscribe from a topic (implement when needed)
   */
  async unsubscribeFromTopic(topic: string): Promise<void> {
    // TODO: Implement when you need topic subscriptions
    console.log(`Topic unsubscription ready: ${topic}`);
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
          console.log('FCM initialized successfully with token:', token);
        }
      } else {
        console.log('Notification permission denied');
      }
    } catch (error) {
      console.error('Error initializing FCM:', error);
    }
  }
}

// Export singleton instance
export const fcmService = FCMService.getInstance();
