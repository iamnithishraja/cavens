import { store } from "@/utils/index";
import axios from "axios";

export const baseUrl = "https://wombat-more-inherently.ngrok-free.app"
console.log("baseUrl", baseUrl);
const apiClient = axios.create({
    baseURL: baseUrl,
});

apiClient.interceptors.request.use(async (config) => {
    const authToken = await store.get("token");
    if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
    }
    
    // Add ngrok bypass header to skip the warning page
    // This is needed when using ngrok's free tier
    config.headers['ngrok-skip-browser-warning'] = 'true';
    
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
    console.log('📱 Sending city update to backend:', data);
    
    const response = await apiClient.post('/api/user/city-update', {
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
      timestamp: data.timestamp,
      eventType: data.eventType,
    });
    
    console.log('✅ City update sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to send city update:', error);
    throw error;
  }
};

export default apiClient;