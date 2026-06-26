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
}

/** Aggregated summary row across all benefits for one pool lane. */
interface PoolSummaryRow {
  key: string;
  label: string;
  icon: "employee" | "dependent" | "combined";
  totalAllocated: number;
  totalSpent: number;
  totalBalance: number;
  segments: PoolSegment[];
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

  for (const group of groups) {
    const scope = group.coverageScope ?? "Employee";
    const groupBenefits = benefits.filter((b) => b.groupId === group.id);

    for (const benefit of groupBenefits) {
      const rows = usage.filter((u) => u.benefitId === benefit.id);
      const emp = rows.find((u) => !u.relationship);
      const deps = rows.filter((u) => u.relationship);
      const showDeps = depsCovered && hasDependentSide(scope) && deps.length > 0;

      if (poolType === "SharedWithEmployee" && hasEmployeeSide(scope) && emp && showDeps) {
        const existing = rowMap.get("combined");
        if (!existing) {
          rowMap.set("combined", {
            key: "combined",
            label: "Employee + Dependents",
            icon: "combined",
            totalAllocated: emp.allocated,
            totalSpent: 0,
            totalBalance: 0,
            segments: [],
          });
        } else {
          existing.totalAllocated += emp.allocated;
        }
        combinedSpend.emp += emp.spent;
        combinedSpend.dep += deps.reduce((s, d) => s + d.spent, 0);
      } else {
        if (hasEmployeeSide(scope) && emp) {
          const existing = rowMap.get("emp");
          if (!existing) {
            rowMap.set("emp", {
              key: "emp",
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
                label: "Dependents · shared pool",
                icon: "dependent",
                totalAllocated: depAlloc,
                totalSpent: depSpent,
                totalBalance: Math.max(depAlloc - depSpent, 0),
                segments: [{ label: "Dependents", spent: depSpent, className: DEP_FILL }],
              });
            } else {
              existing.totalAllocated += depAlloc;
              existing.totalSpent += depSpent;
              existing.totalBalance = Math.max(existing.totalAllocated - existing.totalSpent, 0);
              existing.segments[0].spent += depSpent;
            }
          } else {
            for (const d of deps) {
              const key = d.beneficiaryId;
              const existing = rowMap.get(key);
              if (!existing) {
                rowMap.set(key, {
                  key,
                  label: d.relationship
                    ? `${d.beneficiaryName} · ${d.relationship}`
                    : (d.beneficiaryName ?? "Dependent"),
                  icon: "dependent",
                  totalAllocated: d.allocated,
                  totalSpent: d.spent,
                  totalBalance: d.balance,
                  segments: [{ label: d.relationship ?? "Dependent", spent: d.spent, className: DEP_FILL }],
                });
              } else {
                existing.totalAllocated += d.allocated;
                existing.totalSpent += d.spent;
                existing.totalBalance += d.balance;
                existing.segments[0].spent += d.spent;
              }
            }
          }
        }
      }
    }
  }

  const combined = rowMap.get("combined");
  if (combined) {
    const totalSpent = combinedSpend.emp + combinedSpend.dep;
    combined.totalSpent = totalSpent;
    combined.totalBalance = Math.max(combined.totalAllocated - totalSpent, 0);
    combined.segments = [
      { label: "Employee", spent: combinedSpend.emp, className: EMP_FILL },
      { label: "Dependents", spent: combinedSpend.dep, className: DEP_FILL },
    ];
  }

  return Array.from(rowMap.values());
}

function OverallSummaryCard({ rows }: { rows: PoolSummaryRow[] }) {
  const totalAllocated = rows.reduce((s, r) => s + r.totalAllocated, 0);
  const totalSpent = rows.reduce((s, r) => s + r.totalSpent, 0);
  const totalBalance = rows.reduce((s, r) => s + r.totalBalance, 0);
  const utilPct = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

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
    <Collapsible>
      <div className="rounded-lg border border-border bg-card">
        {/* Always-visible summary */}
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-body font-semibold text-foreground">Allocation Summary</p>
            <span
              className={cn(
                "tabular-nums text-label font-semibold",
                utilPct > 80 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"
              )}
            >
              {utilPct.toFixed(1)}% utilised
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-micro font-medium text-muted-foreground">Total Allocated</p>
                <p className="mt-0.5 text-body font-semibold tabular-nums text-foreground">
                  {formatRM(totalAllocated)}
                </p>
              </div>
              <div>
                <p className="text-micro font-medium text-muted-foreground">Balance</p>
                <p className="mt-0.5 text-body font-semibold tabular-nums text-foreground">
                  {formatRM(totalBalance)}
                </p>
              </div>
            </div>
            <StackedPoolBar allocated={totalAllocated} segments={segments} className="self-center" />
          </div>
        </div>

        {/* Pool breakdown — collapsible */}
        <CollapsibleContent>
          <div className="border-t border-border divide-y divide-border">
            {rows.map((row) => {
              const pct = row.totalAllocated > 0 ? (row.totalSpent / row.totalAllocated) * 100 : 0;
              return (
                <div key={row.key} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="shrink-0">
                    {row.icon === "combined" ? (
                      <UsersThree size={13} weight="fill" className="text-muted-foreground" />
                    ) : row.icon === "dependent" ? (
                      <User size={13} weight="fill" className="text-violet-500" />
                    ) : (
                      <User size={13} weight="fill" className="text-primary" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-label font-medium text-foreground">
                    {row.label}
                  </span>
                  <div className="w-28 shrink-0">
                    <StackedPoolBar allocated={row.totalAllocated} segments={row.segments} showLegend={false} />
                  </div>
                  <span
                    className={cn(
                      "w-14 shrink-0 text-right tabular-nums text-label font-medium",
                      pct > 80 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"
                    )}
                  >
                    {formatRM(row.totalBalance)}
                  </span>
                </div>
              );
            })}
          </div>
        </CollapsibleContent>

        {/* Toggle */}
        <CollapsibleTrigger asChild>
          <button className="group flex w-full items-center justify-center gap-1.5 border-t border-border px-4 py-2 text-micro font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground">
            <span className="group-data-[state=open]:hidden">Show pool breakdown</span>
            <span className="hidden group-data-[state=open]:inline">Hide breakdown</span>
            <CaretDown
              size={11}
              weight="bold"
              className="transition-transform duration-200 group-data-[state=open]:rotate-180"
            />
          </button>
        </CollapsibleTrigger>
      </div>
    </Collapsible>
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
    const spent = emp.spent + depSpent;
    bars.push({
      key: `${benefit.id}-combined`,
      label: "Employee + Dependents",
      icon: "combined",
      allocated: emp.allocated,
      spent,
      balance: Math.max(emp.allocated - spent, 0),
      segments: [
        { label: "Employee", spent: emp.spent, className: EMP_FILL },
        { label: "Dependents", spent: depSpent, className: DEP_FILL },
      ],
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
        label: "Dependents · shared pool",
        icon: "dependent",
        allocated,
        spent,
        balance: Math.max(allocated - spent, 0),
        segments: [{ label: "Dependents", spent, className: DEP_FILL }],
      });
    } else {
      // Individual — one bar per dependent
      for (const d of deps) {
        bars.push({
          key: `${benefit.id}-${d.beneficiaryId}`,
          label: d.relationship ? `${d.beneficiaryName} · ${d.relationship}` : d.beneficiaryName ?? "Dependent",
          icon: "dependent",
          allocated: d.allocated,
          spent: d.spent,
          balance: d.balance,
          segments: [{ label: "Dependent", spent: d.spent, className: DEP_FILL }],
        });
      }
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
        <div className="space-y-3 border-t border-border px-4 pb-3 pt-3">
          {bars.map((bar) => (
            <div key={bar.key}>
              <div className="flex items-center justify-between gap-3 text-label">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  {bar.icon === "combined" ? (
                    <UsersThree size={13} weight="fill" className="text-muted-foreground" />
                  ) : bar.icon === "dependent" ? (
                    <User size={13} weight="fill" className="text-muted-foreground" />
                  ) : (
                    <User size={13} weight="fill" className="text-primary" />
                  )}
                  {bar.label}
                </span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  <span className="font-semibold text-foreground">{formatRM(bar.spent)}</span>
                  {" / "}
                  {formatRM(bar.allocated)}
                </span>
              </div>
              <div className="mt-1.5">
                <StackedPoolBar allocated={bar.allocated} segments={bar.segments} />
              </div>
            </div>
          ))}
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
      <div className="space-y-4">
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

        <div>
          <p className="mb-2 text-label font-semibold text-muted-foreground">Pool Usage</p>
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
