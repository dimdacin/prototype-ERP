import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const LEI_TO_EUR_RATE = 19.5;

export function formatCurrency(
  amountInLei: number | string | null | undefined, 
  options?: { 
    showEuro?: boolean;
    placeholder?: string;
    leiDecimals?: number;
    euroDecimals?: number;
    locale?: string;
  }
): string {
  const showEuro = options?.showEuro !== false;
  const placeholder = options?.placeholder ?? "—";
  const leiDecimals = options?.leiDecimals ?? 0;
  const euroDecimals = options?.euroDecimals ?? 2;
  const locale = options?.locale ?? 'ro-RO';
  
  if (amountInLei === null || amountInLei === undefined || amountInLei === '') {
    return placeholder;
  }

  const numericAmount = typeof amountInLei === 'string' ? parseFloat(amountInLei) : amountInLei;
  
  if (isNaN(numericAmount)) {
    return placeholder;
  }

  const formattedLei = new Intl.NumberFormat(locale, {
    minimumFractionDigits: leiDecimals,
    maximumFractionDigits: leiDecimals,
  }).format(numericAmount);

  if (!showEuro) {
    return `${formattedLei} lei`;
  }

  const euroAmount = numericAmount / LEI_TO_EUR_RATE;
  const formattedEuro = new Intl.NumberFormat(locale, {
    minimumFractionDigits: euroDecimals,
    maximumFractionDigits: euroDecimals,
  }).format(euroAmount);

  return `${formattedLei} lei (€${formattedEuro})`;
}
