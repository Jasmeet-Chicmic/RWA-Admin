export enum PROPERTY_TYPE {
  RESIDENTIAL = 1,
  COMMERCIAL = 2,
  LAND = 3,
}

export type PropertyType = PROPERTY_TYPE;

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  [PROPERTY_TYPE.RESIDENTIAL]: "Residential",
  [PROPERTY_TYPE.COMMERCIAL]: "Commercial",
  [PROPERTY_TYPE.LAND]: "Land",
};

export const PROPERTY_STATUS = {
  PENDING_APPROVAL: 1,
  ADMIN_APPROVED: 2,
  ORGANIZATION_ASSIGNED: 3,
  ACTIVE: 4,
  SOLD_OUT: 5,
  REJECTED: 6,
  MODIFICATION_REQUIRED: 7,
  PENDING_TREX: 8,
  TREX_DEPLOYING: 9,
  VAULT_DEPLOYING: 10,
  REGISTERING: 11,
  KYC_VERIFYING: 12,
  MINTING: 13,
  FAILED: 14,
} as const;

export type PropertyStatusType =
  (typeof PROPERTY_STATUS)[keyof typeof PROPERTY_STATUS];

export enum PropertyStatus {
  Draft = 0,
  PendingApproval = 1,
  AdminApproved = 2,
  OrganizationAssigned = 3,
  Active = 4,
  SoldOut = 5,
  Rejected = 6,
  ModificationRequired = 7,
  PENDING_TREX = 8,
  TREX_DEPLOYING = 9,
  VAULT_DEPLOYING = 10,
  REGISTERING = 11,
  KYC_VERIFYING = 12,
  MINTING = 13,
  FAILED = 14,
}

export const PROPERTY_STATUS_LABEL_MAP: Record<number | string, string> = {
  [PropertyStatus.Draft]: "Draft",
  [PropertyStatus.PendingApproval]: "Pending Approval",
  [PropertyStatus.AdminApproved]: "Admin Approved",
  [PropertyStatus.OrganizationAssigned]: "Organization Assigned",
  [PropertyStatus.Active]: "Listed",
  [PropertyStatus.SoldOut]: "Sold Out",
  [PropertyStatus.Rejected]: "Rejected",
  [PropertyStatus.ModificationRequired]: "Modification Required",
  [PropertyStatus.PENDING_TREX]: "Pending",
  [PropertyStatus.FAILED]: "Failed",
  [PropertyStatus.KYC_VERIFYING]: "Pending",
  [PropertyStatus.MINTING]: "Pending",
  [PropertyStatus.TREX_DEPLOYING]: "Pending",
  [PropertyStatus.VAULT_DEPLOYING]: "Pending",
  [PropertyStatus.REGISTERING]: "Pending",
};

export const PROPERTY_STATUS_LABELS: Record<PropertyStatusType, string> = {
  [PROPERTY_STATUS.PENDING_APPROVAL]: "Pending Approval",
  [PROPERTY_STATUS.ADMIN_APPROVED]: "Admin Approved",
  [PROPERTY_STATUS.ORGANIZATION_ASSIGNED]: "Organization Assigned",
  [PROPERTY_STATUS.ACTIVE]: "Active",
  [PROPERTY_STATUS.SOLD_OUT]: "Sold Out",
  [PROPERTY_STATUS.REJECTED]: "Rejected",
  [PROPERTY_STATUS.MODIFICATION_REQUIRED]: "Modification Required",
  [PROPERTY_STATUS.PENDING_TREX]: "Pending TREX",
  [PROPERTY_STATUS.TREX_DEPLOYING]: "TREX Deploying",
  [PROPERTY_STATUS.VAULT_DEPLOYING]: "Vault Deploying",
  [PROPERTY_STATUS.REGISTERING]: "Registering",
  [PROPERTY_STATUS.KYC_VERIFYING]: "KYC Verifying",
  [PROPERTY_STATUS.MINTING]: "Minting",
  [PROPERTY_STATUS.FAILED]: "Failed",
};

export const PROPERTY_STATUS_BADGE_CLASSES: Record<PropertyStatusType, string> =
  {
    [PROPERTY_STATUS.PENDING_APPROVAL]:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    [PROPERTY_STATUS.ADMIN_APPROVED]:
      "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800",
    [PROPERTY_STATUS.ORGANIZATION_ASSIGNED]:
      "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
    [PROPERTY_STATUS.ACTIVE]:
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
    [PROPERTY_STATUS.SOLD_OUT]:
      "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
    [PROPERTY_STATUS.REJECTED]:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
    [PROPERTY_STATUS.MODIFICATION_REQUIRED]:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
    [PROPERTY_STATUS.PENDING_TREX]:
      "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
    [PROPERTY_STATUS.TREX_DEPLOYING]:
      "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800",
    [PROPERTY_STATUS.VAULT_DEPLOYING]:
      "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800",
    [PROPERTY_STATUS.REGISTERING]:
      "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800",
    [PROPERTY_STATUS.KYC_VERIFYING]:
      "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800",
    [PROPERTY_STATUS.MINTING]:
      "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800",
    [PROPERTY_STATUS.FAILED]:
      "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800",
  };

export const PROPERTY_STATUS_FILTER_OPTIONS = [
  { label: "All Status", value: "" },
  ...Object.entries(PROPERTY_STATUS_LABELS).map(([value, label]) => ({
    label,
    value: Number(value),
  })),
];

export const DEFAULT_PAGE_SIZE = 10;

export enum PROPERTY_DOCUMENT_TYPE {
  NOC = 1,
  REGISTRY = 2,
  ID_PROOF = 3,
  OTHER = 4,
}

export const PROPERTY_DOCUMENT_TYPE_LABELS: Record<number, string> = {
  [PROPERTY_DOCUMENT_TYPE.NOC]: "NOC Document",
  [PROPERTY_DOCUMENT_TYPE.REGISTRY]: "Registry Document",
  [PROPERTY_DOCUMENT_TYPE.ID_PROOF]: "Owner ID Proof",
  [PROPERTY_DOCUMENT_TYPE.OTHER]: "Other Supporting Document",
};
