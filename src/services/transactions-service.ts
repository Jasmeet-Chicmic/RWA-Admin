import { API_END_POINTS } from "@/shared/api";
import { GetAdminTransactionsParams, ResponseType } from "@/shared/types";
import { getRequest } from "./fetcher";

export type AdminTransactionItem = {
  id: string;
  status: number;
  // Backend returns a `property` object now.
  // Keep `propertyId` optional for backwards compatibility if any endpoint still returns the old shape.
  property?: {
    id: string;
    name: string;
  };
  propertyId?: string;
  transactionHash: string;
  buyerAddress: string;
  sellerAddress: string;
  shares: number;
  amount: number;
  errorMessage: string | null;
  createdAt: string;
};

type TransactionsListResponse = ResponseType & {
  data?: {
    items?: AdminTransactionItem[];
    totalCount: number;
    page?: number;
    pageSize: number;
    hasMore: boolean;
  };
};

export const transactionsService = {
  async getTransactions(params: GetAdminTransactionsParams) {
    const payload = await getRequest<
      TransactionsListResponse,
      GetAdminTransactionsParams
    >(API_END_POINTS.ADMIN_TRANSACTIONS, params);

    const items = payload?.data?.items ?? [];
    return {
      transactions: items,
      totalCount: payload?.data?.totalCount ?? 0,
    };
  },
};
