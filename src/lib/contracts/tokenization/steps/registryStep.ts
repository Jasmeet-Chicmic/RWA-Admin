import { PublicClient, WalletClient } from "viem";
import { REAL_ESTATE_REGISTRY_ABI } from "../../realEstateFlowAbi";
import { TOKENIZATION_CONTRACTS } from "../../tokenizationConfig";
import { INTERNAL_API_PATHS } from "@/shared/api";
import { postApiJson } from "@/shared/clientApi";
import type { InternalApiBaseResponse } from "@/shared/types/internalApi";
import type {
  ActiveAccount,
  GasConfig,
  RunTokenizationFlowInput,
} from "../types";

const TOKENIZATION_API_TIMEOUT_MS = 30000;

export type RegistryStepInput = {
  input: RunTokenizationFlowInput;
  tokenAddress: `0x${string}`;
  vaultAddress: `0x${string}`;
};

export type RegistryStepResult = {
  txHash: `0x${string}`;
  apiMessage?: string;
};

export const runRegistryStep = async ({
  walletClient,
  publicClient,
  activeAccount,
  gasConfig,
  input,
}: {
  walletClient: WalletClient;
  publicClient: PublicClient;
  activeAccount: ActiveAccount;
  gasConfig: GasConfig;
  input: RegistryStepInput;
}): Promise<RegistryStepResult> => {
  console.log("[TokenizationFlow] Step 3/3 registerProperty called");
  const txHash = await walletClient.writeContract({
    address: TOKENIZATION_CONTRACTS.registry,
    abi: REAL_ESTATE_REGISTRY_ABI,
    functionName: "registerProperty",
    args: [
      input.input.ownerAddress,
      input.input.ipfsUri,
      input.tokenAddress,
      input.vaultAddress,
    ],
    account: activeAccount,
    chain: walletClient.chain,
    ...gasConfig,
  });
  console.log("[TokenizationFlow] registerProperty tx submitted", { txHash });

  const receipt = await publicClient.waitForTransactionReceipt({
    hash: txHash,
  });
  console.log("[TokenizationFlow] registerProperty tx confirmed", {
    txHash: receipt.transactionHash,
    status: receipt.status,
  });
  if (receipt.status !== "success") {
    throw new Error("registerProperty tx failed");
  }

  const apiPayload = await postApiJson<
    InternalApiBaseResponse,
    { propertyId: string; txHash: `0x${string}` }
  >(
    INTERNAL_API_PATHS.PROPERTY_ONCHAIN_PROPERTY_REGISTERED,
    {
      propertyId: input.input.propertyId,
      txHash: receipt.transactionHash,
    },
    { timeoutMs: TOKENIZATION_API_TIMEOUT_MS },
  );

  if (!apiPayload?.status) {
    throw new Error(
      apiPayload?.message || "Failed to report property registration",
    );
  }
  console.log("[TokenizationFlow] property-registered API succeeded", {
    statusCode: apiPayload?.statusCode,
    message: apiPayload?.message,
    txHash: receipt.transactionHash,
  });

  return { txHash: receipt.transactionHash, apiMessage: apiPayload?.message };
};
