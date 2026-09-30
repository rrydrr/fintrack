/**
 * Formatting utilities for numbers and currencies.
 */

export interface CurrencyFormatOptions {
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Format a number as currency (defaults to IDR with Indonesian locale or USD fallback).
 */
export function formatCurrency(
  amount: number,
  options?: CurrencyFormatOptions
): string {
  const currency = options?.currency || "IDR";
  const locale = options?.locale || (currency === "IDR" ? "id-ID" : "en-US");
  const fractionDigits =
    options?.minimumFractionDigits !== undefined
      ? options.minimumFractionDigits
      : currency === "IDR"
      ? 0
      : 2;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: options?.maximumFractionDigits ?? fractionDigits,
  }).format(amount);
}

/**
 * Format standard number with decimal separators.
 */
export function formatNumber(
  value: number,
  locale: string = "id-ID",
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Format compact numbers (e.g. 1.5K, 2.3M, 1.2B).
 */
export function formatCompactNumber(
  value: number,
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    compactDisplay: "short",
  }).format(value);
}
