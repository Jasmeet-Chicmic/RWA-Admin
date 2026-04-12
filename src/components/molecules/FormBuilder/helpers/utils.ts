import type { KeyboardEvent } from "react";

export function stripAsciiDigits(value: string): string {
  return value.replace(/[0-9]/g, "");
}

/** Blocks typing 0–9; paste is handled via `interceptor: stripAsciiDigits`. */
export function preventDigitKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
  if (e.nativeEvent.isComposing) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (/^[0-9]$/.test(e.key)) {
    e.preventDefault();
  }
}

/** YYYY-MM-DD in local timezone for HTML date inputs and comparisons */
export function getLocalDateYYYYMMDD(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const getRequiredFieldMessage = (
  fieldName: string,
  t?: (key: string, values?: Record<string, string>) => string,
) => {
  if (t) {
    return t("fieldIsRequired", { field: fieldName });
  }
  return `${fieldName} is required`;
};
