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

const MARKETPLACE_ADDRESS =
  "0x4f087f31e47F6EC53e3eAaE7Eb7234B7A459DfBA" as `0x${string}`;

const ID_ALICE_ADDRESS =
  "0x23d76b684d44d82272a0291A0eae847d8D788592" as `0x${string}`;
const ID_MARKETPLACE_ADDRESS =
  "0xD6E9089959ADac38D0aB2C4941D9FE1373A1e5d3" as `0x${string}`;
const ID_VAULT_ADDRESS =
  "0x24581FB4F28435dC2f400a3c290bf71a5d467BD1" as `0x${string}`;

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
        args: [userAddr, idAddr, 42n],

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
  console.log("vaultAddress", vaultAddress, ID_VAULT_ADDRESS);
  await ensureVerified({
    userKey: "Vault",
    userAddr: vaultAddress,
    idAddr: ID_VAULT_ADDRESS,
  });
  console.log(
    "MARKETPLACE_ADDRESS",
    MARKETPLACE_ADDRESS,
    ID_MARKETPLACE_ADDRESS,
  );
  await ensureVerified({
    userKey: "Marketplace",
    userAddr: MARKETPLACE_ADDRESS,
    idAddr: ID_MARKETPLACE_ADDRESS,
  });
  await ensureVerified({
    userKey: "Alice",
    userAddr: input.ownerAddress,
    idAddr: ID_ALICE_ADDRESS,
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
