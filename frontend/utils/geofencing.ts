import * as Location from 'expo-location';
import { store } from '@/utils';

const GEOFENCING_TASK = 'city-geofencing-task';

// UAE Cities with coordinates and radius
const UAE_CITIES = [
  { identifier: 'dubai', latitude: 25.2048, longitude: 55.2708, radius: 15000 },
  { identifier: 'abu-dhabi', latitude: 24.4539, longitude: 54.3773, radius: 20000 },
];

// Task definition moved to app/_layout.tsx for startup registration

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

      // Request basic location permissions
      const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
      if (fgStatus !== 'granted') {
        console.error('❌ Foreground location permission not granted');
        return false;
      }

      // Request background permissions
      const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
      if (bgStatus !== 'granted') {
        console.error('❌ Background location permission not granted');
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Error initializing geofencing service:', error);
      return false;
    }
  }

  async initializeWithoutPermissions(): Promise<boolean> {
    // No-op initialization without permissions
    return true;
  }

  async startGeofencing(): Promise<boolean> {
    if (this.isStarted) return true;

    const globalStartKey = '__CAVENS_GEOFENCING_STARTED__';
    if ((global as any)[globalStartKey]) {
      this.isStarted = true;
      return true;
    }

    const permissionsGranted = await this.initialize();
    if (!permissionsGranted) return false;

    try {
      await Location.stopGeofencingAsync(GEOFENCING_TASK).catch(() => {});

      const geofenceRegions = UAE_CITIES.map(city => ({
        identifier: city.identifier,
        latitude: city.latitude,
        longitude: city.longitude,
        radius: city.radius,
        notifyOnEnter: true,
        notifyOnExit: true,
      }));

      await Location.startGeofencingAsync(GEOFENCING_TASK, geofenceRegions);

      this.isStarted = true;
      (global as any)[globalStartKey] = true;
      await store.set('geofencingEnabled', 'true');
      await store.set('geofencingStartTime', new Date().toISOString());
      await store.set('geofencingRegions', JSON.stringify(geofenceRegions));
      
      console.log('✅ Geofencing: Started');
      return true;
    } catch (_error) {
      this.isStarted = false;
      await store.set('geofencingEnabled', 'false');
      return false;
    }
  }

  async stopGeofencing(): Promise<void> {
    try {
      await Location.stopGeofencingAsync(GEOFENCING_TASK);
      this.isStarted = false;
      await store.set('geofencingEnabled', 'false');
      console.log('🛑 Geofencing stopped');
    } catch (error) {
      console.error('Error stopping geofencing:', error);
    }
  }

  async getCurrentCity(): Promise<string | null> {
    try {
      return await store.get('currentCity');
    } catch (error) {
      console.error('Error getting current city:', error);
      return null;
    }
  }

  async isGeofencingEnabled(): Promise<boolean> {
    try {
      const enabled = await store.get('geofencingEnabled');
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
      await store.delete('geofencingEnabled');
      await store.delete('geofencingStartTime');
      await store.delete('geofencingRegions');
      await store.delete('currentCity');
      await store.delete('lastCityChangeTime');
      console.log('✅ Geofencing state reset successfully');
    } catch (error) {
      console.error('Error resetting geofencing state:', error);
    }
  }

  /**
   * Get comprehensive geofencing status
   */
  async getGeofencingStatus(): Promise<{
    isRunning: boolean;
    isEnabled: boolean;
    needsRestart: boolean;
    permissions: any;
    regions: any[];
    lastStartTime?: string;
    currentCity?: string;
  }> {
    try {
      const isEnabled = await this.isGeofencingEnabled();
      const isRunning = this.isStarted;
      const needsRestart = isEnabled && !isRunning;
      
      const regions = await this.getGeofenceRegions();
      const lastStartTime = await store.get('geofencingStartTime') || undefined;
      const currentCity = await this.getCurrentCity() || undefined;
      
      return {
        isRunning,
        isEnabled,
        needsRestart,
        permissions: { foreground: false, background: false },
        regions,
        lastStartTime,
        currentCity,
      };
    } catch (error) {
      console.error('Error getting geofencing status:', error);
      return {
        isRunning: false,
        isEnabled: false,
        needsRestart: false,
        permissions: { foreground: false, background: false },
        regions: [],
      };
    }
  }

  /**
   * Get configured geofence regions
   */
  async getGeofenceRegions(): Promise<any[]> {
    try {
      const stored = await store.get('geofencingRegions');
      return stored ? JSON.parse(stored) : UAE_CITIES;
    } catch (error) {
      console.error('Error getting geofence regions:', error);
      return UAE_CITIES;
    }
  }

  /**
   * Process pending city updates (when app becomes active)
   */
  async processPendingCityUpdates(): Promise<void> { /* disabled - no storage */ }

}

export const geofencingService = GeofencingService.getInstance();
export default geofencingService;
