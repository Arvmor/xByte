import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a file size in bytes to a human readable format
 * @param bytes - The file size in bytes
 * @returns The file size in a human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Formats an amount in a human readable format
 * @param amount - The amount to format
 * @param decimals - The number of decimals to format the amount to
 * @returns The amount in a human readable format
 */
export function formatAmount(amount: number | string, decimals: number = 18) {
  const amountNumber = typeof amount === "string" ? parseFloat(amount) : amount;
  const powers = Math.pow(10, decimals);
  return amountNumber * powers;
};