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

export default apiClient;