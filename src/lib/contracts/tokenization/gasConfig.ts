import type { GasConfig } from "./types";

const POLYGON_AMOY_CHAIN_ID = 80002;
const AMOY_DEPLOY_TREX_SUITE_GAS_CAP = BigInt(30000000);
const AMOY_MIN_PRIORITY_FEE_PER_GAS = BigInt(25000000000);
const AMOY_MIN_MAX_FEE_PER_GAS = BigInt(30000000000);

export const buildGasConfig = (chainId: number | undefined): GasConfig => {
  if (chainId !== POLYGON_AMOY_CHAIN_ID) {
    return {};
  }

  return {
    gas: AMOY_DEPLOY_TREX_SUITE_GAS_CAP,
    maxPriorityFeePerGas: AMOY_MIN_PRIORITY_FEE_PER_GAS,
    maxFeePerGas: AMOY_MIN_MAX_FEE_PER_GAS,
  };
};
