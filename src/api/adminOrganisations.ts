"use server";

import { API_END_POINTS } from "@/shared/api";
import {
  deleteRequest,
  getRequest,
  postRequest,
  putRequest,
} from "@/shared/fetcher";
import { ResponseType } from "@/shared/types";
import {
  AllPropertiesResponse,
  GetAllPropertiesParams,
  BaseResponse,
} from "@/app/(secured)/properties/helpers/allPropertiesTypes";

export type AdminOrganisation = {
  id: string;
  name: string;
  email?: string;
  walletAddress: string;
  entityType: "LLC" | "SPV" | "Trust";
  registrationNumber: string;
  jurisdiction: string;
  incorporationDate: string;
  status: number;
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
    ResponseType & { data: AdminOrganisationsResponse },
    GetAdminOrganisationsParams
  >(API_END_POINTS.ADMIN_ORGANISATIONS, params);
}

export type OrganisationPropertiesResponse = AllPropertiesResponse;

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
    BaseResponse<AllPropertiesResponse>,
    GetAllPropertiesParams,
    AllPropertiesResponse
  >(
    API_END_POINTS.ADMIN_ALL_PROPERTIES,
    {
      page,
      pageSize,
      organizationId: organisationId,
    },
    {
      transformer: (res) => res.data as AllPropertiesResponse,
    },
  );
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
  console.log(
    "Activate Organisation Property Request::",
    organisationId,
    propertyId,
    payload,
  );
  return await postRequest<
    ResponseType,
    ActivateOrganisationPropertyPayload,
    ResponseType
  >(
    `${API_END_POINTS.ADMIN_ORGANISATIONS}/${organisationId}/properties/${propertyId}/activate`,
    payload,
  );
}

export type CreateOrganisationPayload = {
  name: string;
  email: string;
  password: string;
  walletAddress: string;
  entityType: number;
  registrationNumber: string;
  jurisdiction: string;
  incorporationDate: string;
};

export async function createOrganisationAction(
  payload: CreateOrganisationPayload,
) {
  return await postRequest<
    ResponseType,
    CreateOrganisationPayload,
    ResponseType
  >(API_END_POINTS.ADMIN_ORGANISATIONS, payload);
}

export type UpdateOrganisationPayload = Omit<
  CreateOrganisationPayload,
  "password"
> & {
  organizationId: string;
  password?: string;
};

export async function updateOrganisationAction(
  payload: UpdateOrganisationPayload,
) {
  return await putRequest<
    ResponseType,
    UpdateOrganisationPayload,
    ResponseType
  >(API_END_POINTS.ADMIN_ORGANISATIONS, payload);
}

export type DeleteOrganisationPayload = {
  organizationIds: string[];
};

export async function deleteOrganisationAction(
  payload: DeleteOrganisationPayload,
) {
  return await deleteRequest<
    ResponseType,
    DeleteOrganisationPayload,
    ResponseType
  >(API_END_POINTS.ADMIN_ORGANISATIONS, payload);
}

export async function getSpecificOrganisationAction(organizationId: string) {
  return await getRequest<
    ResponseType & { data: AdminOrganisation },
    { organizationId: string }
  >(API_END_POINTS.FETCH_ORGANISATION_SPECIFIC, { organizationId });
}
