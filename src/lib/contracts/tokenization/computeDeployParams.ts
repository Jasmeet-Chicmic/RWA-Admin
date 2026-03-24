import { keccak256, stringToBytes } from "viem";
import { toBaseUnitsBigInt } from "@/shared/utils/unitUtils";
import type { RunTokenizationFlowInput } from "./types";

const TOKEN_DECIMALS = 6;

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
  const tokenScale = toBaseUnitsBigInt(1, TOKEN_DECIMALS);
  const pricePerShare = (input.totalValue * tokenScale) / input.totalUnits;

  return {
    salt,
    claimTopic,
    pricePerShare,
    tokenSymbol: toTokenSymbol(input.propertyId),
  };
};
