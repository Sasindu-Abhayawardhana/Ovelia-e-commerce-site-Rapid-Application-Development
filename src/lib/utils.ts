import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a number as INR / USD currency string */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style:    'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

/** Format a Firestore Timestamp or Date */
export function formatDate(date: Date | { toDate(): Date } | string): string {
  const d = typeof date === 'string'
    ? new Date(date)
    : 'toDate' in date
      ? date.toDate()
      : date
  return new Intl.DateTimeFormat('en-US', {
    year:  'numeric',
    month: 'long',
    day:   'numeric',
  }).format(d)
}

/** Debounce a function */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/** Generate a slug from a product name */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Truncate text to a given length */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + '…'
}

/** Calculate tax amount (8.5% default) */
export function calculateTax(subtotal: number, rate = 0.085): number {
  return Math.round(subtotal * rate * 100) / 100
}

/** Calculate shipping cost */
export function calculateShipping(subtotal: number): number {
  if (subtotal >= 75) return 0
  return 6.99
}

/** Get star rating label */
export function ratingLabel(rating: number): string {
  if (rating >= 4.5) return 'Excellent'
  if (rating >= 4.0) return 'Very Good'
  if (rating >= 3.5) return 'Good'
  if (rating >= 3.0) return 'Average'
  return 'Poor'
}

/** Convert cents to dollars */
export function centsToAmount(cents: number): number {
  return cents / 100
}

/** Convert dollars to cents for Stripe */
export function amountToCents(amount: number): number {
  return Math.round(amount * 100)
}
