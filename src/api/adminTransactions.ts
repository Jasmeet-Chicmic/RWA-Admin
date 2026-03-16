"use server";

import { API_END_POINTS } from "@/shared/api";
import {
  GetAdminTransactionsParams,
  ResponseType,
  Transaction,
} from "@/shared/types";

export async function getAdminTransactionsAction(
  params: GetAdminTransactionsParams,
) {
  const { getRequest } = await import("@/shared/fetcher");
  return await getRequest<
    ResponseType & {
      data: {
        transactions: Transaction[];
        totalCount: number;
        pageNumber: number;
        pageSize: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      };
    },
    GetAdminTransactionsParams
  >(API_END_POINTS.ADMIN_TRANSACTIONS, params);
}
