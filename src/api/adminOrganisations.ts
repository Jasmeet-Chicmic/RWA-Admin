"use server";

import { API_END_POINTS } from "@/shared/api";
import { getRequest, postRequest } from "@/shared/fetcher";
import { ResponseType } from "@/shared/types";
import { PropertiesListResponse } from "@/app/(secured)/properties/helpers/types";

export type AdminOrganisation = {
  id: string;
  name: string;
  entityType: "LLC" | "SPV" | "Trust";
  registrationNumber: string;
  jurisdiction: string;
  incorporationDate: string;
  propertyHolds: number;
};

export type AdminOrganisationsResponse = {
  page: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;
  items: AdminOrganisation[];
};

export type GetAdminOrganisationsParams = {
  page: number;
  pageSize: number;
};

export async function getAdminOrganisationsAction(
  params: GetAdminOrganisationsParams,
) {
  return await getRequest<
    AdminOrganisationsResponse,
    GetAdminOrganisationsParams
  >(API_END_POINTS.ADMIN_ORGANISATIONS, params);
}

export type OrganisationPropertiesResponse = PropertiesListResponse;

export type GetOrganisationPropertiesParams = {
  organisationId: string;
  page: number;
  pageSize: number;
};

export async function getOrganisationPropertiesAction(
  params: GetOrganisationPropertiesParams,
) {
  const { organisationId, page, pageSize } = params;
  return await getRequest<
    OrganisationPropertiesResponse,
    { page: number; pageSize: number }
  >(`${API_END_POINTS.ADMIN_ORGANISATIONS}/${organisationId}/properties`, {
    page,
    pageSize,
  });
}

export type ActivateOrganisationPropertyPayload = {
  totalPropertyValue: number;
  totalUnits: number;
  rentalIncome: number;
  annualYieldPercent: number;
  riskScore: number;
};

export async function activateOrganisationPropertyAction(params: {
  organisationId: string;
  propertyId: string;
  payload: ActivateOrganisationPropertyPayload;
}) {
  const { organisationId, propertyId, payload } = params;
  return await postRequest<
    ResponseType,
    ActivateOrganisationPropertyPayload,
    ResponseType
  >(
    `${API_END_POINTS.ADMIN_ORGANISATIONS}/${organisationId}/properties/${propertyId}/activate`,
    payload,
  );
}
