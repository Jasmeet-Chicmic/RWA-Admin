import { AxiosError } from "axios";

import { axiosInstance } from "@/lib/axiosInstance";

type ApiErrorShape = {
  message?: string;
  statusCode?: number;
};

const DEFAULT_NETWORK_ERROR_MESSAGE =
  "Network error. Please check your connection and try again.";

const showNetworkErrorToast = async (message: string) => {
  if (typeof window === "undefined") return;
  const { toast } = await import("react-toastify");
  toast.error(message || DEFAULT_NETWORK_ERROR_MESSAGE);
};

function toError(error: unknown): Error {
  if (error instanceof AxiosError) {
    const responseData = error.response?.data as ApiErrorShape | undefined;
    const isNetworkError = !error.response;
    const message =
      responseData?.message ||
      (isNetworkError ? DEFAULT_NETWORK_ERROR_MESSAGE : error.message) ||
      "Request failed";
    if (isNetworkError) {
      void showNetworkErrorToast(message);
    }
    return new Error(message);
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error("Unexpected request error");
}

export async function getRequest<TResponse, TParams extends object = object>(
  url: string,
  params?: TParams,
): Promise<TResponse> {
  try {
    const { data } = await axiosInstance.get<TResponse>(url, { params });
    return data;
  } catch (error) {
    throw toError(error);
  }
}

export type RequestExtraOptions = {
  headers?: Record<string, string>;
};

export async function postRequest<TResponse, TPayload>(
  url: string,
  payload: TPayload,
  options?: RequestExtraOptions,
): Promise<TResponse> {
  try {
    const { data } = await axiosInstance.post<TResponse>(url, payload, {
      headers: options?.headers,
    });
    return data;
  } catch (error) {
    throw toError(error);
  }
}

export async function putRequest<TResponse, TPayload>(
  url: string,
  payload: TPayload,
): Promise<TResponse> {
  try {
    const { data } = await axiosInstance.put<TResponse>(url, payload);
    return data;
  } catch (error) {
    throw toError(error);
  }
}

export async function deleteRequest<TResponse, TPayload>(
  url: string,
  payload: TPayload,
): Promise<TResponse> {
  try {
    const { data } = await axiosInstance.delete<TResponse>(url, {
      data: payload,
    });
    return data;
  } catch (error) {
    throw toError(error);
  }
}

export async function patchRequest<TResponse, TPayload>(
  url: string,
  payload: TPayload,
): Promise<TResponse> {
  try {
    const { data } = await axiosInstance.patch<TResponse>(url, payload);
    return data;
  } catch (error) {
    throw toError(error);
  }
}
