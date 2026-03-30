const AUTH_TOKEN_KEY = "token";

/**
 * Returns the client auth token used for API requests.
 * This reads from localStorage because login flow stores token there.
 */
export function getAuthToken(): string | null {
  if (globalThis.window === undefined) {
    return null;
  }

  return globalThis.window.localStorage.getItem(AUTH_TOKEN_KEY);
}
