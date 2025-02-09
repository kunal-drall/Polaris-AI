import { BigNumberish } from "ethers";

/**
 * Formats token balance with proper decimal places
 * @param balance - Raw balance as string or BigNumberish
 * @param decimals - Number of decimal places
 * @returns Formatted balance string
 */
export function formatTokenBalance(balance: BigNumberish, decimals: number): string {
  const rawBalance = BigInt(balance.toString());
  const divisor = BigInt(10) ** BigInt(decimals);
  const integerPart = rawBalance / divisor;
  const fractionalPart = rawBalance % divisor;
  
  let formatted = integerPart.toString();
  if (fractionalPart > BigInt(0)) {
    let fractional = fractionalPart.toString().padStart(decimals, '0');
    // Remove trailing zeros
    fractional = fractional.replace(/0+$/, '');
    if (fractional.length > 0) {
      formatted += '.' + fractional;
    }
  }
  
  // Use scientific notation for very large numbers
  if (formatted.length > 10) {
    const num = parseFloat(formatted);
    formatted = num.toExponential(6);
  }
  
  return formatted;
} 