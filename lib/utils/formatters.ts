/**
 * Standardized locale-aware formatting utilities using browser Intl APIs.
 */

const MYR_FORMATTER = new Intl.NumberFormat("en-MY", {
  style: "currency",
  currency: "MYR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const NUMBER_FORMATTER = new Intl.NumberFormat("en-MY")

const DATE_FORMATTER = new Intl.DateTimeFormat("en-MY", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

/**
 * Format a number as Malaysian Ringgit currency (e.g. `RM 1,250.00`).
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "RM 0.00"
  }
  // Intl format outputs 'MYR 1,250.00' in en-MY. Replace MYR with RM for Malaysian UI standard.
  return MYR_FORMATTER.format(amount).replace("MYR", "RM").trim()
}

/**
 * Format a number with standard thousands separators (e.g. `1,250`).
 */
export function formatNumber(value: number): string {
  if (isNaN(value) || value === null || value === undefined) {
    return "0"
  }
  return NUMBER_FORMATTER.format(value)
}

/**
 * Format a Date object or ISO date string into standard date representation (e.g. `14 Aug 2026`).
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-"
  const d = typeof date === "string" ? new Date(date) : date
  if (isNaN(d.getTime())) return "-"
  return DATE_FORMATTER.format(d)
}
