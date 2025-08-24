import { store } from "@/utils/index";
import axios from "axios";

export const baseUrl = process.env.EXPO_PUBLIC_TEST_BE_URL || "http://10.0.2.2:3000"; 
console.log('🌐 API Client baseUrl:', baseUrl);

const apiClient = axios.create({
    baseURL: baseUrl,
});

apiClient.interceptors.request.use(async (config) => {
    const authToken = await store.get("token");
    console.log('🔑 API Request - URL:', config.url, 'Token:', authToken ? 'Present' : 'Missing');
    if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
    }
    
    // Add ngrok bypass header to skip the warning page
    // This is needed when using ngrok's free tier
    config.headers['ngrok-skip-browser-warning'] = 'true';
    
    return config;
});

apiClient.interceptors.response.use(
    (response) => {
        console.log('✅ API Response - Status:', response.status, 'URL:', response.config.url);
        return response;
    },
    (error) => {
        console.log('❌ API Error - Status:', error.response?.status, 'URL:', error.config?.url, 'Message:', error.response?.data?.message);
        return Promise.reject(error);
    }
);

export default apiClient;