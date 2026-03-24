import { PublicClient, WalletClient, zeroAddress } from "viem";
import { TREX_FACTORY_ABI } from "../../trexFactoryAbi";
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

export type TrexStepInput = {
  input: RunTokenizationFlowInput;
  salt: string;
  claimTopic: bigint;
  tokenSymbol: string;
};

export type TrexStepResult = {
  tokenAddress: `0x${string}`;
  txHash: `0x${string}`;
  apiMessage?: string;
};

export const runTrexStep = async ({
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
  input: TrexStepInput;
}): Promise<TrexStepResult> => {
  console.log("[TokenizationFlow] Step 1/3 deployTREXSuite called");
  const txHash = await walletClient.writeContract({
    address: TOKENIZATION_CONTRACTS.trexFactory,
    abi: TREX_FACTORY_ABI,
    functionName: "deployTREXSuite",
    args: [
      input.salt,
      {
        owner: activeAccount.address,
        name: input.input.propertyName,
        symbol: input.tokenSymbol,
        decimals: 6,
        irs: zeroAddress,
        ONCHAINID: zeroAddress,
        irAgents: [activeAccount.address],
        tokenAgents: [activeAccount.address],
        complianceModules: [],
        complianceSettings: [],
      },
      {
        claimTopics: [input.claimTopic],
        issuers: [TOKENIZATION_CONTRACTS.claimIssuer],
        issuerClaims: [[input.claimTopic]],
      },
    ],
    account: activeAccount,
    chain: walletClient.chain,
    ...gasConfig,
  });
  console.log("[TokenizationFlow] deployTREXSuite tx submitted", { txHash });

  const receipt = await publicClient.waitForTransactionReceipt({
    hash: txHash,
  });
  console.log("[TokenizationFlow] deployTREXSuite tx confirmed", {
    txHash: receipt.transactionHash,
    status: receipt.status,
  });
  if (receipt.status !== "success") {
    throw new Error("deployTREXSuite tx failed");
  }

  const apiPayload = await postApiJson<
    InternalApiBaseResponse,
    { propertyId: string; txHash: `0x${string}` }
  >(
    INTERNAL_API_PATHS.PROPERTY_ONCHAIN_TREX_DEPLOYED,
    {
      propertyId: input.input.propertyId,
      txHash: receipt.transactionHash,
    },
    { timeoutMs: TOKENIZATION_API_TIMEOUT_MS },
  );

  if (!apiPayload?.status) {
    throw new Error(apiPayload?.message || "Failed to report trex deployment");
  }
  console.log("[TokenizationFlow] trex-deployed API succeeded", {
    statusCode: apiPayload?.statusCode,
    message: apiPayload?.message,
    txHash: receipt.transactionHash,
  });

  const tokenAddress = (await publicClient.readContract({
    address: TOKENIZATION_CONTRACTS.trexFactory,
    abi: TREX_FACTORY_ABI,
    functionName: "getToken",
    args: [input.salt],
  })) as `0x${string}`;
  console.log("[TokenizationFlow] Token fetched from factory", {
    tokenAddress,
  });

  if (!tokenAddress || tokenAddress === zeroAddress) {
    throw new Error("Token address not found after TREX suite deployment");
  }

  return {
    tokenAddress,
    txHash: receipt.transactionHash,
    apiMessage: apiPayload?.message,
  };
};
