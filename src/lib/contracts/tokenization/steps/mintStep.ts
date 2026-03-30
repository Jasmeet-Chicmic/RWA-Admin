import { propertyOnchainService } from "@/services/property-onchain-service";
import { PublicClient, WalletClient, parseUnits } from "viem";
import { MODULAR_COMPLIANCE_ABI, TOKEN_ABI } from "../abis";
import type {
  ActiveAccount,
  GasConfig,
  RunTokenizationFlowInput,
} from "../types";

export type MintStepInput = {
  input: RunTokenizationFlowInput;
  tokenAddress: `0x${string}`;
  vaultAddress: `0x${string}`;
  skipMinting?: boolean;
  existingMintTxHash?: `0x${string}`;
};

export type MintStepResult = {
  unpauseTxHash?: `0x${string}`;
  mintTxHash: `0x${string}`;
  addModuleTxHash?: `0x${string}`;
  apiMessages: {
    unpauseDone?: string;
    minted?: string;
    complianceBound?: string;
  };
};

export const runMintStep = async ({
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
  input: MintStepInput;
}): Promise<MintStepResult> => {
  console.log("[TokenizationFlow] Step 5/5 minting & compliance binding");
  const apiMessages: {
    unpauseDone?: string;
    minted?: string;
    complianceBound?: string;
  } = {};

  let unpauseTxHash: `0x${string}` | undefined;
  let mintTxHash: `0x${string}` | undefined = input.existingMintTxHash;

  if (!input.skipMinting) {
    const isPaused = (await publicClient.readContract({
      address: input.tokenAddress,
      abi: TOKEN_ABI,
      functionName: "paused",
    })) as boolean;
    console.log("[TokenizationFlow] token.paused()", { isPaused });

    if (isPaused) {
      unpauseTxHash = await walletClient.writeContract({
        address: input.tokenAddress,
        abi: TOKEN_ABI,
        functionName: "unpause",
        account: activeAccount,
        chain: walletClient.chain,
        gas: BigInt(800000),
        ...gasConfig,
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: unpauseTxHash,
      });
      console.log("[TokenizationFlow] token.unpause confirmed", {
        status: receipt.status,
        txHash: receipt.transactionHash,
      });
      if (receipt.status !== "success") {
        throw new Error("token.unpause tx failed");
      }

      const unpauseDonePayload = await propertyOnchainService.unpauseDone({
        propertyId: input.input.propertyId,
        txHash: receipt.transactionHash,
      });
      if (!unpauseDonePayload?.status) {
        throw new Error(
          unpauseDonePayload?.message || "Failed to report unpause done",
        );
      }
      apiMessages.unpauseDone = unpauseDonePayload?.message;
    }

    const mintAmount = parseUnits(String(input.input.totalUnits), 6);
    console.log("[TokenizationFlow] token.mint", {
      amount: mintAmount.toString(),
      to: input.vaultAddress,
    });
    const submittedMintTxHash = await walletClient.writeContract({
      address: input.tokenAddress,
      abi: TOKEN_ABI,
      functionName: "mint",
      args: [input.vaultAddress, mintAmount],
      account: activeAccount,
      chain: walletClient.chain,
      ...gasConfig,
    });
    const mintReceipt = await publicClient.waitForTransactionReceipt({
      hash: submittedMintTxHash,
    });
    if (mintReceipt.status !== "success") {
      throw new Error("token.mint tx failed");
    }

    const mintedPayload = await propertyOnchainService.minted({
      propertyId: input.input.propertyId,
      txHash: mintReceipt.transactionHash,
    });
    if (!mintedPayload?.status) {
      throw new Error(mintedPayload?.message || "Failed to report minted");
    }
    apiMessages.minted = mintedPayload?.message;
    console.log("[TokenizationFlow] token.mint confirmed", {
      status: mintReceipt.status,
      txHash: mintReceipt.transactionHash,
    });

    mintTxHash = mintReceipt.transactionHash;
  }

  const compAddr = (await publicClient.readContract({
    address: input.tokenAddress,
    abi: TOKEN_ABI,
    functionName: "compliance",
  })) as `0x${string}`;

  const isBound = (await publicClient.readContract({
    address: compAddr,
    abi: MODULAR_COMPLIANCE_ABI,
    functionName: "isModuleBound",
    args: [input.vaultAddress],
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
      args: [input.vaultAddress],
      account: activeAccount,
      chain: walletClient.chain,
      ...gasConfig,
    });

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: addModuleTxHash,
    });
    console.log("[TokenizationFlow] compliance.addModule confirmed", {
      status: receipt.status,
      txHash: receipt.transactionHash,
    });
    if (receipt.status !== "success") {
      throw new Error("compliance.addModule tx failed");
    }

    const complianceBoundPayload = await propertyOnchainService.complianceBound(
      {
        propertyId: input.input.propertyId,
        txHash: receipt.transactionHash,
      },
    );
    if (!complianceBoundPayload?.status) {
      throw new Error(
        complianceBoundPayload?.message || "Failed to report compliance bound",
      );
    }
    console.log("[TokenizationFlow] compliance-bound API succeeded", {
      statusCode: complianceBoundPayload?.statusCode,
      message: complianceBoundPayload?.message,
      txHash: receipt.transactionHash,
    });
    apiMessages.complianceBound = complianceBoundPayload?.message;
  }

  if (!mintTxHash) {
    throw new Error("Missing mint tx hash before compliance binding");
  }

  return {
    unpauseTxHash,
    mintTxHash,
    addModuleTxHash,
    apiMessages,
  };
};
