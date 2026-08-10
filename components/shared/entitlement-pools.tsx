"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { EntitlementAllocationDrawer } from "@/components/shared/entitlement-allocation-drawer"
import { EntitlementBreakdownTable } from "@/components/shared/entitlement-breakdown-table"
import { EntitlementGroupLedgerCard } from "@/components/shared/entitlement-group-ledger-card"
import { EntitlementUsageTooltip } from "@/components/shared/entitlement-usage-tooltip"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  StackedPoolBar,
  type PoolSegment,
} from "@/components/shared/stacked-pool-bar"
import {
  buildEntitlementAllocationDetail,
  buildEntitlementServiceAllocation,
  type EntitlementAllocationRow,
  type EntitlementServiceAllocation,
  type ResolvedEntitlement,
} from "@/features/employees/entitlement-resolver"

const EMPLOYEE_FILL = "bg-primary"
const DEPENDENT_FILL = "bg-teal-500 dark:bg-teal-400"

interface EntitlementPoolsProps {
  employeeName?: string
  entitlement: ResolvedEntitlement
}

/**
 * Shared entitlement view for the host console and org portal.
 *
 * The page remains an overview. Person-specific allocation details open from
 * the employee and dependent cards in the breakdown.
 */
export function EntitlementPools({
  employeeName,
  entitlement,
}: EntitlementPoolsProps) {
  const [selectedPerson, setSelectedPerson] =
    useState<EntitlementAllocationRow | null>(null)
  const summaryDetail = buildEntitlementAllocationDetail(
    entitlement,
    { type: "overall" },
    employeeName
  )
  const serviceAllocations = new Map<string, EntitlementServiceAllocation>(
    entitlement.benefits.map((benefit) => [
      benefit.id,
      buildEntitlementServiceAllocation(
        entitlement,
        benefit.groupId,
        benefit.id,
        employeeName
      ),
    ])
  )

  return (
    <div className="space-y-6">
      <Card data-testid="entitlement-summary">
        <CardContent className="space-y-4 p-5">
          <div>
            <h3 className="text-lead font-semibold text-foreground">
              Allocation Summary
            </h3>
            <p className="mt-1 text-label text-muted-foreground">
              Total capacity and consuming spend across this entitlement.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:items-center lg:gap-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatBlock
                label="Total Allocated"
                value={formatRM(entitlement.summary.allocated)}
              />
              <StatBlock
                label="Total Used"
                value={formatRM(entitlement.summary.used)}
              />
              <StatBlock
                label="Balance Left"
                value={formatRM(entitlement.summary.left)}
              />
            </div>

            <div
              data-testid="entitlement-overall-usage"
              className="min-w-0 pt-2 lg:pt-0"
            >
              <div className="mb-2 flex items-center gap-1.5 text-label text-muted-foreground">
                <span>Overall Usage</span>
                <EntitlementUsageTooltip />
              </div>
              <StackedPoolBar
                allocated={entitlement.summary.allocated}
                segments={buildSummarySegments(entitlement.summary)}
                showLegend={entitlement.summary.used > 0}
              />
            </div>
          </div>

          {entitlement.summary.used > entitlement.summary.allocated && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2">
              <p className="text-label text-foreground">
                Usage exceeds the available allocation by{" "}
                {formatRM(
                  entitlement.summary.used - entitlement.summary.allocated
                )}
                .
              </p>
              <StatusBadge status="Review Required" variant="rose" />
            </div>
          )}
        </CardContent>
        <EntitlementBreakdownTable
          kind={summaryDetail.kind}
          rows={summaryDetail.rows}
          summary={summaryDetail.summary}
          onPersonClick={setSelectedPerson}
        />
      </Card>

      <div className="space-y-3">
        <div>
          <h3 className="text-lead font-semibold text-foreground">
            Benefit Groups
          </h3>
          <p className="mt-1 text-label text-muted-foreground">
            Group allocations inherit the policy rule and define each benefit
            category&apos;s available balance.
          </p>
        </div>
        {entitlement.pools.map((pool) => (
          <EntitlementGroupLedgerCard
            key={pool.group.id}
            benefits={entitlement.benefits.filter(
              (benefit) => benefit.groupId === pool.group.id
            )}
            display={pool.display}
            group={pool.group}
            serviceAllocations={serviceAllocations}
          />
        ))}
      </div>

      <EntitlementAllocationDrawer
        isOpen={selectedPerson !== null}
        onClose={() => setSelectedPerson(null)}
        row={selectedPerson}
      />
    </div>
  )
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-label font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-lead font-semibold text-foreground tabular-nums">
        {value}
      </p>
    </div>
  )
}

function buildSummarySegments(
  summary: ResolvedEntitlement["summary"]
): PoolSegment[] {
  const segments: PoolSegment[] = []
  if (summary.employeeUsed > 0) {
    segments.push({
      label: "Employee Used",
      spent: summary.employeeUsed,
      className: EMPLOYEE_FILL,
    })
  }
  if (summary.dependentUsed > 0) {
    segments.push({
      label: "Dependents Used",
      spent: summary.dependentUsed,
      className: DEPENDENT_FILL,
    })
  }
  return segments
}

function formatRM(amount: number) {
  return `RM ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
