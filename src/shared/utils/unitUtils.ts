import { formatUnits, parseUnits } from "viem";

export const DEFAULT_TOKEN_DECIMALS = 6;
export const DISPLAY_CURRENCY = "USDC";

type UnitInput = number | string | bigint | null | undefined;

export const formatToFixed = (
  value: number | string,
  decimals: number,
): string => {
  const num = typeof value === "string" ? Number.parseFloat(value) : value;
  if (Number.isNaN(num)) return value.toString();
  if (Number.isInteger(num)) return num.toString();
  if (decimals <= 0) return Math.trunc(num).toString();
  const fixed = num.toFixed(decimals);
  const trimmed = fixed.replace(/\.?0+$/, "");
  return trimmed.includes(".") ? trimmed : fixed;
};

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

export const formatDisplayCurrency = (
  value: number,
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  },
) => {
  const { minimumFractionDigits = 0, maximumFractionDigits = 2 } =
    options ?? {};
  const normalizedValue = Number.isFinite(value) ? value : 0;
  const formatted = formatToFixed(normalizedValue, maximumFractionDigits);
  const withMinFractionDigits =
    minimumFractionDigits > 0 && !formatted.includes(".")
      ? `${formatted}.${"0".repeat(minimumFractionDigits)}`
      : formatted;

  return `${withMinFractionDigits} ${DISPLAY_CURRENCY}`;
};
