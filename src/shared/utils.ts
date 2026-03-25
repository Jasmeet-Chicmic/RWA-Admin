// utils/sessionClient.ts

import clsx, { ClassValue } from "clsx";
import { format, formatDistanceToNow } from "date-fns";
import Payment from "payment";
import { twMerge } from "tailwind-merge";

import {
  BASE_URL,
  ENTITY_STATUS,
  STATUS_COLOR_MAP,
  ORGANIZATION_STATUS,
  ORGANIZATION_STATUS_COLOR_MAP,
  OrganizationStatusValue,
  TRANSACTION_SOURCE_TYPES,
  CURRENCY_PRECISION,
  APP_BASE_PATH,
  BILLING_CYCLE,
  CURRENCY_SYMBOLS,
} from "./constants";
import { DISPLAY_CURRENCY, formatToFixed } from "./utils/unitUtils";
import { PlanPrice } from "./types";

// Set session cookie by sending token to server
export async function createSessionClient(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${APP_BASE_PATH}/api/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    if (!res.ok) {
      const data = await res.json();
      console.error("Failed to create session:", data);
      return false;
    }

    return true;
  } catch (err) {
    console.error("❌ Error in createSessionClient:", err);
    return false;
  }
}

// Delete session cookie (logout)
export async function deleteSessionClient(): Promise<boolean> {
  try {
    const res = await fetch(`${APP_BASE_PATH}/api/session`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = await res.json();
      console.error("Failed to delete session:", data);
      return false;
    }

    return true;
  } catch (err) {
    console.error("❌ Error in deleteSessionClient:", err);
    return false;
  }
}
// Delete session cookie (logout)
export async function getSessionClient() {
  try {
    const res = await fetch(`${APP_BASE_PATH}/api/session`, {
      method: "GET",
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Failed to get session:", data);
      return data;
    }

    return data;
  } catch (err) {
    console.error("❌ Error in getSessionClient:", err);
    return err;
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function hexToRgb(hex: string): string {
  const sanitizedHex = hex.replace("#", "");
  const bigint = Number.parseInt(sanitizedHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r},${g},${b}`;
}

export const buildDisplayName = (
  fullName?: string | null,
  firstName?: string | null,
  lastName?: string | null,
): string => {
  if (fullName && fullName.trim().length > 0) {
    return fullName.trim();
  }

  const combined = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  return combined.length > 0 ? combined : "Unknown";
};

export const buildImageUrl = (src?: string | null): string => {
  if (!src) return "";

  // Absolute or root-relative URL – use as-is
  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("/")
  ) {
    return src;
  }

  // Relative path coming from backend (e.g. "ProfilePicture/xyz.jpg")
  const baseUrl =
    process.env.NEXT_PUBLIC_ASSETS_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";
  if (!baseUrl) {
    return src;
  }

  const normalizedBase = baseUrl.replace(/\/$/, "");
  const normalizedSrc = src.replace(/^\//, "");
  return `${normalizedBase}/${normalizedSrc}`;
};

export const getSafeText = (
  value: string | null | undefined,
  fallback: string = "-",
): string => {
  return value && value.trim().length > 0 ? value : fallback;
};

export const toQueryParams = <T>(params: T): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params as object).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  return `?${searchParams.toString()}`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<F extends (...args: any[]) => void>(
  func: F,
  wait: number,
): (...args: Parameters<F>) => void {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<F>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

export const getRelativeTime = (date: Date | string): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export function formatMsToReadableDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const parts = [];
  if (days) parts.push(`${days} days`);
  if (hours) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
  if (minutes) parts.push(`${minutes} minute${minutes > 1 ? "s" : ""}`);

  return parts.join(" ");
}

export const calculateTotal = ({
  cost = 0,
  quantity = 0,
  discount = 0,
  tax1Percentage = 0,
  tax2Percentage = 0,
}) => {
  if (cost === 0 || quantity === 0) return 0;
  const price = cost * quantity;
  const discountedPrice = price - price * (discount / 100);
  const tax1Price = discountedPrice * (tax1Percentage / 100);
  const tax2Price = discountedPrice * (tax2Percentage / 100);
  return discountedPrice + tax1Price + tax2Price;
};

// Format card number based on issuer
export const formatCardNumber = (value: string): string => {
  return value
    .replace(/\D/g, "")
    .replace(/(.{4})/g, "$1 ")
    .trim();
};

// Format expiry date
export const formatExpiry = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

// Format CVV
export const formatCVV = (value: string, cardNumber: string): string => {
  const digits = value.replace(/\D/g, "");
  const cardType = Payment.fns.cardType(cardNumber);
  const maxLength = cardType === "amex" ? 4 : 3;
  return digits.slice(0, maxLength);
};

// Get card issuer
export const getCardIssuer = (cardNumber: string): string | null => {
  const digits = cardNumber.replace(/\D/g, "");
  return Payment.fns.cardType(digits) ?? null;
};

export const formatNumberValue = (value: number): string => {
  if (value === 0) return "0";
  if (value < 0) return `-${formatNumberValue(-value)}`;
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};

export const getTransactionSourceDetails = (source: number): string => {
  switch (source) {
    case TRANSACTION_SOURCE_TYPES.WALLET:
      return "Wallet";
    case TRANSACTION_SOURCE_TYPES.BANK_TRANSFER:
      return "Bank Transfer";
    case TRANSACTION_SOURCE_TYPES.PAYPAL:
      return "PayPal";
    case TRANSACTION_SOURCE_TYPES.BANK_TRANSACTION:
      return "Bank Transaction";
    case TRANSACTION_SOURCE_TYPES.CARD:
      return "Card";
    default:
      return "";
  }
};

export const formatDate = (
  date: Date | string,
  showTime: boolean = true,
): string => {
  if (!date) return "";
  const formatPattern = showTime ? "MMM d, yyyy h:mm a" : "MMM d, yyyy";
  return format(new Date(date), formatPattern);
};

/**
 * Format a date string into a localized "MMM yyyy" format.
 * Returns the provided fallback (e.g. translated "N/A") if the date is empty or invalid.
 */
export const formatMonthYear = (
  dateString: string | null | undefined,
  fallback: string,
): string => {
  if (!dateString || dateString === "0001-01-01T00:00:00") {
    return fallback;
  }
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
    });
  } catch {
    return fallback;
  }
};

export const getNextDayDateString = (
  date: string | Date | null | undefined,
): string | undefined => {
  if (!date) return undefined;
  const fromDate = new Date(date);
  fromDate.setDate(fromDate.getDate() + 1);
  return fromDate.toISOString().split("T")[0];
};

export const truncateWords = (text: string, maxWords = 5): string => {
  if (!text) return "-";
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return `${words.slice(0, maxWords).join(" ")}...`;
};

/**
 * Truncates a string to a maximum length and appends ".." if truncated.
 * @param text - The string to truncate (null/undefined returns fallback)
 * @param maxLength - Maximum character length before truncation (default 50)
 * @param fallback - Value to return when text is empty (default "-")
 */
export const truncateText = (
  text: string | null | undefined,
  maxLength = 50,
  fallback = "-",
): string => {
  if (text == null || text === "") return fallback;
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength)}..`;
};

export const isValidUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export async function updateLocale(locale: string): Promise<boolean> {
  try {
    const res = await fetch(`${APP_BASE_PATH}/api/locale`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    });

    if (!res.ok) {
      const data = await res.json();
      console.error("Failed to update locale:", data);
      return false;
    }

    return true;
  } catch (err) {
    console.error("❌ Error in updateLocale:", err);
    return false;
  }
}

export async function getLocale(): Promise<string | null> {
  try {
    const res = await fetch(`${APP_BASE_PATH}/api/locale`, {
      method: "GET",
    });
    if (!res.ok) {
      const data = await res.json();
      console.error("Failed to get locale:", data);
      return null;
    }

    const data = await res.json();
    console.log(data, "res in getLocale");
    return data.locale || "en";
  } catch (err) {
    console.error("❌ Error in getLocale:", err);
    return null;
  }
}

export const getStatusColor = (status: ENTITY_STATUS): string => {
  return (
    STATUS_COLOR_MAP[status as ENTITY_STATUS] || "bg-gray-100 text-gray-800"
  );
};
export const getOrganizationStatusColor = (
  status: OrganizationStatusValue,
): string => {
  return ORGANIZATION_STATUS_COLOR_MAP[status] || "bg-gray-100 text-gray-800";
};
export const walletTruncate = (
  address: string,
  startLength = 6,
  endLength = 4,
) => {
  if (!address) return "";
  if (address.length <= startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

/**
 * Format a number into a compact currency format (K, M, B, T)
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @param showSign - Whether to show + for positive numbers (default: false)
 * @returns Formatted string like "1.5K", "2.3M", "1.2B", "3.4T"
 */
export const formatCurrency = (
  value: number,
  decimals: number = 2,
  showSign: boolean = false,
): string => {
  if (value === 0) return `0 ${DISPLAY_CURRENCY}`;

  const isNegative = value < 0;
  const absValue = Math.abs(value);

  const suffixes = [
    { threshold: 1e12, suffix: "T" }, // Trillion
    { threshold: 1e9, suffix: "B" }, // Billion
    { threshold: 1e6, suffix: "M" }, // Million
    { threshold: 1e3, suffix: "K" }, // Thousand
  ];

  let formattedValue = "";

  for (const { threshold, suffix } of suffixes) {
    if (absValue >= threshold) {
      const scaled = absValue / threshold;
      formattedValue = `${formatToFixed(scaled, decimals)}${suffix}`;
      break;
    }
  }

  // If no suffix applied, just format normally
  if (!formattedValue) {
    formattedValue = formatToFixed(absValue, decimals);
  }

  // Add sign
  if (isNegative) {
    return `-${formattedValue} ${DISPLAY_CURRENCY}`;
  } else if (showSign && value > 0) {
    return `+${formattedValue} ${DISPLAY_CURRENCY}`;
  }

  return `${formattedValue} ${DISPLAY_CURRENCY}`;
};

/**
 * Format currency with full precision for smaller values, compact for larger
 * @param value - The number to format
 * @param compactThreshold - Value above which to use compact format (default: 10000)
 * @param decimals - Number of decimal places (default: 2)
 */
export const formatCurrencyAuto = (
  value: number,
  compactThreshold: number = 10000,
  decimals: number = 2,
): string => {
  const absValue = Math.abs(value);

  if (absValue >= compactThreshold) {
    return formatCurrency(value, decimals);
  }

  // For smaller values, show full number with locale formatting
  return (
    value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }) + ` ${DISPLAY_CURRENCY}`
  );
};

/**
 * Helper function to create sortable table columns with consistent configuration
 * @param field - The field key from the data type
 * @param title - The column title to display
 * @param render - Function to render the cell content
 * @param sortKey - Optional custom sort key (defaults to field name)
 * @returns TableColumn configuration object
 */
export const createSortableColumn = <T>(
  field: keyof T,
  title: string,
  render: (item: T) => React.ReactNode,
  sortKey?: string,
): {
  field: keyof T;
  title: string;
  render: (item: T) => React.ReactNode;
  sortable: boolean;
  sortKey: string;
} => ({
  field,
  title,
  render,
  sortable: true,
  sortKey: sortKey || (field as string),
});

/**
 * Builds a complete image URL from a path string
 * @param path - The image path (can be a relative path, full URL, or blob URL)
 * @returns The complete image URL, or empty string if path is empty
 * @example
 * getImageUrl("uploads/image.jpg") // "https://api.example.com/uploads/image.jpg"
 * getImageUrl("http://example.com/image.jpg") // "http://example.com/image.jpg"
 * getImageUrl("blob:http://localhost:3000/abc123") // "blob:http://localhost:3000/abc123"
 */
export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) return "";
  if (path.startsWith("blob:") || path.startsWith("http")) return path;
  const baseUrl = BASE_URL?.replace(/\/$/, "") || "";
  const encodedPath = encodeURI(path);
  return `${baseUrl}/${encodedPath}`;
};

/**
 * Get the number of decimal places in a value
 * @param value - The value to check (string or number)
 * @returns Number of decimal places
 */
export const getDecimalPlaces = (value: string | number): number => {
  const strValue = String(value);
  if (!strValue.includes(".")) return 0;
  return strValue.split(".")[1]?.length || 0;
};

/**
 * Truncate a value to the allowed decimal places for a currency
 * @param value - The value to truncate
 * @param currency - The currency type (from CURRENCY_TYPE enum)
 * @returns The truncated value as a string
 */
export const truncateToCurrencyPrecision = (
  value: string | number,
  currency: number,
): string => {
  const precision =
    CURRENCY_PRECISION[currency as keyof typeof CURRENCY_PRECISION];
  if (precision === undefined) return String(value);

  const strValue = String(value);
  if (!strValue.includes(".")) return strValue;

  const [integerPart, decimalPart] = strValue.split(".");
  const truncatedDecimal = decimalPart.slice(0, precision);
  return truncatedDecimal ? `${integerPart}.${truncatedDecimal}` : integerPart;
};

/**
 * Get the step value for a number input based on currency precision
 * @param currency - The currency type (from CURRENCY_TYPE enum)
 * @returns The step value as a string (e.g., "0.00000001" for 8 decimals)
 */
export const getCurrencyStep = (currency: number): string => {
  const precision =
    CURRENCY_PRECISION[currency as keyof typeof CURRENCY_PRECISION];
  if (precision === undefined || precision === 0) return "1";
  return `0.${"0".repeat(precision - 1)}1`;
};

export const truncateToDecimalPlaces = (
  value: string | number,
  decimalPlaces: number,
): string => {
  const strValue = String(value);
  if (!strValue.includes(".")) return strValue;

  const [integerPart, decimalPart] = strValue.split(".");
  const truncatedDecimal = decimalPart.slice(0, decimalPlaces);
  return truncatedDecimal ? `${integerPart}.${truncatedDecimal}` : integerPart;
};

export const formatPrice = (price: PlanPrice) => {
  const symbol = getCurrencySymbol(price.currency);
  const cycleLabel =
    price.billingCycle === BILLING_CYCLE.YEARLY ? "/year" : "/month";
  const amount =
    price.price % 1 === 0 ? String(price.price) : formatToFixed(price.price, 2);
  return { amount: symbol + amount, cycle: cycleLabel };
};

/**
 * Get the currency symbol for a given currency code
 * Falls back to '$' if the currency code is not recognized
 */
export const getCurrencySymbol = (currencyCode: string): string => {
  return CURRENCY_SYMBOLS[currencyCode] || DISPLAY_CURRENCY;
};

/**
 * Normalize rich-text HTML coming from the backend.
 * Currently replaces non-breaking spaces with regular spaces so
 * text can wrap naturally.
 */
export const normalizeHtml = (html: string | null | undefined): string => {
  if (!html) return "";
  return html.replace(/&nbsp;/g, " ");
};

/**
 * Strips HTML tags from a string.
 * Also decodes common HTML entities like &nbsp; and &#39;
 */
export const stripHtmlTags = (html: string | null | undefined): string => {
  if (!html) return "";
  // Step 1: Remove all HTML tags
  let text = html.replace(/<[^>]*>/g, "");
  // Step 2: Replace common entities
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
  return text.trim();
};

/**
 * Trust score color classes based on score thresholds.
 */
export const TRUST_SCORE_COLORS = {
  HIGH: "text-green-600 dark:text-green-400",
  MEDIUM: "text-yellow-600 dark:text-yellow-400",
  LOW: "text-red-600 dark:text-red-400",
} as const;

/**
 * Returns the appropriate color class for a trust score (0–1).
 */
export const getTrustScoreColor = (score: number): string => {
  if (score >= 0.7) return TRUST_SCORE_COLORS.HIGH;
  if (score >= 0.4) return TRUST_SCORE_COLORS.MEDIUM;
  return TRUST_SCORE_COLORS.LOW;
};

/**
 * Formats a trust score (0–1) as a percentage string (e.g. 0.85 → "85%").
 */
export const formatTrustScore = (score: number): string =>
  `${Math.round(score * 100)}%`;
