import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendCityUpdateToBackend } from '@/app/api/client';

const GEOFENCING_TASK = 'city-geofencing-task';

// UAE Cities with coordinates and radius
const UAE_CITIES = [
  { identifier: 'dubai', latitude: 25.2048, longitude: 55.2708, radius: 15000 },
  { identifier: 'abu-dhabi', latitude: 24.4539, longitude: 54.3773, radius: 20000 },
];

// Define geofencing task
TaskManager.defineTask(GEOFENCING_TASK, async ({ data, error }: any) => {
  console.log('🔔 Geofencing task triggered:', { data, error });

  if (error) {
    console.error('Geofencing error:', error);
    return;
  }

  if (!data) return;

  const { eventType, region } = data;

  if (!eventType || !region) return;

  try {
    const currentCity = await AsyncStorage.getItem('currentCity');

    if (eventType === Location.GeofencingEventType.Enter) {
      console.log('🏙️ Entered city:', region.identifier);

      if (currentCity !== region.identifier) {
        await AsyncStorage.setItem('currentCity', region.identifier);
        await AsyncStorage.setItem('lastCityChangeTime', new Date().toISOString());

        try {
          await sendCityUpdateToBackend({
            city: region.identifier,
            latitude: region.latitude,
            longitude: region.longitude,
            timestamp: new Date().toISOString(),
            eventType: 'enter',
          });
          console.log('✅ City enter notification sent');
        } catch (backendError) {
          console.error('❌ Failed to send city enter notification:', backendError);
        }
      }
    } else if (eventType === Location.GeofencingEventType.Exit) {
      console.log('🚪 Exited city:', region.identifier);

      try {
        await sendCityUpdateToBackend({
          city: region.identifier,
          eventType: 'exit',
          timestamp: new Date().toISOString(),
        });
      } catch (backendError) {
        console.error('❌ Failed to send city exit notification:', backendError);
      }
    }
  } catch (err) {
    console.error('❌ Error in geofencing task:', err);
  }
});

class GeofencingService {
  private static instance: GeofencingService;
  private isStarted = false;

  static getInstance(): GeofencingService {
    if (!GeofencingService.instance) {
      GeofencingService.instance = new GeofencingService();
    }
    return GeofencingService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
      if (fgStatus !== 'granted') {
        console.error('Foreground location permission not granted');
        return false;
      }

      const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
      if (bgStatus !== 'granted') {
        console.error('Background location permission not granted');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  async startGeofencing(): Promise<boolean> {
    // Check if already started in this session
    if (this.isStarted) {
      console.log('🔄 Geofencing already started in this session, skipping...');
      return true;
    }

    console.log('🚀 Starting geofencing for UAE cities...');
    
    const permissionsGranted = await this.initialize();
    if (!permissionsGranted) {
      console.error('❌ Location permissions not granted');
      return false;
    }

    try {
      // Always stop any existing geofencing tasks first (in case of app restart)
      await Location.stopGeofencingAsync(GEOFENCING_TASK).catch(() => {
        console.log('🔄 No existing geofencing tasks to stop');
      });

      // Start geofencing with proper configuration
      await Location.startGeofencingAsync(GEOFENCING_TASK, UAE_CITIES.map(city => ({
        identifier: city.identifier,
        latitude: city.latitude,
        longitude: city.longitude,
        radius: city.radius,
        notifyOnEnter: true,
        notifyOnExit: true,
      })));

      this.isStarted = true;
      await AsyncStorage.setItem('geofencingEnabled', 'true');
      await AsyncStorage.setItem('geofencingStartTime', new Date().toISOString());
      console.log('✅ Native geofencing started successfully');
      return true;
    } catch (error) {
      console.error('❌ Error starting geofencing:', error);
      this.isStarted = false;
      await AsyncStorage.setItem('geofencingEnabled', 'false');
      return false;
    }
  }

  async stopGeofencing(): Promise<void> {
    try {
      await Location.stopGeofencingAsync(GEOFENCING_TASK);
      this.isStarted = false;
      await AsyncStorage.setItem('geofencingEnabled', 'false');
      console.log('🛑 Geofencing stopped');
    } catch (error) {
      console.error('Error stopping geofencing:', error);
    }
  }

  async getCurrentCity(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('currentCity');
    } catch (error) {
      console.error('Error getting current city:', error);
      return null;
    }
  }

  async isGeofencingEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem('geofencingEnabled');
      return enabled === 'true';
    } catch {
      return false;
    }
  }

  async checkGeofencingStatus(): Promise<{ isRunning: boolean; isEnabled: boolean; needsRestart: boolean }> {
    try {
      const isEnabled = await this.isGeofencingEnabled();
      const isRunning = this.isStarted;
      
      // If storage says enabled but service says not running, it needs restart
      const needsRestart = isEnabled && !isRunning;
      
      console.log(`🔍 Geofencing status - Running: ${isRunning}, Enabled: ${isEnabled}, NeedsRestart: ${needsRestart}`);
      
      return { isRunning, isEnabled, needsRestart };
    } catch (error) {
      console.error('Error checking geofencing status:', error);
      return { isRunning: false, isEnabled: false, needsRestart: false };
    }
  }

  async resetGeofencingState(): Promise<void> {
    try {
      console.log('🔄 Resetting geofencing state...');
      await this.stopGeofencing();
      await AsyncStorage.removeItem('geofencingEnabled');
      await AsyncStorage.removeItem('geofencingStartTime');
      await AsyncStorage.removeItem('currentCity');
      await AsyncStorage.removeItem('lastCityChangeTime');
      console.log('✅ Geofencing state reset successfully');
    } catch (error) {
      console.error('Error resetting geofencing state:', error);
    }
  }
}

export const geofencingService = GeofencingService.getInstance();
export default geofencingService;
