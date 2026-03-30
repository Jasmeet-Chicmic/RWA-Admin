import { propertyOnchainService } from "@/services/property-onchain-service";
import { PublicClient, WalletClient } from "viem";
import { TOKENIZATION_CONTRACTS } from "../../tokenizationConfig";
import { IDENTITY_REGISTRY_ABI, TOKEN_ABI } from "../abis";
import type {
  ActiveAccount,
  GasConfig,
  RunTokenizationFlowInput,
} from "../types";

export type IdentityStepInput = {
  input: RunTokenizationFlowInput;
  tokenAddress: `0x${string}`;
  vaultAddress: `0x${string}`;
};

export type IdentityStepResult = {
  txHashes: `0x${string}`[];
  apiMessage?: string;
};

export const runIdentityStep = async ({
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
  input: IdentityStepInput;
}): Promise<IdentityStepResult> => {
  console.log(
    "[TokenizationFlow] Step 4/5 identity registration & verification",
  );
  const tokenIdentityRegistry = (await publicClient.readContract({
    address: input.tokenAddress,
    abi: TOKEN_ABI,
    functionName: "identityRegistry",
  })) as `0x${string}`;
  console.log("[TokenizationFlow] Token.identityRegistry()", {
    tokenIdentityRegistry,
  });

  const txHashes: `0x${string}`[] = [];
  let apiMessage: string | undefined;

  const ensureVerified = async ({
    userKey,
    userAddr,
    idAddr,
  }: {
    userKey: string;
    userAddr: `0x${string}`;
    idAddr: `0x${string}` | undefined;
  }) => {
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
        ...gasConfig,
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
      if (receipt.status !== "success") {
        throw new Error(
          `[TokenizationFlow] registerIdentity failed for ${userKey}`,
        );
      }

      txHashes.push(receipt.transactionHash);
      const kycDonePayload = await propertyOnchainService.kycDone({
        propertyId: input.input.propertyId,
        txHash: receipt.transactionHash,
      });

      if (!kycDonePayload?.status) {
        throw new Error(kycDonePayload?.message || "Failed to report kyc done");
      }
      console.log("[TokenizationFlow] kyc-done API succeeded", {
        statusCode: kycDonePayload?.statusCode,
        message: kycDonePayload?.message,
        txHash: receipt.transactionHash,
        userKey,
      });
      apiMessage = kycDonePayload?.message;
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

  await ensureVerified({
    userKey: "Vault",
    userAddr: input.vaultAddress,
    idAddr: TOKENIZATION_CONTRACTS.vaultIdentity,
  });
  await ensureVerified({
    userKey: "Marketplace",
    userAddr: TOKENIZATION_CONTRACTS.marketplace,
    idAddr: TOKENIZATION_CONTRACTS.marketplaceIdentity,
  });
  await ensureVerified({
    userKey: "Alice",
    userAddr: input.input.ownerAddress,
    idAddr: TOKENIZATION_CONTRACTS.aliceIdentity,
  });

  return { txHashes, apiMessage };
};
