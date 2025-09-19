import { store } from "@/utils/index";
import axios from "axios";

// Use environment variable or fallback to localhost for development
export const baseUrl = "https://wombat-more-inherently.ngrok-free.app"
console.log("🔗 Backend URL:", baseUrl);

const apiClient = axios.create({
    baseURL: baseUrl,
    timeout: 10000, // 10 second timeout
});

apiClient.interceptors.request.use(async (config) => {
    const authToken = await store.get("token");
    if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
    }
    
    // Add ngrok bypass header only if using ngrok
    if (baseUrl.includes('ngrok')) {
        config.headers['ngrok-skip-browser-warning'] = 'true';
    }
    
    return config;
});

// City update function for geofencing
export const sendCityUpdateToBackend = async (data: {
  city: string;
  latitude?: number;
  longitude?: number;
  timestamp: string;
  eventType: 'enter' | 'exit';
}) => {
  try {
    const lastUpdateKey = `lastCityUpdate_${data.city}_${data.eventType}`;
    const lastUpdateTime = await store.get(lastUpdateKey);
    const now = Date.now();
    
    if (lastUpdateTime && (now - parseInt(lastUpdateTime)) < 30000) {
      return { success: true, message: 'Duplicate update skipped' };
    }
    
    await store.set(lastUpdateKey, now.toString());
    
    let fcmToken: string | null = null;
    try { fcmToken = await store.get('fcmToken'); } catch {}
    
    const response = await apiClient.post('/api/user/city-update', {
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
      timestamp: data.timestamp,
      eventType: data.eventType,
      fcmToken: fcmToken || undefined,
    });
    
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export default apiClient;