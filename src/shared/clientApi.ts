export type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  cache?: RequestCache;
  timeoutMs?: number;
};

const DEFAULT_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
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

export const requestApiJson = async <TResponse>(
  path: string,
  options?: ApiRequestOptions,
): Promise<TResponse> => {
  const controller = new AbortController();
  const timeoutMs = options?.timeoutMs;
  const timeoutId =
    timeoutMs && timeoutMs > 0
      ? setTimeout(() => controller.abort(), timeoutMs)
      : undefined;

  try {
    const response = await fetch(path, {
      method: options?.method ?? "GET",
      headers: { ...DEFAULT_HEADERS, ...(options?.headers ?? {}) },
      body:
        options?.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: options?.cache,
      signal: controller.signal,
    });

    const responseText = await response.text();
    const payload = responseText
      ? (JSON.parse(responseText) as TResponse)
      : null;

    if (!response.ok) {
      throw new Error(
        toErrorMessage(payload, "API request failed", response.status),
      );
    }

    return payload as TResponse;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        `API request timed out${timeoutMs ? ` after ${timeoutMs}ms` : ""}`,
      );
    }

    throw error;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
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
