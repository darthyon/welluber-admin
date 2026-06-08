import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        "text-micro",
        "text-label",
        "text-body",
        "text-lead",
        "text-heading",
        "text-title",
        "text-display",
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—"
  const date = typeof value === "string" ? new Date(value) : value
  if (isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function formatDateTime(
  value: string | Date | null | undefined
): string {
  if (!value) return "—"
  const date = typeof value === "string" ? new Date(value) : value
  if (isNaN(date.getTime())) return String(value)
  return date.toLocaleString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

export function getCurrencyLabel(currency: string | null | undefined): string {
  if (!currency) return "RM"
  const normalizedCurrency = currency.trim().toUpperCase()
  if (normalizedCurrency === "MYR" || normalizedCurrency === "RM") {
    return "RM"
  }
  return normalizedCurrency
}
