"use server";

import { API_END_POINTS } from "@/shared/api";

export interface TokenRequest {
  requestId: string;
  userId: string;
  requestedAmount: number;
  status: number;
  createdAt: string;
}

export async function getAdminTokenRequestsAction() {
  const { getRequest } = await import("@/shared/fetcher");

  return await getRequest<TokenRequest[]>(
    API_END_POINTS.ADMIN_TOKEN_REQUESTS,
  );
}

export interface ReviewTokenRequestPayload {
  requestId: string;
  approve: boolean;
  rejectionReason: string | null;
}

export async function reviewAdminTokenRequestAction(
  payload: ReviewTokenRequestPayload,
) {
  const { postRequest } = await import("@/shared/fetcher");

  return await postRequest<unknown, ReviewTokenRequestPayload>(
    `${API_END_POINTS.ADMIN_TOKEN_REQUESTS}/${payload.requestId}/review`,
    payload,
  );
}

