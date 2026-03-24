import { PublicClient, WalletClient, zeroAddress } from "viem";
import { REAL_ESTATE_VAULT_FACTORY_ABI } from "../../realEstateFlowAbi";
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

export type VaultStepInput = {
  input: RunTokenizationFlowInput;
  tokenAddress: `0x${string}`;
  pricePerShare: bigint;
};

export type VaultStepResult = {
  vaultAddress: `0x${string}`;
  txHash: `0x${string}`;
  apiMessage?: string;
};

export const runVaultStep = async ({
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
  input: VaultStepInput;
}): Promise<VaultStepResult> => {
  console.log("[TokenizationFlow] Step 2/3 deployVault called");
  const txHash = await walletClient.writeContract({
    address: TOKENIZATION_CONTRACTS.vaultFactory,
    abi: REAL_ESTATE_VAULT_FACTORY_ABI,
    functionName: "deployVault",
    args: [
      input.tokenAddress,
      TOKENIZATION_CONTRACTS.usdc,
      input.pricePerShare,
      input.input.ownerAddress,
    ],
    account: activeAccount,
    chain: walletClient.chain,
    ...gasConfig,
  });
  console.log("[TokenizationFlow] deployVault tx submitted", { txHash });

  const receipt = await publicClient.waitForTransactionReceipt({
    hash: txHash,
  });
  console.log("[TokenizationFlow] deployVault tx confirmed", {
    txHash: receipt.transactionHash,
    status: receipt.status,
  });
  if (receipt.status !== "success") {
    throw new Error("deployVault tx failed");
  }

  const apiPayload = await postApiJson<
    InternalApiBaseResponse,
    { propertyId: string; txHash: `0x${string}` }
  >(
    INTERNAL_API_PATHS.PROPERTY_ONCHAIN_VAULT_DEPLOYED,
    {
      propertyId: input.input.propertyId,
      txHash: receipt.transactionHash,
    },
    { timeoutMs: TOKENIZATION_API_TIMEOUT_MS },
  );

  if (!apiPayload?.status) {
    throw new Error(apiPayload?.message || "Failed to report vault deployment");
  }
  console.log("[TokenizationFlow] vault-deployed API succeeded", {
    statusCode: apiPayload?.statusCode,
    message: apiPayload?.message,
    txHash: receipt.transactionHash,
  });

  const vaultAddress = (await publicClient.readContract({
    address: TOKENIZATION_CONTRACTS.vaultFactory,
    abi: REAL_ESTATE_VAULT_FACTORY_ABI,
    functionName: "vaults",
    args: [input.tokenAddress],
  })) as `0x${string}`;
  console.log("[TokenizationFlow] Vault fetched from factory", {
    vaultAddress,
  });

  if (!vaultAddress || vaultAddress === zeroAddress) {
    throw new Error("Vault address not found after vault deployment");
  }

  return {
    vaultAddress,
    txHash: receipt.transactionHash,
    apiMessage: apiPayload?.message,
  };
};
