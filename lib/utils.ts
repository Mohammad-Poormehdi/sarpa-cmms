import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date to a localized Persian string
 */
export function formatDate(date: Date): string {
  try {
    // Format as Persian date (Jalali calendar)
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(date);
  }
}

export function getSortParams(searchParams?: { sortBy?: string; sortOrder?: string }) {
  const sortBy = searchParams?.sortBy || "createdAt";
  const sortOrder = (searchParams?.sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc';
  
  return { sortBy, sortOrder };
}
