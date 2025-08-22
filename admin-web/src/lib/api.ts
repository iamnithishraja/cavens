import axios, { type AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from "axios";

const baseURL = (import.meta as unknown as { env?: Record<string, string> })?.env?.VITE_ADMIN_API_BASE_URL || "http://localhost:80";

export const api = axios.create({ baseURL });

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("admin_token");
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export function setAdminToken(token?: string) {
  if (token) localStorage.setItem("admin_token", token);
}

export function clearAdminToken() {
  localStorage.removeItem("admin_token");
}


