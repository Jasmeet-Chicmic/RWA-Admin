export interface PropertyDocument {
  title: string;
  fileName: string;
  documentUrl: string;
}

export enum PropertyStatus {
  PendingApproval = 1,
  Active = 2,
  SoldOut = 3,
  Rejected = 4,
  ModificationRequired = 5,
}

export interface AdminProperty {
  id: string;
  name: string;
  description: string;
  location: string;
  propertyType: string;
  imageUrl: string;
  status: PropertyStatus;
  rejectionReason: string | null;
  totalValue: number;
  totalUnits: number;
  availableUnits: number;
  pricePerUnit: number;
  pricePerUnitEth: number;
  annualYieldPercent: number;
  riskScore: number;
  demandScore: number | null;
  rentalIncomeHistory: number;
  documents: PropertyDocument[];
  hasPendingUpdateRequest: boolean;
  canEditFullProperty: boolean;
  canResubmit: boolean;
  canRequestUpdate: boolean;
  canDelete: boolean;
}

export interface PropertiesListResponse {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: AdminProperty[];
}

export interface GetPropertiesParams {
  page: number;
  pageSize: number;
  status?: number;
  search?: string;
  location?: string;
}
