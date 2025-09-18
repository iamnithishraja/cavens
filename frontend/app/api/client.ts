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
    console.log('📱 Sending city update to backend:', {
      city: data.city,
      eventType: data.eventType,
      backendUrl: baseUrl
    });
    
    // Include JWT token as fallback when Authorization header is missing (background scenario)
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
    
    console.log('✅ City update sent successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to send city update:', {
      error: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      backendUrl: baseUrl
    });
    throw error;
  }
};

export default apiClient;