"use client";

import {
  ArrowClockwise,
  CaretDown,
  TreeStructure,
  User,
  UsersThree,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { StackedPoolBar, type PoolSegment } from "@/components/shared/stacked-pool-bar";
import {
  ContractSection,
  DataGrid,
  DataPoint,
  TechnicalBadge,
} from "@/components/host/policies/policy-datapoint-ui";
import {
  formatCopay,
  formatRM,
  getEffectiveRefresh,
  getGroupCap,
  hasDependentSide,
  hasEmployeeSide,
} from "@/components/host/policies/policy-datapoint-helpers";
import { getMainServiceIcon } from "@/components/host/policies/detail-tabs/policy-detail-helpers";
import { getMainServiceName, resolveMainServiceId } from "@/lib/mock-data/service-catalog";
import type { Benefit, BenefitGroup, BenefitPolicy } from "@/types/policy";
import type { BeneficiaryUsage } from "@/features/employees/types";
import {
  getEmployeeEntitlement,
  type AssignedPolicyEntitlement,
} from "./employee-entitlements-mock";

const EMP_FILL = "bg-primary";
const DEP_FILL = "bg-violet-500";

/** A single rendered pool bar for one benefit (employee, a dependent, or combined). */
interface PoolBar {
  key: string;
  label: string;
  icon: "employee" | "dependent" | "combined";
  allocated: number;
  spent: number;
  balance: number;
  segments: PoolSegment[];
  details?: PoolDetailRow[];
}

/** Aggregated summary row across all benefits for one pool lane. */
interface PoolSummaryRow {
  key: string;
  allocationGroup: string;
  label: string;
  icon: "employee" | "dependent" | "combined";
  totalAllocated: number;
  totalSpent: number;
  totalBalance: number;
  segments: PoolSegment[];
  details?: PoolDetailRow[];
}

interface PoolDetailRow {
  key: string;
  label: string;
  relationshipLabel?: string;
  allocated: number;
  spent: number;
  balance: number;
}

function SummaryStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-label font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-heading font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

function PoolStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-[6rem]">
      <p className="text-label font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-lead font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}

function UtilisationRail({
  allocated,
  spent,
  color = "employee",
}: {
  allocated: number;
  spent: number;
  color?: "employee" | "dependent";
}) {
  const pct = allocated > 0 ? Math.min(Math.round((spent / allocated) * 100), 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <span className="w-10 shrink-0 text-label font-semibold tabular-nums text-foreground">
        {pct}%
      </span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", color === "dependent" ? DEP_FILL : EMP_FILL)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function SummaryLegend({
  allocated,
  segments,
}: {
  allocated: number;
  segments: PoolSegment[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
      {segments.map((segment, index) => {
        const pct = allocated > 0 ? Math.min(Math.round((segment.spent / allocated) * 100), 100) : 0;
        return (
          <div key={index} className="flex items-center gap-2 text-label text-muted-foreground">
            <span className={cn("h-2.5 w-2.5 rounded-full", segment.className)} />
            <span>{segment.label}</span>
            <span className="tabular-nums text-foreground">
              {formatRM(segment.spent)} ({pct}%)
            </span>
          </div>
        );
      })}
    </div>
  );
}

function PoolIdentity({
  icon,
  label,
  tone,
  subtitle,
}: {
  icon: PoolBar["icon"] | PoolSummaryRow["icon"];
  label: string;
  tone?: string;
  subtitle: string;
}) {
  const toneDescription = getPoolToneDescription(tone);

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-4xl border border-border bg-muted/30">
        <PoolIcon icon={icon} />
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-lead font-semibold text-foreground">{label}</p>
          {tone ? (
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <span className="rounded-4xl border border-primary/15 bg-primary/8 px-2 py-0.5 text-label font-medium text-primary">
                  {tone}
                </span>
              </TooltipTrigger>
              {toneDescription ? (
                <TooltipContent side="top" className="max-w-[240px] text-label text-muted-foreground">
                  {toneDescription}
                </TooltipContent>
              ) : null}
            </Tooltip>
          ) : null}
        </div>
        <p className="mt-0.5 text-label text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function PoolIcon({ icon }: { icon: PoolBar["icon"] | PoolSummaryRow["icon"] }) {
  if (icon === "combined") {
    return <UsersThree size={14} weight="fill" className="text-muted-foreground" />;
  }
  if (icon === "dependent") {
    return <User size={14} weight="fill" className="text-violet-500" />;
  }
  return <User size={14} weight="fill" className="text-primary" />;
}

function getPoolToneDescription(tone?: string) {
  switch (tone) {
    case "Individual Pool":
      return "This allocation belongs to one beneficiary and is not shared with other covered members.";
    case "Shared Pool":
      return "All covered dependents draw from the same dependent allocation.";
    case "Individual Pools":
      return "Each covered dependent has a separate allocation tracked individually.";
    case "Combined Pool":
      return "The employee and covered dependents share one allocation limit.";
    default:
      return null;
  }
}

function buildDependentDetails(rows: BeneficiaryUsage[]): PoolDetailRow[] {
  const detailMap = new Map<string, PoolDetailRow>();

  for (const row of rows) {
    const key = row.beneficiaryId;
    const existing = detailMap.get(key);
    if (!existing) {
      detailMap.set(key, {
        key,
        label: row.beneficiaryName ?? row.relationship ?? "Dependent",
        relationshipLabel: row.relationship,
        allocated: row.allocated,
        spent: row.spent,
        balance: row.balance,
      });
      continue;
    }

    existing.allocated += row.allocated;
    existing.spent += row.spent;
    existing.balance += row.balance;
  }

  return Array.from(detailMap.values());
}

function mergeDetailRows(...detailGroups: Array<PoolDetailRow[] | undefined>) {
  const merged = new Map<string, PoolDetailRow>();

  for (const group of detailGroups) {
    for (const detail of group ?? []) {
      const existing = merged.get(detail.key);
      if (!existing) {
        merged.set(detail.key, { ...detail });
        continue;
      }

      existing.allocated += detail.allocated;
      existing.spent += detail.spent;
      existing.balance += detail.balance;
    }
  }

  return Array.from(merged.values());
}

function toCoverageKey(relationship?: string) {
  return relationship?.trim().toLowerCase();
}

function getIndividualDependentCapMap(policy: BenefitPolicy) {
  const caps = new Map<string, number>();

  for (const coverage of policy.dependentCoverages ?? []) {
    const key = toCoverageKey(coverage.type);
    if (!key || typeof coverage.capAmount !== "number") {
      continue;
    }

    caps.set(key, coverage.capAmount);
  }

  return caps;
}

function getSharedDependentPoolAllocated(
  policy: BenefitPolicy,
  groups: BenefitGroup[],
  fallback: number
) {
  const groupCap = groups.reduce((sum, group) => sum + (group.dependentGroupCap ?? 0), 0);

  if (typeof policy.dependentCapAmount === "number") {
    return policy.dependentCapAmount;
  }

  if (groupCap > 0) {
    return groupCap;
  }

  return fallback;
}

function normaliseSummaryRows(
  entitlement: AssignedPolicyEntitlement,
  rows: PoolSummaryRow[]
) {
  const employeeSpent = entitlement.usage
    .filter((row) => !row.relationship)
    .reduce((sum, row) => sum + row.spent, 0);
  const dependentSpent = entitlement.usage
    .filter((row) => row.relationship)
    .reduce((sum, row) => sum + row.spent, 0);
  const dependentCaps = getIndividualDependentCapMap(entitlement.policy);

  return rows.map((row) => {
    if (row.allocationGroup === "combined") {
      const allocated = entitlement.policy.totalCapAmount ?? row.totalAllocated;
      const sharedBalance = Math.max(allocated - (employeeSpent + dependentSpent), 0);

      return {
        ...row,
        totalAllocated: allocated,
        totalSpent: row.key === "combined-emp" ? employeeSpent : dependentSpent,
        totalBalance: sharedBalance,
        label: row.key === "combined-dep" ? `Dependents (${row.details?.length ?? 0})` : "Employee",
      };
    }

    if (row.key === "emp") {
      const allocated = entitlement.policy.totalCapAmount ?? row.totalAllocated;

      return {
        ...row,
        totalAllocated: allocated,
        totalSpent: employeeSpent,
        totalBalance: Math.max(allocated - employeeSpent, 0),
      };
    }

    if (row.key === "dep-shared") {
      const allocated = getSharedDependentPoolAllocated(
        entitlement.policy,
        entitlement.groups,
        row.totalAllocated
      );

      return {
        ...row,
        totalAllocated: allocated,
        totalBalance: Math.max(allocated - row.totalSpent, 0),
      };
    }

    if (row.key === "dep-individual") {
      const details = row.details?.map((detail) => {
        const relationshipKey = toCoverageKey(detail.relationshipLabel);
        const allocated = relationshipKey
          ? (dependentCaps.get(relationshipKey) ?? detail.allocated)
          : detail.allocated;
        return {
          ...detail,
          allocated,
          balance: Math.max(allocated - detail.spent, 0),
        };
      });
      const totalAllocated = details?.reduce((sum, detail) => sum + detail.allocated, 0) ?? row.totalAllocated;

      return {
        ...row,
        totalAllocated,
        totalBalance: Math.max(totalAllocated - row.totalSpent, 0),
        details,
        label: `Dependents (${details?.length ?? 0})`,
      };
    }

    return row;
  });
}

/** Roll up all benefit usage into one PoolSummaryRow per pool lane.
 *  Mirrors buildBenefitBars gating logic so numbers always match the bars below. */
function buildSummaryRows(entitlement: AssignedPolicyEntitlement): PoolSummaryRow[] {
  const { policy, groups, benefits, usage } = entitlement;
  const poolType = policy.dependentsPoolType;
  const depsCovered = (policy.dependentCoverages?.length ?? 0) > 0;

  const rowMap = new Map<string, PoolSummaryRow>();
  // Separate emp/dep spend accumulators for SharedWithEmployee (one shared ceiling)
  const combinedSpend = { emp: 0, dep: 0 };
  const combinedDetails = new Map<string, PoolDetailRow>();

  for (const group of groups) {
    const scope = group.coverageScope ?? "Employee";
    const groupBenefits = benefits.filter((b) => b.groupId === group.id);

    for (const benefit of groupBenefits) {
      const rows = usage.filter((u) => u.benefitId === benefit.id);
      const emp = rows.find((u) => !u.relationship);
      const deps = rows.filter((u) => u.relationship);
      const showDeps = depsCovered && hasDependentSide(scope) && deps.length > 0;

      if (poolType === "SharedWithEmployee" && emp) {
        const existingEmployee = rowMap.get("combined-emp");
        if (!existingEmployee) {
          rowMap.set("combined-emp", {
            key: "combined-emp",
            allocationGroup: "combined",
            label: "Employee",
            icon: "employee",
            totalAllocated: emp.allocated,
            totalSpent: emp.spent,
            totalBalance: 0,
            segments: [{ label: "Employee", spent: emp.spent, className: EMP_FILL }],
          });
        } else {
          existingEmployee.totalAllocated += emp.allocated;
          existingEmployee.totalSpent += emp.spent;
          existingEmployee.segments[0].spent += emp.spent;
        }
        combinedSpend.emp += emp.spent;
        if (showDeps) {
          const depSpent = deps.reduce((s, d) => s + d.spent, 0);
          const dependentDetails = buildDependentDetails(deps);
          const existingDependent = rowMap.get("combined-dep");
          if (!existingDependent) {
            rowMap.set("combined-dep", {
              key: "combined-dep",
              allocationGroup: "combined",
              label: `Dependents (${dependentDetails.length})`,
              icon: "dependent",
              totalAllocated: emp.allocated,
              totalSpent: depSpent,
              totalBalance: 0,
              segments: [{ label: "Dependents", spent: depSpent, className: DEP_FILL }],
              details: dependentDetails,
            });
          } else {
            existingDependent.totalAllocated += emp.allocated;
            existingDependent.totalSpent += depSpent;
            existingDependent.segments[0].spent += depSpent;
            existingDependent.details = mergeDetailRows(existingDependent.details, dependentDetails);
            existingDependent.label = `Dependents (${existingDependent.details.length})`;
          }

          combinedSpend.dep += depSpent;
          for (const dep of deps) {
            const existing = combinedDetails.get(dep.beneficiaryId);
            if (!existing) {
              combinedDetails.set(dep.beneficiaryId, {
                key: dep.beneficiaryId,
                label: dep.beneficiaryName ?? dep.relationship ?? "Dependent",
                relationshipLabel: dep.relationship,
                allocated: dep.allocated,
                spent: dep.spent,
                balance: dep.balance,
              });
              continue;
            }

            existing.allocated += dep.allocated;
            existing.spent += dep.spent;
            existing.balance += dep.balance;
          }
        }
      } else {
        if (hasEmployeeSide(scope) && emp) {
          const existing = rowMap.get("emp");
          if (!existing) {
            rowMap.set("emp", {
              key: "emp",
              allocationGroup: "emp",
              label: "Employee",
              icon: "employee",
              totalAllocated: emp.allocated,
              totalSpent: emp.spent,
              totalBalance: emp.balance,
              segments: [{ label: "Employee", spent: emp.spent, className: EMP_FILL }],
            });
          } else {
            existing.totalAllocated += emp.allocated;
            existing.totalSpent += emp.spent;
            existing.totalBalance += emp.balance;
            existing.segments[0].spent += emp.spent;
          }
        }

        if (showDeps) {
          if (poolType === "Shared") {
            const depSpent = deps.reduce((s, d) => s + d.spent, 0);
            const depAlloc = deps[0]?.allocated ?? 0;
            const existing = rowMap.get("dep-shared");
            if (!existing) {
              rowMap.set("dep-shared", {
                key: "dep-shared",
                allocationGroup: "dep-shared",
                label: "Dependents",
                icon: "dependent",
                totalAllocated: depAlloc,
                totalSpent: depSpent,
                totalBalance: Math.max(depAlloc - depSpent, 0),
                segments: [{ label: "Dependents", spent: depSpent, className: DEP_FILL }],
                details: buildDependentDetails(deps),
              });
            } else {
              existing.totalAllocated += depAlloc;
              existing.totalSpent += depSpent;
              existing.totalBalance = Math.max(existing.totalAllocated - existing.totalSpent, 0);
              existing.segments[0].spent += depSpent;
              existing.details = mergeDetailRows(existing.details, buildDependentDetails(deps));
            }
          } else {
            const depSpent = deps.reduce((s, d) => s + d.spent, 0);
            const depAllocated = deps.reduce((s, d) => s + d.allocated, 0);
            const depBalance = deps.reduce((s, d) => s + d.balance, 0);
            const existing = rowMap.get("dep-individual");
            if (!existing) {
              rowMap.set("dep-individual", {
                key: "dep-individual",
                allocationGroup: "dep-individual",
                label: `Dependents (${buildDependentDetails(deps).length})`,
                icon: "dependent",
                totalAllocated: depAllocated,
                totalSpent: depSpent,
                totalBalance: depBalance,
                segments: [{ label: "Dependents", spent: depSpent, className: DEP_FILL }],
                details: buildDependentDetails(deps),
              });
            } else {
              existing.totalAllocated += depAllocated;
              existing.totalSpent += depSpent;
              existing.totalBalance += depBalance;
              existing.segments[0].spent += depSpent;
              existing.details = mergeDetailRows(existing.details, buildDependentDetails(deps));
              existing.label = `Dependents (${existing.details.length})`;
            }
          }
        }
      }
    }
  }

  const combinedDependents = rowMap.get("combined-dep");
  if (combinedDependents) {
    combinedDependents.details = Array.from(combinedDetails.values());
    combinedDependents.label = `Dependents (${combinedDependents.details.length})`;
  }

  return normaliseSummaryRows(entitlement, Array.from(rowMap.values()));
}

function renderPoolDetails(
  details?: PoolDetailRow[],
  utilisationAllocated?: number
) {
  if (!details?.length) return null;

  return (
    <div className="mt-4 rounded-lg border border-border bg-background/70 px-4 py-4">
      <div className="mb-3">
        <p className="text-body font-semibold text-foreground">Usage By Dependents</p>
      </div>
      <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(12rem,1.2fr)] gap-4 border-b border-border pb-3 text-label font-medium text-muted-foreground">
        <span>Dependent</span>
        <span>Relationship</span>
        <span>Allocated</span>
        <span>Used</span>
        <span>Left</span>
        <span>Utilisation</span>
      </div>
      <div className="divide-y divide-border">
        {details.map((detail) => {
          const utilisationBase = utilisationAllocated ?? detail.allocated;
          const balance = detail.balance;

          return (
            <div
              key={detail.key}
              className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(12rem,1.2fr)] items-center gap-4 py-4 text-body"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{detail.label}</p>
              </div>
              <span className="text-foreground">{detail.relationshipLabel ?? "Dependent"}</span>
              <span className="tabular-nums text-foreground">{formatRM(detail.allocated)}</span>
              <span className="tabular-nums text-foreground">{formatRM(detail.spent)}</span>
              <span className="tabular-nums text-foreground">{formatRM(balance)}</span>
              <UtilisationRail
                allocated={utilisationBase}
                spent={detail.spent}
                color={detail.relationshipLabel ? "dependent" : "employee"}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OverallSummaryCard({
  rows,
}: {
  rows: PoolSummaryRow[];
}) {
  const totalSpent = rows.reduce((s, r) => s + r.totalSpent, 0);
  const allocationGroups = new Map<string, { allocated: number; balance: number }>();
  for (const row of rows) {
    const existing = allocationGroups.get(row.allocationGroup);
    if (!existing) {
      allocationGroups.set(row.allocationGroup, {
        allocated: row.totalAllocated,
        balance: row.totalBalance,
      });
      continue;
    }

    allocationGroups.set(row.allocationGroup, {
      allocated: Math.max(existing.allocated, row.totalAllocated),
      balance: Math.max(existing.balance, row.totalBalance),
    });
  }
  const totalAllocated = Array.from(allocationGroups.values()).reduce((sum, group) => sum + group.allocated, 0);
  const totalBalance = Array.from(allocationGroups.values()).reduce((sum, group) => sum + group.balance, 0);

  let empSpent = 0;
  let depSpent = 0;
  for (const row of rows) {
    for (const seg of row.segments) {
      if (seg.className === EMP_FILL) empSpent += seg.spent;
      else depSpent += seg.spent;
    }
  }
  const segments: PoolSegment[] = [{ label: "Employee", spent: empSpent, className: EMP_FILL }];
  if (depSpent > 0) segments.push({ label: "Dependents", spent: depSpent, className: DEP_FILL });

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3">
          <p className="text-heading font-semibold text-foreground">Allocation Summary</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_32rem] lg:items-center">
          <div className="grid grid-cols-3 gap-6">
            <SummaryStat label="Total Allocated" value={formatRM(totalAllocated)} />
            <SummaryStat label="Used" value={formatRM(totalSpent)} />
            <SummaryStat label="Left" value={formatRM(totalBalance)} />
          </div>
          <div className="space-y-3">
            <StackedPoolBar
              allocated={totalAllocated}
              segments={segments}
              showLegend={false}
              className="self-center"
            />
            <SummaryLegend allocated={totalAllocated} segments={segments} />
          </div>
        </div>
        <Collapsible className="-mx-4 -mb-4 mt-6 border-t border-border bg-muted/20">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="group flex h-auto w-full items-center justify-between rounded-none px-4 py-3 text-label font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            >
              <span>View Breakdown</span>
              <CaretDown
                size={14}
                className="shrink-0 transition-transform group-data-[state=open]:rotate-180"
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-4 border-t border-border px-4 pb-4 pt-4">
              {rows.map((row) => {
                const isCombined = row.allocationGroup === "combined";
                const isDependent = row.icon === "dependent";
                const hasDetails = (row.details?.length ?? 0) > 0;
                const poolTone =
                  isCombined
                    ? "Combined Pool"
                    : isDependent
                      ? row.label.startsWith("Dependents (")
                        ? "Individual Pools"
                        : "Shared Pool"
                      : "Individual Pool";
                const subtitle =
                  isCombined
                    ? isDependent
                      ? "Covered Dependents"
                      : "Employee"
                    : isDependent
                      ? row.label.startsWith("Dependents (")
                        ? `${row.details?.length ?? 0} Dependents`
                        : "Covered Dependents"
                      : "Employee";

                return (
                  <div key={row.key} className="rounded-lg border border-border bg-background">
                    <div className="grid grid-cols-[minmax(0,2fr)_minmax(6rem,1fr)_minmax(6rem,1fr)_minmax(6rem,1fr)_minmax(12rem,1.2fr)_auto] items-center gap-4 px-4 py-4">
                      <PoolIdentity
                        icon={row.icon}
                        label={row.label}
                        tone={poolTone}
                        subtitle={subtitle}
                      />
                      <PoolStat label="Allocated" value={formatRM(row.totalAllocated)} />
                      <PoolStat label="Used" value={formatRM(row.totalSpent)} />
                      <PoolStat label="Left" value={formatRM(row.totalBalance)} />
                      <div>
                        <p className="text-label font-medium text-muted-foreground">Utilisation</p>
                        <div className="mt-2">
                          <UtilisationRail
                            allocated={row.totalAllocated}
                            spent={row.totalSpent}
                            color={isDependent ? "dependent" : "employee"}
                          />
                        </div>
                      </div>
                      <span className="shrink-0" aria-hidden="true" />
                    </div>
                    {hasDetails ? (
                      <div className="px-4 pb-4">
                        {renderPoolDetails(
                          row.details,
                          isCombined || row.icon === "dependent"
                            ? row.totalAllocated
                            : undefined
                        )}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}

/** Build the pool bar(s) for one benefit, applying coverageScope (which sides show)
 *  and the policy's dependentsPoolType (how the dependent side aggregates). */
function buildBenefitBars(
  policy: BenefitPolicy,
  group: BenefitGroup,
  benefit: Benefit,
  usage: BeneficiaryUsage[]
): PoolBar[] {
  const scope = group.coverageScope ?? "Employee";
  const rows = usage.filter((u) => u.benefitId === benefit.id);
  const emp = rows.find((u) => !u.relationship);
  const deps = rows.filter((u) => u.relationship);
  const depsCovered = (policy.dependentCoverages?.length ?? 0) > 0;
  const showDeps = depsCovered && hasDependentSide(scope) && deps.length > 0;
  const poolType = policy.dependentsPoolType;
  const bars: PoolBar[] = [];

  // Combined pool — employee + dependents share one ceiling
  if (hasEmployeeSide(scope) && showDeps && poolType === "SharedWithEmployee" && emp) {
    const depSpent = deps.reduce((s, d) => s + d.spent, 0);
    const sharedBalance = Math.max(emp.allocated - (emp.spent + depSpent), 0);
    const details = buildDependentDetails(deps);
    bars.push({
      key: `${benefit.id}-combined-emp`,
      label: "Employee",
      icon: "employee",
      allocated: emp.allocated,
      spent: emp.spent,
      balance: sharedBalance,
      segments: [{ label: "Employee", spent: emp.spent, className: EMP_FILL }],
    });
    bars.push({
      key: `${benefit.id}-combined-dep`,
      label: `Dependents (${details.length})`,
      icon: "dependent",
      allocated: emp.allocated,
      spent: depSpent,
      balance: sharedBalance,
      segments: [{ label: "Dependents", spent: depSpent, className: DEP_FILL }],
      details,
    });
    return bars;
  }

  // Employee bar
  if (hasEmployeeSide(scope) && emp) {
    bars.push({
      key: `${benefit.id}-emp`,
      label: "Employee",
      icon: "employee",
      allocated: emp.allocated,
      spent: emp.spent,
      balance: emp.balance,
      segments: [{ label: "Employee", spent: emp.spent, className: EMP_FILL }],
    });
  }

  // Dependent side
  if (showDeps) {
    if (poolType === "Shared") {
      const spent = deps.reduce((s, d) => s + d.spent, 0);
      const allocated = deps[0]?.allocated ?? 0;
      bars.push({
        key: `${benefit.id}-dep-shared`,
        label: "Dependents",
        icon: "dependent",
        allocated,
        spent,
        balance: Math.max(allocated - spent, 0),
        segments: [{ label: "Dependents", spent, className: DEP_FILL }],
        details: buildDependentDetails(deps),
      });
    } else {
      const details = buildDependentDetails(deps);
      const allocated = deps.reduce((sum, dep) => sum + dep.allocated, 0);
      const spent = deps.reduce((sum, dep) => sum + dep.spent, 0);
      const balance = deps.reduce((sum, dep) => sum + dep.balance, 0);
      bars.push({
        key: `${benefit.id}-deps-individual`,
        label: `Dependents (${details.length})`,
        icon: "dependent",
        allocated,
        spent,
        balance,
        segments: [{ label: "Dependents", spent, className: DEP_FILL }],
        details,
      });
    }
  }

  return bars;
}

function BenefitRow({
  policy,
  group,
  benefit,
  usage,
}: {
  policy: BenefitPolicy;
  group: BenefitGroup;
  benefit: Benefit;
  usage: BeneficiaryUsage[];
}) {
  const bars = buildBenefitBars(policy, group, benefit, usage);

  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <button className="group flex w-full min-w-0 items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-muted/30">
          <span className="shrink-0">{getMainServiceIcon(benefit.serviceId)}</span>
          <span className="truncate text-body font-semibold text-foreground">
            {getMainServiceName(benefit.serviceId)}
          </span>
          <span className="ml-auto shrink-0">
            <TechnicalBadge>{resolveMainServiceId(benefit.serviceId)}</TechnicalBadge>
          </span>
          <CaretDown
            size={12}
            weight="bold"
            className="ml-1 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
          />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="space-y-3 border-t border-border bg-muted/10 px-4 pb-3 pt-3">
          {bars.map((bar) => {
            const isCombined = bar.key.includes("combined");
            const isDependent = bar.icon === "dependent";
            return (
              <div key={bar.key} className="rounded-lg border border-border bg-background">
                <div className="grid grid-cols-[minmax(0,2fr)_minmax(6rem,1fr)_minmax(6rem,1fr)_minmax(6rem,1fr)_minmax(12rem,1.2fr)_auto] items-center gap-4 px-4 py-4">
                  <PoolIdentity
                    icon={bar.icon}
                    label={bar.label}
                    tone={isCombined ? "Combined Pool" : undefined}
                    subtitle={isCombined ? (isDependent ? "Covered Dependents" : "Employee") : bar.icon === "dependent" ? "Covered Dependents" : "Employee"}
                  />
                  <PoolStat label="Allocated" value={formatRM(bar.allocated)} />
                  <PoolStat label="Used" value={formatRM(bar.spent)} />
                  <PoolStat label="Left" value={formatRM(bar.balance)} />
                  <div>
                    <p className="text-label font-medium text-muted-foreground">Utilisation</p>
                    <div className="mt-2">
                      <UtilisationRail
                        allocated={bar.allocated}
                        spent={bar.spent}
                        color={isDependent ? "dependent" : "employee"}
                      />
                    </div>
                  </div>
                  <span className="shrink-0" aria-hidden="true" />
                </div>
                <div className="px-4 pb-4">
                  {renderPoolDetails(
                    bar.details,
                    isCombined || bar.icon === "dependent"
                      ? bar.allocated
                      : undefined
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function GroupCard({ entitlement, group }: { entitlement: AssignedPolicyEntitlement; group: BenefitGroup }) {
  const { policy, benefits, usage } = entitlement;
  const scope = group.coverageScope ?? "Employee";
  const depsCovered = (policy.dependentCoverages?.length ?? 0) > 0;
  const groupBenefits = benefits.filter((b) => b.groupId === group.id);

  const distribution =
    group.distributionType === "SharedAmount" ? "Shared Amount" : "Individual Amount";
  const meta = [scope, distribution, group.isTaxable ? "Taxable" : "Not Taxable"].join(" · ");

  const empCap = getGroupCap(group, "employee");
  const depCap = getGroupCap(group, "dependent");

  return (
    <ContractSection
      title={group.name}
      description={meta}
      icon={<TreeStructure size={18} weight="duotone" />}
    >
      <div className="space-y-5">
        <div>
          <p className="mb-3 text-label font-semibold text-muted-foreground">Pool Usage</p>
          {groupBenefits.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-muted/10 py-6 text-center text-label text-faint">
              No benefits configured for this group.
            </p>
          ) : (
            <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
              {groupBenefits.map((benefit) => (
                <BenefitRow
                  key={benefit.id}
                  policy={policy}
                  group={group}
                  benefit={benefit}
                  usage={usage}
                />
              ))}
            </div>
          )}
        </div>

        <Collapsible className="-mx-4 -mb-4 border-t border-border bg-muted/20">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="group flex h-auto w-full items-center justify-between rounded-none px-4 py-3 text-label font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            >
              <span className="flex items-start gap-2">
                <TreeStructure size={14} weight="duotone" className="mt-0.5" />
                <span>Benefit Group Details</span>
              </span>
              <CaretDown
                size={14}
                className="shrink-0 transition-transform group-data-[state=open]:rotate-180"
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border-t border-border px-4 pb-4 pt-4">
              <DataGrid>
                {hasEmployeeSide(scope) && (
                  <DataPoint label="Employee Cap" value={empCap.value} helper={empCap.helper} />
                )}
                {depsCovered && hasDependentSide(scope) && (
                  <DataPoint label="Dependent Cap" value={depCap.value} helper={depCap.helper} />
                )}
                <DataPoint label="Co-pay" value={formatCopay(group.coPayment)} />
                <DataPoint label="Refresh" value={`${getEffectiveRefresh(policy, group)} Refresh`} />
              </DataGrid>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </ContractSection>
  );
}

interface EmployeeEntitlementsTabProps {
  employeeId: string;
}

export function EmployeeEntitlementsTab({ employeeId }: EmployeeEntitlementsTabProps) {
  const entitlement = getEmployeeEntitlement(employeeId);

  const summaryRows = buildSummaryRows(entitlement);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-title font-semibold text-foreground">Usage</h2>
        <Button variant="outline" size="sm" className="h-9 gap-2 font-medium">
          <ArrowClockwise size={14} weight="bold" />
          Refresh All
        </Button>
      </div>

      {/* Summary — overall card with collapsible pool breakdown */}
      <OverallSummaryCard rows={summaryRows} />

      {/* Benefit group cards for the employee's assigned policy */}
      <div className="space-y-4">
        {entitlement.groups.map((group) => (
          <GroupCard key={group.id} entitlement={entitlement} group={group} />
        ))}
      </div>
    </div>
  );
}
