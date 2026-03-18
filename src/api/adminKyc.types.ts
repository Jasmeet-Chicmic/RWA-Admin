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

