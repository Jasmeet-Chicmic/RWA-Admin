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
  const tokenScale = BigInt(Math.pow(10, TOKEN_DECIMALS));
  const pricePerShare = (input.totalValue * tokenScale) / input.totalUnits;
  console.log("[TokenizationFlow] Computed deploy params", {
    salt,
    claimTopic: claimTopic.toString(),
    pricePerShare: pricePerShare.toString(),
    owner: activeAccount.address,
  });

  // 1) Deploy TREX suite
  onStepChange?.(TOKENIZATION_FLOW_STEPS.deployTrexSuite);
  console.log("[TokenizationFlow] Step 1/3 deployTREXSuite called");
  const gasConfig =
    walletClient.chain?.id === POLYGON_AMOY_CHAIN_ID
      ? { gas: AMOY_DEPLOY_TREX_SUITE_GAS_CAP }
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
  }
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

  const baseResult = {
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
    });

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: unpauseTxHash,
    });

    console.log("[TokenizationFlow] token.unpause confirmed", {
      status: receipt.status,
      txHash: receipt.transactionHash,
    });
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
  });

  const mintReceipt = await publicClient.waitForTransactionReceipt({
    hash: mintTxHash,
  });

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
