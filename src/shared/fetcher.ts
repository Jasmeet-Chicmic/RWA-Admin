/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { cookies } from "next/headers";

import { decrypt } from "./session";
import { toQueryParams } from "./utils";
import { redirect } from "next/navigation";
import { ROUTES } from "./routes";
import { API_END_POINTS } from "./api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
console.log("BASE_URL", BASE_URL);
/**
 * Creates an Axios instance with interceptors and auth headers.
 */
const createAxiosInstance = async (): Promise<AxiosInstance> => {
  const cookieStore = await cookies();
  const token = await decrypt(cookieStore.get("session")?.value);
  const locale = cookieStore.get("locale")?.value || "en";

  const instance = axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": locale,
    },
  });

  // Inject Authorization Header
  instance.interceptors.request.use(
    (config) => {
      if (token?.token) {
        // Mutate headers object directly
        config.headers = config.headers || {};
        config.headers["Authorization"] = ("Bearer " + token.token) as string;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  // Global Error Handling
  instance.interceptors.response.use(
    (res) => res,
    (error: AxiosError) => {
      // if (error.response?.status === 401) {
      //   cookies().then((c) => c.delete("session"));
      //   redirect(`${ROUTES.LOGIN}?unauthorized=true`);
      // }
      return Promise.reject(error);
    },
  );

  return instance;
};

/**
 * Common request executor
 */
type FetcherOptions<R, T = R> = {
  transformer?: (data: R) => T;
  headers?: Record<string, string>;
  // Add more options here as needed
};

const request = async <R, T = R>(
  config: AxiosRequestConfig,
  options?: FetcherOptions<R, T>,
): Promise<T> => {
  try {
    // Merge headers from config and options
    const mergedHeaders = { ...config.headers, ...(options?.headers || {}) };
    const axiosInstance = await createAxiosInstance();
    const res = await axiosInstance.request<R>({
      ...config,
      headers: mergedHeaders,
    });
    console.log(`${config.method}, ${config.url}: `, res.data);
    return options?.transformer
      ? options.transformer(res.data)
      : (res.data as unknown as T);
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    if (
      (error?.response?.status === 401 || error?.status === 401) &&
      config.url !== API_END_POINTS.LOGIN
    ) {
      const cookieStore = await cookies();
      cookieStore.delete("session");
      redirect(`${ROUTES.LOGIN}?unauthorized=true`);
    }
    console.log("Error::", error, "Config::", config);
    // If backend returned a structured response body, prefer that over the raw AxiosError
    if (axios.isAxiosError(error) && error.response?.data) {
      return error.response.data as T;
    }

    // Return a plain object to ensure serialization for Server Actions
    return {
      status: false,
      message: error.message || "An unexpected error occurred",
      statusCode: error.response?.status || error.status || 500,
    } as unknown as T;
  }
};

// =====================
// HTTP METHODS
// =====================

export const getRequest = async <R, Q = undefined, T = R>(
  url: string,
  params?: Q,
  options?: FetcherOptions<R, T>,
): Promise<T> => {
  const query = params ? toQueryParams<Q>(params) : "";
  console.log(`${url}${query}`, params, "sdfjksadasdas");
  return request<R, T>({ method: "GET", url: `${url}${query}` }, options);
};

export const postRequest = async <R, D, T = R>(
  url: string,
  data: D,
  options?: FetcherOptions<R, T>,
): Promise<T> => {
  console.log("POST Request::", url, data, options);
  return request<R, T>(
    {
      method: "POST",
      url,
      data,
      headers: options?.headers,
    },
    options,
  );
};

export const putRequest = async <R, D, T = R>(
  url: string,
  data: D,
  options?: FetcherOptions<R, T>,
): Promise<T> => {
  return request<R, T>(
    {
      method: "PUT",
      url,
      data,
      headers: options?.headers,
    },
    options,
  );
};

export const patchRequest = async <R, D, T = R>(
  url: string,
  data: D,
  options?: FetcherOptions<R, T>,
): Promise<T> => {
  return request<R, T>(
    {
      method: "PATCH",
      url,
      data,
      headers: options?.headers,
    },
    options,
  );
};

export const deleteRequest = async <R, D = undefined, T = R>(
  url: string,
  data?: D,
  options?: FetcherOptions<R, T>,
): Promise<T> => {
  return request<R, T>(
    {
      method: "DELETE",
      url,
      data,
      headers: options?.headers,
    },
    options,
  );
};
