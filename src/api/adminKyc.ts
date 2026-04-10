"use server";

import { API_END_POINTS } from "@/shared/api";
import { getRequest, postRequest } from "@/shared/fetcher";
import { ResponseType } from "@/shared/types";
import {
  GetIdentityClaimRequestsParams,
  GetAdminWhitelistRequestsParams,
  AdminWhitelistRequestsEnvelope,
  AdminWhitelistRequestsResponse,
  GetPendingKycParams,
  IdentityClaimRequestListEnvelope,
  IdentityClaimRequestListResponse,
  PendingKycListResponse,
} from "./adminKyc.types";

function unwrapIdentityClaimRequestList(
  raw: unknown,
  params: GetIdentityClaimRequestsParams,
): IdentityClaimRequestListResponse {
  if (
    raw &&
    typeof raw === "object" &&
    "data" in raw &&
    (raw as IdentityClaimRequestListEnvelope).data &&
    typeof (raw as IdentityClaimRequestListEnvelope).data === "object" &&
    Array.isArray((raw as IdentityClaimRequestListEnvelope).data.items)
  ) {
    return (raw as IdentityClaimRequestListEnvelope).data;
  }
  if (
    raw &&
    typeof raw === "object" &&
    "items" in raw &&
    Array.isArray((raw as IdentityClaimRequestListResponse).items)
  ) {
    return raw as IdentityClaimRequestListResponse;
  }
  return {
    page: params.page,
    pageSize: params.pageSize,
    totalCount: 0,
    hasMore: false,
    items: [],
  };
}

function unwrapWhitelistRequests(
  raw: unknown,
  params: GetAdminWhitelistRequestsParams,
): AdminWhitelistRequestsResponse {
  if (
    raw &&
    typeof raw === "object" &&
    "data" in raw &&
    (raw as AdminWhitelistRequestsEnvelope).data &&
    typeof (raw as AdminWhitelistRequestsEnvelope).data === "object" &&
    Array.isArray((raw as AdminWhitelistRequestsEnvelope).data.items)
  ) {
    return (raw as AdminWhitelistRequestsEnvelope).data;
  }
  if (
    raw &&
    typeof raw === "object" &&
    "items" in raw &&
    Array.isArray((raw as AdminWhitelistRequestsResponse).items)
  ) {
    return raw as AdminWhitelistRequestsResponse;
  }
  return {
    skip: params.skip,
    limit: params.limit,
    totalCount: 0,
    items: [],
  };
}

export async function getAdminPendingKycAction(params: GetPendingKycParams) {
  return await getRequest<PendingKycListResponse, GetPendingKycParams>(
    API_END_POINTS.ADMIN_KYC_PENDING,
    params,
  );
}

export async function getAdminIdentityClaimRequestsAction(
  params: GetIdentityClaimRequestsParams,
): Promise<IdentityClaimRequestListResponse> {
  const raw = await getRequest<
    IdentityClaimRequestListEnvelope | IdentityClaimRequestListResponse,
    GetIdentityClaimRequestsParams
  >(API_END_POINTS.ADMIN_IDENTITY_CLAIM_REQUESTS, params);
  return unwrapIdentityClaimRequestList(raw, params);
}

export async function getAdminWhitelistRequestsAction(
  params: GetAdminWhitelistRequestsParams,
): Promise<AdminWhitelistRequestsResponse> {
  const raw = await getRequest<
    AdminWhitelistRequestsEnvelope | AdminWhitelistRequestsResponse,
    GetAdminWhitelistRequestsParams
  >(API_END_POINTS.ADMIN_IDENTITY_WHITELIST_REQUESTS, params);
  return unwrapWhitelistRequests(raw, params);
}

export async function approveAdminKycAction(kycId: string) {
  return await postRequest<ResponseType, undefined>(
    `/api/admin/kyc/${kycId}/approve`,
    undefined as never,
  );
}

export async function approveIdentityClaimRequestAction(
  identityRequestId: string,
  signature: `0x${string}`,
) {
  return await postRequest<ResponseType, { signature: `0x${string}` }>(
    `${API_END_POINTS.ADMIN_IDENTITY_CLAIM_REQUESTS}/${identityRequestId}/approve`,
    { signature },
  );
}

export async function rejectAdminKycAction(kycId: string, reason = "") {
  return await postRequest<ResponseType, { reason: string }>(
    `/api/admin/kyc/${kycId}/reject`,
    { reason },
  );
}

export async function rejectIdentityClaimRequestAction(
  identityRequestId: string,
  reason = "",
) {
  return await postRequest<ResponseType, { reason: string }>(
    `${API_END_POINTS.ADMIN_IDENTITY_CLAIM_REQUESTS}/${identityRequestId}/reject`,
    { reason },
  );
}

export async function rejectWhitelistRequestAction(payload: {
  whitelistRequestId: string;
  reason: string;
}) {
  return await postRequest<
    ResponseType,
    {
      whitelistRequestId: string;
      reason: string;
    }
  >(`${API_END_POINTS.ADMIN_IDENTITY_WHITELIST_REQUESTS}/reject`, payload);
}
