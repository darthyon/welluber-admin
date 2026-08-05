"use client"

import { ArrowClockwise } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { EntitlementPools } from "@/components/shared/entitlement-pools"
import { resolveEmployeeEntitlement } from "@/features/employees/entitlement-resolver"

interface EmployeeEntitlementsTabProps {
  employeeId: string
}

/**
 * Usage view for one employee.
 *
 * All pool arithmetic lives in `entitlement-pool-display.ts` via the resolver,
 * and all rendering in `<EntitlementPools>`, which the org portal shares. This
 * file used to carry its own `buildSummaryRows` / `normaliseSummaryRows` /
 * `buildBenefitBars` implementations — a third copy of the calculation that
 * drifted from the other two and made the two consoles disagree.
 */
export function EmployeeEntitlementsTab({
  employeeId,
}: EmployeeEntitlementsTabProps) {
  const entitlement = resolveEmployeeEntitlement(employeeId)

  if (!entitlement) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center">
        <p className="text-body font-medium text-foreground">
          No Entitlement To Show
        </p>
        <p className="mt-1 text-label text-muted-foreground">
          Assign a benefit policy to this employee to see allocation and usage.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-title font-semibold text-foreground">Usage</h2>
        <Button variant="outline" size="sm" className="h-9 gap-2 font-medium">
          <ArrowClockwise size={14} weight="bold" />
          Refresh All
        </Button>
      </div>

      <EntitlementPools entitlement={entitlement} />
    </div>
  )
}
