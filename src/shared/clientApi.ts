import axios, { AxiosError } from "axios";

import { axiosInstance } from "@/lib/axiosInstance";

export type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  cache?: RequestCache;
  timeoutMs?: number;
};

const toErrorMessage = (
  payload: unknown,
  fallbackMessage: string,
  status: number,
) => {
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof (payload as { message?: unknown }).message === "string"
  ) {
    return (payload as { message: string }).message;
  }

  return `${fallbackMessage} (status: ${status})`;
};

/**
 * JSON API helper backed by the shared Axios instance (correct API base URL,
 * auth interceptors). Prefer `src/services/fetcher.ts` for new code.
 */
export const requestApiJson = async <TResponse>(
  path: string,
  options?: ApiRequestOptions,
): Promise<TResponse> => {
  const method = options?.method ?? "GET";
  const timeoutMs = options?.timeoutMs;

  try {
    const response = await axiosInstance.request<TResponse>({
      url: path,
      method,
      data: options?.body,
      headers: options?.headers,
      ...(timeoutMs && timeoutMs > 0 ? { timeout: timeoutMs } : {}),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const ax = error as AxiosError<unknown>;
      const status = ax.response?.status ?? 0;
      const payload = ax.response?.data;
      throw new Error(toErrorMessage(payload, "API request failed", status));
    }

    if (error instanceof Error && error.name === "AbortError") {
      const suffix =
        timeoutMs && timeoutMs > 0 ? ` after ${String(timeoutMs)}ms` : "";
      throw new Error(`API request timed out${suffix}`);
    }

    throw error;
  }
};

export const postApiJson = async <TResponse, TBody>(
  path: string,
  body: TBody,
  options?: Omit<ApiRequestOptions, "method" | "body">,
) =>
  requestApiJson<TResponse>(path, {
    ...options,
    method: "POST",
    body,
  });
