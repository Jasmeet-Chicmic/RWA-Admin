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

export type RunTokenizationFlowInput = {
  propertyId: string;
  propertyName: string;
  ownerAddress: `0x${string}`;
  ipfsUri: string;
  totalUnits: number;
  totalValue: number;
};

type RunTokenizationFlowParams = {
  walletClient: WalletClient;
  publicClient: PublicClient;
  input: RunTokenizationFlowInput;
};

const toTokenSymbol = (propertyId: string) =>
  `P${
    propertyId
      .replace(/[^A-Za-z0-9]/g, "")
      .slice(-6)
      .toUpperCase() || "RWA"
  }`;

export const runTokenizationFlow = async ({
  walletClient,
  publicClient,
  input,
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
  const pricePerShare = parseUnits(
    (input.totalValue / input.totalUnits).toFixed(6),
    6,
  );
  console.log("[TokenizationFlow] Computed deploy params", {
    salt,
    claimTopic: claimTopic.toString(),
    pricePerShare: pricePerShare.toString(),
    owner: activeAccount.address,
  });

  // 1) Deploy TREX suite
  console.log("[TokenizationFlow] Step 1/3 deployTREXSuite called");
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
  });
  console.log("[TokenizationFlow] deployVault tx submitted", {
    txHash: deployVaultHash,
  });

  await publicClient.waitForTransactionReceipt({ hash: deployVaultHash });
  console.log("[TokenizationFlow] deployVault tx confirmed", {
    txHash: deployVaultHash,
  });

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
  console.log("[TokenizationFlow] Step 3/3 registerProperty called");
  console.log("input.ownerAddress", input);
  const registerHash = await walletClient.writeContract({
    address: TOKENIZATION_CONTRACTS.registry,
    abi: REAL_ESTATE_REGISTRY_ABI,
    functionName: "registerProperty",
    args: [input.ownerAddress, input.ipfsUri, tokenAddress, vaultAddress],
    account: activeAccount,
    chain: walletClient.chain,
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

  const result = {
    salt,
    tokenAddress,
    vaultAddress,
    tx: {
      deployTREXSuite: deployTokenReceipt.transactionHash,
      deployVault: deployVaultHash,
      registerProperty: registerReceipt.transactionHash,
    },
  };
  console.log("[TokenizationFlow] Flow completed successfully", result);

  return result;
};
