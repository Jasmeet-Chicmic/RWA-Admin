import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

import { getAuthToken } from "@/lib/authToken";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "69420",
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const headers = config.headers;
    const explicitAuth =
      (headers &&
        (headers.Authorization ??
          (headers as { authorization?: string }).authorization)) ||
      (typeof headers?.get === "function" && headers.get("Authorization"));
    if (!explicitAuth) {
      const token = getAuthToken();
      if (token) {
        const headers = AxiosHeaders.from(config.headers ?? {});
        headers.set("Authorization", `Bearer ${token}`);
        config.headers = headers;
      }
    }

    if (process.env.NODE_ENV === "development") {
      const method = (config.method ?? "GET").toUpperCase();
      console.group(`[API] ${method} ${config.url}`);
      console.log("Headers:", config.headers);
      console.log("Params/Payload:", config.data ?? config.params);
      console.groupEnd();
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    if (process.env.NODE_ENV === "development") {
      const method = (response.config.method ?? "GET").toUpperCase();
      console.group(
        `[API] ✓ ${method} ${response.config.url} — ${response.status}`,
      );
      console.log("Data:", response.data);
      console.groupEnd();
    }
    return response;
  },
  (error: AxiosError) => {
    if (process.env.NODE_ENV === "development") {
      const method = (error.config?.method ?? "GET").toUpperCase();
      const statusLabel = error.response?.status ?? "NETWORK_ERROR";
      const errorBody = error.response?.data ?? error.message;
      console.error(
        `[API] ✗ ${method} ${error.config?.url} — ${statusLabel}`,
        errorBody,
      );
    }

    return Promise.reject(error);
  },
);
