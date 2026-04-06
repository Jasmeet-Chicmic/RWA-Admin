import { propertyOnchainService } from "@/services/property-onchain-service";
import { PublicClient, WalletClient } from "viem";
import { computeDeployParams } from "./computeDeployParams";
import { buildGasConfig } from "./gasConfig";
import { fetchJobStatus } from "./statusCheck";
import { runIdentityStep } from "./steps/identityStep";
import { runMintStep } from "./steps/mintStep";
import { runRegistryStep } from "./steps/registryStep";
import { runTrexStep } from "./steps/trexStep";
import { runVaultStep } from "./steps/vaultStep";
import {
  PROPERTY_REGISTRATION_JOB_STATUS,
  TOKENIZATION_FLOW_STEPS,
  type ActiveAccount,
  type JobStatusData,
  type RunTokenizationFlowInput,
  type TokenizationFlowResult,
  type TokenizationFlowStep,
} from "./types";

type RunTokenizationFlowParams = {
  walletClient: WalletClient;
  publicClient: PublicClient;
  input: RunTokenizationFlowInput;
  onStepChange?: (step: TokenizationFlowStep) => void;
};

type StartStep =
  | "initiate"
  | "trex"
  | "vault"
  | "registry"
  | "identity"
  | "mint"
  | "compliance";

const START_STEP_ORDER: Record<StartStep, number> = {
  initiate: 0,
  trex: 1,
  vault: 2,
  registry: 3,
  identity: 4,
  mint: 5,
  compliance: 6,
};

const getActiveAccount = (walletClient: WalletClient): ActiveAccount => {
  const account = walletClient.account;
  if (!account?.address) {
    throw new Error("Wallet account is not available");
  }
  return account;
};

const resolveStartStep = (statusData: JobStatusData | null): StartStep => {
  if (!statusData) return "initiate";

  if (statusData.status === PROPERTY_REGISTRATION_JOB_STATUS.PENDING_TREX) {
    return "initiate";
  }
  if (statusData.status === PROPERTY_REGISTRATION_JOB_STATUS.TREX_DEPLOYING) {
    return "trex";
  }
  if (statusData.status === PROPERTY_REGISTRATION_JOB_STATUS.VAULT_DEPLOYING) {
    return "vault";
  }
  if (statusData.status === PROPERTY_REGISTRATION_JOB_STATUS.REGISTERING) {
    return "registry";
  }
  if (statusData.status === PROPERTY_REGISTRATION_JOB_STATUS.KYC_VERIFYING) {
    return "identity";
  }
  if (
    statusData.status === PROPERTY_REGISTRATION_JOB_STATUS.UNPAUSING ||
    statusData.status === PROPERTY_REGISTRATION_JOB_STATUS.MINTING
  ) {
    return "mint";
  }
  if (
    statusData.status === PROPERTY_REGISTRATION_JOB_STATUS.COMPLIANCE_BINDING
  ) {
    return "compliance";
  }

  return "initiate";
};

const shouldRunStep = (
  startFrom: StartStep,
  step: Exclude<StartStep, "initiate">,
) => START_STEP_ORDER[startFrom] <= START_STEP_ORDER[step];

const buildInitiatePayload = ({
  propertyId,
  mintAmount,
  pricePerShare,
  riskScore,
}: {
  propertyId: string;
  mintAmount: number;
  pricePerShare: number;
  riskScore?: number;
}) => {
  const base = { propertyId, mintAmount, pricePerShare };
  if (
    typeof riskScore === "number" &&
    Number.isFinite(riskScore) &&
    riskScore >= 1 &&
    riskScore <= 10 &&
    Number.isInteger(riskScore)
  ) {
    return { ...base, riskScore };
  }
  return base;
};

const initiateTracking = async ({
  propertyId,
  mintAmount,
  pricePerShare,
  riskScore,
}: {
  propertyId: string;
  mintAmount: number;
  pricePerShare: number;
  riskScore?: number;
}) => {
  console.log("[TokenizationFlow] Initiating onchain tracking job");
  const payload = await propertyOnchainService.initiate(
    buildInitiatePayload({
      propertyId,
      mintAmount,
      pricePerShare,
      riskScore,
    }),
  );

  if (!payload?.status || !payload?.data?.jobId) {
    throw new Error(
      payload?.message || "Failed to initiate onchain property tracking job",
    );
  }
  console.log("[TokenizationFlow] Initiate API succeeded", {
    statusCode: payload?.statusCode,
    message: payload?.message,
  });
  return { jobId: payload.data.jobId, message: payload.message };
};

const ensureTrexSubmittedJobIsConfirmed = async ({
  publicClient,
  statusData,
  propertyId,
}: {
  publicClient: PublicClient;
  statusData: JobStatusData;
  propertyId: string;
}) => {
  if (!statusData.trexDeployTxHash) {
    throw new Error("Missing trexDeployTxHash while resuming TREX_DEPLOYING");
  }
  console.log("[TokenizationFlow] Resuming TREX_DEPLOYING with existing tx", {
    txHash: statusData.trexDeployTxHash,
  });
  const receipt = await publicClient.waitForTransactionReceipt({
    hash: statusData.trexDeployTxHash,
  });
  if (receipt.status !== "success") {
    throw new Error("Existing deployTREXSuite tx failed while resuming");
  }

  await propertyOnchainService.trexDeployed({
    propertyId,
    txHash: receipt.transactionHash,
  });
};

export const resumeTokenizationFlow = async ({
  walletClient,
  publicClient,
  input,
  onStepChange,
}: RunTokenizationFlowParams): Promise<TokenizationFlowResult> => {
  console.log("[TokenizationFlow] Starting flow", {
    input,
    chainId: walletClient.chain?.id,
  });

  const activeAccount = getActiveAccount(walletClient);
  if (input.totalUnits <= BigInt(0)) {
    throw new Error("Total units must be greater than 0");
  }

  const gasConfig = buildGasConfig(walletClient.chain?.id);
  const deployParams = computeDeployParams(input);
  console.log("[TokenizationFlow] Computed deploy params", {
    salt: deployParams.salt,
    claimTopic: deployParams.claimTopic.toString(),
    pricePerShare: deployParams.pricePerShare.toString(),
    owner: activeAccount.address,
  });

  let existingStatus = await fetchJobStatus(input.propertyId);
  if (existingStatus?.status === PROPERTY_REGISTRATION_JOB_STATUS.COMPLETED) {
    throw new Error("Property is already fully tokenized");
  }
  if (existingStatus?.status === PROPERTY_REGISTRATION_JOB_STATUS.FAILED) {
    console.warn(
      "[TokenizationFlow] Existing status is FAILED. Attempting resume from last known good step.",
      { propertyId: input.propertyId, status: existingStatus.status },
    );
  }

  let startFrom = resolveStartStep(existingStatus);
  let jobId = existingStatus?.jobId;
  let tokenAddress = existingStatus?.tokenAddress ?? undefined;
  let vaultAddress = existingStatus?.vaultAddress ?? undefined;
  const apiMessages: TokenizationFlowResult["apiMessages"] = {};
  let deployTREXSuiteTxHash: `0x${string}` | undefined =
    existingStatus?.trexDeployTxHash ?? undefined;
  let deployVaultTxHash: `0x${string}` | undefined =
    existingStatus?.vaultDeployTxHash ?? undefined;
  let registerPropertyTxHash: `0x${string}` | undefined =
    existingStatus?.registerPropertyTxHash ?? undefined;

  if (startFrom === "initiate") {
    const initiated = await initiateTracking({
      propertyId: input.propertyId,
      mintAmount: input.initiateMintAmount,
      pricePerShare: input.initiatePricePerShare,
      riskScore: input.riskScore,
    });
    jobId = initiated.jobId;
    apiMessages.initiate = initiated.message;
  } else if (!jobId) {
    const initiated = await initiateTracking({
      propertyId: input.propertyId,
      mintAmount: input.initiateMintAmount,
      pricePerShare: input.initiatePricePerShare,
      riskScore: input.riskScore,
    });
    jobId = initiated.jobId;
    apiMessages.initiate = initiated.message;
  }

  if (!jobId) {
    throw new Error("Missing jobId for tokenization flow");
  }

  if (startFrom === "trex" && existingStatus) {
    await ensureTrexSubmittedJobIsConfirmed({
      publicClient,
      statusData: existingStatus,
      propertyId: input.propertyId,
    });
    existingStatus = await fetchJobStatus(input.propertyId);
    tokenAddress = existingStatus?.tokenAddress ?? tokenAddress;
    deployTREXSuiteTxHash =
      existingStatus?.trexDeployTxHash ?? deployTREXSuiteTxHash;
    startFrom = "vault";
  }

  if (shouldRunStep(startFrom, "trex")) {
    onStepChange?.(TOKENIZATION_FLOW_STEPS.deployTrexSuite);
    const trexResult = await runTrexStep({
      walletClient,
      publicClient,
      activeAccount,
      gasConfig,
      input: {
        input,
        salt: deployParams.salt,
        claimTopic: deployParams.claimTopic,
        tokenSymbol: deployParams.tokenSymbol,
      },
    });
    tokenAddress = trexResult.tokenAddress;
    deployTREXSuiteTxHash = trexResult.txHash;
    apiMessages.trexDeployed = trexResult.apiMessage;
  }

  if (!tokenAddress) {
    throw new Error("Missing tokenAddress before vault step");
  }

  if (shouldRunStep(startFrom, "vault")) {
    onStepChange?.(TOKENIZATION_FLOW_STEPS.deployVault);
    const vaultResult = await runVaultStep({
      walletClient,
      publicClient,
      activeAccount,
      gasConfig,
      input: {
        input,
        tokenAddress,
        pricePerShare: deployParams.pricePerShare,
      },
    });
    vaultAddress = vaultResult.vaultAddress;
    deployVaultTxHash = vaultResult.txHash;
    apiMessages.vaultDeployed = vaultResult.apiMessage;
  }

  if (!vaultAddress) {
    throw new Error("Missing vaultAddress before registry step");
  }

  if (shouldRunStep(startFrom, "registry")) {
    onStepChange?.(TOKENIZATION_FLOW_STEPS.registerProperty);
    const registryResult = await runRegistryStep({
      walletClient,
      publicClient,
      activeAccount,
      gasConfig,
      input: { input, tokenAddress, vaultAddress },
    });
    registerPropertyTxHash = registryResult.txHash;
    apiMessages.propertyRegistered = registryResult.apiMessage;
  }

  if (shouldRunStep(startFrom, "identity")) {
    const identityResult = await runIdentityStep({
      walletClient,
      publicClient,
      activeAccount,
      gasConfig,
      input: { input, tokenAddress, vaultAddress },
    });
    apiMessages.kycDone = identityResult.apiMessage;
  }

  let unpauseTxHash: `0x${string}` | undefined;
  let mintTxHash: `0x${string}` | undefined =
    existingStatus?.mintTxHash ?? undefined;
  let addModuleTxHash: `0x${string}` | undefined;

  if (shouldRunStep(startFrom, "mint")) {
    const mintResult = await runMintStep({
      walletClient,
      publicClient,
      activeAccount,
      gasConfig,
      input: {
        input,
        tokenAddress,
        vaultAddress,
        skipMinting: false,
      },
    });
    unpauseTxHash = mintResult.unpauseTxHash;
    mintTxHash = mintResult.mintTxHash;
    addModuleTxHash = mintResult.addModuleTxHash;
    apiMessages.unpauseDone = mintResult.apiMessages.unpauseDone;
    apiMessages.minted = mintResult.apiMessages.minted;
    apiMessages.complianceBound = mintResult.apiMessages.complianceBound;
  }

  if (startFrom === "compliance") {
    const mintResult = await runMintStep({
      walletClient,
      publicClient,
      activeAccount,
      gasConfig,
      input: {
        input,
        tokenAddress,
        vaultAddress,
        skipMinting: true,
        existingMintTxHash: existingStatus?.mintTxHash ?? undefined,
        existingComplianceBoundTxHash:
          existingStatus?.complianceBoundTxHash ?? undefined,
        forceReportComplianceBound: true,
      },
    });
    mintTxHash = mintResult.mintTxHash;
    addModuleTxHash = mintResult.addModuleTxHash;
    apiMessages.complianceBound = mintResult.apiMessages.complianceBound;
  }

  if (
    !deployTREXSuiteTxHash ||
    !deployVaultTxHash ||
    !registerPropertyTxHash ||
    !mintTxHash
  ) {
    throw new Error("Tokenization flow did not produce required tx hashes");
  }

  const result: TokenizationFlowResult = {
    jobId,
    apiMessages,
    salt: deployParams.salt,
    tokenAddress,
    vaultAddress,
    tx: {
      deployTREXSuite: deployTREXSuiteTxHash,
      deployVault: deployVaultTxHash,
      registerProperty: registerPropertyTxHash,
      unpause: unpauseTxHash,
      mint: mintTxHash,
      addModule: addModuleTxHash,
    },
  };

  console.log("[TokenizationFlow] Flow completed successfully", result);
  return result;
};
