"use server";

import { API_END_POINTS } from "@/shared/api";
import { getRequest } from "@/shared/fetcher";

import { PropertiesListResponse, GetPropertiesParams } from "@/app/(secured)/properties/helpers/types";

export async function getAdminPropertiesAction(params: GetPropertiesParams) {
  return await getRequest<PropertiesListResponse, GetPropertiesParams>(
    API_END_POINTS.ADMIN_PROPERTIES,
    params,
  );
}

