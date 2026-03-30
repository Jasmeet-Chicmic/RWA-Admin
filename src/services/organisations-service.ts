import { API_END_POINTS } from "@/shared/api";
import { ResponseType } from "@/shared/types";
import { deleteRequest, getRequest } from "./fetcher";

export type OrganisationEntityType = "LLC" | "SPV" | "Trust";

export type AdminOrganisation = {
  id: string;
  name: string;
  email?: string;
  walletAddress: string;
  entityType: OrganisationEntityType;
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

type AdminOrganisationsApiResponse = ResponseType & {
  data?: AdminOrganisationsResponse;
};

export type OrganisationProfile = {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
  entityType: string;
  registrationNumber: string;
  jurisdiction: string;
  incorporationDate: string;
};

type OrganisationProfileResponse = ResponseType & {
  data?: OrganisationProfile;
};

export const organisationsService = {
  async getAdminOrganisations(params: {
    page: number;
    pageSize: number;
  }): Promise<AdminOrganisationsResponse> {
    const payload = await getRequest<AdminOrganisationsApiResponse>(
      API_END_POINTS.ADMIN_ORGANISATIONS,
      params,
    );
    return (
      payload.data ?? {
        page: params.page,
        pageSize: params.pageSize,
        totalCount: 0,
        hasMore: false,
        items: [],
      }
    );
  },

  async getOrganisationProfile(): Promise<OrganisationProfile | null> {
    const payload = await getRequest<OrganisationProfileResponse>(
      API_END_POINTS.ORGANIZATION_PROFILE,
    );
    return payload.data ?? null;
  },

  async deleteOrganisation(organizationIds: string[]): Promise<ResponseType> {
    return await deleteRequest<ResponseType, { organizationIds: string[] }>(
      API_END_POINTS.ADMIN_ORGANISATIONS,
      { organizationIds },
    );
  },
};
