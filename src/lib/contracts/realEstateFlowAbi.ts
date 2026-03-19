export const REAL_ESTATE_VAULT_FACTORY_ABI = [
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "address", name: "paymentToken", type: "address" },
      { internalType: "uint256", name: "pricePerShare", type: "uint256" },
      { internalType: "address", name: "owner", type: "address" },
    ],
    name: "deployVault",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "vaults",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const REAL_ESTATE_REGISTRY_ABI = [
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "string", name: "propertyUri", type: "string" },
      { internalType: "address", name: "tokenAddress", type: "address" },
      { internalType: "address", name: "vaultAddress", type: "address" },
    ],
    name: "registerProperty",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
