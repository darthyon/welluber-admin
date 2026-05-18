"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { StatusBadge } from "@/components/shared/status-badge";
import { DetailSection } from "@/components/shared/detail-section";
import { DetailField } from "@/components/shared/detail-field";
import { SharedDataTable } from "@/components/shared/data-table";
import { ActionPopover, type ActionItem } from "@/components/shared/action-popover";
import {
  IdentificationCard,
  Gear,
  TreeStructure,
  Buildings,
  Users,
  ClockCounterClockwise,
  NotePencil,
  Plus,
  ArrowsDownUp,
  CaretLeft,
  Funnel,
  CaretDown,
} from "@phosphor-icons/react";
import { BenefitPolicy, BenefitGroup, Benefit } from "@/types/policy";
import { SERVICES } from "@/lib/mock-data/service-catalog";
import { MOCK_ORGS } from "@/lib/mock-data";
import type { PolicyListItem } from "@/features/policies/types";
import type { EmployeeDirectoryItem } from "@/features/employees/types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PolicyDetailViewProps {
  policy: BenefitPolicy;
  groups: BenefitGroup[];
  benefits: Benefit[];
  versions?: PolicyListItem[];
  versionOverrideCounts?: Record<string, number>;
  parentPolicyName?: string;
  parentBenefits?: Benefit[];
  employees?: EmployeeDirectoryItem[];
  initialTab?: TabId;
  onEdit: () => void;
  onClone: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
  onEditVersion?: (id: string) => void;
  onRemoveVersion?: (id: string) => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TABS = [
  { id: "overview", label: "Overview", icon: IdentificationCard },
  { id: "benefit-groups", label: "Benefit Groups", icon: TreeStructure },
  { id: "versions", label: "Versions", icon: TreeStructure },
  { id: "employees", label: "Assigned Employees", icon: Buildings },
  { id: "audit", label: "Audit Log", icon: ClockCounterClockwise },
] as const;

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  "contract": "Contract",
  "internship": "Internship",
};

export type TabId = (typeof TABS)[number]["id"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCadence(policy: BenefitPolicy): string {
  const parts: string[] = [];
  parts.push(`${policy.refreshCycle} refresh`);
  parts.push(`${policy.utilisationMode} allocation`);
  if ((policy.dependentCoverages?.length ?? 0) > 0) parts.push("+dependents");
  if (policy.refreshStartReference === "fy_start") parts.push("FY start");
  else if (policy.refreshStartReference === "join_date") parts.push("Join date");
  else parts.push("Custom date");
  return parts.join(" · ");
}

// ─── Component ───────────────────────────────────────────────────────────────

export function PolicyDetailView({
  policy,
  groups,
  benefits,
  versions = [],
  versionOverrideCounts = {},
  parentPolicyName,
  parentBenefits,
  employees,
  initialTab,
  onEdit,
  onClone,
  onDeactivate,
  onDelete,
  onEditVersion,
  onRemoveVersion,
}: PolicyDetailViewProps) {
  void onClone;
  void onDeactivate;
  void onDelete;
  const router = useRouter();
  const isVersion = Boolean(policy.parentPolicyId);
  const availableTabs = useMemo(
    () => (isVersion ? TABS.filter((tab) => tab.id !== "versions") : TABS),
    [isVersion]
  );
  const [selectedTab, setSelectedTab] = useState<TabId>(initialTab ?? "overview");
  const activeTab = availableTabs.some((tab) => tab.id === selectedTab) ? selectedTab : "overview";

  const statusVariant = policy.status === "active" ? "emerald" : policy.status === "draft" ? "amber" : "rose";
  const canEdit = policy.status !== "deactivated";

  const canCreateVersion = policy.status === "active" && !policy.parentPolicyId;

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Header Banner - matches org page pattern */}
      <div className="relative z-30 -mx-6 -mt-6 border-b border-border bg-card px-6 pt-6">
        <div className="py-6 lg:px-2">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                <IdentificationCard size={28} weight="duotone" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-display font-semibold tracking-tight text-foreground">
                    {policy.name}
                  </h1>
                  <StatusBadge status={policy.status} variant={statusVariant} dot />
                </div>
                <div className="flex items-center gap-3 text-body text-subtle">
                  <span className="rounded border border-border bg-background px-2 py-0.5 font-mono text-label tracking-widest text-faint uppercase">
                    {policy.code || "NO-CODE"}
                  </span>
                  <span className="text-faint">·</span>
                  <span>{formatCadence(policy)}</span>
                </div>
                {policy.parentPolicyId && (
                  <div className="flex items-center gap-1.5 text-label text-faint mt-1">
                    <TreeStructure size={12} />
                    <span>
                      Derived from{" "}
                      <span className="font-semibold text-foreground">
                        {parentPolicyName || policy.parentPolicyId}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {policy.parentPolicyId && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() =>
                    router.push(`/policies?policyId=${policy.parentPolicyId}&mode=view&wizard=open`)
                  }
                  className="rounded-full text-body font-medium transition-all"
                >
                  <CaretLeft size={16} weight="bold" className="mr-1.5" />
                  Back to Parent Policy
                </Button>
              )}
              {canCreateVersion && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push(`/policies/${policy.id}/versions/new`)}
                  className="rounded-full text-body font-medium transition-all"
                >
                  <TreeStructure size={16} weight="bold" className="mr-1.5" />
                  Create Version
                </Button>
              )}
              {canEdit && (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={onEdit}
                  className="rounded-full text-body font-medium transition-all"
                >
                  <NotePencil size={16} weight="bold" className="mr-1.5" />
                  Edit Policy
                </Button>
              )}
            </div>
          </div>

          {/* Tabs - matches org page pattern */}
          <div className="mt-8 flex items-center gap-6 border-b border-border">
            {availableTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 border-b-2 py-3 text-body font-medium transition-all duration-300",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                  )}
                >
                  <Icon size={16} weight={isActive ? "fill" : "regular"} className={cn("transition-colors", isActive && "text-primary")} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {activeTab === "overview" && (
              isVersion ? (
                <VersionOverviewTab
                  policy={policy}
                  groups={groups}
                  benefits={benefits}
                  parentBenefits={parentBenefits}
                  parentPolicyName={parentPolicyName}
                />
              ) : (
                <OverviewTab policy={policy} groups={groups} benefits={benefits} onEdit={onEdit} />
              )
            )}
            {activeTab === "benefit-groups" && (
              <BenefitGroupsTab policy={policy} groups={groups} benefits={benefits} onEdit={onEdit} />
            )}
            {!isVersion && activeTab === "versions" && (
              <VersionsTab
                policy={policy}
                versions={versions}
                overrideCounts={versionOverrideCounts}
                onCreateVersion={() => router.push(`/policies/${policy.id}/versions/new`)}
                onViewVersion={(id) => router.push(`/policies?policyId=${id}&mode=view&wizard=open`)}
                onEditVersion={onEditVersion ?? ((id) => router.push(`/policies/${id}/edit`))}
                onRemoveVersion={onRemoveVersion ?? (() => {})}
              />
            )}
            {activeTab === "employees" && (
              <AssignedEmployeesTab policy={policy} employees={employees} />
            )}
            {activeTab === "audit" && (
              <AuditLogTab />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Versions Tab ─────────────────────────────────────────────────────────

function VersionsTab({
  policy,
  versions,
  overrideCounts = {},
  onCreateVersion,
  onViewVersion,
  onEditVersion,
  onRemoveVersion,
}: {
  policy: BenefitPolicy;
  versions: PolicyListItem[];
  overrideCounts: Record<string, number>;
  onCreateVersion: () => void;
  onViewVersion: (id: string) => void;
  onEditVersion: (id: string) => void;
  onRemoveVersion: (id: string) => void;
}) {
  const canCreateVersion = policy.status === "active" && !policy.parentPolicyId;

  const versionRows = useMemo(
    () => versions.map((v, i) => ({ ...v, _versionLabel: `1.${i + 1}` })),
    [versions]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-heading font-semibold text-foreground">
            {versions.length > 0 ? `Versions (${versions.length})` : "Versions"}
          </h3>
          <p className="text-body text-muted-foreground mt-1">
            Override benefit amounts for specific employee groups and individuals.
          </p>
        </div>
        {canCreateVersion && (
          <Button onClick={onCreateVersion} className="h-9 px-5 rounded-full text-body font-medium shadow-sm">
            <Plus size={15} weight="bold" className="mr-1.5" />
            Create Version
          </Button>
        )}
      </div>

      {versions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-lg border border-dashed border-border/60 text-center">
          <div className="w-14 h-14 rounded-lg bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 flex items-center justify-center text-violet-500 mb-4">
            <TreeStructure size={28} weight="duotone" />
          </div>
          <p className="text-body font-semibold text-foreground">No versions yet</p>
          <p className="text-label text-faint mt-1 max-w-sm">
            Create a version to tailor benefit amounts for a specific tier, department, or individual employee without changing the base policy.
          </p>
          {canCreateVersion && (
            <Button onClick={onCreateVersion} size="sm" className="mt-6 text-label font-medium">
              <Plus size={14} weight="bold" className="mr-1.5" />
              Create Version
            </Button>
          )}
          {!canCreateVersion && policy.parentPolicyId && (
            <p className="text-label text-faint mt-4 italic">
              Versions can only be created from parent policies.
            </p>
          )}
        </div>
      ) : (
        <SharedDataTable
          data={versionRows}
          columns={[
            {
              header: "Version",
              align: "center",
              render: (row) => (
                <span className="text-body font-semibold text-foreground font-mono tabular-nums">
                  {(row as typeof versionRows[number])._versionLabel}
                </span>
              ),
            },
            {
              header: "Version Name",
              accessorKey: "name",
              render: (row) => (
                <div>
                  <p className="text-body font-semibold text-foreground">{row.name}</p>
                  {row.code && (
                    <p className="text-label font-mono text-faint mt-0.5">{row.code}</p>
                  )}
                </div>
              ),
            },
            {
              header: "Status",
              accessorKey: "status",
              render: (row) => (
                <StatusBadge
                  status={row.status}
                  variant={row.status === "active" ? "emerald" : row.status === "draft" ? "amber" : "rose"}
                  dot
                />
              ),
            },
            {
              header: "Employees",
              align: "center",
              render: (row) => {
                const count = row.targetEmployeeIds?.length ?? 0;
                return (
                  <span className="text-body tabular-nums text-subtle font-medium">
                    {count > 0 ? count : "—"}
                  </span>
                );
              },
            },
            {
              header: "Overrides",
              align: "center",
              render: (row) => {
                const oc = overrideCounts[row.id] ?? 0;
                return oc > 0 ? (
                  <Badge variant="secondary" className="inline-flex items-center gap-1">
                    <ArrowsDownUp size={10} weight="bold" />
                    {oc}
                  </Badge>
                ) : (
                  <span className="text-label text-faint">—</span>
                );
              },
            },
            {
              header: "Actions",
              headerClassName: "text-right",
              align: "right",
              render: (row) => {
                const actions: ActionItem[] = [
                  {
                    label: "View version details",
                    onClick: (e: React.MouseEvent) => {
                      e.stopPropagation();
                      onViewVersion(row.id);
                    },
                  },
                  {
                    label: "Edit version",
                    onClick: (e: React.MouseEvent) => {
                      e.stopPropagation();
                      onEditVersion(row.id);
                    },
                  },
                  {
                    label: "Remove version",
                    onClick: (e: React.MouseEvent) => {
                      e.stopPropagation();
                      onRemoveVersion(row.id);
                    },
                    isDanger: true,
                  },
                ];
                return (
                  <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                    <ActionPopover actions={actions} />
                  </div>
                );
              },
            },
          ]}
          onRowClick={(row) => onViewVersion(row.id)}
          rowsPerPage={10}
          ghost
        />
      )}
    </div>
  );
}

function OverviewTab({
  policy,
  groups,
  benefits,
  onEdit,
}: {
  policy: BenefitPolicy;
  groups: BenefitGroup[];
  benefits: Benefit[];
  onEdit: () => void;
}) {
  const refreshLabels: Record<string, string> = {
    fy_start: "Organisation Financial Year",
    join_date: "Employee Join Date",
    custom_date: "Custom Start Date",
  };

  return (
    <div className="space-y-6">
      {/* Policy Overview */}
      <DetailSection
        title="Policy Overview"
        icon={<IdentificationCard size={18} weight="duotone" />}
        description="Basic information and configuration"
      >
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          <DetailField label="Policy Name" value={policy.name} />
          <DetailField label="Policy Code" value={policy.code || "—"} />
          <DetailField
            label="Status"
            value={
              <span className="capitalize">{policy.status}</span>
            }
          />
          <DetailField
            label="Organisation"
            value={policy.organizationId}
          />
          <div className="col-span-2 md:col-span-4">
            <DetailField
              label="Description"
              value={policy.description || "—"}
            />
          </div>
          <div className="col-span-2 md:col-span-4">
            <DetailField
              label="Employment Types"
               value={policy.eligibleEmploymentTypes.map((t) => t.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")).join(", ")}
            />
          </div>
        </div>
      </DetailSection>

      {/* Pool & Cycle */}
      <DetailSection
        title="Pool & Cycle"
        icon={<Gear size={18} weight="duotone" />}
        description="Fund allocation and refresh configuration"
      >
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          <DetailField label="Dependents" value={(policy.dependentCoverages?.length ?? 0) > 0 ? "Covered" : "Employee Only"} />
          {(policy.dependentCoverages?.length ?? 0) > 0 && (
            <DetailField
              label="Dependent Types"
              value={policy.dependentCoverages?.map((c) => c.type).join(", ") || "—"}
            />
          )}
          {(policy.dependentCoverages?.length ?? 0) > 0 && (
            <DetailField label="Dependents Pool Type" value={policy.dependentsPoolType === "SharedWithEmployee" ? "Shared with Employee" : policy.dependentsPoolType || "—"} />
          )}
          <DetailField label="Utilisation Mode" value={policy.utilisationMode === "Fixed" ? "Fixed Allocation" : "Prorated Allocation"} />
          {policy.utilisationMode === "Prorated" && (
            <DetailField label="Prorate Unit" value={policy.prorateUnit || "—"} />
          )}
          <DetailField label="Refresh Cycle" value={policy.refreshCycle} />
          <DetailField
            label="Start Reference"
            value={refreshLabels[policy.refreshStartReference] || policy.refreshStartReference}
          />
          {policy.refreshStartReference === "custom_date" && (
            <DetailField label="Custom Date" value={policy.refreshCustomDate || "—"} />
          )}
        </div>
      </DetailSection>

      {/* Eligibility */}
      {policy.eligibility && (
        <DetailSection
          title="Employee Eligibility"
          icon={<Users size={18} weight="duotone" />}
          description="Filter criteria for automatic employee assignment"
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
            <DetailField
              label="Age Range"
              value={
                policy.eligibility.minAge || policy.eligibility.maxAge
                  ? `${policy.eligibility.minAge || "Any"} — ${policy.eligibility.maxAge || "Any"}`
                  : "Any age"
              }
            />
            <DetailField
              label="Gender"
              value={
                <span className="capitalize">{policy.eligibility.gender || "All"}</span>
              }
            />
            <DetailField
              label="Tier Restrictions"
              value={
                policy.eligibility.tierIds?.length
                  ? `${policy.eligibility.tierIds.length} tier(s)`
                  : "None"
              }
            />
          </div>
        </DetailSection>
      )}

    </div>
  );
}

// ─── Benefit Groups Tab ───────────────────────────────────────────────────────

function BenefitGroupsTab({
  policy,
  groups,
  benefits,
  onEdit,
}: {
  policy: BenefitPolicy;
  groups: BenefitGroup[];
  benefits: Benefit[];
  onEdit: () => void;
}) {
  return (
    <div className="space-y-6">
      <DetailSection
        title="Benefit Groups"
        icon={<TreeStructure size={18} weight="duotone" />}
        description="Benefits and amounts configured per group"
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={onEdit}
            className="flex h-8 items-center gap-2 text-label font-medium"
          >
            <NotePencil size={14} weight="bold" />
            Edit Groups
          </Button>
        }
      >
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-muted/10 rounded-lg border border-dashed border-border/60">
            <TreeStructure size={36} weight="duotone" className="text-faint mb-3" />
            <p className="text-body font-medium text-muted-foreground">No benefit groups configured.</p>
            <p className="text-label text-faint mt-1">Add groups to define which benefits are available.</p>
            <Button variant="ghost" size="sm" onClick={onEdit} className="mt-3 text-primary font-semibold">
              <NotePencil size={14} weight="bold" className="mr-1.5" />
              Edit Policy to Add Groups
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => {
              const groupBenefits = benefits.filter((b) => b.groupId === group.id);
              return (
                <div key={group.id} className="rounded-lg border border-border bg-card/40 overflow-hidden">
                  <div className="flex items-start justify-between gap-3 p-4 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <TreeStructure size={18} weight="duotone" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-body font-semibold text-foreground">{group.name}</p>
                          {group.isTaxable === true ? (
                            <Badge variant="secondary">Taxable (BIK)</Badge>
                          ) : group.isTaxable === false ? (
                            <Badge variant="secondary">Non-Taxable</Badge>
                          ) : null}
                        </div>
                        {group.description && (
                          <p className="text-label text-muted-foreground">{group.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-body font-semibold text-primary">
                        {group.distributionType === "SharedAmount"
                          ? `RM ${group.maxUsagePerCycle?.toFixed(2) || "0.00"}`
                          : "Individual"}
                      </p>
                      <p className="text-label text-faint font-medium">
                        {group.distributionType === "SharedAmount" ? "Shared Pool" : "Per Benefit"}
                      </p>
                      <p className="text-label text-faint font-medium">
                        Utilisation:{" "}
                        {group.utilisationMode
                          ? group.utilisationMode === "Fixed"
                            ? "Fixed"
                            : `Prorated (${group.prorateUnit || policy.prorateUnit || "Monthly"})`
                          : policy.utilisationMode === "Fixed"
                          ? "Inherit (Fixed)"
                          : `Inherit (Prorated · ${policy.prorateUnit || "Monthly"})`}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    {groupBenefits.map((benefit) => {
                      const coPayment = group.distributionType === "SharedAmount" ? group.coPayment : benefit.coPayment;
                      return (
                        <div
                          key={benefit.id}
                          className="flex items-center justify-between px-4 py-3 rounded-lg bg-muted/30 border border-border/50"
                        >
                          <div className="flex items-center gap-3">
                            <IdentificationCard size={16} className="text-faint" />
                            <span className="text-body font-medium text-foreground">
                              {SERVICES.find((s) => s.id === benefit.serviceId)?.name || benefit.serviceId}
                            </span>
                            {coPayment?.required && (
                              <Badge variant="secondary">
                                Co-pay{" "}
                                {coPayment.type === "Percentage"
                                  ? `${coPayment.value}%`
                                  : `RM ${coPayment.value}`}
                              </Badge>
                            )}
                          </div>
                          <span className="text-body font-semibold text-foreground font-mono tabular-nums">
                            RM {benefit.amount.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                    {groupBenefits.length === 0 && (
                      <p className="text-center py-4 text-label text-faint italic">No benefits configured for this group.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DetailSection>
    </div>
  );
}

// ─── Version Overview Tab ─────────────────────────────────────────────────────

function VersionOverviewTab({
  policy,
  groups,
  benefits,
  parentBenefits,
  parentPolicyName,
}: {
  policy: BenefitPolicy;
  groups: BenefitGroup[];
  benefits: Benefit[];
  parentBenefits?: Benefit[];
  parentPolicyName?: string;
}) {
  const router = useRouter();

  function formatRM(amount: number): string {
    return `RM ${amount.toFixed(2)}`;
  }

  function getServiceName(serviceId: string): string {
    return SERVICES.find(s => s.id === serviceId)?.name ?? serviceId;
  }

  const tierOptions = useMemo(() => {
    const org = MOCK_ORGS.find(o => o.id === policy.organizationId);
    return (org?.tierConfigs ?? []).map(t => ({ value: t.id, label: t.code ? `${t.code} - ${t.name}` : t.name }));
  }, [policy.organizationId]);

  const departmentOptions = useMemo(() => {
    const org = MOCK_ORGS.find(o => o.id === policy.organizationId);
    return (org?.departmentConfigs ?? []).map(d => ({ value: d.id, label: d.code ? `${d.code} - ${d.name}` : d.name }));
  }, [policy.organizationId]);

  const diffEntries = useMemo(() => {
    if (!parentBenefits || parentBenefits.length === 0) return [];
    return benefits
      .filter(vb => {
        const parent = parentBenefits.find(pb => pb.serviceId === vb.serviceId);
        return parent && parent.amount !== vb.amount;
      })
      .map(vb => {
        const parent = parentBenefits.find(pb => pb.serviceId === vb.serviceId)!;
        const group = groups.find(g => g.id === vb.groupId);
        return { benefit: vb, parentAmount: parent.amount, groupName: group?.name ?? "—" };
      });
  }, [benefits, parentBenefits, groups]);

  const groupedDiffs = useMemo(() => {
    const map = new Map<string, typeof diffEntries>();
    diffEntries.forEach(entry => {
      const existing = map.get(entry.groupName) ?? [];
      existing.push(entry);
      map.set(entry.groupName, existing);
    });
    return Array.from(map.entries());
  }, [diffEntries]);

  const hasOverrides = diffEntries.length > 0;

  const eligibleEmpLabels = (policy.eligibleEmploymentTypes ?? []).map(et => EMPLOYMENT_TYPE_LABELS[et] ?? et);
  const tierLabels = (policy.eligibility?.tierIds ?? []).map(id => tierOptions.find(t => t.value === id)?.label ?? id);
  const deptLabels = (policy.eligibility?.departmentIds ?? []).map(id => departmentOptions.find(d => d.value === id)?.label ?? id);

  return (
    <div className="space-y-6">
      {/* Version Summary */}
      <div className="bg-card border border-border rounded-lg shadow-sm p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
            <TreeStructure size={20} weight="duotone" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <h3 className="text-lead font-semibold text-foreground truncate">{policy.name}</h3>
              <StatusBadge
                status={policy.status}
                variant={policy.status === "active" ? "emerald" : policy.status === "draft" ? "amber" : "rose"}
                dot
              />
            </div>
            {policy.code && (
              <p className="text-label font-mono text-faint mt-0.5">{policy.code}</p>
            )}
            {policy.description && (
              <p className="text-body text-subtle mt-2">{policy.description}</p>
            )}
            <div className="flex items-center gap-1.5 mt-3 text-label text-faint">
              <TreeStructure size={12} />
              <span>
                Derived from{" "}
                <button
                  onClick={() => router.push(`/policies?policyId=${policy.parentPolicyId}&mode=view&wizard=open`)}
                  className="font-semibold text-primary hover:underline"
                >
                  {parentPolicyName || policy.parentPolicyId}
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Targeting - Collapsible accordion */}
      <section className="bg-card border border-border rounded-lg shadow-sm">
        <Collapsible defaultOpen={false}>
          <CollapsibleTrigger className="w-full flex items-center gap-3 p-4 group">
            <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <Funnel size={14} weight="duotone" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-body font-semibold text-foreground">Targeting</p>
              <p className="text-label text-muted-foreground truncate">
                {eligibleEmpLabels.length} employment type{eligibleEmpLabels.length !== 1 ? "s" : ""}
                {" · "}{tierLabels.length} tier{tierLabels.length !== 1 ? "s" : ""}
                {" · "}{deptLabels.length} department{deptLabels.length !== 1 ? "s" : ""}
              </p>
            </div>
            <CaretDown size={14} weight="bold" className="text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4 space-y-4">
            {eligibleEmpLabels.length > 0 && (
              <div className="space-y-2">
                <label className="text-label font-medium text-subtle">Employment Types</label>
                <div className="flex flex-wrap gap-1.5">
                  {eligibleEmpLabels.map(label => (
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
                  {tierLabels.map(label => (
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
                  {deptLabels.map(label => (
                    <Badge key={label} variant="secondary" className="px-3 py-1">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {eligibleEmpLabels.length === 0 && tierLabels.length === 0 && deptLabels.length === 0 && (
              <p className="text-label text-faint italic">No targeting filters applied.</p>
            )}
          </CollapsibleContent>
        </Collapsible>
      </section>

      {/* Benefit Amount Changes */}
      {parentBenefits && parentBenefits.length > 0 ? (
        <section className="bg-card border border-border rounded-lg shadow-sm p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <ArrowsDownUp size={18} weight="duotone" />
            </div>
            <div>
              <h3 className="text-lead font-semibold text-foreground">Benefit Amount Changes</h3>
              <p className="text-label text-muted-foreground mt-0.5">
                {hasOverrides ? "Overridden amounts relative to the parent policy" : "All amounts match the parent policy"}
              </p>
            </div>
          </div>
          {hasOverrides ? (
            <div className="space-y-3">
              {groupedDiffs.map(([groupName, entries]) => (
                <div key={groupName} className="rounded-lg border border-border bg-card/40 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/30">
                    <TreeStructure size={14} className="text-faint" />
                    <span className="text-label font-semibold text-foreground">{groupName}</span>
                  </div>
                  <div className="divide-y divide-border/40">
                    {entries.map(({ benefit, parentAmount }) => (
                      <div key={benefit.id} className="flex items-center justify-between px-4 py-3">
                        <span className="text-body font-medium text-foreground">{getServiceName(benefit.serviceId)}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-body text-faint line-through font-mono tabular-nums">{formatRM(parentAmount)}</span>
                          <span className="text-body font-semibold text-primary font-mono tabular-nums">{formatRM(benefit.amount)}</span>
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
            <div className="flex flex-col items-center justify-center py-12 bg-muted/10 rounded-lg border border-dashed border-border/60 text-center">
              <ArrowsDownUp size={32} weight="duotone" className="text-faint mb-3" />
              <p className="text-body font-medium text-muted-foreground">No benefit changes detected.</p>
              <p className="text-label text-faint mt-1">All benefit amounts in this version match the parent policy.</p>
            </div>
          )}
        </section>
      ) : (
        <section className="bg-card border border-border rounded-lg shadow-sm p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <TreeStructure size={18} weight="duotone" />
            </div>
            <div>
              <h3 className="text-lead font-semibold text-foreground">Benefit Amounts</h3>
              <p className="text-label text-muted-foreground mt-0.5">Configured benefits for this version</p>
            </div>
          </div>
          <div className="space-y-3">
            {groups.map(group => {
              const groupBenefits = benefits.filter(b => b.groupId === group.id);
              return (
                <div key={group.id} className="rounded-lg border border-border bg-card/40 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/30">
                    <TreeStructure size={14} className="text-faint" />
                    <span className="text-label font-semibold text-foreground">{group.name}</span>
                  </div>
                  <div className="divide-y divide-border/40">
                    {groupBenefits.map(benefit => (
                      <div key={benefit.id} className="flex items-center justify-between px-4 py-3">
                        <span className="text-body font-medium text-foreground">{getServiceName(benefit.serviceId)}</span>
                        <span className="text-body font-semibold text-foreground font-mono tabular-nums">{formatRM(benefit.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Assigned Employees Tab ──────────────────────────────────────────────────

function AssignedEmployeesTab({ employees }: { policy: BenefitPolicy; employees?: EmployeeDirectoryItem[] }) {
  const employeeList = employees ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-heading font-semibold text-foreground">Assigned Employees</h3>
          <p className="text-body text-muted-foreground mt-1">
            {employeeList.length} employee{employeeList.length !== 1 ? "s" : ""} currently assigned.
          </p>
        </div>
      </div>

      {employeeList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-lg border border-dashed border-border/60 text-center">
          <Users size={36} weight="duotone" className="text-faint mb-3" />
          <p className="text-body font-medium text-muted-foreground">No assigned employees</p>
          <p className="text-label text-faint mt-1 max-w-xs">
            Employees matching the policy eligibility criteria will appear here once assigned.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <div className="grid grid-cols-12 text-label font-semibold text-muted-foreground">
              <span className="col-span-3">Employee</span>
              <span className="col-span-3">Department</span>
              <span className="col-span-2">Tier</span>
              <span className="col-span-2">Join Date</span>
              <span className="col-span-2">Status</span>
            </div>
          </div>
          <div className="divide-y divide-border/50">
            {employeeList.map((emp) => (
              <div key={emp.id} className="grid grid-cols-12 items-center px-4 py-3 hover:bg-muted/20 transition-colors">
                <div className="col-span-3">
                  <p className="text-body font-semibold text-foreground">{emp.name}</p>
                  <p className="text-label text-faint font-mono">{emp.empCode}</p>
                </div>
                <div className="col-span-3">
                  <span className="text-body text-subtle">{emp.department}</span>
                </div>
                <div className="col-span-2">
                  <Badge variant="secondary">
                    {emp.tier}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <span className="text-body text-subtle">{emp.joinDate}</span>
                </div>
                <div className="col-span-2">
                  <StatusBadge
                    status={emp.status === "active" ? "Active" : emp.status === "on-leave" ? "On Leave" : "Inactive"}
                    variant={emp.status === "active" ? "emerald" : emp.status === "on-leave" ? "amber" : "zinc"}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Audit Log Tab (Placeholder) ─────────────────────────────────────────────

function AuditLogTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-heading font-semibold text-foreground">Audit Log</h3>
        <p className="text-body text-muted-foreground mt-1">Track changes to this policy over time.</p>
      </div>
      <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-lg border border-dashed border-border/60">
        <div className="w-16 h-16 rounded-lg bg-card border border-border flex items-center justify-center text-muted/30 mb-4">
          <ClockCounterClockwise size={32} weight="duotone" />
        </div>
        <p className="text-body font-medium text-muted-foreground">No audit events yet.</p>
        <p className="text-label text-faint mt-1">Policy changes will be logged here once activity begins.</p>
      </div>
    </div>
  );
}
