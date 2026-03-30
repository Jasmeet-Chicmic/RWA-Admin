import { postRequest } from "@/services/fetcher";
import { INTERNAL_API_PATHS } from "@/shared/api";
import { LOGIN_ROLE } from "@/shared/constants";

export type LoginNonceResponse = {
  status?: boolean;
  statusCode?: number;
  message?: string;
  data?: {
    nonce?: string;
    token?: string;
  };
};

export type WalletVerifyResponse = {
  status?: boolean;
  statusCode?: number;
  message?: string;
  data?: {
    token?: string;
  };
};

const LOGIN_PATH: Record<LOGIN_ROLE, string> = {
  [LOGIN_ROLE.ADMIN]: INTERNAL_API_PATHS.ADMIN_AUTH_LOGIN,
  [LOGIN_ROLE.ORGANISATION]: INTERNAL_API_PATHS.ORG_AUTH_LOGIN,
};

const WALLET_VERIFY_PATH: Record<LOGIN_ROLE, string> = {
  [LOGIN_ROLE.ADMIN]: INTERNAL_API_PATHS.ADMIN_WALLET_VERIFY,
  [LOGIN_ROLE.ORGANISATION]: INTERNAL_API_PATHS.ORG_WALLET_VERIFY,
};

export const authService = {
  async requestLoginNonce(
    role: LOGIN_ROLE,
    body: { email: string; password: string },
  ): Promise<LoginNonceResponse> {
    return postRequest<LoginNonceResponse, { email: string; password: string }>(
      LOGIN_PATH[role],
      body,
    );
  },

  async verifyWalletSignature(
    role: LOGIN_ROLE,
    body: { message: string; signature: string },
    tempToken: string,
  ): Promise<WalletVerifyResponse> {
    return postRequest<
      WalletVerifyResponse,
      { message: string; signature: string }
    >(WALLET_VERIFY_PATH[role], body, {
      headers: {
        Authorization: `Bearer ${tempToken}`,
      },
    });
  },
};
