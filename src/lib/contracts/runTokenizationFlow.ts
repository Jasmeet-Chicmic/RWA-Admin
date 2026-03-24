import {
  PublicClient,
  WalletClient,
  keccak256,
  parseUnits,
  stringToBytes,
  zeroAddress,
} from "viem";
import { TREX_FACTORY_ABI } from "./trexFactoryAbi";
import {
  REAL_ESTATE_REGISTRY_ABI,
  REAL_ESTATE_VAULT_FACTORY_ABI,
} from "./realEstateFlowAbi";
import { TOKENIZATION_CONTRACTS } from "./tokenizationConfig";
import { INTERNAL_API_PATHS } from "@/shared/api";
import { postApiJson } from "@/shared/clientApi";
import {
  InitiateOnchainTrackingResponse,
  InternalApiBaseResponse,
} from "@/shared/types/internalApi";
import { toBaseUnitsBigInt } from "@/shared/utils/unitUtils";

const TOKEN_ABI = [
  {
    inputs: [],
    name: "paused",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "compliance",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "identityRegistry",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const IDENTITY_REGISTRY_ABI = [
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "contains",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "isVerified",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_useraddress", type: "address" },
      { internalType: "address", name: "_identity", type: "address" },
      { internalType: "uint16", name: "_country", type: "uint16" },
    ],
    name: "registerIdentity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const MODULAR_COMPLIANCE_ABI = [
  {
    inputs: [{ internalType: "address", name: "module", type: "address" }],
    name: "isModuleBound",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "module", type: "address" }],
    name: "addModule",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const TOKEN_DECIMALS = 6;
const POLYGON_AMOY_CHAIN_ID = 80002;
const AMOY_DEPLOY_TREX_SUITE_GAS_CAP = BigInt(30000000);
const AMOY_MIN_PRIORITY_FEE_PER_GAS = BigInt(25000000000);
const AMOY_MIN_MAX_FEE_PER_GAS = BigInt(30000000000);
const TOKENIZATION_API_TIMEOUT_MS = 30000;

export type RunTokenizationFlowInput = {
  propertyId: string;
  propertyName: string;
  ownerAddress: `0x${string}`;
  ipfsUri: string;
  totalUnits: bigint;
  totalValue: bigint;
};

export const TOKENIZATION_FLOW_STEPS = {
  deployTrexSuite: "deployTrexSuite",
  deployVault: "deployVault",
  registerProperty: "registerProperty",
} as const;

export type TokenizationFlowStep =
  (typeof TOKENIZATION_FLOW_STEPS)[keyof typeof TOKENIZATION_FLOW_STEPS];

type RunTokenizationFlowParams = {
  walletClient: WalletClient;
  publicClient: PublicClient;
  input: RunTokenizationFlowInput;
  onStepChange?: (step: TokenizationFlowStep) => void;
};

const toTokenSymbol = (propertyId: string) =>
  `P${
    propertyId
      .replace(/[^A-Za-z0-9]/g, "")
      .slice(-6)
      .toUpperCase() || "RWA"
  }`;

const postTokenizationApi = <TResponse, TBody>(path: string, body: TBody) =>
  postApiJson<TResponse, TBody>(path, body, {
    timeoutMs: TOKENIZATION_API_TIMEOUT_MS,
  });

export const runTokenizationFlow = async ({
  walletClient,
  publicClient,
  input,
  onStepChange,
}: RunTokenizationFlowParams) => {
  console.log("[TokenizationFlow] Starting flow", {
    input,
    chainId: walletClient.chain?.id,
  });

  const [activeAccount] = walletClient.account ? [walletClient.account] : [];
  if (!activeAccount?.address) {
    console.error("[TokenizationFlow] Wallet account is not available");
    throw new Error("Wallet account is not available");
  }

  if (input.totalUnits <= 0) {
    console.error("[TokenizationFlow] Invalid total units", {
      totalUnits: input.totalUnits,
    });
    throw new Error("Total units must be greater than 0");
  }

  const salt = `${input.propertyId}-${Date.now()}`;
  const claimTopic = BigInt(keccak256(stringToBytes("KYC_CLAIM")));
  const tokenScale = toBaseUnitsBigInt(1, TOKEN_DECIMALS);
  const pricePerShare = (input.totalValue * tokenScale) / input.totalUnits;
  console.log("[TokenizationFlow] Computed deploy params", {
    salt,
    claimTopic: claimTopic.toString(),
    pricePerShare: pricePerShare.toString(),
    owner: activeAccount.address,
  });

  console.log("[TokenizationFlow] Initiating onchain tracking job");
  const initiatePayload = await postTokenizationApi<
    InitiateOnchainTrackingResponse,
    { propertyId: string }
  >(INTERNAL_API_PATHS.PROPERTY_ONCHAIN_INITIATE, {
    propertyId: input.propertyId,
  });

  if (!initiatePayload?.status) {
    console.error("[TokenizationFlow] Failed to initiate onchain tracking", {
      status: initiatePayload?.statusCode,
      payload: initiatePayload,
    });
    throw new Error(
      initiatePayload?.message ||
        "Failed to initiate onchain property tracking job",
    );
  }
  console.log("[TokenizationFlow] Initiate API succeeded", {
    statusCode: initiatePayload?.statusCode,
    message: initiatePayload?.message,
  });

  const jobId = initiatePayload?.data?.jobId;
  if (!jobId) {
    console.error("[TokenizationFlow] Missing jobId in initiate response", {
      payload: initiatePayload,
    });
    throw new Error("Missing jobId from onchain initiate API");
  }

  console.log("[TokenizationFlow] Onchain tracking job created", { jobId });
  const apiMessages: {
    initiate?: string;
    trexDeployed?: string;
    vaultDeployed?: string;
    propertyRegistered?: string;
    kycDone?: string;
    unpauseDone?: string;
    minted?: string;
  } = {
    initiate: initiatePayload?.message,
  };

  // 1) Deploy TREX suite
  onStepChange?.(TOKENIZATION_FLOW_STEPS.deployTrexSuite);
  console.log("[TokenizationFlow] Step 1/3 deployTREXSuite called");
  const gasConfig =
    walletClient.chain?.id === POLYGON_AMOY_CHAIN_ID
      ? { gas: AMOY_DEPLOY_TREX_SUITE_GAS_CAP }
      : {};
  const feeConfig =
    walletClient.chain?.id === POLYGON_AMOY_CHAIN_ID
      ? {
          maxPriorityFeePerGas: AMOY_MIN_PRIORITY_FEE_PER_GAS,
          maxFeePerGas: AMOY_MIN_MAX_FEE_PER_GAS,
        }
      : {};

  const deployTokenHash = await walletClient.writeContract({
    address: TOKENIZATION_CONTRACTS.trexFactory,
    abi: TREX_FACTORY_ABI,
    functionName: "deployTREXSuite",
    args: [
      salt,
      {
        owner: activeAccount.address,
        name: input.propertyName,
        symbol: toTokenSymbol(input.propertyId),
        decimals: 6,
        irs: zeroAddress,
        ONCHAINID: zeroAddress,
        irAgents: [activeAccount.address],
        tokenAgents: [activeAccount.address],
        complianceModules: [],
        complianceSettings: [],
      },
      {
        claimTopics: [claimTopic],
        issuers: [TOKENIZATION_CONTRACTS.claimIssuer],
        issuerClaims: [[claimTopic]],
      },
    ],
    account: activeAccount,
    chain: walletClient.chain,
    ...gasConfig,
    ...feeConfig,
  });
  console.log("[TokenizationFlow] deployTREXSuite tx submitted", {
    txHash: deployTokenHash,
  });

  const deployTokenReceipt = await publicClient.waitForTransactionReceipt({
    hash: deployTokenHash,
  });
  console.log("[TokenizationFlow] deployTREXSuite tx confirmed", {
    txHash: deployTokenReceipt.transactionHash,
    status: deployTokenReceipt.status,
  });
  if (deployTokenReceipt.status !== "success") {
    console.error("[TokenizationFlow] deployTREXSuite tx failed", {
      txHash: deployTokenReceipt.transactionHash,
      status: deployTokenReceipt.status,
    });
    throw new Error("deployTREXSuite tx failed");
    return;
  }

  const trexDeployedPayload = await postTokenizationApi<
    InternalApiBaseResponse,
    { propertyId: string; txHash: `0x${string}` }
  >(INTERNAL_API_PATHS.PROPERTY_ONCHAIN_TREX_DEPLOYED, {
    propertyId: input.propertyId,
    txHash: deployTokenReceipt.transactionHash,
  });

  if (!trexDeployedPayload?.status) {
    console.error("[TokenizationFlow] Failed to report trex deployment", {
      status: trexDeployedPayload?.statusCode,
      payload: trexDeployedPayload,
    });
    throw new Error(
      trexDeployedPayload?.message || "Failed to report trex deployment",
    );
    return;
  }
  console.log("[TokenizationFlow] trex-deployed API succeeded", {
    statusCode: trexDeployedPayload?.statusCode,
    message: trexDeployedPayload?.message,
    txHash: deployTokenReceipt.transactionHash,
  });
  apiMessages.trexDeployed = trexDeployedPayload?.message;

  const tokenAddress = (await publicClient.readContract({
    address: TOKENIZATION_CONTRACTS.trexFactory,
    abi: TREX_FACTORY_ABI,
    functionName: "getToken",
    args: [salt],
  })) as `0x${string}`;
  console.log("[TokenizationFlow] Token fetched from factory", {
    tokenAddress,
  });

  if (!tokenAddress || tokenAddress === zeroAddress) {
    console.error(
      "[TokenizationFlow] Token address not found after TREX suite deployment",
      { salt, tokenAddress },
    );
    throw new Error("Token address not found after TREX suite deployment");
  }

  // 2) Deploy vault
  onStepChange?.(TOKENIZATION_FLOW_STEPS.deployVault);
  console.log("[TokenizationFlow] Step 2/3 deployVault called");
  const deployVaultHash = await walletClient.writeContract({
    address: TOKENIZATION_CONTRACTS.vaultFactory,
    abi: REAL_ESTATE_VAULT_FACTORY_ABI,
    functionName: "deployVault",
    args: [
      tokenAddress,
      TOKENIZATION_CONTRACTS.usdc,
      pricePerShare,
      input.ownerAddress,
    ],
    account: activeAccount,
    chain: walletClient.chain,
    ...gasConfig,
    ...feeConfig,
  });
  console.log("[TokenizationFlow] deployVault tx submitted", {
    txHash: deployVaultHash,
  });

  await publicClient.waitForTransactionReceipt({ hash: deployVaultHash });
  console.log("[TokenizationFlow] deployVault tx confirmed", {
    txHash: deployVaultHash,
  });

  const vaultDeployedPayload = await postTokenizationApi<
    InternalApiBaseResponse,
    { propertyId: string; txHash: `0x${string}` }
  >(INTERNAL_API_PATHS.PROPERTY_ONCHAIN_VAULT_DEPLOYED, {
    propertyId: input.propertyId,
    txHash: deployVaultHash,
  });

  if (!vaultDeployedPayload?.status) {
    console.error("[TokenizationFlow] Failed to report vault deployment", {
      status: vaultDeployedPayload?.statusCode,
      payload: vaultDeployedPayload,
    });
    throw new Error(
      vaultDeployedPayload?.message || "Failed to report vault deployment",
    );
  }
  console.log("[TokenizationFlow] vault-deployed API succeeded", {
    statusCode: vaultDeployedPayload?.statusCode,
    message: vaultDeployedPayload?.message,
    txHash: deployVaultHash,
  });
  apiMessages.vaultDeployed = vaultDeployedPayload?.message;

  const vaultAddress = (await publicClient.readContract({
    address: TOKENIZATION_CONTRACTS.vaultFactory,
    abi: REAL_ESTATE_VAULT_FACTORY_ABI,
    functionName: "vaults",
    args: [tokenAddress],
  })) as `0x${string}`;
  console.log("[TokenizationFlow] Vault fetched from factory", {
    vaultAddress,
  });

  if (!vaultAddress || vaultAddress === zeroAddress) {
    console.error("[TokenizationFlow] Vault address not found", {
      tokenAddress,
      vaultAddress,
    });
    throw new Error("Vault address not found after vault deployment");
  }

  // 3) Register property
  onStepChange?.(TOKENIZATION_FLOW_STEPS.registerProperty);
  console.log("[TokenizationFlow] Step 3/3 registerProperty called");
  console.log("input.ownerAddress", input);
  const registerHash = await walletClient.writeContract({
    address: TOKENIZATION_CONTRACTS.registry,
    abi: REAL_ESTATE_REGISTRY_ABI,
    functionName: "registerProperty",
    args: [input.ownerAddress, input.ipfsUri, tokenAddress, vaultAddress],
    account: activeAccount,
    chain: walletClient.chain,
    ...gasConfig,
    ...feeConfig,
  });
  console.log("[TokenizationFlow] registerProperty tx submitted", {
    txHash: registerHash,
  });

  const registerReceipt = await publicClient.waitForTransactionReceipt({
    hash: registerHash,
  });
  console.log("[TokenizationFlow] registerProperty tx confirmed", {
    txHash: registerReceipt.transactionHash,
    status: registerReceipt.status,
  });

  const propertyRegisteredPayload = await postTokenizationApi<
    InternalApiBaseResponse,
    { propertyId: string; txHash: `0x${string}` }
  >(INTERNAL_API_PATHS.PROPERTY_ONCHAIN_PROPERTY_REGISTERED, {
    propertyId: input.propertyId,
    txHash: registerReceipt.transactionHash,
  });

  if (!propertyRegisteredPayload?.status) {
    console.error("[TokenizationFlow] Failed to report property registration", {
      status: propertyRegisteredPayload?.statusCode,
      payload: propertyRegisteredPayload,
    });
    throw new Error(
      propertyRegisteredPayload?.message ||
        "Failed to report property registration",
    );
  }
  console.log("[TokenizationFlow] property-registered API succeeded", {
    statusCode: propertyRegisteredPayload?.statusCode,
    message: propertyRegisteredPayload?.message,
    txHash: registerReceipt.transactionHash,
  });
  apiMessages.propertyRegistered = propertyRegisteredPayload?.message;

  const baseResult = {
    jobId,
    apiMessages,
    salt,
    tokenAddress,
    vaultAddress,
    tx: {
      deployTREXSuite: deployTokenReceipt.transactionHash,
      deployVault: deployVaultHash,
      registerProperty: registerReceipt.transactionHash,
    },
  };

  console.log(
    "[TokenizationFlow] Step 4/5 identity registration & verification",
  );
  const tokenIdentityRegistry = (await publicClient.readContract({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: "identityRegistry",
  })) as `0x${string}`;

  console.log("[TokenizationFlow] Token.identityRegistry()", {
    tokenIdentityRegistry,
  });

  const ensureVerified = async ({
    userKey,
    userAddr,
    idAddr,
  }: {
    userKey: string;
    userAddr: `0x${string}`;
    idAddr: `0x${string}` | undefined;
  }) => {
    console.log("userKey", userKey, userAddr, idAddr);
    if (!idAddr) {
      throw new Error(
        `[TokenizationFlow] Missing identity contract address for ${userKey}.`,
      );
    }

    console.log(`[TokenizationFlow]   Syncing ${userKey} (${userAddr})...`);
    const isRegistered = (await publicClient.readContract({
      address: tokenIdentityRegistry,
      abi: IDENTITY_REGISTRY_ABI,
      functionName: "contains",
      args: [userAddr],
    })) as boolean;

    if (!isRegistered) {
      console.log(
        `[TokenizationFlow]   registerIdentity(${userKey}) sending tx`,
      );
      const txHash = await walletClient.writeContract({
        address: tokenIdentityRegistry,
        abi: IDENTITY_REGISTRY_ABI,
        functionName: "registerIdentity",
        args: [userAddr, idAddr, 42],

        account: activeAccount,
        chain: walletClient.chain,
        gas: BigInt(800000),
        ...feeConfig,
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      console.log(
        `[TokenizationFlow]   registerIdentity(${userKey}) tx confirmed`,
        {
          status: receipt.status,
          txHash: receipt.transactionHash,
        },
      );

      const kycDonePayload = await postTokenizationApi<
        InternalApiBaseResponse,
        { propertyId: string; txHash: `0x${string}` }
      >(INTERNAL_API_PATHS.PROPERTY_ONCHAIN_KYC_DONE, {
        propertyId: input.propertyId,
        txHash: receipt.transactionHash,
      });

      if (!kycDonePayload?.status) {
        console.error("[TokenizationFlow] Failed to report kyc done", {
          status: kycDonePayload?.statusCode,
          payload: kycDonePayload,
          userKey,
        });
        throw new Error(kycDonePayload?.message || "Failed to report kyc done");
      }

      console.log("[TokenizationFlow] kyc-done API succeeded", {
        statusCode: kycDonePayload?.statusCode,
        message: kycDonePayload?.message,
        txHash: receipt.transactionHash,
        userKey,
      });
      apiMessages.kycDone = kycDonePayload?.message;
    }

    const verified = (await publicClient.readContract({
      address: tokenIdentityRegistry,
      abi: IDENTITY_REGISTRY_ABI,
      functionName: "isVerified",
      args: [userAddr],
    })) as boolean;

    if (!verified) {
      throw new Error(
        `[TokenizationFlow] ${userKey} verification failed on new token registry`,
      );
    }

    console.log(`[TokenizationFlow]   ${userKey} ✅ Verified`);
  };
  console.log(
    "vaultAddress",
    vaultAddress,
    TOKENIZATION_CONTRACTS.vaultIdentity,
  );
  await ensureVerified({
    userKey: "Vault",
    userAddr: vaultAddress,
    idAddr: TOKENIZATION_CONTRACTS.vaultIdentity,
  });
  console.log(
    "MARKETPLACE_ADDRESS",
    TOKENIZATION_CONTRACTS.marketplace,
    TOKENIZATION_CONTRACTS.marketplaceIdentity,
  );
  await ensureVerified({
    userKey: "Marketplace",
    userAddr: TOKENIZATION_CONTRACTS.marketplace,
    idAddr: TOKENIZATION_CONTRACTS.marketplaceIdentity,
  });
  await ensureVerified({
    userKey: "Alice",
    userAddr: input.ownerAddress,
    idAddr: TOKENIZATION_CONTRACTS.aliceIdentity,
  });

  console.log("[TokenizationFlow] Step 5/5 minting & compliance binding");
  let unpauseTxHash: `0x${string}` | undefined;

  const isPaused = (await publicClient.readContract({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: "paused",
  })) as boolean;

  console.log("[TokenizationFlow] token.paused()", { isPaused });

  if (isPaused) {
    unpauseTxHash = await walletClient.writeContract({
      address: tokenAddress,
      abi: TOKEN_ABI,
      functionName: "unpause",
      account: activeAccount,
      chain: walletClient.chain,
      gas: BigInt(800000),
      ...feeConfig,
    });

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: unpauseTxHash,
    });

    console.log("[TokenizationFlow] token.unpause confirmed", {
      status: receipt.status,
      txHash: receipt.transactionHash,
    });

    const unpauseDonePayload = await postTokenizationApi<
      InternalApiBaseResponse,
      { propertyId: string; txHash: `0x${string}` }
    >(INTERNAL_API_PATHS.PROPERTY_ONCHAIN_UNPAUSE_DONE, {
      propertyId: input.propertyId,
      txHash: receipt.transactionHash,
    });

    if (!unpauseDonePayload?.status) {
      console.error("[TokenizationFlow] Failed to report unpause done", {
        status: unpauseDonePayload?.statusCode,
        payload: unpauseDonePayload,
      });
      throw new Error(
        unpauseDonePayload?.message || "Failed to report unpause done",
      );
    }

    console.log("[TokenizationFlow] unpause-done API succeeded", {
      statusCode: unpauseDonePayload?.statusCode,
      message: unpauseDonePayload?.message,
      txHash: receipt.transactionHash,
    });
    apiMessages.unpauseDone = unpauseDonePayload?.message;
  }

  const mintAmount = parseUnits(String(input.totalUnits), 6);
  console.log("[TokenizationFlow] token.mint", {
    amount: mintAmount.toString(),
    to: vaultAddress,
  });

  const mintTxHash = await walletClient.writeContract({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: "mint",
    args: [vaultAddress, mintAmount],
    account: activeAccount,
    chain: walletClient.chain,
    ...gasConfig,
    ...feeConfig,
  });

  const mintReceipt = await publicClient.waitForTransactionReceipt({
    hash: mintTxHash,
  });

  const mintedPayload = await postTokenizationApi<
    InternalApiBaseResponse,
    { propertyId: string; txHash: `0x${string}` }
  >(INTERNAL_API_PATHS.PROPERTY_ONCHAIN_MINTED, {
    propertyId: input.propertyId,
    txHash: mintReceipt.transactionHash,
  });

  if (!mintedPayload?.status) {
    console.error("[TokenizationFlow] Failed to report minted", {
      status: mintedPayload?.statusCode,
      payload: mintedPayload,
    });
    throw new Error(mintedPayload?.message || "Failed to report minted");
  }

  console.log("[TokenizationFlow] minted API succeeded", {
    statusCode: mintedPayload?.statusCode,
    message: mintedPayload?.message,
    txHash: mintReceipt.transactionHash,
  });
  apiMessages.minted = mintedPayload?.message;

  console.log("[TokenizationFlow] token.mint confirmed", {
    status: mintReceipt.status,
    txHash: mintReceipt.transactionHash,
  });

  const compAddr = (await publicClient.readContract({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: "compliance",
  })) as `0x${string}`;

  const isBound = (await publicClient.readContract({
    address: compAddr,
    abi: MODULAR_COMPLIANCE_ABI,
    functionName: "isModuleBound",
    args: [vaultAddress],
  })) as boolean;

  console.log("[TokenizationFlow] compliance.isModuleBound(vault)", {
    compAddr,
    isBound,
  });

  let addModuleTxHash: `0x${string}` | undefined;
  if (!isBound) {
    addModuleTxHash = await walletClient.writeContract({
      address: compAddr,
      abi: MODULAR_COMPLIANCE_ABI,
      functionName: "addModule",
      args: [vaultAddress],
      account: activeAccount,
      chain: walletClient.chain,
      ...gasConfig,
      ...feeConfig,
    });

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: addModuleTxHash,
    });

    console.log("[TokenizationFlow] compliance.addModule confirmed", {
      status: receipt.status,
      txHash: receipt.transactionHash,
    });
  }

  const finalResult = {
    ...baseResult,
    tx: {
      ...baseResult.tx,
      unpause: unpauseTxHash,
      mint: mintTxHash,
      addModule: addModuleTxHash,
    },
  };

  console.log("[TokenizationFlow] Flow completed successfully", finalResult);
  return finalResult;
};
