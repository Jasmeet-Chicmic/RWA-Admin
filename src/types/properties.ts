export interface PropertyDocument {
  id?: string;
  title?: string;
  type?: number;
  submissionReason?: number;
  fileName: string;
  documentUrl: string;
}

export interface PropertyItem {
  id: string;
  name: string;
  location: string;
  status: number;
  propertyType: number;
  organisation?: {
    id: string;
    name: string;
  };
  organization?: {
    id: string;
    name: string;
  };
  approvedValuation: number;
  annualYieldPercentage: number | null;
  pricePerShare: number | null;
  owner?: {
    id?: string;
    walletAddress?: string;
    identityContractAddress?: string;
  } | null;
  whitelistedUsers: number;
  investorUsers: number;
  createdAt: string;
}

export interface AllPropertiesResponse {
  page: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;
  items: PropertyItem[];
}

export interface PropertyDetailsItem {
  id: string;
  name: string;
  description: string;
  location: string;
  propertyType: number;
  imageUrls: string[];
  status: number;
  rejectionReason: string | null;
  approvedReason: string | null;
  squareFeet: number | null;
  sellingPercentage: number | null;
  rentalIncomeHistory: number | null;
  approvedValuation: number;
  annualYieldPercentage: number | null;
  pricePerShare: number | null;
  totalUnitMint?: number | null;
  soldUnits?: number | null;
  availableUnits?: number | null;
  documents: PropertyDocument[];
  adminDocuments: PropertyDocument[];
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
  userId?: string;
  sortKey?: string;
  sortDirection?: string;
  organizationId?: string;
}

export interface BaseResponse<T = unknown> {
  status: boolean;
  message: string;
  data?: T;
  statusCode?: number;
}

export interface AdminProperty {
  id: string;
  name: string;
  description: string;
  location: string;
  propertyType: string;
  imageUrl: string;
  status: number;
  rejectionReason: string | null;
  adminDocuments?: PropertyDocument[];
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
  image: string;
  ownerWalletAddress: string;
  whitelistedUsers: number;
  investorUsers: number;
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

export interface BasePropertyUser {
  id: string;
  name: string;
  walletAddress: string;
  createdAt: string;
}

export interface InvestorUser extends BasePropertyUser {
  sharesBought: number;
  sharesHeld?: number | string;
}

export interface InvestorUsersResponse {
  totalCount: number;
  limit: number;
  skip: number;
  items: InvestorUser[];
}

export interface WhitelistedUser extends BasePropertyUser {
  whitelistedAt: string;
}

export interface WhitelistedUsersResponse {
  totalCount: number;
  limit: number;
  skip: number;
  items: WhitelistedUser[];
}
