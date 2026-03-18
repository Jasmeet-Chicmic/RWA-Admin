"use server";

import { API_END_POINTS } from "@/shared/api";
import { getRequest, postRequest } from "@/shared/fetcher";
import { ResponseType } from "@/shared/types";
import { GetPendingKycParams, PendingKycListResponse } from "./adminKyc.types";

export async function getAdminPendingKycAction(params: GetPendingKycParams) {
  return await getRequest<PendingKycListResponse, GetPendingKycParams>(
    API_END_POINTS.ADMIN_KYC_PENDING,
    params,
  );
}

export async function approveAdminKycAction(kycId: string) {
  return await postRequest<ResponseType, undefined>(
    `/api/admin/kyc/${kycId}/approve`,
    undefined as never,
  );
}

export async function rejectAdminKycAction(kycId: string, reason = "") {
  return await postRequest<ResponseType, { reason: string }>(
    `/api/admin/kyc/${kycId}/reject`,
    { reason },
  );
}
