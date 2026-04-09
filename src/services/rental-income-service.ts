import {
  deleteRequest,
  getRequest,
  postRequest,
  putRequest,
} from "@/services/fetcher";
import { API_END_POINTS } from "@/shared/api";
import {
  DistributeRentalIncomeRequest,
  DeleteRentalIncomeRequest,
  RentalIncomeDistributionsRequest,
  RentalIncomeDistributionsResponse,
  RentalIncomeDetailRequest,
  RentalIncomeDetailResponse,
  RentalIncomeListRequest,
  RentalIncomeListResponse,
  RentalIncomeRequest,
  RentalIncomeResponse,
  UpdateRentalIncomeRequest,
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
  getRentalIncomes: async (
    params: RentalIncomeListRequest,
  ): Promise<RentalIncomeListResponse> => {
    return await getRequest<RentalIncomeListResponse, RentalIncomeListRequest>(
      API_END_POINTS.RENTAL_INCOME,
      params,
    );
  },
  getRentalIncomeDetail: async (
    params: RentalIncomeDetailRequest,
  ): Promise<RentalIncomeDetailResponse> => {
    return await getRequest<
      RentalIncomeDetailResponse,
      RentalIncomeDetailRequest
    >(API_END_POINTS.RENTAL_INCOME_DETAIL, params);
  },
  getRentalIncomeDistributions: async (
    params: RentalIncomeDistributionsRequest,
  ): Promise<RentalIncomeDistributionsResponse> => {
    return await getRequest<
      RentalIncomeDistributionsResponse,
      RentalIncomeDistributionsRequest
    >(API_END_POINTS.RENTAL_INCOME_DISTRIBUTIONS, params);
  },
  deleteRentalIncome: async (
    payload: DeleteRentalIncomeRequest,
  ): Promise<RentalIncomeResponse> => {
    return await deleteRequest<RentalIncomeResponse, DeleteRentalIncomeRequest>(
      API_END_POINTS.RENTAL_INCOME,
      payload,
    );
  },
  updateRentalIncome: async (
    payload: UpdateRentalIncomeRequest,
  ): Promise<RentalIncomeResponse> => {
    return await putRequest<RentalIncomeResponse, UpdateRentalIncomeRequest>(
      API_END_POINTS.RENTAL_INCOME,
      payload,
    );
  },
  distributeRentalIncome: async (
    payload: DistributeRentalIncomeRequest,
  ): Promise<RentalIncomeResponse> => {
    return await postRequest<
      RentalIncomeResponse,
      DistributeRentalIncomeRequest
    >(API_END_POINTS.RENTAL_INCOME_DISTRIBUTE, payload);
  },
};
