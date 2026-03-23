export interface PropertyDocument {
  title: string;
  fileName: string;
  documentUrl: string;
}

export enum PropertyStatus {
  Draft = 0,
  PendingApproval = 1,
  AdminApproved = 2,
  OrganizationAssigned = 3,
  Active = 4,
  SoldOut = 5,
  Rejected = 6,
  ModificationRequired = 7,
  PENDING_TREX = 8, // Job created, about to submit deployTREXSuite TX
  TREX_DEPLOYING = 9, // deployTREXSuite TX submitted, waiting for TREXSuiteDeployed event
  VAULT_DEPLOYING = 10, // T-REX deployed, deploying vault
  REGISTERING = 11, // Vault deployed, calling registerProperty
  KYC_VERIFYING = 12, // Registered, setting up identities in token IR
  MINTING = 13, // KYC done, minting tokens to vault + binding compliance
  FAILED = 14, // Any step failed; see error_message column
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
