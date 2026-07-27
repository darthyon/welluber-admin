"use client"

import { useParams, useRouter } from "next/navigation"
import {
  Users,
  Envelope,
  Buildings,
  IdentificationCard,
  Shield,
  Calendar,
  ArrowSquareOut,
} from "@phosphor-icons/react"
import { DetailSection } from "@/components/shared/detail-section"
import { DetailField } from "@/components/shared/detail-field"
import { BackButton } from "@/components/shared/back-button"
import { UtilisationClaimsTable } from "@/components/shared/utilisation-claims-table"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/status-badge"
import { Badge } from "@/components/ui/badge"
import { MOCK_EMPLOYEES, MOCK_EMPLOYEE_UTILISATION } from "@/lib/mock-data"
import { getEmployeeEntitlements } from "@/lib/mock-data/factories/entitlement"
import { routes } from "@/lib/navigation"

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
}

export default function EmployeeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orgSlug = params.orgSlug as string
  const employeeId = params.employeeId as string

  const employee = MOCK_EMPLOYEES.find((e) => e.id === employeeId)
  const utilisation = MOCK_EMPLOYEE_UTILISATION.filter((r) => r.id === employeeId)
  const entitlementsSummary = getEmployeeEntitlements(employeeId)

  if (!employee) {
    return (
      <div className="space-y-4">
        <BackButton label="Employees" onClick={() => router.push(routes.org.employees(orgSlug))} />
        <p className="text-muted-foreground">Employee not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <BackButton label="Employees" onClick={() => router.push(routes.org.employees(orgSlug))} />
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{employee.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-label font-mono text-faint">{employee.empCode}</span>
          </div>
        </div>
      </div>

      {/* Profile */}
      <DetailSection title="Employee Profile" icon={<Users size={16} weight="duotone" />}>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          <DetailField
            label="Full Name"
            value={employee.name}
            icon={<Users size={14} weight="duotone" />}
          />
          <DetailField
            label="Email"
            value={employee.email}
            icon={<Envelope size={14} weight="duotone" />}
          />
          <DetailField
            label="Branch"
            value={employee.branch}
            icon={<Buildings size={14} weight="duotone" />}
          />
          <DetailField
            label="Department"
            value={employee.department}
          />
          <DetailField
            label="Tier"
            value={employee.tier}
            icon={<IdentificationCard size={14} weight="duotone" />}
          />
          <DetailField
            label="Employment Type"
            value={EMPLOYMENT_TYPE_LABELS[employee.employmentType ?? ""] ?? employee.employmentType ?? "—"}
          />
          <DetailField
            label="Joined"
            value={employee.joinDate}
            icon={<Calendar size={14} weight="duotone" />}
          />
          <DetailField
            label="Last Active"
            value={employee.lastActive}
          />
        </div>
      </DetailSection>

      {/* Benefit Policies & Entitlements */}
      <DetailSection
        title="Benefit Policies & Entitlements"
        icon={<Shield size={16} weight="duotone" />}
        description="Assigned policy, beneficiary allocations, and benefit group wallets"
      >
        {!entitlementsSummary ? (
          <p className="text-body text-muted-foreground py-4">No benefit policies assigned.</p>
        ) : (
          <div className="space-y-6">
            {/* Tier 1: Assigned Policy Header */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border bg-card p-4 shadow-xs">
              <div className="space-y-1">
                <p className="text-label font-medium text-muted-foreground">Assigned Benefit Policy</p>
                <p className="text-heading font-semibold text-foreground">{entitlementsSummary.policyName}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 shrink-0"
                onClick={() => router.push(routes.org.policies(orgSlug))}
              >
                View Policy Details <ArrowSquareOut size={14} />
              </Button>
            </div>

            {/* Tier 2: Beneficiary Allocation Summary (Person Level) */}
            {entitlementsSummary.beneficiarySummary && (
              <div className="rounded-lg border border-border bg-card p-4 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-body font-semibold text-foreground">Beneficiary Allocation Summary</p>
                    <p className="text-label text-muted-foreground">Individual allocations and usage per person</p>
                  </div>
                  <Badge variant="secondary" className="text-label font-medium">
                    {entitlementsSummary.beneficiarySummary.length} {entitlementsSummary.beneficiarySummary.length === 1 ? "Beneficiary" : "Family Members"}
                  </Badge>
                </div>

                {/* Per Person Table */}
                <div className="divide-y divide-border/40 text-label">
                  <div className="grid grid-cols-4 pb-2 text-muted-foreground font-medium">
                    <span>Beneficiary Name</span>
                    <span>Allocated Quota</span>
                    <span>Spent</span>
                    <span className="text-right">Balance Left</span>
                  </div>
                  {entitlementsSummary.beneficiarySummary.map((b, idx) => {
                    const bal = Math.max(b.allocatedAmount - b.usedAmount, 0)
                    return (
                      <div key={idx} className="grid grid-cols-4 py-2 items-center">
                        <div className="flex items-center gap-2">
                          <span>{b.role === "Employee" ? "👤" : b.role === "Spouse" ? "👤" : "👶"}</span>
                          <span className="font-semibold text-foreground">{b.name}</span>
                          <Badge variant="outline" className="text-micro py-0 h-4 font-normal text-muted-foreground">
                            {b.role}
                          </Badge>
                        </div>
                        <span className="font-mono text-foreground">
                          {b.isSharedFamilyPot ? "Combined Pool" : `RM ${b.allocatedAmount.toFixed(2)}`}
                        </span>
                        <span className="font-mono text-foreground">RM {b.usedAmount.toFixed(2)}</span>
                        <span className="font-mono text-right font-semibold text-emerald-600 dark:text-emerald-400">
                          {b.isSharedFamilyPot ? "Shared" : `RM ${bal.toFixed(2)}`}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* 2-Tone Teal & Purple Scalable Progress Bar */}
                <div className="space-y-2 pt-2 border-t border-border/40">
                  {(() => {
                    const empSpent = entitlementsSummary.beneficiarySummary.find((b) => b.role === "Employee")?.usedAmount ?? 0
                    const depSpent = entitlementsSummary.beneficiarySummary
                      .filter((b) => b.role !== "Employee")
                      .reduce((sum, b) => sum + b.usedAmount, 0)
                    const totalAlloc = entitlementsSummary.beneficiarySummary.reduce((sum, b) => sum + b.allocatedAmount, 0) || 1
                    const empPct = Math.round((empSpent / totalAlloc) * 100)
                    const depPct = Math.round((depSpent / totalAlloc) * 100)

                    return (
                      <>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted flex border border-border/20">
                          {/* Teal = Employee */}
                          <div className="h-full transition-all duration-500" style={{ width: `${empPct}%`, backgroundColor: "#0d9488" }} />
                          {/* Purple = Dependents Combined */}
                          <div className="h-full transition-all duration-500" style={{ width: `${depPct}%`, backgroundColor: "#8b5cf6" }} />
                        </div>
                        <div className="flex flex-wrap items-center justify-between text-label text-muted-foreground pt-1">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#0d9488" }} />
                              <span>Employee: <strong className="text-foreground font-mono">RM {empSpent.toFixed(2)}</strong></span>
                            </div>
                            {depSpent > 0 && (
                              <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#8b5cf6" }} />
                                <span>Dependents Combined: <strong className="text-foreground font-mono">RM {depSpent.toFixed(2)}</strong></span>
                              </div>
                            )}
                          </div>
                          <span className="font-mono text-foreground font-medium">
                            Total Family Spent: RM {(empSpent + depSpent).toFixed(2)}
                          </span>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>
            )}

            {/* Per-Benefit-Group Allocation Cards */}
            <div className="space-y-3">
              <p className="text-label font-medium text-muted-foreground uppercase tracking-wider">Assigned Benefit Groups & Wallets</p>
              
              {entitlementsSummary.groups.map((group) => {
                const remaining = Math.max(group.allocatedAmount - group.usedAmount, 0)
                const pct = group.allocatedAmount > 0 ? Math.round((group.usedAmount / group.allocatedAmount) * 100) : 0
                const isDepleted = remaining === 0

                return (
                  <div key={group.id} className="rounded-lg border border-border/80 bg-card p-4 space-y-3 shadow-xs">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <p className="text-body font-semibold text-foreground">{group.groupName}</p>
                        <Badge
                          variant="secondary"
                          className={
                            group.poolType === "Individual"
                              ? "text-label font-medium bg-primary/10 text-primary border-primary/20"
                              : group.poolType === "SharedWithEmployee"
                                ? "text-label font-medium bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20"
                                : "text-label font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                          }
                        >
                          {group.poolType === "Individual"
                            ? "Individual"
                            : group.poolType === "SharedWithEmployee"
                              ? "Combined"
                              : "Shared"}
                        </Badge>
                        {group.isSubCapped && (
                          <StatusBadge status="Sub-Capped" variant="amber" />
                        )}
                      </div>
                      <span className="text-label text-muted-foreground">Resets {group.resetCycle}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 border-y border-border/40 py-2.5">
                      <div>
                        <p className="text-label font-medium text-muted-foreground">
                          {group.poolType === "SharedWithEmployee"
                            ? "Combined Allocation"
                            : group.poolType === "Shared"
                              ? "Shared Allocation"
                              : "Individual Allocation"}
                        </p>
                        <p className="text-body font-semibold text-foreground font-mono">
                          RM {group.allocatedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-label font-medium text-muted-foreground">Used</p>
                        <p className="text-body font-semibold text-foreground font-mono">
                          RM {group.usedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-label font-medium text-muted-foreground">Remaining</p>
                        <p className={`text-body font-semibold font-mono ${isDepleted ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                          RM {remaining.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-label">
                        <span className="text-muted-foreground font-medium">Group Utilisation</span>
                        <span className={`font-semibold font-mono ${isDepleted ? "text-rose-600 dark:text-rose-400" : "text-foreground"}`}>
                          {pct}% {isDepleted ? "(Cap Reached)" : ""}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isDepleted ? "bg-destructive" : "bg-primary"}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>

                    {group.isSubCapped && isDepleted && (
                      <p className="text-label text-muted-foreground font-medium pt-0.5">
                        ⚠️ Note: Employee has RM {entitlementsSummary.overallRemaining.toLocaleString("en-US", { minimumFractionDigits: 2 })} remaining in Overall Policy, but group cap of RM {group.subCapLimit?.toFixed(2)} is exhausted.
                      </p>
                    )}

                    {/* Family Breakdown Sub-list */}
                    {group.familyBreakdown && (
                      <div className="rounded-md border border-border/60 bg-muted/30 p-3 space-y-2">
                        <p className="text-label font-semibold text-foreground">Family Member Draw-down Breakdown</p>
                        <div className="space-y-1.5 text-label">
                          {group.familyBreakdown.map((mem, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                              <span className="text-muted-foreground">
                                {mem.role === "Employee" ? "👤" : mem.role === "Spouse" ? "👤" : "👶"} {mem.name}
                              </span>
                              <span className="font-medium text-foreground font-mono">
                                RM {mem.usedAmount.toFixed(2)} ({mem.percentage}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </DetailSection>

      {/* Claims */}
      {utilisation.length > 0 && (
        <DetailSection title="Claims History" icon={<Shield size={16} weight="duotone" />} ghost>
          <UtilisationClaimsTable data={utilisation} />
        </DetailSection>
      )}
    </div>
  )
}
