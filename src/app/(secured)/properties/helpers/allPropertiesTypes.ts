import { PropertyStatusType, PropertyType } from "./propertiesConstants";

export interface PropertyItem {
  id: string;
  name: string;
  location: string;
  status: PropertyStatusType;
  propertyType: PropertyType;
  approvedValuation: number;
  annualYieldPercentage: number | null;
  pricePerShare: number | null;
  createdAt: string;
}

export interface AllPropertiesResponse {
  page: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;
  items: PropertyItem[];
}

export interface PropertyDocument {
  type: number;
  fileName: string;
  documentUrl: string;
}

export interface PropertyActionPayload {
  reason: string;
  documents: PropertyDocument[];
}

export interface GetAllPropertiesParams {
  page: number;
  pageSize: number;
  status?: number | string;
  search?: string;
  organizationId?: string;
}

export interface BaseResponse<T = unknown> {
  status: boolean;
  message: string;
  data?: T;
  statusCode?: number;
}
