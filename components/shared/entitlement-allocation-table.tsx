"use client"

import type {
  EntitlementAllocationRow,
  EntitlementPoolKind,
} from "@/features/employees/entitlement-resolver"
import { cn } from "@/lib/utils"

interface EntitlementAllocationTableProps {
  dependentAllocated: number
  kind: EntitlementPoolKind
  rows: EntitlementAllocationRow[]
}

export function EntitlementAllocationTable({
  dependentAllocated,
  kind,
  rows,
}: EntitlementAllocationTableProps) {
  const employeeRows = rows.filter((row) => row.beneficiaryType === "employee")
  const dependentRows = rows.filter(
    (row) => row.beneficiaryType === "dependent"
  )

  return (
    <div
      data-testid="entitlement-allocation-table"
      className="overflow-hidden rounded-lg border border-border bg-card"
    >
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          {employeeRows.length > 0 && (
            <AllocationSectionTable
              dependentAllocated={dependentAllocated}
              kind={kind}
              rows={employeeRows}
              section="employee"
            />
          )}
          {dependentRows.length > 0 && (
            <AllocationSectionTable
              dependentAllocated={dependentAllocated}
              kind={kind}
              rows={dependentRows}
              section="dependent"
            />
          )}
          {rows.length === 0 && (
            <p className="px-4 py-8 text-center text-label text-muted-foreground">
              No allocation rows available.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function AllocationSectionTable({
  dependentAllocated,
  kind,
  rows,
  section,
}: {
  dependentAllocated: number
  kind: EntitlementPoolKind
  rows: EntitlementAllocationRow[]
  section: "employee" | "dependent"
}) {
  const isEmployeeSection = section === "employee"
  const label = isEmployeeSection ? "Employee" : "Dependents"
  const beneficiaryLabel = isEmployeeSection ? "Employee" : "Dependent"

  return (
    <section
      data-testid={`allocation-section-${section}`}
      className={cn(section === "dependent" && "border-t border-border/70")}
    >
      <table className="w-full table-fixed border-separate border-spacing-0 text-left">
        <caption className="sr-only">
          {label} allocation table for {tableTitle(kind)}
        </caption>
        <colgroup>
          <col className="w-2/5" />
          <col className="w-1/5" />
          <col className="w-1/5" />
          <col className="w-1/5" />
        </colgroup>
        <thead className="bg-muted/40">
          <tr>
            <th className="px-4 py-3 text-label font-medium text-muted-foreground">
              {beneficiaryLabel}
            </th>
            <th className="px-4 py-3 text-label font-medium text-muted-foreground">
              Allocation
            </th>
            <th className="px-4 py-3 text-label font-medium text-muted-foreground">
              Used
            </th>
            <th className="px-4 py-3 text-label font-medium text-muted-foreground">
              Balance
            </th>
          </tr>
        </thead>
        <tbody>
          {!isEmployeeSection && (
            <DependentPoolSummaryRow
              dependentAllocated={dependentAllocated}
              kind={kind}
              rows={rows}
            />
          )}
          {rows.map((row) => (
            <AllocationTableRow
              key={row.beneficiaryId}
              kind={kind}
              row={row}
              section={section}
            />
          ))}
        </tbody>
      </table>
    </section>
  )
}

function DependentPoolSummaryRow({
  dependentAllocated,
  kind,
  rows,
}: {
  dependentAllocated: number
  kind: EntitlementPoolKind
  rows: EntitlementAllocationRow[]
}) {
  const dependentUsed = rows.reduce((total, row) => total + row.used, 0)
  const dependentBalance = Math.max(dependentAllocated - dependentUsed, 0)
  const isCombined = kind === "combined"

  return (
    <tr className="bg-muted/20">
      <td className="border-t border-border/70 px-4 py-3">
        <div className="min-w-0">
          <p className="text-body font-semibold text-foreground">
            All Dependents
          </p>
          <p className="mt-0.5 text-label text-muted-foreground">
            {isCombined ? "Combined Pool" : "Dependent Pool"}
          </p>
        </div>
      </td>
      <td className="border-t border-border/70 px-4 py-3 align-middle">
        <PoolValue
          value={
            isCombined ? "Combined With Employee" : formatRM(dependentAllocated)
          }
        />
      </td>
      <td className="border-t border-border/70 px-4 py-3 align-middle">
        <MetricValue value={formatRM(dependentUsed)} />
      </td>
      <td className="border-t border-border/70 px-4 py-3 align-middle">
        <PoolValue
          value={
            isCombined ? "Combined With Employee" : formatRM(dependentBalance)
          }
        />
      </td>
    </tr>
  )
}

function AllocationTableRow({
  kind,
  row,
  section,
}: {
  kind: EntitlementPoolKind
  row: EntitlementAllocationRow
  section: "employee" | "dependent"
}) {
  return (
    <tr className="group transition-colors hover:bg-accent/30">
      <td className="border-t border-border/70 px-4 py-3">
        <PersonIdentity row={row} />
      </td>
      <td className="border-t border-border/70 px-4 py-3 align-middle">
        <PoolValue
          value={
            section === "employee"
              ? employeePoolValue(row)
              : dependentPoolValue(row, kind)
          }
        />
      </td>
      <td className="border-t border-border/70 px-4 py-3 align-middle">
        <MetricValue value={formatRM(row.used)} />
      </td>
      <td className="border-t border-border/70 px-4 py-3 align-middle">
        <PoolValue value={balanceValue(row, kind)} />
      </td>
    </tr>
  )
}

function PersonIdentity({ row }: { row: EntitlementAllocationRow }) {
  const isEmployee = row.beneficiaryType === "employee"
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
        <span className="flex items-center gap-2">
          <span className="truncate text-body font-semibold text-foreground">
            {row.name}
          </span>
        </span>
        {!isEmployee && (
          <span className="mt-0.5 block text-label text-muted-foreground">
            {row.relationship}
          </span>
        )}
      </span>
    </>
  )

  return (
    <div
      data-testid={`allocation-person-${row.beneficiaryId}`}
      className="flex min-w-0 items-center gap-3"
    >
      {identity}
    </div>
  )
}

function MetricValue({ value }: { value: string }) {
  return (
    <span className="text-label font-semibold text-foreground tabular-nums">
      {value}
    </span>
  )
}

function PoolValue({ value }: { value: string }) {
  return (
    <span className="text-label font-semibold text-foreground tabular-nums">
      {value}
    </span>
  )
}

function employeePoolValue(row: EntitlementAllocationRow) {
  return row.allocated === null ? "—" : formatRM(row.allocated)
}

function dependentPoolValue(
  row: EntitlementAllocationRow,
  kind: EntitlementPoolKind
) {
  if (kind === "individual" && row.allocated !== null) {
    return formatRM(row.allocated)
  }
  if (kind === "combined") return "—"
  return kind === "shared"
    ? "Shared Between Dependents"
    : "Combined With Employee"
}

function balanceLabel(kind: EntitlementPoolKind) {
  if (kind === "shared") return "Shared Pool"
  if (kind === "combined") return "Combined Pool"
  return "—"
}

function balanceValue(
  row: EntitlementAllocationRow,
  kind: EntitlementPoolKind
) {
  if (row.beneficiaryType === "dependent" && kind === "shared") {
    return "Shared Between Dependents"
  }
  if (row.beneficiaryType === "dependent" && kind === "combined") {
    return "—"
  }
  if (row.balance !== null) return formatRM(row.balance)
  if (row.beneficiaryType === "dependent") return "—"
  return balanceLabel(kind)
}

function tableTitle(kind: EntitlementPoolKind) {
  if (kind === "individual") return "Separate Individual Allocations"
  if (kind === "shared") return "Shared Between Dependents"
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
