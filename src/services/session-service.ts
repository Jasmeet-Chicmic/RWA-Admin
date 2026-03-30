import { axiosInstance } from "@/lib/axiosInstance";
import { APP_BASE_PATH, LOGIN_ROLE } from "@/shared/constants";

type SessionResponse = {
  role?: LOGIN_ROLE;
};

function getSessionUrl(): string {
  if (globalThis.window === undefined) {
    return `${APP_BASE_PATH}/api/session`;
  }

  return `${globalThis.window.location.origin}${APP_BASE_PATH}/api/session`;
}

export const sessionService = {
  async getSession(): Promise<SessionResponse> {
    const { data } = await axiosInstance.get<SessionResponse>(getSessionUrl());
    return data;
  },
};
