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
