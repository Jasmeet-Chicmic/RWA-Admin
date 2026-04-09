import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

import { getAuthToken } from "@/lib/authToken";
import { APP_BASE_PATH } from "@/shared/constants";
import { PUBLIC_ROUTES } from "@/shared/routes";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";

let handlingUnauthorized = false;

const isUnauthorizedError = (error: AxiosError) =>
  error.response?.status === 401;

const redirectToLogin = () => {
  if (typeof window === "undefined") return;
  const target = `${APP_BASE_PATH}${PUBLIC_ROUTES.LOGIN}`;
  if (window.location.pathname !== target) {
    window.location.assign(target);
  }
};

const handleUnauthorizedSession = async () => {
  if (typeof window === "undefined") return;
  if (handlingUnauthorized) return;
  handlingUnauthorized = true;
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    localStorage.removeItem("role");

    const [{ deleteSessionClient }, { store }, { clearAuthProfile }, reown] =
      await Promise.all([
        import("@/shared/utils"),
        import("@/store/store"),
        import("@/store/authProfileSlice"),
        import("@/lib/reown"),
      ]);

    await deleteSessionClient();
    store.dispatch(clearAuthProfile());

    if (reown.wagmiAdapter?.wagmiConfig) {
      const wagmiCore = await import("@wagmi/core/actions");
      await wagmiCore.disconnect(reown.wagmiAdapter.wagmiConfig);
    }
  } catch (logoutError) {
    console.error("[Auth] Failed to handle 401 logout:", logoutError);
  } finally {
    redirectToLogin();
    handlingUnauthorized = false;
  }
};

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

    if (isUnauthorizedError(error) && getAuthToken()) {
      void handleUnauthorizedSession();
    }

    return Promise.reject(error);
  },
);
