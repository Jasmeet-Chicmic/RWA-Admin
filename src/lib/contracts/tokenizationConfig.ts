const toAddress = (value: string) => value as `0x${string}`;

const requireEnvAddress = (value: string | undefined, key: string) => {
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return toAddress(value);
};

export const TOKENIZATION_CONTRACTS = {
  trexFactory: requireEnvAddress(
    process.env.NEXT_PUBLIC_TREX_FACTORY_ADDRESS,
    "NEXT_PUBLIC_TREX_FACTORY_ADDRESS",
  ),
  vaultFactory: requireEnvAddress(
    process.env.NEXT_PUBLIC_REAL_ESTATE_VAULT_FACTORY_ADDRESS,
    "NEXT_PUBLIC_REAL_ESTATE_VAULT_FACTORY_ADDRESS",
  ),
  registry: requireEnvAddress(
    process.env.NEXT_PUBLIC_REAL_ESTATE_REGISTRY_ADDRESS,
    "NEXT_PUBLIC_REAL_ESTATE_REGISTRY_ADDRESS",
  ),
  marketplace: requireEnvAddress(
    process.env.NEXT_PUBLIC_REAL_ESTATE_MARKETPLACE_ADDRESS,
    "NEXT_PUBLIC_REAL_ESTATE_MARKETPLACE_ADDRESS",
  ),
  aliceIdentity: requireEnvAddress(
    process.env.NEXT_PUBLIC_ALICE_IDENTITY_ADDRESS,
    "NEXT_PUBLIC_ALICE_IDENTITY_ADDRESS",
  ),
  marketplaceIdentity: requireEnvAddress(
    process.env.NEXT_PUBLIC_MARKETPLACE_IDENTITY_ADDRESS,
    "NEXT_PUBLIC_MARKETPLACE_IDENTITY_ADDRESS",
  ),
  vaultIdentity: requireEnvAddress(
    process.env.NEXT_PUBLIC_VAULT_IDENTITY_ADDRESS,
    "NEXT_PUBLIC_VAULT_IDENTITY_ADDRESS",
  ),
  usdc: requireEnvAddress(
    process.env.NEXT_PUBLIC_USDC_TOKEN_ADDRESS,
    "NEXT_PUBLIC_USDC_TOKEN_ADDRESS",
  ),
  claimIssuer: requireEnvAddress(
    process.env.NEXT_PUBLIC_CLAIM_ISSUER_ADDRESS,
    "NEXT_PUBLIC_CLAIM_ISSUER_ADDRESS",
  ),
} as const;
