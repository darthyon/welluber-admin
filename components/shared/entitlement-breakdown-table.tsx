"use client"

import { useState } from "react"
import { CaretDown } from "@phosphor-icons/react"
import { EntitlementAllocationTable } from "@/components/shared/entitlement-allocation-table"
import { EntitlementAllocationRuleNote } from "@/components/shared/entitlement-allocation-rule-note"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import type {
  EntitlementAllocationRow,
  EntitlementPoolKind,
  EntitlementSummary,
} from "@/features/employees/entitlement-resolver"

interface EntitlementBreakdownTableProps {
  kind: EntitlementPoolKind
  rows: EntitlementAllocationRow[]
  summary: EntitlementSummary
  onPersonClick: (row: EntitlementAllocationRow) => void
}

export function EntitlementBreakdownTable({
  kind,
  rows,
  summary,
  onPersonClick,
}: EntitlementBreakdownTableProps) {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      data-testid="entitlement-breakdown"
      className="rounded-b-lg border-t border-border/60 bg-muted/20 px-5 py-3"
    >
      <div>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            aria-label={`${open ? "Hide" : "Show"} Breakdown`}
            className="group flex min-w-0 items-center gap-3 rounded-lg px-2 py-1 text-left transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <span className="block text-body font-semibold text-foreground">
              Breakdown
            </span>
            <CaretDown
              size={16}
              weight="bold"
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent>
        <div className="mt-3 space-y-3 border-t border-border/60 pt-3">
          <EntitlementAllocationRuleNote kind={kind} />
          <EntitlementAllocationTable
            kind={kind}
            rows={rows}
            summary={summary}
            onPersonClick={onPersonClick}
            scopeLabel="People and Allocations"
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
