const toAddress = (value: string) => value as `0x${string}`;

const DEFAULT_TOKENIZATION_CONTRACTS = {
  trexFactory: toAddress("0x1bF1199343E76ef017D4Ae5d1c6d37f7B08C7F35"),
  vaultFactory: toAddress("0xe1b264D5d06F7a3F21d9Db8b5F99c154a8adBd2A"),
  registry: toAddress("0xB79a38247D66369fD9A5dF844Eac0fe94a88abd1"),
  usdc: toAddress("0xF39906465Ac54E2370c4a189Af83b143f99F7010"),
  claimIssuer: toAddress("0x443B2e65cA081616556746679866b455bc96281D"),
} as const;

export const TOKENIZATION_CONTRACTS = {
  trexFactory: toAddress(
    process.env.NEXT_PUBLIC_TREX_FACTORY_ADDRESS ??
      DEFAULT_TOKENIZATION_CONTRACTS.trexFactory,
  ),
  vaultFactory: toAddress(
    process.env.NEXT_PUBLIC_REAL_ESTATE_VAULT_FACTORY_ADDRESS ??
      DEFAULT_TOKENIZATION_CONTRACTS.vaultFactory,
  ),
  registry: toAddress(
    process.env.NEXT_PUBLIC_REAL_ESTATE_REGISTRY_ADDRESS ??
      DEFAULT_TOKENIZATION_CONTRACTS.registry,
  ),
  usdc: toAddress(
    process.env.NEXT_PUBLIC_USDC_TOKEN_ADDRESS ??
      DEFAULT_TOKENIZATION_CONTRACTS.usdc,
  ),
  claimIssuer: toAddress(
    process.env.NEXT_PUBLIC_CLAIM_ISSUER_ADDRESS ??
      DEFAULT_TOKENIZATION_CONTRACTS.claimIssuer,
  ),
} as const;

