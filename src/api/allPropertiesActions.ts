"use server";

import { API_END_POINTS } from "@/shared/api";
import { getRequest, postRequest } from "@/shared/fetcher";

import {
  AllPropertiesResponse,
  BaseResponse,
  GetAllPropertiesParams,
  PropertyActionPayload,
} from "@/types/properties";

export async function getAllPropertiesAction(params: GetAllPropertiesParams) {
  return await getRequest<
    BaseResponse<AllPropertiesResponse>,
    GetAllPropertiesParams,
    AllPropertiesResponse
  >(API_END_POINTS.ADMIN_ALL_PROPERTIES, params, {
    transformer: (res) => res.data as AllPropertiesResponse,
  });
}

export async function approvePropertyAction(
  propertyId: string,
  payload: PropertyActionPayload,
) {
  return await postRequest<BaseResponse<null>, PropertyActionPayload>(
    API_END_POINTS.ADMIN_PROPERTY_APPROVE(propertyId),
    payload,
  );
}

export async function rejectPropertyAction(
  propertyId: string,
  payload: PropertyActionPayload,
) {
  return await postRequest<BaseResponse<null>, PropertyActionPayload>(
    API_END_POINTS.ADMIN_PROPERTY_REJECT(propertyId),
    payload,
  );
}

export async function assignPropertyToOrganisationAction(
  propertyId: string,
  organisationId: string,
) {
  return await postRequest<BaseResponse<null>, { organizationId: string }>(
    API_END_POINTS.ADMIN_PROPERTY_ASSIGN_ORGANIZATION(propertyId),
    { organizationId: organisationId },
  );
}
