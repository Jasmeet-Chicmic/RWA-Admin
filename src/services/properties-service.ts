import type { AdminPropertiesDetails } from "@/api/adminProperties.types";
import { PROPERTY_STATUS } from "@/constants/properties";
import { getRequest } from "@/services/fetcher";
import { API_END_POINTS } from "@/shared/api";
import {
  AllPropertiesResponse,
  BaseResponse,
  GetAllPropertiesParams,
  InvestorUsersResponse,
  PropertyDetailsItem,
  WhitelistedUsersResponse,
} from "@/types/properties";

const EMPTY_ALL_PROPERTIES_RESPONSE: AllPropertiesResponse = {
  page: 1,
  pageSize: 10,
  totalCount: 0,
  hasMore: false,
  items: [],
};

type AdminOrganisation = {
  id: string;
  name: string;
  entityType: "LLC" | "SPV" | "Trust";
  registrationNumber: string;
  jurisdiction: string;
  incorporationDate: string;
  propertyHolds: number;
};

type AdminOrganisationsResponse = {
  totalCount: number;
  items: AdminOrganisation[];
};

type AdminOrganisationsApiResponse = {
  status?: boolean;
  message?: string;
  data?: AdminOrganisationsResponse;
};

function normalizeAllPropertiesResponse(
  payload: BaseResponse<AllPropertiesResponse> | AllPropertiesResponse,
): AllPropertiesResponse {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "status" in payload &&
    "message" in payload
  ) {
    return payload.data ?? EMPTY_ALL_PROPERTIES_RESPONSE;
  }

  return payload;
}

const EMPTY_ADMIN_DASHBOARD_SUMMARY: AdminPropertiesDetails = {
  totalAssetValue: 0,
  totalInvestors: 0,
  tokensIssued: 0,
  pendingKyc: 0,
  platformRevenue: 0,
  pendingPropertyApprovals: 0,
};

export const propertiesService = {
  async getAllProperties(
    params: GetAllPropertiesParams,
  ): Promise<AllPropertiesResponse> {
    const payload = await getRequest<
      BaseResponse<AllPropertiesResponse> | AllPropertiesResponse
    >(API_END_POINTS.ADMIN_ALL_PROPERTIES, params);

    return normalizeAllPropertiesResponse(payload);
  },

  async getOrganisationProperties(params: {
    page: number;
    pageSize: number;
    status?: number;
    search?: string;
  }): Promise<AllPropertiesResponse> {
    const payload = await getRequest<
      BaseResponse<AllPropertiesResponse> | AllPropertiesResponse
    >(API_END_POINTS.ORGANIZATION_PROPERTIES, params);

    return normalizeAllPropertiesResponse(payload);
  },

  async getAdminSpecificOrganisationProperties(params: {
    organizationId: string;
    page: number;
    pageSize: number;
    status?: number;
    search?: string;
  }): Promise<AllPropertiesResponse> {
    const payload = await getRequest<
      BaseResponse<AllPropertiesResponse> | AllPropertiesResponse
    >(API_END_POINTS.ADMIN_ALL_PROPERTIES, params);

    return normalizeAllPropertiesResponse(payload);
  },

  async getPropertyOrganisations(params: {
    page: number;
    pageSize: number;
  }): Promise<AdminOrganisationsResponse> {
    const payload = await getRequest<AdminOrganisationsApiResponse>(
      API_END_POINTS.ADMIN_ORGANISATIONS,
      params,
    );

    return {
      items: payload.data?.items ?? [],
      totalCount: payload.data?.totalCount ?? 0,
    };
  },

  async getPropertyDetails(
    propertyId: string,
    scope: "admin" | "organisation" = "admin",
  ): Promise<PropertyDetailsItem> {
    const endpoint =
      scope === "organisation"
        ? API_END_POINTS.ORGANIZATION_PROPERTY_BY_ID(propertyId)
        : API_END_POINTS.ADMIN_PROPERTY_BY_ID(propertyId);
    const payload =
      await getRequest<BaseResponse<PropertyDetailsItem>>(endpoint);
    if (!payload.data) {
      throw new Error("Property details not found");
    }
    return payload.data;
  },

  /**
   * Dashboard stat cards: there is no separate aggregate endpoint in the public API contract.
   * Pending approvals count comes from GET /admin/properties with status filter.
   * Other totals stay at 0 until a dedicated admin summary endpoint exists.
   */
  async getAdminDashboardSummary(): Promise<AdminPropertiesDetails> {
    try {
      const list = await this.getAllProperties({
        page: 1,
        pageSize: 1,
        status: PROPERTY_STATUS.PENDING_APPROVAL,
      });
      return {
        ...EMPTY_ADMIN_DASHBOARD_SUMMARY,
        pendingPropertyApprovals: list.totalCount,
      };
    } catch {
      return EMPTY_ADMIN_DASHBOARD_SUMMARY;
    }
  },

  async getInvestorUsers(params: {
    propertyId: string;
    page: number;
    pageSize: number;
  }): Promise<BaseResponse<InvestorUsersResponse>> {
    return await getRequest<BaseResponse<InvestorUsersResponse>>(
      API_END_POINTS.PROPERTIES_INVESTOR_USERS,
      params,
    );
  },

  async getWhitelistedUsers(params: {
    propertyId: string;
    page: number;
    pageSize: number;
  }): Promise<BaseResponse<WhitelistedUsersResponse>> {
    return await getRequest<BaseResponse<WhitelistedUsersResponse>>(
      API_END_POINTS.PROPERTIES_WHITELISTED_USERS,
      params,
    );
  },
};
