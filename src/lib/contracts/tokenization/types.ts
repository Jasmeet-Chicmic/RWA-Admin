import type { WalletClient } from "viem";

export const TOKENIZATION_FLOW_STEPS = {
  deployTrexSuite: "deployTrexSuite",
  deployVault: "deployVault",
  registerProperty: "registerProperty",
} as const;

export type TokenizationFlowStep =
  (typeof TOKENIZATION_FLOW_STEPS)[keyof typeof TOKENIZATION_FLOW_STEPS];

export const PROPERTY_REGISTRATION_JOB_STATUS = {
  PENDING_TREX: 1,
  TREX_DEPLOYING: 2,
  VAULT_DEPLOYING: 3,
  REGISTERING: 4,
  KYC_VERIFYING: 5,
  UNPAUSING: 6,
  MINTING: 7,
  COMPLIANCE_BINDING: 8,
  COMPLETED: 9,
  FAILED: 10,
} as const;

export type RunTokenizationFlowInput = {
  propertyId: string;
  propertyName: string;
  ownerAddress: `0x${string}`;
  ipfsUri: string;
  totalUnits: bigint;
  totalValue: bigint;
  initiateMintAmount: number;
  initiatePricePerShare: number;
};

export type GasConfig = {
  gas?: bigint;
  maxPriorityFeePerGas?: bigint;
  maxFeePerGas?: bigint;
};

export type ActiveAccount = NonNullable<WalletClient["account"]>;

export type TokenizationApiMessages = {
  initiate?: string;
  trexDeployed?: string;
  vaultDeployed?: string;
  propertyRegistered?: string;
  kycDone?: string;
  unpauseDone?: string;
  minted?: string;
  complianceBound?: string;
};

export type TokenizationFlowResult = {
  jobId: string;
  apiMessages: TokenizationApiMessages;
  salt: string;
  tokenAddress: `0x${string}`;
  vaultAddress: `0x${string}`;
  tx: {
    deployTREXSuite: `0x${string}`;
    deployVault: `0x${string}`;
    registerProperty: `0x${string}`;
    unpause?: `0x${string}`;
    mint: `0x${string}`;
    addModule?: `0x${string}`;
  };
};

export type JobStatusData = {
  jobId: string;
  propertyId: string;
  status: number;
  statusLabel?: string;
  mintAmount?: number | string | null;
  pricePerShare?: number | string | null;
  totalShares?: number | string | null;
  totalPropertyValue?: number | string | null;
  ownerAddress?: string | null;
  requestPayload?: Record<string, unknown> | null;
  tokenAddress: `0x${string}` | null;
  vaultAddress: `0x${string}` | null;
  onChainPropertyId: string | null;
  trexDeployTxHash: `0x${string}` | null;
  vaultDeployTxHash: `0x${string}` | null;
  complianceBoundTxHash?: `0x${string}` | null;
  registerPropertyTxHash: `0x${string}` | null;
  kycSetupTxHash: `0x${string}` | null;
  unpauseTxHash: `0x${string}` | null;
  mintTxHash: `0x${string}` | null;
  updatedAt?: string;
};
