"use server";

import { API_END_POINTS } from "@/shared/api";
import { getRequest, putRequest } from "@/shared/fetcher";
import {
  PaginatedDataType,
  ResponseType,
  SystemFeature,
  UpdateDefaultFeaturePayload,
  UpdateFeatureActiveStatusPayload,
} from "@/shared/types";

export async function getDefaultFeaturesAction(
  skip: number = 0,
  limit: number = 10,
  searchText: string = "",
) {
  return await getRequest<
    ResponseType & { data: PaginatedDataType<SystemFeature> },
    { skip: number; limit: number; searchText: string }
  >(API_END_POINTS.DEFAULT_FEATURES, { skip, limit, searchText });
}

export async function updateDefaultFeaturesAction(
  payload: UpdateDefaultFeaturePayload,
) {
  return await putRequest<ResponseType, UpdateDefaultFeaturePayload>(
    API_END_POINTS.UPDATE_DEFAULT_FEATURES,
    payload,
  );
}

export async function updateFeatureActiveStatusAction(
  payload: UpdateFeatureActiveStatusPayload,
) {
  return await putRequest<ResponseType, UpdateFeatureActiveStatusPayload>(
    API_END_POINTS.UPDATE_FEATURE_ACTIVE_STATUS,
    payload,
  );
}
