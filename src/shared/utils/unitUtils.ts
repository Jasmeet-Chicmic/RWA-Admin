import { formatUnits, parseUnits } from "viem";

export const DEFAULT_TOKEN_DECIMALS = 6;

type UnitInput = number | string | bigint | null | undefined;

export const toBaseBigInt = (value: UnitInput) => {
  if (value === null || value === undefined) return BigInt(0);
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(Math.trunc(value));
  const trimmed = value.trim();
  if (!trimmed) return BigInt(0);
  return BigInt(trimmed);
};

export const toBaseUnitsBigInt = (
  value: number | string,
  decimals = DEFAULT_TOKEN_DECIMALS,
) => parseUnits(String(value), decimals);

export const toBaseUnits = (
  value: number | string,
  decimals = DEFAULT_TOKEN_DECIMALS,
) => Number(toBaseUnitsBigInt(value, decimals));

export const fromBaseUnits = (
  value: UnitInput,
  decimals = DEFAULT_TOKEN_DECIMALS,
) => Number(formatUnits(toBaseBigInt(value), decimals));
