"use client"

import { useState, type ReactNode } from "react"
import { ArrowSquareOut, TreeStructure } from "@phosphor-icons/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/status-badge"
import { Sheet } from "@/components/ui/sheet"
import { getEmployeeEntitlement } from "./employee-entitlements-mock"

interface EmployeePolicyTabProps {
  employeeId: string
  employeeName: string
}

const DEPENDENT_POOL_LABEL: Record<string, string> = {
  SharedWithEmployee: "Combined With Employee",
  Shared: "Shared Between Dependents",
  Individual: "Individual",
}

function formatUtilisationMode(mode?: string, prorateUnit?: string) {
  if (mode === "Prorated") {
    return prorateUnit
      ? `Prorated Allocation (${prorateUnit})`
      : "Prorated Allocation"
  }

  return "Fixed Allocation"
}

function formatRefreshCycle(refreshCycle?: string) {
  return refreshCycle ? `${refreshCycle} Refresh` : "Refresh Not Set"
}

function formatPoolSummary(
  policy: NonNullable<ReturnType<typeof getEmployeeEntitlement>>["policy"]
) {
  if (policy.benefitPoolType === "Shared") {
    return {
      label: "Employee + Dependents",
      badge: "Combined With Employee",
    }
  }

  if (!policy.dependentCoverages?.length) {
    return {
      label: "Employee",
      badge: "Individual",
    }
  }

  const dependentType = policy.dependentsPoolType ?? "Individual"
  const badge = DEPENDENT_POOL_LABEL[dependentType] ?? "Individual"

  return {
    label: "Employee + Dependents",
    badge,
  }
}

function formatPoolStructure(
  policy: NonNullable<ReturnType<typeof getEmployeeEntitlement>>["policy"]
) {
  const summary = formatPoolSummary(policy)
  return `${summary.label} · ${summary.badge}`
}

function formatEmployeePoolType(
  policy: NonNullable<ReturnType<typeof getEmployeeEntitlement>>["policy"]
) {
  return policy.benefitPoolType === "Shared" ||
    policy.dependentsPoolType === "SharedWithEmployee"
    ? "Combined With Employee"
    : "Individual"
}

export function EmployeePolicyTab({
  employeeId,
  employeeName,
}: EmployeePolicyTabProps) {
  const [showPolicyModal, setShowPolicyModal] = useState(false)

  // Summary reads the same source as the Usage section so the two never drift.
  const entitlement = getEmployeeEntitlement(employeeId)

  if (!entitlement) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center">
        <p className="text-body font-medium text-foreground">
          No Benefit Policy Assigned
        </p>
        <p className="mt-1 text-label text-muted-foreground">
          This employee has no assigned benefit policy, so there is no
          entitlement to display.
        </p>
      </div>
    )
  }

  const { policy, groups } = entitlement
  const poolSummary = formatPoolSummary(policy)
  const summary = {
    name: policy.name,
    code: policy.code ?? policy.id,
    orgName: "Acme Corporation Sdn Bhd",
    version: policy.version ?? "V1.0",
    status: "Active",
    refreshCycle: formatRefreshCycle(policy.refreshCycle),
    utilisationMode: formatUtilisationMode(
      policy.utilisationMode,
      policy.prorateUnit
    ),
    poolLabel: poolSummary.label,
    poolBadge: poolSummary.badge,
    groupCount: groups.length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-title font-semibold text-foreground">
          Entitlement
        </h2>
        <p className="mt-1 text-body text-muted-foreground">
          View the assigned policy and how its benefits are allocated and used.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/[0.03] shadow-none">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1.5">
              <h3 className="text-heading font-semibold text-foreground">
                {summary.name}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-label font-medium text-muted-foreground">
                <StatusBadge status={summary.status} variant="emerald" />
                <span>·</span>
                <span>{summary.version}</span>
                <span>·</span>
                <span>{summary.utilisationMode}</span>
                <span>·</span>
                <span>{summary.refreshCycle}</span>
                <span>·</span>
                <span>{summary.poolLabel}</span>
                <span className="rounded-4xl border border-primary/15 bg-primary/8 px-2 py-0.5 text-micro font-medium text-primary">
                  {summary.poolBadge}
                </span>
              </div>
              <p className="text-label font-medium text-subtle">
                {summary.orgName} · {summary.code} · {summary.groupCount}{" "}
                Benefit Group{summary.groupCount === 1 ? "" : "s"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 gap-1.5 font-medium text-primary hover:text-primary"
              onClick={() => setShowPolicyModal(true)}
            >
              View Policy Details
              <ArrowSquareOut size={14} />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Sheet
        isOpen={showPolicyModal}
        onClose={() => setShowPolicyModal(false)}
        title={summary.name}
        description={`${summary.orgName} · ${summary.code}`}
        size="lg"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPolicyModal(false)}
            >
              Close
            </Button>
            <Button asChild className="gap-2">
              <Link href={`/policies/${policy.id}`}>
                Open Full Policy
                <ArrowSquareOut size={14} />
              </Link>
            </Button>
          </>
        }
      >
        <div data-testid="employee-policy-details-drawer" className="space-y-6">
          <div className="flex flex-wrap items-center gap-2 text-label font-medium text-muted-foreground">
            <StatusBadge status={summary.status} variant="emerald" />
            <span>·</span>
            <span>{summary.version}</span>
            <span>·</span>
            <span>{summary.utilisationMode}</span>
            <span>·</span>
            <span>{summary.refreshCycle}</span>
            <span>·</span>
            <span>{summary.poolLabel}</span>
            <span className="rounded-4xl border border-primary/15 bg-primary/8 px-2 py-0.5 text-micro font-medium text-primary">
              {summary.poolBadge}
            </span>
          </div>

          <PolicyDetailSection title="Employee Pool">
            <PolicyDetailGrid>
              <PolicyDetailItem
                label="Pool Type"
                value={formatEmployeePoolType(policy)}
              />
              <PolicyDetailItem
                label="Utilisation Mode"
                value={formatUtilisationMode(
                  policy.utilisationMode,
                  policy.prorateUnit
                )}
              />
              <PolicyDetailItem
                label="Refresh Cycle"
                value={formatRefreshCycle(policy.refreshCycle)}
              />
              <PolicyDetailItem
                label="Employee Cap"
                value={
                  policy.totalCapAmount != null
                    ? `RM ${policy.totalCapAmount.toLocaleString()} / Cycle`
                    : "Not Set"
                }
              />
            </PolicyDetailGrid>
          </PolicyDetailSection>

          <PolicyDetailSection title="Dependent Coverage">
            <PolicyDetailGrid>
              <PolicyDetailItem
                label="Covered Types"
                value={
                  (policy.dependentCoverages?.length ?? 0) > 0
                    ? policy
                        .dependentCoverages!.map(
                          (c) =>
                            c.type.charAt(0).toUpperCase() + c.type.slice(1)
                        )
                        .join(", ")
                    : "Employee Only"
                }
              />
              <PolicyDetailItem
                label="Dependents Pool Type"
                value={
                  (policy.dependentCoverages?.length ?? 0) > 0
                    ? formatPoolStructure(policy)
                    : "Not Applicable"
                }
              />
              {policy.dependentCapAmount != null && (
                <PolicyDetailItem
                  label="Dependent Cap"
                  value={`RM ${policy.dependentCapAmount.toLocaleString()} / Cycle`}
                />
              )}
            </PolicyDetailGrid>
          </PolicyDetailSection>

          <PolicyDetailSection title={`Benefit Groups · ${groups.length}`}>
            <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
              {groups.map((g) => (
                <div key={g.id} className="flex items-center gap-3 px-3 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                    <TreeStructure size={16} weight="duotone" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body font-semibold text-foreground">
                      {g.name}
                    </p>
                    <p className="mt-0.5 text-label text-muted-foreground">
                      {g.coverageScope ?? "Employee"} ·{" "}
                      {g.distributionType === "SharedAmount"
                        ? "Shared Amount"
                        : "Individual Amount"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </PolicyDetailSection>
        </div>
      </Sheet>
    </div>
  )
}

function PolicyDetailSection({
  children,
  title,
}: {
  children: ReactNode
  title: string
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-body font-semibold text-foreground">{title}</h3>
      {children}
    </section>
  )
}

function PolicyDetailGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-muted/30 p-4 sm:grid-cols-2">
      {children}
    </div>
  )
}

function PolicyDetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-micro font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-label font-semibold text-foreground">{value}</p>
    </div>
  )
}
