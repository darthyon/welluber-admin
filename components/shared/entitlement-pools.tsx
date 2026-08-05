"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StackedPoolBar, type PoolSegment } from "@/components/shared/stacked-pool-bar"
import type {
  EntitlementGroupPoolDisplay,
  EntitlementBeneficiaryRow,
} from "@/features/employees/entitlement-pool-display"
import type { ResolvedEntitlement } from "@/features/employees/entitlement-resolver"
import { cn } from "@/lib/utils"

/**
 * The single entitlement view — host console and org portal both render this,
 * so the same employee can no longer show different numbers in each.
 *
 * Colour carries meaning on two levels:
 *  - HUE distinguishes employee from dependent: purple = employee spend,
 *    teal = dependent spend, muted = balance left.
 *  - SHADE within teal distinguishes individual dependents, which is what keeps
 *    the bar readable once a family has four or more members.
 * Both are tokens; no raw hex. The org portal previously hardcoded #0d9488 on
 * the employee segment and #8b5cf6 on dependents — the hues inverted.
 */

const EMPLOYEE_FILL = "bg-primary"
const DEPENDENT_FILL = "bg-teal-500 dark:bg-teal-400"

/** Per-dependent shades, walked in order so each family member is distinct. */
const DEPENDENT_FILL_CLASSES = [
  "bg-teal-500 dark:bg-teal-400",
  "bg-teal-600 dark:bg-teal-300",
  "bg-teal-400 dark:bg-teal-500",
  "bg-teal-700 dark:bg-teal-200",
]
const OTHER_DEPENDENTS_FILL = "bg-teal-700 dark:bg-teal-300"

/** Beyond this, remaining dependents collapse into one "Other dependents" band. */
const MAX_DEPENDENT_SEGMENTS = 4

function dependentFill(index: number) {
  return DEPENDENT_FILL_CLASSES[index % DEPENDENT_FILL_CLASSES.length]!
}

function formatRM(amount: number) {
  return `RM ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Pools where dependents draw on one ceiling rather than their own wallets.
 * Their per-person quota is unknowable, so the spec renders it as an em dash
 * rather than inventing a number.
 */
function isPooledKind(kind: EntitlementGroupPoolDisplay["kind"]) {
  return kind === "combined" || kind === "shared"
}

function dependentsOf(display: EntitlementGroupPoolDisplay) {
  return display.beneficiaries.filter((b) => b.beneficiaryType === "dependent")
}

function employeeOf(display: EntitlementGroupPoolDisplay) {
  return display.beneficiaries.find((b) => b.beneficiaryType === "employee")
}

/** Employee band + one band per dependent, collapsing the long tail. */
function buildSegments(display: EntitlementGroupPoolDisplay): PoolSegment[] {
  const segments: PoolSegment[] = []

  if (display.employeeUsed > 0) {
    segments.push({
      label: "Employee",
      spent: display.employeeUsed,
      className: EMPLOYEE_FILL,
    })
  }

  const dependents = dependentsOf(display).filter((d) => d.used > 0)
  const shown = dependents.slice(0, MAX_DEPENDENT_SEGMENTS)
  const rest = dependents.slice(MAX_DEPENDENT_SEGMENTS)

  shown.forEach((dependent, index) => {
    segments.push({
      label: dependent.name,
      spent: dependent.used,
      className: dependentFill(index),
    })
  })

  if (rest.length > 0) {
    segments.push({
      label: `${rest.length} other dependent${rest.length === 1 ? "" : "s"}`,
      spent: rest.reduce((sum, d) => sum + d.used, 0),
      className: OTHER_DEPENDENTS_FILL,
    })
  }

  return segments
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-label font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-lead font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  )
}

function QuotaCell({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-body font-medium tabular-nums text-foreground">
      {children}
    </span>
  )
}

function BeneficiaryTable({
  display,
}: {
  display: EntitlementGroupPoolDisplay
}) {
  const employee = employeeOf(display)
  const dependents = dependentsOf(display)
  const pooled = isPooledKind(display.kind)

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-border">
          <th className="pb-2 text-left text-label font-medium text-muted-foreground">
            Beneficiary
          </th>
          <th className="pb-2 text-right text-label font-medium text-muted-foreground">
            Allocated Quota
          </th>
          <th className="pb-2 text-right text-label font-medium text-muted-foreground">
            Spent
          </th>
          <th className="pb-2 text-right text-label font-medium text-muted-foreground">
            Balance Left
          </th>
        </tr>
      </thead>
      <tbody>
        {employee && (
          <tr className="border-b border-border/50">
            <td className="py-2">
              <span className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", EMPLOYEE_FILL)} />
                <span className="text-body font-medium text-foreground">
                  Employee
                </span>
              </span>
            </td>
            <td className="py-2 text-right">
              <QuotaCell>{formatRM(display.allocated)}</QuotaCell>
            </td>
            <td className="py-2 text-right">
              <QuotaCell>{formatRM(display.employeeUsed)}</QuotaCell>
            </td>
            <td className="py-2 text-right">
              <QuotaCell>{formatRM(display.left)}</QuotaCell>
            </td>
          </tr>
        )}

        {pooled && dependents.length > 0 && (
          <tr className="border-b border-border/50">
            <td className="py-2">
              <span className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", DEPENDENT_FILL)} />
                <span className="text-body font-medium text-foreground">
                  Dependents
                </span>
              </span>
            </td>
            <td className="py-2 text-right">
              <QuotaCell>Combined Pool</QuotaCell>
            </td>
            <td className="py-2 text-right">
              <QuotaCell>{formatRM(display.dependentUsed)}</QuotaCell>
            </td>
            <td className="py-2 text-right">
              <span className="text-body text-muted-foreground">Shared</span>
            </td>
          </tr>
        )}

        {dependents.map((dependent, index) => (
          <DependentRow
            key={dependent.id}
            dependent={dependent}
            index={index}
            pooled={pooled}
          />
        ))}
      </tbody>
    </table>
  )
}

function DependentRow({
  dependent,
  index,
  pooled,
}: {
  dependent: EntitlementBeneficiaryRow
  index: number
  pooled: boolean
}) {
  return (
    <tr className="border-b border-border/50 last:border-0">
      <td className={cn("py-2", pooled && "pl-6")}>
        <span className="flex items-center gap-2">
          <span
            className={cn("h-2 w-2 rounded-full", dependentFill(index))}
          />
          <span className="text-body text-subtle">
            {dependent.name}
            {dependent.relationship && (
              <span className="ml-1 text-label text-muted-foreground">
                ({dependent.relationship})
              </span>
            )}
          </span>
        </span>
      </td>
      <td className="py-2 text-right">
        {/* Pooled dependents have no individual quota — the spec requires an
            em dash here rather than repeating the pool ceiling per person. */}
        {pooled ? (
          <span className="text-body text-muted-foreground">—</span>
        ) : (
          <QuotaCell>{formatRM(dependent.allocated)}</QuotaCell>
        )}
      </td>
      <td className="py-2 text-right">
        <QuotaCell>{formatRM(dependent.used)}</QuotaCell>
      </td>
      <td className="py-2 text-right">
        {pooled ? (
          <span className="text-body text-muted-foreground">—</span>
        ) : (
          <QuotaCell>{formatRM(dependent.left)}</QuotaCell>
        )}
      </td>
    </tr>
  )
}

const KIND_LABEL: Record<EntitlementGroupPoolDisplay["kind"], string> = {
  employee: "Employee Only",
  combined: "Combined Pool",
  shared: "Shared Dependent Pool",
  individual: "Individual Wallets",
}

function GroupPoolCard({
  name,
  display,
}: {
  name: string
  display: EntitlementGroupPoolDisplay
}) {
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-lead font-semibold text-foreground">{name}</h4>
          <Badge
            variant="outline"
            className="border-primary/20 bg-primary/10 text-label font-medium text-primary"
          >
            {KIND_LABEL[display.kind]}
          </Badge>
        </div>

        <StackedPoolBar
          allocated={display.allocated}
          segments={buildSegments(display)}
        />

        <BeneficiaryTable display={display} />
      </CardContent>
    </Card>
  )
}

interface EntitlementPoolsProps {
  entitlement: ResolvedEntitlement
}

/**
 * Tier 2 + Tier 3 of the entitlement view: allocation summary, then one card
 * per benefit group. The policy header (Tier 1) stays with the caller, since
 * host and org portal link to different policy routes.
 */
export function EntitlementPools({ entitlement }: EntitlementPoolsProps) {
  const { summary, pools } = entitlement

  const summarySegments: PoolSegment[] = []
  if (summary.employeeUsed > 0) {
    summarySegments.push({
      label: "Employee",
      spent: summary.employeeUsed,
      className: EMPLOYEE_FILL,
    })
  }
  if (summary.dependentUsed > 0) {
    summarySegments.push({
      label: "Dependents",
      spent: summary.dependentUsed,
      className: DEPENDENT_FILL,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 p-5">
          <h3 className="text-lead font-semibold text-foreground">
            Allocation Summary
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatBlock
              label="Total Allocated"
              value={formatRM(summary.allocated)}
            />
            <StatBlock label="Total Used" value={formatRM(summary.used)} />
            <StatBlock
              label="Total Balance Left"
              value={formatRM(summary.left)}
            />
          </div>

          <StackedPoolBar
            allocated={summary.allocated}
            segments={summarySegments}
            showLegend={summarySegments.length > 0}
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {pools.map(({ group, display }) => (
          <GroupPoolCard key={group.id} name={group.name} display={display} />
        ))}
      </div>
    </div>
  )
}
