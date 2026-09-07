export type KycReviewUserProfile = {
  id: string;
  name: string;
  email: string;
};

export type KycReviewListItem = {
  id: string;
  status: number;
  kycLevel: number;
  tenantId: string;
  createdAt: string;
  reviewedAt: string | null;
  userProfileId: string;
  userProfile: KycReviewUserProfile;
};

export type KycReviewListResponse = {
  items: KycReviewListItem[];
  totalCount: number;
};

export type KycReviewListParams = {
  skip: number;
  limit: number;
  sortKey?: "createdAt" | "kycLevel";
  sortDirection?: "asc" | "desc";
  searchString?: string;
  level?: number;
};

export type KycReviewDocument = {
  id: string;
  type: number;
  url: string;
  issuingCountryId: string | null;
  issuingCountryName: string | null;
  issuedOn: string | null;
  referenceNumber: string | null;
  issuerName: string | null;
};

export type KycReviewDetail = KycReviewListItem & {
  documents: KycReviewDocument[];
  rejectionReason: string | null;
  expiresAt: string | null;
};

export type DecideKycReviewPayload = {
  kycVerificationId: string;
  status: number;
  rejectionReason?: string;
};
