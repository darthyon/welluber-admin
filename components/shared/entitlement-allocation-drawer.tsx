"use client"

import { useEffect } from "react"
import { Info, TreeStructure } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Sheet } from "@/components/ui/sheet"
import { StatusBadge } from "@/components/shared/status-badge"
import { StackedPoolBar } from "@/components/shared/stacked-pool-bar"
import type {
  EntitlementAllocationRow,
  EntitlementPoolKind,
} from "@/features/employees/entitlement-resolver"

interface EntitlementAllocationDrawerProps {
  isOpen: boolean
  onClose: () => void
  row: EntitlementAllocationRow | null
}

const EMPLOYEE_FILL = "bg-primary"
const DEPENDENT_FILL = "bg-teal-500 dark:bg-teal-400"

export function EntitlementAllocationDrawer({
  isOpen,
  onClose,
  row,
}: EntitlementAllocationDrawerProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!row) return null

  const kind = row.allocationType
  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={row.name}
      description={`${row.relationship} allocation details`}
      footer={
        <Button type="button" variant="outline" onClick={onClose}>
          Close
        </Button>
      }
      size="lg"
    >
      <div data-testid="entitlement-allocation-drawer" className="space-y-6">
        <section className="space-y-5 rounded-lg border border-border bg-muted/20 p-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-label font-semibold ${
                row.beneficiaryType === "employee"
                  ? "bg-primary text-primary-foreground"
                  : "bg-teal-500/15 text-teal-700 dark:bg-teal-400/20 dark:text-teal-300"
              }`}
            >
              {initials(row.name)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lead font-semibold text-foreground">
                  {row.name}
                </h3>
                <StatusBadge
                  status={row.relationship}
                  variant={
                    row.beneficiaryType === "employee" ? "primary" : "zinc"
                  }
                  className="font-semibold"
                />
              </div>
              <p className="mt-1 text-label text-muted-foreground">
                {allocationTypeLabel(kind)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 border-t border-border/60 pt-4">
            <PersonMetric
              label="Allocated"
              value={
                row.allocated !== null
                  ? formatRM(row.allocated)
                  : allocationTypeLabel(kind)
              }
            />
            <PersonMetric label="Spent" value={formatRM(row.used)} />
            <PersonMetric
              label="Balance"
              value={
                row.balance !== null
                  ? formatRM(row.balance)
                  : allocationTypeLabel(kind)
              }
            />
          </div>
        </section>

        {row.allocated !== null ? (
          <section data-testid="entitlement-person-usage" className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lead font-semibold text-foreground">Usage</h3>
              <span className="text-label text-muted-foreground tabular-nums">
                {formatRM(row.used)} spent
              </span>
            </div>
            <StackedPoolBar
              allocated={row.allocated}
              segments={[
                {
                  label: "Spent",
                  spent: row.used,
                  className:
                    row.beneficiaryType === "employee"
                      ? EMPLOYEE_FILL
                      : DEPENDENT_FILL,
                },
              ]}
              showLegend={false}
            />
          </section>
        ) : (
          <section className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 px-3 py-3">
            <Info
              size={16}
              weight="duotone"
              className="mt-0.5 shrink-0 text-primary"
              aria-hidden="true"
            />
            <p className="text-body leading-normal text-muted-foreground">
              {poolDescription(kind, row.beneficiaryType)}
            </p>
          </section>
        )}

        <section data-testid="entitlement-benefit-groups" className="space-y-3">
          <div className="flex items-center gap-2">
            <TreeStructure
              size={16}
              weight="duotone"
              className="text-primary"
              aria-hidden="true"
            />
            <h3 className="text-lead font-semibold text-foreground">
              Benefit Groups
            </h3>
          </div>

          {row.benefitGroups.length > 0 ? (
            <div className="space-y-2">
              {row.benefitGroups.map((group) => (
                <div
                  key={group.groupId}
                  className="rounded-lg border border-border bg-card p-3"
                >
                  <p className="text-body font-semibold text-foreground">
                    {group.groupName}
                  </p>
                  <p className="mt-1 text-label text-muted-foreground">
                    {group.serviceNames.length > 0
                      ? group.serviceNames.join(" · ")
                      : "No services configured"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-label text-muted-foreground">
              No benefit groups assigned.
            </p>
          )}
        </section>
      </div>
    </Sheet>
  )
}

function PersonMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-micro text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-label font-semibold text-foreground tabular-nums">
        {value}
      </p>
    </div>
  )
}

function allocationTypeLabel(kind: EntitlementPoolKind) {
  if (kind === "shared") return "Shared"
  if (kind === "individual") return "Individual"
  if (kind === "combined") return "Combined With Employee"
  return "Employee"
}

function poolDescription(
  kind: EntitlementPoolKind,
  beneficiaryType: EntitlementAllocationRow["beneficiaryType"]
) {
  if (kind === "combined") {
    return beneficiaryType === "dependent"
      ? "This dependent draws from the employee's allocation. Balance is tracked at the combined pool level."
      : "This allocation is shared with dependents. Balance is tracked at the combined pool level."
  }
  return "This dependent draws from the shared dependent allocation. Balance is tracked at the shared pool level."
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
