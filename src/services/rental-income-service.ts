import { postRequest } from "@/services/fetcher";
import { API_END_POINTS } from "@/shared/api";
import {
  RentalIncomeRequest,
  RentalIncomeResponse,
} from "@/types/rental-income";

export const rentalIncomeService = {
  submitRentalIncome: async (
    payload: RentalIncomeRequest,
  ): Promise<RentalIncomeResponse> => {
    return await postRequest<RentalIncomeResponse, RentalIncomeRequest>(
      API_END_POINTS.RENTAL_INCOME,
      payload,
    );
  },
};
