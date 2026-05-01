"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { DetailSection } from "@/components/shared/detail-section";
import { DetailField } from "@/components/shared/detail-field";
import {
  IdentificationCard,
  Gear,
  TreeStructure,
  Buildings,
  Users,
  ClockCounterClockwise,
  NotePencil,
  Copy,
  XCircle,
  Trash,
  ShieldCheck,
  CheckCircle,
  Warning,
} from "@phosphor-icons/react";
import { BenefitPolicy, BenefitGroup, Benefit, TierVariant } from "@/types/policy";
import { TierVariantsTab } from "./tier-variants-tab";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PolicyDetailViewProps {
  policy: BenefitPolicy;
  groups: BenefitGroup[];
  benefits: Benefit[];
  tiers: TierVariant[];
  onEdit: () => void;
  onClone: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TABS = [
  { id: "overview", label: "Overview", icon: IdentificationCard },
  { id: "tiers", label: "Tier Variants", icon: Users },
  { id: "employees", label: "Assigned Employees", icon: Buildings },
  { id: "audit", label: "Audit Log", icon: ClockCounterClockwise },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCadence(policy: BenefitPolicy): string {
  const parts: string[] = [];
  parts.push(`${policy.refreshCycle} refresh`);
  parts.push(`${policy.utilisationMode} allocation`);
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
  tiers,
  onEdit,
  onClone,
  onDeactivate,
  onDelete,
}: PolicyDetailViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const statusVariant = policy.status === "active" ? "emerald" : policy.status === "draft" ? "amber" : "rose";
  const canEdit = policy.status !== "deactivated";
  const canDelete = policy.status === "draft" || policy.status === "deactivated";

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
              </div>
            </div>

            <div className="flex items-center gap-2">
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
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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
              <OverviewTab policy={policy} groups={groups} benefits={benefits} onEdit={onEdit} />
            )}
            {activeTab === "tiers" && (
              <TierVariantsTab
                policy={policy}
                groups={groups}
                benefits={benefits}
                tiers={tiers}
              />
            )}
            {activeTab === "employees" && (
              <AssignedEmployeesTab policy={policy} />
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

// ─── Overview Tab ────────────────────────────────────────────────────────────

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
              label="Eligible Employment Types"
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
          <DetailField label="Pool Type" value={policy.benefitPoolType} />
          <DetailField label="Utilisation Mode" value={policy.utilisationMode} />
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

      {/* Benefit Groups */}
      <DetailSection
        title="Benefit Groups"
        icon={<TreeStructure size={18} weight="duotone" />}
        description="Services and amounts configured per group"
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
            <p className="text-label text-faint mt-1">Add groups to define which services are available.</p>
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
                        <p className="text-body font-semibold text-foreground">{group.name}</p>
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
                        {group.distributionType === "SharedAmount" ? "Shared Pool" : "Per Service"}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    {groupBenefits.map((benefit) => (
                      <div
                        key={benefit.id}
                        className="flex items-center justify-between px-4 py-3 rounded-lg bg-muted/30 border border-border/50"
                      >
                        <div className="flex items-center gap-3">
                          <IdentificationCard size={16} className="text-faint" />
                          <span className="text-body font-medium text-foreground">
                            Service {benefit.serviceId}
                          </span>
                          {benefit.coPayment.required && (
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-label font-medium">
                              Co-pay{" "}
                              {benefit.coPayment.type === "Percentage"
                                ? `${benefit.coPayment.value}%`
                                : `RM ${benefit.coPayment.value}`}
                            </span>
                          )}
                        </div>
                        <span className="text-body font-semibold text-foreground font-mono tabular-nums">
                          RM {benefit.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                    {groupBenefits.length === 0 && (
                      <p className="text-center py-4 text-label text-faint italic">No services configured for this group.</p>
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

// ─── Assigned Employees Tab ──────────────────────────────────────────────────

const MOCK_EMPLOYEES = [
  { id: "emp_1", name: "Ahmad bin Ismail", empCode: "ACM-001", department: "Engineering", tier: "Band 2", status: "active", joinDate: "15 Jan 2023" },
  { id: "emp_2", name: "Sarah Tan", empCode: "ACM-042", department: "Product", tier: "Band 1", status: "active", joinDate: "03 Mar 2022" },
  { id: "emp_3", name: "Rajesh Kumar", empCode: "ACM-156", department: "Design", tier: "Band 3", status: "on-leave", joinDate: "20 Jun 2023" },
  { id: "emp_4", name: "Lim Wei Ling", empCode: "ACM-089", department: "Marketing", tier: "Band 2", status: "active", joinDate: "12 Sep 2021" },
];

function AssignedEmployeesTab({ policy }: { policy: BenefitPolicy }) {
  const eligibleTypes = policy.eligibleEmploymentTypes;
  const filteredEmployees = MOCK_EMPLOYEES.filter((e) => {
    // In reality this would check eligibility rules
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-heading font-semibold text-foreground">Assigned Employees</h3>
          <p className="text-body text-muted-foreground mt-1">
            {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? "s" : ""} matched by policy criteria.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <div className="grid grid-cols-12 text-label font-semibold text-muted-foreground">
            <span className="col-span-3">Employee</span>
            <span className="col-span-2">Department</span>
            <span className="col-span-2">Tier</span>
            <span className="col-span-2">Join Date</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-1 text-right">Actions</span>
          </div>
        </div>
        <div className="divide-y divide-border/50">
          {filteredEmployees.map((emp) => (
            <div key={emp.id} className="grid grid-cols-12 items-center px-4 py-3 hover:bg-muted/20 transition-colors">
              <div className="col-span-3">
                <p className="text-body font-semibold text-foreground">{emp.name}</p>
                <p className="text-label text-faint font-mono">{emp.empCode}</p>
              </div>
              <div className="col-span-2">
                <span className="text-body text-subtle">{emp.department}</span>
              </div>
              <div className="col-span-2">
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-label font-medium">
                  {emp.tier}
                </span>
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
              <div className="col-span-1 text-right">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-label text-primary hover:bg-primary/5">
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
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
