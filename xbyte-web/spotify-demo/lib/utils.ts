import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
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
}

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
}

/**
 * Formats a balance from a number of decimals to a human readable format
 * @param balance - The balance to format
 * @param decimals - The number of decimals to format the balance to
 * @returns The balance in a human readable format
 */
export function formatFromDecimals(balance: bigint, decimals: bigint): string {
    const divisor = 10n ** decimals;
    const whole = balance / divisor;
    const fractional = balance % divisor;

    if (fractional === 0n) {
        return whole.toString();
    }

    const fractionalStr = fractional.toString().padStart(6, "0");
    const trimmed = fractionalStr.replace(/0+$/, "");

    return trimmed ? `${whole}.${trimmed}` : whole.toString();
}
