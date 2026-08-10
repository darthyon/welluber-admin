"use client"

import { CaretRight } from "@phosphor-icons/react"
import { StatusBadge } from "@/components/shared/status-badge"
import type {
  EntitlementAllocationRow,
  EntitlementPoolKind,
  EntitlementSummary,
} from "@/features/employees/entitlement-resolver"
import { cn } from "@/lib/utils"

interface EntitlementAllocationTableProps {
  kind: EntitlementPoolKind
  rows: EntitlementAllocationRow[]
  summary: EntitlementSummary
  onPersonClick?: (row: EntitlementAllocationRow) => void
  scopeLabel?: string
}

export function EntitlementAllocationTable({
  kind,
  rows,
  summary,
  onPersonClick,
  scopeLabel = "Allocation Breakdown",
}: EntitlementAllocationTableProps) {
  const hasDependentColumn = kind !== "employee"

  return (
    <div
      data-testid="entitlement-allocation-table"
      className="overflow-hidden rounded-lg border border-border bg-card"
    >
      <div className="border-b border-border bg-muted/20 px-4 py-3">
        <div className="min-w-0">
          <p className="text-label font-medium text-muted-foreground">
            {scopeLabel}
          </p>
          <p className="mt-0.5 text-body font-semibold text-foreground">
            {tableTitle(kind)}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-separate border-spacing-0 text-left">
          <caption className="sr-only">
            {scopeLabel} for {tableTitle(kind)}
          </caption>
          <thead className="bg-muted/40">
            <tr>
              <th className="w-[28%] px-4 py-3 text-label font-medium text-muted-foreground">
                Beneficiary
              </th>
              <th className="px-4 py-3 text-label font-medium text-muted-foreground">
                <ColumnHeading
                  label="Employee Policy Amount"
                  value={formatRM(summary.employeeAllocated)}
                />
              </th>
              {hasDependentColumn && (
                <th className="px-4 py-3 text-label font-medium text-muted-foreground">
                  <ColumnHeading
                    label={dependentColumnTitle(kind)}
                    value={dependentColumnValue(kind, summary)}
                  />
                </th>
              )}
              <th className="px-4 py-3 text-label font-medium text-muted-foreground">
                Used
              </th>
              <th className="px-4 py-3 text-label font-medium text-muted-foreground">
                Balance
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={hasDependentColumn ? 5 : 4}
                  className="px-4 py-8 text-center text-label text-muted-foreground"
                >
                  No allocation rows available.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <AllocationTableRow
                  key={row.beneficiaryId}
                  kind={kind}
                  row={row}
                  hasDependentColumn={hasDependentColumn}
                  onClick={onPersonClick}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AllocationTableRow({
  hasDependentColumn,
  kind,
  onClick,
  row,
}: {
  hasDependentColumn: boolean
  kind: EntitlementPoolKind
  onClick?: (row: EntitlementAllocationRow) => void
  row: EntitlementAllocationRow
}) {
  return (
    <tr className="group transition-colors hover:bg-accent/30">
      <td className="border-t border-border/70 px-4 py-3">
        <PersonIdentity row={row} onClick={onClick} />
      </td>
      <td className="border-t border-border/70 px-4 py-3 align-middle">
        <PoolValue value={employeePoolValue(row)} />
      </td>
      {hasDependentColumn && (
        <td className="border-t border-border/70 px-4 py-3 align-middle">
          <PoolValue value={dependentPoolValue(row, kind)} />
        </td>
      )}
      <td className="border-t border-border/70 px-4 py-3 align-middle">
        <MetricValue value={formatRM(row.used)} />
      </td>
      <td className="border-t border-border/70 px-4 py-3 align-middle">
        <PoolValue
          value={
            row.balance === null ? balanceLabel(kind) : formatRM(row.balance)
          }
          muted={row.balance === null}
        />
      </td>
    </tr>
  )
}

function PersonIdentity({
  onClick,
  row,
}: {
  onClick?: (row: EntitlementAllocationRow) => void
  row: EntitlementAllocationRow
}) {
  const isEmployee = row.beneficiaryType === "employee"
  const relationship = isEmployee ? "Employee" : row.relationship
  const identity = (
    <>
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-label font-semibold",
          isEmployee
            ? "bg-primary text-primary-foreground"
            : "bg-teal-500/15 text-teal-700 dark:bg-teal-400/20 dark:text-teal-300"
        )}
      >
        {initials(row.name)}
      </span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2">
          <span className="truncate text-body font-semibold text-foreground">
            {row.name}
          </span>
          <StatusBadge
            status={relationship}
            variant={isEmployee ? "primary" : "zinc"}
            className="font-semibold"
          />
        </span>
        <span className="mt-0.5 block text-label text-muted-foreground">
          {isEmployee ? "Policy Holder" : row.relationship}
        </span>
      </span>
    </>
  )

  if (!onClick) {
    return (
      <div
        data-testid={`allocation-person-${row.beneficiaryId}`}
        className="flex min-w-0 items-center gap-3"
      >
        {identity}
      </div>
    )
  }

  return (
    <button
      type="button"
      data-testid={`allocation-person-${row.beneficiaryId}`}
      aria-haspopup="dialog"
      aria-label={`View allocation details for ${row.name}`}
      onClick={() => onClick(row)}
      className="flex min-w-0 items-center gap-3 rounded-4xl px-1.5 py-1 text-left transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      {identity}
      <CaretRight
        size={14}
        className="ml-auto shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </button>
  )
}

function ColumnHeading({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex min-w-32 flex-col gap-0.5">
      <span>{label}</span>
      <span className="text-body font-semibold text-foreground tabular-nums">
        {value}
      </span>
    </span>
  )
}

function MetricValue({ value }: { value: string }) {
  return (
    <span className="text-label font-semibold text-foreground tabular-nums">
      {value}
    </span>
  )
}

function PoolValue({
  muted = false,
  value,
}: {
  muted?: boolean
  value: string
}) {
  return (
    <span
      className={cn(
        "text-label font-semibold tabular-nums",
        muted ? "text-muted-foreground" : "text-foreground"
      )}
    >
      {value}
    </span>
  )
}

function employeePoolValue(row: EntitlementAllocationRow) {
  return row.beneficiaryType === "employee" && row.allocated !== null
    ? formatRM(row.allocated)
    : "—"
}

function dependentPoolValue(
  row: EntitlementAllocationRow,
  kind: EntitlementPoolKind
) {
  if (row.beneficiaryType === "employee") return "—"
  if (kind === "individual" && row.allocated !== null) {
    return formatRM(row.allocated)
  }
  return kind === "shared" ? "Shared" : "Combined"
}

function dependentColumnTitle(kind: EntitlementPoolKind) {
  if (kind === "individual") return "Dependent (Individual)"
  if (kind === "shared") return "Dependent (Shared)"
  return "Shared With Employee"
}

function dependentColumnValue(
  kind: EntitlementPoolKind,
  summary: EntitlementSummary
) {
  if (kind === "individual") return formatRM(summary.dependentAllocated)
  if (kind === "shared") return `${formatRM(summary.dependentAllocated)} pool`
  return "Uses employee pool"
}

function balanceLabel(kind: EntitlementPoolKind) {
  if (kind === "shared") return "Shared Pool"
  if (kind === "combined") return "Combined Pool"
  return "—"
}

function tableTitle(kind: EntitlementPoolKind) {
  if (kind === "individual") return "Separate Individual Allocations"
  if (kind === "shared") return "Shared Dependent Pool"
  if (kind === "combined") return "Combined With Employee"
  return "Employee Policy Allocation"
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
