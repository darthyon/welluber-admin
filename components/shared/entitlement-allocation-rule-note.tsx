"use client"

import { StatusBadge } from "@/components/shared/status-badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { EntitlementPoolKind } from "@/features/employees/entitlement-resolver"

export function EntitlementAllocationRuleBadge({
  kind,
}: {
  kind: EntitlementPoolKind
}) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            data-testid="entitlement-allocation-rule"
            aria-label={`Allocation Rule: ${kindLabel(kind)}`}
            className="rounded-4xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <StatusBadge
              status={kindLabel(kind)}
              variant="primary"
              className="border-primary/40 bg-primary/15 px-2.5 py-1 font-semibold"
            />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="end"
          className="max-w-[300px] text-label leading-relaxed"
        >
          {kindDescription(kind)}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function kindLabel(kind: EntitlementPoolKind) {
  if (kind === "individual") return "Individual"
  if (kind === "shared") return "Shared Between Dependents"
  if (kind === "combined") return "Combined With Employee"
  return "Employee Only"
}

function kindDescription(kind: EntitlementPoolKind) {
  if (kind === "individual") {
    return "Employee and dependents have separate allocations."
  }
  if (kind === "shared") {
    return "Dependents share one pool; the employee has an individual allocation."
  }
  if (kind === "combined") {
    return "Employee and dependents share from one combined pool."
  }
  return "The employee has one individual allocation."
}
