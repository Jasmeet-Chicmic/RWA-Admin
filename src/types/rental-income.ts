import { BaseResponse } from "./properties";

export interface RentalIncomeRequest {
  propertyId: string;
  fromDate: string; // ISO 8601 format
  toDate: string; // ISO 8601 format
  amountReceived: string; // BigInt as string
  maintenanceCharges: string; // BigInt as string
  otherCharges: string; // BigInt as string
}

export interface RentalIncomeData {
  id: string;
  propertyId: string;
  fromDate: string;
  toDate: string;
  amountReceived: string;
  maintenanceCharges: string;
  otherCharges: string;
  netIncome: string;
  distributableIncome: string;
  sellingPercentage: string;
  mintAmount: string;
  createdAt: string;
}

export type RentalIncomeResponse = BaseResponse<RentalIncomeData>;

export interface RentalIncomeListItem {
  id: string;
  property: {
    id: string;
    name: string;
  };
  status: number;
  amountReceived: number | string;
  distributableIncome: number | string;
  investorUsers: number;
  fromDate?: string;
  toDate?: string;
  maintenanceCharges?: number | string;
  otherCharges?: number | string;
}

export interface RentalIncomeListData {
  items: RentalIncomeListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface RentalIncomeListRequest {
  propertyId?: string;
  status?: number;
  page?: number;
  pageSize?: number;
}

export type RentalIncomeListResponse = BaseResponse<RentalIncomeListData>;
export interface RentalIncomeDetailRequest {
  rentalIncomeId: string;
}

export interface RentalIncomeDetailData extends RentalIncomeListItem {
  organizationId: string;
  netIncome: number | string;
  sellingPercentage: number;
  mintAmount: number | string;
  distributedAt: string | null;
  createdAt: string;
}

export type RentalIncomeDetailResponse = BaseResponse<RentalIncomeDetailData>;

export interface DeleteRentalIncomeRequest {
  rentalIncomeId: string;
}

export interface UpdateRentalIncomeRequest {
  rentalIncomeId: string;
  fromDate: string;
  toDate: string;
  amountReceived: string;
  maintenanceCharges: string;
  otherCharges: string;
}

export interface DistributeRentalIncomeRequest {
  rentalIncomeId: string;
}
