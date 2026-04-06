import { API_END_POINTS } from "@/shared/api";
import { ResponseType, Role } from "@/shared/types";
import { getRequest } from "./fetcher";

export type UserPortfolioItem = {
  id: string;
  name: string | null;
  walletAddress: string;
  properties: number;
  totalInvestment: number;
  portfolioValue: number;
  kycStatus: 0 | 1 | 2 | 3;
};

export type UsersListResponse = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: UserPortfolioItem[];
};

type UsersApiResponse = ResponseType & {
  data?: UsersListResponse;
};

type RolesApiResponse = ResponseType & {
  data?: Role[];
};

export type GetUsersListParams = {
  page: number;
  pageSize: number;
  /** Substring match on wallet address */
  search?: string;
  kycStatus?: number;
};

export const usersService = {
  async getUsers(params: GetUsersListParams): Promise<UsersListResponse> {
    const payload = await getRequest<UsersApiResponse, GetUsersListParams>(
      API_END_POINTS.USER,
      params,
    );
    return (
      payload.data ?? {
        page: params.page,
        pageSize: params.pageSize,
        totalCount: 0,
        totalPages: 0,
        items: [],
      }
    );
  },

  async getRoles(): Promise<Role[]> {
    const payload = await getRequest<RolesApiResponse>(API_END_POINTS.ROLES);
    return payload.data ?? [];
  },
};
