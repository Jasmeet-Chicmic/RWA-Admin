// Keep in sync with User/src/constants/kyc.ts — same backend, no shared package.
export const KYC_LEVELS = { L2: 2, L3: 3 } as const;

export type KycLevel = (typeof KYC_LEVELS)[keyof typeof KYC_LEVELS];

export const KYC_LEVEL_LABELS: Record<KycLevel, string> = {
  [KYC_LEVELS.L2]: "L2",
  [KYC_LEVELS.L3]: "L3",
};

export const KYC_LEVEL_FILTER_OPTIONS = [
  { label: "L2", value: String(KYC_LEVELS.L2) },
  { label: "L3", value: String(KYC_LEVELS.L3) },
];

export const KYC_VERIFICATION_STATUSES = {
  PENDING: 1,
  APPROVED: 2,
  REJECTED: 3,
  EXPIRED: 4,
} as const;

export type KycVerificationStatus =
  (typeof KYC_VERIFICATION_STATUSES)[keyof typeof KYC_VERIFICATION_STATUSES];

export const KYC_VERIFICATION_STATUS_LABELS: Record<
  KycVerificationStatus,
  string
> = {
  [KYC_VERIFICATION_STATUSES.PENDING]: "Pending",
  [KYC_VERIFICATION_STATUSES.APPROVED]: "Approved",
  [KYC_VERIFICATION_STATUSES.REJECTED]: "Rejected",
  [KYC_VERIFICATION_STATUSES.EXPIRED]: "Expired",
};

export const KYC_VERIFICATION_STATUS_BADGE_CLASSES: Record<
  KycVerificationStatus,
  string
> = {
  [KYC_VERIFICATION_STATUSES.PENDING]:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
  [KYC_VERIFICATION_STATUSES.APPROVED]:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  [KYC_VERIFICATION_STATUSES.REJECTED]:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
  [KYC_VERIFICATION_STATUSES.EXPIRED]:
    "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
};

export const KYC_DOCUMENT_TYPES = {
  GOVERNMENT_ID: 1,
  SELFIE: 2,
  PASSPORT_ADDRESS_PAGE: 3,
  UTILITY_BILL: 4,
  COMPANY_REGISTRATION: 5,
  TRADE_LICENCE: 6,
  CERTIFICATE_OF_INCORPORATION: 7,
  UBO_DECLARATION: 8,
  BOARD_LIST: 9,
  AUTHORISED_REP_CERTIFICATE: 10,
  BANK_STATEMENT: 11,
  TENANCY_OR_EJARI: 12,
  GOVERNMENT_LETTER: 13,
  ARTICLES_OF_ASSOCIATION: 14,
  SHAREHOLDER_REGISTER: 15,
  REGULATORY_LICENCE_DOCUMENT: 16,
  FATCA_CRS_SELF_CERTIFICATION: 17,
  AML_KYC_POLICY: 18,
  BOARD_RESOLUTION_OR_POA: 19,
  SPECIMEN_SIGNATURE: 20,
  BANK_LETTER_OR_SETTLEMENT_CONFIRMATION: 21,
  PROOF_OF_ADDRESS_REGISTERED_OFFICE: 22,
  ADDITIONAL_SUPPORTING_DOCUMENT: 23,
  DRIVING_LICENSE: 24,
} as const;

export type KycDocumentType =
  (typeof KYC_DOCUMENT_TYPES)[keyof typeof KYC_DOCUMENT_TYPES];

export const KYC_DOCUMENT_LABELS: Record<KycDocumentType, string> = {
  [KYC_DOCUMENT_TYPES.GOVERNMENT_ID]: "Government ID",
  [KYC_DOCUMENT_TYPES.SELFIE]: "Selfie",
  [KYC_DOCUMENT_TYPES.PASSPORT_ADDRESS_PAGE]: "Passport page with address",
  [KYC_DOCUMENT_TYPES.UTILITY_BILL]: "Utility bill",
  [KYC_DOCUMENT_TYPES.COMPANY_REGISTRATION]: "Company registration",
  [KYC_DOCUMENT_TYPES.TRADE_LICENCE]: "Trade licence",
  [KYC_DOCUMENT_TYPES.CERTIFICATE_OF_INCORPORATION]:
    "Certificate of incorporation",
  [KYC_DOCUMENT_TYPES.UBO_DECLARATION]: "UBO declaration",
  [KYC_DOCUMENT_TYPES.BOARD_LIST]: "Board list",
  [KYC_DOCUMENT_TYPES.AUTHORISED_REP_CERTIFICATE]:
    "Authorised representative certificate",
  [KYC_DOCUMENT_TYPES.BANK_STATEMENT]: "Bank statement",
  [KYC_DOCUMENT_TYPES.TENANCY_OR_EJARI]: "Tenancy contract / Ejari",
  [KYC_DOCUMENT_TYPES.GOVERNMENT_LETTER]: "Government letter",
  [KYC_DOCUMENT_TYPES.ARTICLES_OF_ASSOCIATION]: "Articles of association",
  [KYC_DOCUMENT_TYPES.SHAREHOLDER_REGISTER]: "Shareholder register",
  [KYC_DOCUMENT_TYPES.REGULATORY_LICENCE_DOCUMENT]: "Regulatory licence",
  [KYC_DOCUMENT_TYPES.FATCA_CRS_SELF_CERTIFICATION]:
    "FATCA/CRS self-certification",
  [KYC_DOCUMENT_TYPES.AML_KYC_POLICY]: "AML/KYC policy",
  [KYC_DOCUMENT_TYPES.BOARD_RESOLUTION_OR_POA]:
    "Board resolution or power of attorney",
  [KYC_DOCUMENT_TYPES.SPECIMEN_SIGNATURE]: "Specimen signature",
  [KYC_DOCUMENT_TYPES.BANK_LETTER_OR_SETTLEMENT_CONFIRMATION]:
    "Bank letter or settlement confirmation",
  [KYC_DOCUMENT_TYPES.PROOF_OF_ADDRESS_REGISTERED_OFFICE]:
    "Proof of address (registered office)",
  [KYC_DOCUMENT_TYPES.ADDITIONAL_SUPPORTING_DOCUMENT]:
    "Additional supporting document",
  [KYC_DOCUMENT_TYPES.DRIVING_LICENSE]: "Driving license",
};

export const getKycDocumentLabel = (type: number): string =>
  KYC_DOCUMENT_LABELS[type as KycDocumentType] ?? `Document type ${type}`;

export const DEFAULT_KYC_PAGE_SIZE = 10;
