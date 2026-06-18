import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateExpirationStatus(expirationDate: string | null | undefined): 'expired' | 'near-expiry' | 'ok' | 'missing' {
  if (!expirationDate) {
    return 'missing';
  }

  const today = new Date();
  const expiry = new Date(expirationDate);

  if (expiry < today) {
    return 'expired';
  }

  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(today.getDate() + 7);
  if (expiry <= sevenDaysFromNow) {
    return 'near-expiry';
  }

  return 'ok';
}
