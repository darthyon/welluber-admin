"use client"

import type React from "react"
import { StatusBadge } from "@/components/shared/status-badge"
import type { EntitlementAllocationRow } from "@/features/employees/entitlement-resolver"
import { cn } from "@/lib/utils"

interface EntitlementAllocationPersonCardProps {
  compact?: boolean
  onClick?: () => void
  row: EntitlementAllocationRow
}

export function EntitlementAllocationPersonCard({
  compact = false,
  onClick,
  row,
}: EntitlementAllocationPersonCardProps) {
  const isEmployee = row.beneficiaryType === "employee"
  const relationship = isEmployee ? "Employee" : row.relationship
  const cardClassName = cn(
    "w-full rounded-lg border border-border bg-card text-left",
    onClick &&
      "transition-colors hover:border-primary/40 hover:bg-accent/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
    compact ? "p-3" : "p-4"
  )

  const content = (
    <>
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full text-label font-semibold",
            compact ? "h-8 w-8" : "h-10 w-10",
            isEmployee
              ? "bg-primary text-primary-foreground"
              : "bg-teal-500/15 text-teal-700 dark:bg-teal-400/20 dark:text-teal-300"
          )}
        >
          {initials(row.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="truncate text-body font-semibold text-foreground">
              {row.name}
            </h4>
            <StatusBadge
              status={relationship}
              variant={isEmployee ? "primary" : "zinc"}
              className="font-semibold"
            />
          </div>
        </div>
      </div>

      <div className={cn("grid grid-cols-3 gap-3", compact ? "mt-4" : "mt-5")}>
        <PersonMetric
          label="Allocated"
          value={
            row.allocated === null
              ? allocationTypeLabel(row)
              : formatRM(row.allocated)
          }
        />
        <PersonMetric label="Spent" value={formatRM(row.used)} />
        <PersonMetric
          label="Balance"
          value={
            row.balance === null
              ? allocationTypeLabel(row)
              : formatRM(row.balance)
          }
        />
      </div>
    </>
  )

  if (!onClick) {
    return (
      <article
        data-testid={`allocation-person-${row.beneficiaryId}`}
        className={cardClassName}
      >
        {content}
      </article>
    )
  }

  return (
    <button
      type="button"
      data-testid={`allocation-person-${row.beneficiaryId}`}
      aria-haspopup="dialog"
      aria-label={`View allocation details for ${row.name}`}
      onClick={onClick}
      className={cardClassName}
    >
      {content}
    </button>
  )
}

function PersonMetric({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="min-w-0">
      <p className="text-micro text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-label font-semibold text-foreground tabular-nums">
        {value}
      </p>
    </div>
  )
}

function allocationTypeLabel(row: EntitlementAllocationRow) {
  if (row.allocationType === "shared") return "Shared"
  if (row.allocationType === "combined") return "Combined"
  return "Individual"
}

function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return "?"
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
}

function formatRM(amount: number) {
  return `RM ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
