import axios, { AxiosError, AxiosInstance } from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "lib/tokenStore";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

let refreshing: Promise<string | null> | null = null;

export const http: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: false,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Authorization header
http.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 + refresh token rotation
http.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<any>) => {
    const original = error.config!;
    const status = error.response?.status;

    // If unauthorized and we have refresh token, try once
    if (status === 401 && !original._retry) {
      original._retry = true;

      if (!refreshing) {
        refreshing = (async () => {
          const rt = getRefreshToken();
          if (!rt) return null;
          try {
            const { data } = await axios.post(
              `${http.defaults.baseURL}/auth/refresh`,
              { refreshToken: rt },
            );
            // expecting { accessToken, refreshToken? }
            setTokens(data.accessToken, data.refreshToken ?? rt);
            return data.accessToken as string;
          } catch {
            clearTokens();
            return null;
          } finally {
            refreshing = null;
          }
        })();
      }

      const newAccess = await refreshing;
      if (newAccess) {
        // retry original call with new token
        (original.headers as any) = {
          ...(original.headers || {}),
          Authorization: `Bearer ${newAccess}`,
        };
        return http(original);
      }
    }

    // Bubble up
    throw error;
  },
);
