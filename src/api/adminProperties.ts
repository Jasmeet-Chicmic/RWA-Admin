"use server";

import { API_END_POINTS } from "@/shared/api";
import { getRequest } from "@/shared/fetcher";

import {
  AllPropertiesResponse,
  BaseResponse,
} from "@/app/(secured)/properties/helpers/allPropertiesTypes";
import {
  GetPropertiesParams,
  PropertiesListResponse,
} from "@/app/(secured)/properties/helpers/types";
import { AdminPropertiesDetails } from "./adminProperties.types";

const EMPTY_LIST: AllPropertiesResponse = {
  page: 1,
  pageSize: 10,
  totalCount: 0,
  hasMore: false,
  items: [],
};

function normalizeAllPropertiesPayload(
  payload: BaseResponse<AllPropertiesResponse> | AllPropertiesResponse,
): AllPropertiesResponse {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "status" in payload &&
    "message" in payload
  ) {
    const apiPayload = payload as BaseResponse<AllPropertiesResponse>;
    return apiPayload.data ?? EMPTY_LIST;
  }
  return payload as AllPropertiesResponse;
}

export async function getAdminPropertiesAction(params: GetPropertiesParams) {
  return await getRequest<PropertiesListResponse, GetPropertiesParams>(
    API_END_POINTS.ADMIN_PROPERTIES,
    params,
  );
}

export async function getAdminPendingPropertiesAction(
  params: GetPropertiesParams,
) {
  return await getRequest<PropertiesListResponse, GetPropertiesParams>(
    API_END_POINTS.ADMIN_PROPERTIES_PENDING,
    params,
  );
}

export async function getAdminPropertiesDetailsAction() {
  const raw = await getRequest<
    BaseResponse<AllPropertiesResponse> | AllPropertiesResponse,
    { page: number; pageSize: number; status: number }
  >(API_END_POINTS.ADMIN_ALL_PROPERTIES, {
    page: 1,
    pageSize: 1,
    status: 1,
  });
  const list = normalizeAllPropertiesPayload(raw);
  const summary: AdminPropertiesDetails = {
    totalAssetValue: 0,
    totalInvestors: 0,
    tokensIssued: 0,
    pendingKyc: 0,
    platformRevenue: 0,
    pendingPropertyApprovals: list.totalCount,
  };
  return summary;
}
