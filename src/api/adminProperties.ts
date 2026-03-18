"use server";

import { API_END_POINTS } from "@/shared/api";
import { getRequest } from "@/shared/fetcher";

import {
  PropertiesListResponse,
  GetPropertiesParams,
} from "@/app/(secured)/properties/helpers/types";
import { AdminPropertiesDetails } from "./adminProperties.types";

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
  return await getRequest<AdminPropertiesDetails, undefined>(
    API_END_POINTS.ADMIN_PROPERTIES_DETAILS,
  );
}