import { keccak256, stringToBytes } from "viem";
import type { RunTokenizationFlowInput } from "./types";

const toTokenSymbol = (propertyId: string) =>
  `P${
    propertyId
      .replace(/[^A-Za-z0-9]/g, "")
      .slice(-6)
      .toUpperCase() || "RWA"
  }`;

export const computeDeployParams = (input: RunTokenizationFlowInput) => {
  const salt = `${input.propertyId}-${Date.now()}`;
  const claimTopic = BigInt(keccak256(stringToBytes("KYC_CLAIM")));
  // `totalValue` is already expressed in 10^6 units (USDC base units),
  // so dividing by whole-share `totalUnits` keeps pricePerShare in 10^6 scale.
  const pricePerShare = input.totalValue / input.totalUnits;

  return {
    salt,
    claimTopic,
    pricePerShare,
    tokenSymbol: toTokenSymbol(input.propertyId),
  };
};
