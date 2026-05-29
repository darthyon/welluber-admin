"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import {
  TreeStructure,
  ArrowsDownUp,
  Funnel,
  CaretDown,
} from "@phosphor-icons/react"
import { SERVICES } from "@/lib/mock-data/service-catalog"
import { MOCK_ORGS } from "@/lib/mock-data"
import { EMPLOYMENT_TYPE_LABELS } from "./policy-detail-helpers"
import type { BenefitPolicy, BenefitGroup, Benefit } from "@/types/policy"

interface VersionOverviewTabProps {
  policy: BenefitPolicy
  groups: BenefitGroup[]
  benefits: Benefit[]
  parentBenefits?: Benefit[]
  parentPolicyName?: string
}

export function VersionOverviewTab({
  policy,
  groups,
  benefits,
  parentBenefits,
  parentPolicyName,
}: VersionOverviewTabProps) {
  const router = useRouter()

  function formatRM(amount: number): string {
    return `RM ${amount.toFixed(2)}`
  }

  function getServiceName(serviceId: string): string {
    return SERVICES.find((s) => s.id === serviceId)?.name ?? serviceId
  }

  const tierOptions = useMemo(() => {
    const org = MOCK_ORGS.find((o) => o.id === policy.organizationId)
    return (org?.tierConfigs ?? []).map((t) => ({
      value: t.id,
      label: t.code ? `${t.code} - ${t.name}` : t.name,
    }))
  }, [policy.organizationId])

  const departmentOptions = useMemo(() => {
    const org = MOCK_ORGS.find((o) => o.id === policy.organizationId)
    return (org?.departmentConfigs ?? []).map((d) => ({
      value: d.id,
      label: d.code ? `${d.code} - ${d.name}` : d.name,
    }))
  }, [policy.organizationId])

  const diffEntries = useMemo(() => {
    if (!parentBenefits || parentBenefits.length === 0) return []
    return benefits
      .filter((vb) => {
        const parent = parentBenefits.find((pb) => pb.serviceId === vb.serviceId)
        return parent && parent.amount !== vb.amount
      })
      .map((vb) => {
        const parent = parentBenefits.find((pb) => pb.serviceId === vb.serviceId)!
        const group = groups.find((g) => g.id === vb.groupId)
        return {
          benefit: vb,
          parentAmount: parent.amount,
          groupName: group?.name ?? "—",
        }
      })
  }, [benefits, parentBenefits, groups])

  const groupedDiffs = useMemo(() => {
    const map = new Map<string, typeof diffEntries>()
    diffEntries.forEach((entry) => {
      const existing = map.get(entry.groupName) ?? []
      existing.push(entry)
      map.set(entry.groupName, existing)
    })
    return Array.from(map.entries())
  }, [diffEntries])

  const hasOverrides = diffEntries.length > 0

  const eligibleEmpLabels = (policy.eligibleEmploymentTypes ?? []).map(
    (et) => EMPLOYMENT_TYPE_LABELS[et] ?? et
  )
  const tierLabels = (policy.eligibility?.tierIds ?? []).map(
    (id) => tierOptions.find((t) => t.value === id)?.label ?? id
  )
  const deptLabels = (policy.eligibility?.departmentIds ?? []).map(
    (id) => departmentOptions.find((d) => d.value === id)?.label ?? id
  )

  return (
    <div className="space-y-6">
      {/* Version Summary */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-violet-200 bg-violet-50 text-violet-600 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400">
            <TreeStructure size={20} weight="duotone" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <h3 className="truncate text-lead font-semibold text-foreground">
                {policy.name}
              </h3>
              <StatusBadge
                status={policy.status}
                variant={
                  policy.status === "active"
                    ? "emerald"
                    : policy.status === "draft"
                      ? "amber"
                      : "rose"
                }
                dot
              />
            </div>
            {policy.code && (
              <p className="mt-0.5 font-mono text-label text-faint">
                {policy.code}
              </p>
            )}
            {policy.description && (
              <p className="mt-2 text-body text-subtle">{policy.description}</p>
            )}
            <div className="mt-3 flex items-center gap-1.5 text-label text-faint">
              <TreeStructure size={12} />
              <span>
                Derived from{" "}
                <button
                  onClick={() =>
                    router.push(
                      `/policies?policyId=${policy.parentPolicyId}&mode=view&wizard=open`
                    )
                  }
                  className="font-semibold text-primary hover:underline"
                >
                  {parentPolicyName || policy.parentPolicyId}
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Targeting */}
      <section className="rounded-lg border border-border bg-card shadow-sm">
        <Collapsible defaultOpen={false}>
          <CollapsibleTrigger className="group flex w-full items-center gap-3 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
              <Funnel size={14} weight="duotone" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-body font-semibold text-foreground">Targeting</p>
              <p className="truncate text-label text-muted-foreground">
                {eligibleEmpLabels.length} employment type
                {eligibleEmpLabels.length !== 1 ? "s" : ""}
                {" · "}
                {tierLabels.length} tier{tierLabels.length !== 1 ? "s" : ""}
                {" · "}
                {deptLabels.length} department
                {deptLabels.length !== 1 ? "s" : ""}
              </p>
            </div>
            <CaretDown
              size={14}
              weight="bold"
              className="text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 px-4 pb-4">
            {eligibleEmpLabels.length > 0 && (
              <div className="space-y-2">
                <label className="text-label font-medium text-subtle">Employment Types</label>
                <div className="flex flex-wrap gap-1.5">
                  {eligibleEmpLabels.map((label) => (
                    <Badge key={label} variant="secondary" className="px-3 py-1">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {tierLabels.length > 0 && (
              <div className="space-y-2">
                <label className="text-label font-medium text-subtle">Tiers</label>
                <div className="flex flex-wrap gap-1.5">
                  {tierLabels.map((label) => (
                    <Badge key={label} variant="secondary" className="px-3 py-1">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {deptLabels.length > 0 && (
              <div className="space-y-2">
                <label className="text-label font-medium text-subtle">Departments</label>
                <div className="flex flex-wrap gap-1.5">
                  {deptLabels.map((label) => (
                    <Badge key={label} variant="secondary" className="px-3 py-1">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {eligibleEmpLabels.length === 0 &&
              tierLabels.length === 0 &&
              deptLabels.length === 0 && (
                <p className="text-label text-faint italic">
                  No targeting filters applied.
                </p>
              )}
          </CollapsibleContent>
        </Collapsible>
      </section>

      {/* Benefit Amount Changes */}
      {parentBenefits && parentBenefits.length > 0 ? (
        <section className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
              <ArrowsDownUp size={18} weight="duotone" />
            </div>
            <div>
              <h3 className="text-lead font-semibold text-foreground">
                Benefit Amount Changes
              </h3>
              <p className="mt-0.5 text-label text-muted-foreground">
                {hasOverrides
                  ? "Overridden amounts relative to the parent policy"
                  : "All amounts match the parent policy"}
              </p>
            </div>
          </div>
          {hasOverrides ? (
            <div className="space-y-3">
              {groupedDiffs.map(([groupName, entries]) => (
                <div
                  key={groupName}
                  className="overflow-hidden rounded-lg border border-border bg-card/40"
                >
                  <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-2.5">
                    <TreeStructure size={14} className="text-faint" />
                    <span className="text-label font-semibold text-foreground">
                      {groupName}
                    </span>
                  </div>
                  <div className="divide-y divide-border/40">
                    {entries.map(({ benefit, parentAmount }) => (
                      <div
                        key={benefit.id}
                        className="flex items-center justify-between px-4 py-3"
                      >
                        <span className="text-body font-medium text-foreground">
                          {getServiceName(benefit.serviceId)}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-body text-faint tabular-nums line-through">
                            {formatRM(parentAmount)}
                          </span>
                          <span className="font-mono text-body font-semibold text-primary tabular-nums">
                            {formatRM(benefit.amount)}
                          </span>
                          <Badge variant="secondary" className="tabular-nums">
                            +{formatRM(benefit.amount - parentAmount)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/10 py-12 text-center">
              <ArrowsDownUp size={32} weight="duotone" className="mb-3 text-faint" />
              <p className="text-body font-medium text-muted-foreground">
                No benefit changes detected.
              </p>
              <p className="mt-1 text-label text-faint">
                All benefit amounts in this version match the parent policy.
              </p>
            </div>
          )}
        </section>
      ) : (
        <section className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
              <TreeStructure size={18} weight="duotone" />
            </div>
            <div>
              <h3 className="text-lead font-semibold text-foreground">Benefit Amounts</h3>
              <p className="mt-0.5 text-label text-muted-foreground">
                Configured benefits for this version
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {groups.map((group) => {
              const groupBenefits = benefits.filter((b) => b.groupId === group.id)
              return (
                <div
                  key={group.id}
                  className="overflow-hidden rounded-lg border border-border bg-card/40"
                >
                  <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-2.5">
                    <TreeStructure size={14} className="text-faint" />
                    <span className="text-label font-semibold text-foreground">
                      {group.name}
                    </span>
                  </div>
                  <div className="divide-y divide-border/40">
                    {groupBenefits.map((benefit) => (
                      <div
                        key={benefit.id}
                        className="flex items-center justify-between px-4 py-3"
                      >
                        <span className="text-body font-medium text-foreground">
                          {getServiceName(benefit.serviceId)}
                        </span>
                        <span className="font-mono text-body font-semibold text-foreground tabular-nums">
                          {formatRM(benefit.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
