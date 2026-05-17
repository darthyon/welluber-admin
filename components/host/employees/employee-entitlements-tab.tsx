"use client"

import {
  Gift, CurrencyCircleDollar, Calendar, ArrowClockwise, ChartLineUp,
  Users, UserCircle, UsersThree,
} from "@phosphor-icons/react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/empty-state"
import { useEmployeePoolSummary, useBenefitAssignments } from "@/hooks/data-hooks"
import { getAvailableAmount, getUtilisationPct } from "@/types/benefit-assignment"
import type { BenefitAssignment, BenefitAssignmentSourceType } from "@/types/benefit-assignment"
import { cn } from "@/lib/utils"

interface EmployeeEntitlementsTabProps {
  employeeId: string
}

export function EmployeeEntitlementsTab({ employeeId }: EmployeeEntitlementsTabProps) {
  const summary = useEmployeePoolSummary(employeeId)
  const { assignments } = useBenefitAssignments(employeeId)

  if (assignments.length === 0) {
    return (
      <EmptyState
        title="No benefit pools assigned"
        description="This employee doesn't have any benefit policy assignments yet. Assign a benefit policy to get started."
        action={<Button variant="outline" size="sm"><Gift size={16} className="mr-2" />Assign Policy</Button>}
      />
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-title font-semibold text-foreground">Benefit Pools</h2>
        <p className="text-body text-muted-foreground mt-2">
          Allocated benefit pools, available balance, and utilisation for this employee and their dependents.
        </p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-body font-semibold text-muted-foreground flex items-center gap-2">
              <CurrencyCircleDollar size={18} />
              Total Allocated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-display font-semibold text-foreground tabular-nums">
              RM {summary.totalAllocated.toLocaleString("en-MY", { minimumFractionDigits: 0 })}
            </div>
            <p className="text-label text-muted-foreground mt-1">Across all pools this cycle</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-body font-semibold text-muted-foreground flex items-center gap-2">
              <Gift size={18} />
              Total Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-display font-semibold tabular-nums",
              summary.totalAvailable === 0 ? "text-rose-600" : "text-foreground"
            )}>
              RM {summary.totalAvailable.toLocaleString("en-MY", { minimumFractionDigits: 0 })}
            </div>
            <p className="text-label text-muted-foreground mt-1">Remaining to spend</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-body font-semibold text-muted-foreground flex items-center gap-2">
              <ChartLineUp size={18} />
              Overall Utilisation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-display font-semibold text-foreground">
              {summary.utilisationPct}%
            </div>
            <Progress
              value={summary.utilisationPct}
              className={cn("h-2 mt-2", summary.utilisationPct > 80 && "[&>div]:bg-rose-500")}
            />
          </CardContent>
        </Card>
      </div>

      {/* Pool cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-heading font-semibold text-foreground">Pool Breakdown</h3>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowClockwise size={16} />
            Refresh All
          </Button>
        </div>

        {assignments.map(a => (
          <BenefitAssignmentCard key={a.id} assignment={a} />
        ))}
      </div>
    </div>
  )
}

// ── Per-assignment card ───────────────────────────────────────────────────────

function BenefitAssignmentCard({ assignment: a }: { assignment: BenefitAssignment }) {
  const available     = getAvailableAmount(a)
  const utilisationPct = getUtilisationPct(a)
  const isExhausted   = a.status === "exhausted"
  const isExpired     = a.status === "expired"

  return (
    <Card className="border-border">
      <CardContent className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <PoolTypeIcon sourceType={a.sourceType} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-body font-semibold text-foreground">
                  {groupDisplayName(a.benefitGroupId)}
                </h4>
                <PoolTypeBadge sourceType={a.sourceType} />
                {isExhausted && (
                  <Badge variant="outline" className="text-micro border-rose-300 text-rose-600 bg-rose-50">
                    Exhausted
                  </Badge>
                )}
                {isExpired && (
                  <Badge variant="outline" className="text-micro border-zinc-300 text-zinc-500">
                    Expired
                  </Badge>
                )}
              </div>
              <p className="text-label text-muted-foreground">{policyDisplayName(a.policyId)}</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-label text-muted-foreground">Available</p>
            <p className={cn(
              "text-lead font-semibold tabular-nums",
              isExhausted || isExpired ? "text-rose-600" : "text-foreground"
            )}>
              RM {available.toLocaleString("en-MY", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <Progress
            value={utilisationPct}
            className={cn(
              "h-2",
              utilisationPct >= 100 && "[&>div]:bg-rose-500",
              utilisationPct > 80 && utilisationPct < 100 && "[&>div]:bg-amber-400",
            )}
          />
          <div className="flex items-center justify-between">
            <span className="text-micro text-muted-foreground">{utilisationPct}% used</span>
            <span className="text-micro text-muted-foreground tabular-nums">
              RM {a.usedAmount.toLocaleString("en-MY", { minimumFractionDigits: 2 })} used
              {" / "}
              RM {a.allocatedAmount.toLocaleString("en-MY", { minimumFractionDigits: 2 })} allocated
            </span>
          </div>
        </div>

        {/* Shared pool note */}
        {a.sourceType === "shared" && (
          <div className="rounded-md bg-muted/50 border border-border px-3 py-2 text-label text-muted-foreground flex items-center gap-2">
            <UsersThree size={14} />
            This is a shared pool — balance is split across all employees under this policy group.
          </div>
        )}

        {/* Cycle info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
          <InfoCell label="Cycle Start" value={formatDate(a.cycleStartDate)} />
          <InfoCell label="Cycle End" value={a.cycleEndDate ? formatDate(a.cycleEndDate) : "Open-ended"} />
          <InfoCell
            label="Days Remaining"
            value={a.cycleEndDate ? daysRemaining(a.cycleEndDate) : "—"}
          />
          <InfoCell label="Pool Type" value={sourceTypeLabel(a.sourceType)} />
        </div>
      </CardContent>
    </Card>
  )
}

// ── helpers ───────────────────────────────────────────────────────────────────

function PoolTypeIcon({ sourceType }: { sourceType: BenefitAssignmentSourceType }) {
  if (sourceType === "shared")    return <UsersThree size={20} weight="fill" />
  if (sourceType === "dependent") return <Users size={20} weight="fill" />
  return <UserCircle size={20} weight="fill" />
}

function PoolTypeBadge({ sourceType }: { sourceType: BenefitAssignmentSourceType }) {
  const map: Record<BenefitAssignmentSourceType, { label: string; className: string }> = {
    employee:  { label: "Individual",  className: "border-primary/30 text-primary bg-primary/5" },
    dependent: { label: "Dependent",   className: "border-amber-300 text-amber-700 bg-amber-50" },
    shared:    { label: "Shared Pool", className: "border-violet-300 text-violet-700 bg-violet-50" },
  }
  const { label, className } = map[sourceType]
  return (
    <Badge variant="outline" className={cn("text-micro", className)}>
      {label}
    </Badge>
  )
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-label text-muted-foreground">{label}</p>
      <p className="text-body text-foreground">{value}</p>
    </div>
  )
}

function sourceTypeLabel(t: BenefitAssignmentSourceType) {
  const map: Record<BenefitAssignmentSourceType, string> = {
    employee:  "Individual",
    dependent: "Dependent",
    shared:    "Shared",
  }
  return map[t]
}

function groupDisplayName(groupId: string): string {
  // In production this would come from the policy data map
  const map: Record<string, string> = {
    "POL-20260115-0001-G1": "Physical Wellbeing",
    "POL-20260115-0001-G2": "Mental Fitness",
    "POL-20260115-0001-G3": "Nutritional Support",
    "POL-20260115-0002-G1": "Premium Wellness",
    "POL-20260115-0003-G1": "Lite Benefits",
    "POL-20260115-0004-G1": "Engineering Wellness",
  }
  return map[groupId] ?? groupId
}

function policyDisplayName(policyId: string): string {
  const map: Record<string, string> = {
    "POL-20260115-0001": "Acme Employee Wellness Policy FY2026",
    "POL-20260115-0002": "Acme Leadership Benefits Policy FY2026",
    "POL-20260115-0003": "Global Tech Lite Benefits Policy FY2026",
    "POL-20260115-0004": "Acme Engineering Supplement FY2026",
  }
  return map[policyId] ?? policyId
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-MY", { day: "2-digit", month: "short", year: "numeric" })
}

function daysRemaining(cycleEnd: string): string {
  const diff = Math.ceil((new Date(cycleEnd).getTime() - Date.now()) / 86_400_000)
  if (diff < 0) return "Ended"
  if (diff === 0) return "Ends today"
  return `${diff} days`
}
