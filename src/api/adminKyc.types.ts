export type PendingKycItem = {
  kycId: string;
  userId: string;
  fullName: string;
  status: number;
  rejectionReason: string | null;
  createdAt: string;
};

export type PendingKycListResponse = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: PendingKycItem[];
};

export type GetPendingKycParams = {
  page: number;
  pageSize: number;
  Status?: number;
};

export type IdentityClaimRequestItem = {
  id: string;
  topic: number;
  identityContractAddress: string;
  data: string;
  status: number;
  user: {
    id: string;
    walletAddress: string;
    name: string | null;
  } | null;
  approver: {
    id: string;
    walletAddress: string;
    name: string | null;
  } | null;
  approvedAt: string | null;
  transactionHash: string | null;
  rejectionReason: string | null;
  createdAt: string;
};

export type IdentityClaimRequestListResponse = {
  page: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;
  items: IdentityClaimRequestItem[];
};

/** Wrapped API shape from identity service */
export type IdentityClaimRequestListEnvelope = {
  statusCode: number;
  status: boolean;
  message: string;
  type: string;
  data: IdentityClaimRequestListResponse;
};

export type GetIdentityClaimRequestsParams = {
  page: number;
  pageSize: number;
  topic?: number;
  status?: number;
  search?: string;
};
