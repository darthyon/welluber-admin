"use client"

import { Info } from "@phosphor-icons/react"
import type { EntitlementPoolKind } from "@/features/employees/entitlement-resolver"

export function EntitlementAllocationRuleNote({
  kind,
}: {
  kind: EntitlementPoolKind
}) {
  return (
    <div
      data-testid="entitlement-allocation-rule"
      className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-3"
    >
      <Info
        size={16}
        weight="duotone"
        className="shrink-0 self-center text-primary"
        aria-hidden="true"
      />
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-body text-muted-foreground">Allocation Rule</span>
        <span className="text-body text-muted-foreground" aria-hidden="true">
          ·
        </span>
        <span className="text-body font-semibold text-foreground">
          {kindLabel(kind)}
        </span>
        <span className="text-body text-muted-foreground" aria-hidden="true">
          —
        </span>
        <span className="text-body leading-normal text-muted-foreground">
          {kindDescription(kind)}
        </span>
      </div>
    </div>
  )
}

function kindLabel(kind: EntitlementPoolKind) {
  if (kind === "individual") return "Individual"
  if (kind === "shared") return "Shared"
  if (kind === "combined") return "Combined With Employee"
  return "Employee Only"
}

function kindDescription(kind: EntitlementPoolKind) {
  if (kind === "individual") {
    return "Employee and each dependent have a separate allocation. Balances are tracked per person."
  }
  if (kind === "shared") {
    return "Dependents share one allocation. The employee's allocation remains separate."
  }
  if (kind === "combined") {
    return "Employee and dependents share one allocation. Dependent spend reduces the same balance."
  }
  return "The employee has one individual policy allocation."
}
