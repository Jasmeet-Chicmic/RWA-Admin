import { API_END_POINTS } from "@/shared/api";
import { getRequest } from "@/shared/fetcher";

// Top Transactions
export const fetchTransactionsList = (params = {}) => {
  return getRequest(API_END_POINTS.TRANSACTIONS, params, {
    transformer: (response: {
      data: {
        count: number;
        data: {
          amount: number;
          description: string;
          paymentType: number;
          sourceType: number;
          type: number;
          _id: string;
        }[];
      };
    }) => response.data,
  });
};
