"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useQueryState, useUpdateQueryParams } from "@/hooks/use-tab-persistence";
import {
  TreeStructure,
  IdentificationCard,
  MagnifyingGlass,
  DownloadSimple,
  CheckCircle,
  Warning,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterItem } from "@/components/shared/filter-item";
import { StatusBadge } from "@/components/shared/status-badge";
import { SharedDataTable, Column } from "@/components/shared/data-table";
import { ActionPopover, type ActionItem } from "@/components/shared/action-popover";
import { PolicyDetailView } from "@/components/host/policies/policy-detail-view";
import { PolicyCreationLauncher } from "@/components/host/policies/policy-creation-launcher";
import { MOCK_POLICIES, MOCK_POLICY_DATA_MAP } from "@/lib/mock-data";
import type { PolicyListItem, PolicyData } from "@/features/policies/types";
import { MOCK_EMPLOYEES } from "@/lib/mock-data";

// ─── Types ───────────────────────────────────────────────────────────────────

type StatusFilter = "all" | "draft" | "active" | "deactivated";

// ─── Clone Dialog ────────────────────────────────────────────────────────────

function ClonePolicyDialog({
  isOpen,
  original,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  original: PolicyListItem | null;
  onClose: () => void;
  onConfirm: (name: string) => void;
}) {
  const [name, setName] = useState(() => (original ? `${original.name} — Copy` : ""));

  if (!isOpen || !original) return null;

  return (
    <div className="fixed inset-0 z-[100] flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-[2px] duration-300 fade-in">
      <div className="w-full max-w-md animate-in overflow-hidden rounded-[24px] border border-border bg-card shadow-2xl duration-300 zoom-in-95">
        <div className="p-8 pb-4">
          <h3 className="text-heading font-semibold text-foreground text-balance">Clone Policy</h3>
          <p className="text-body font-medium text-subtle mt-1">
            Create a deep copy of <span className="text-foreground font-semibold">{original.name}</span>.
          </p>
        </div>

        <div className="px-8 pb-2">
          <label className="text-label font-medium text-subtle">New policy name</label>
          <input
            type="text"
            className="mt-1.5 w-full px-4 py-2.5 bg-background border border-border rounded-lg text-body font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/40 transition-all"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 border-t border-border bg-muted/30 p-8 pt-4 mt-6">
          <Button variant="ghost" className="h-12 flex-1 rounded-lg font-semibold hover:bg-muted" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="h-12 flex-1 rounded-lg font-semibold shadow-lg shadow-primary/20"
            disabled={!name.trim()}
            onClick={() => onConfirm(name.trim())}
          >
            Clone Policy
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Confirmation Dialog ─────────────────────────────────────────────────────

function ConfirmDialog({
  isOpen,
  title,
  description,
  warning,
  confirmLabel,
  isDanger,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  title: string;
  description: string;
  warning?: string;
  confirmLabel: string;
  isDanger?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-[2px] duration-300 fade-in">
      <div className="w-full max-w-md animate-in overflow-hidden rounded-[24px] border border-border bg-card shadow-2xl duration-300 zoom-in-95">
        <div className="p-8 pb-4">
          <h3 className="text-heading font-semibold text-foreground text-balance">{title}</h3>
          <p className="text-body font-medium text-subtle mt-1">{description}</p>
          {warning && (
            <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
              <Warning size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-label text-amber-700 dark:text-amber-300">{warning}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-border bg-muted/30 p-8 pt-4">
          <Button variant="ghost" className="h-12 flex-1 rounded-lg font-semibold hover:bg-muted" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className={cn(
              "h-12 flex-1 rounded-lg font-semibold shadow-lg",
              isDanger ? "bg-destructive text-primary-foreground shadow-rose-500/20 hover:bg-destructive/90" : "shadow-primary/20"
            )}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Content ────────────────────────────────────────────────────────────

function PoliciesContent() {
  const router = useRouter();
  const [wizardStatus] = useQueryState("wizard");
  const [wizardMode] = useQueryState("mode");
  const [activePolicyId] = useQueryState("policyId");
  const updateQueryParams = useUpdateQueryParams();

  const showWizard = wizardStatus === "open";


  // State
  const [policies, setPolicies] = useState<PolicyListItem[]>(MOCK_POLICIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [orgFilter, setOrgFilter] = useState<string>("all");

  // Mock groups/benefits per policy
  const [policyDataMap, setPolicyDataMap] = useState<Record<string, PolicyData>>(MOCK_POLICY_DATA_MAP);

  // Dialogs
  const [cloneTarget, setCloneTarget] = useState<PolicyListItem | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    warning?: string;
    confirmLabel: string;
    isDanger?: boolean;
    onConfirm: () => void;
  }>({ open: false, title: "", description: "", confirmLabel: "", onConfirm: () => {} });

  const [toast, setToast] = useState<string | null>(null);

  const filteredPolicies = useMemo(() => {
    return policies.filter(p => {
      const matchesSearch = !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      const matchesOrg = orgFilter === "all" || p.orgName === orgFilter || p.organizationId === orgFilter;
      return matchesSearch && matchesStatus && matchesOrg;
    });
  }, [policies, searchQuery, statusFilter, orgFilter]);

  const orgFilterOptions = useMemo(() => {
    const allOrgs = new Map<string, string>();
    policies.forEach(p => {
      if (p.orgName || p.organizationId) {
        allOrgs.set(p.organizationId, p.orgName || p.organizationId);
      }
    });
    return [
      { label: "All Organisations", value: "all" },
      ...Array.from(allOrgs.entries()).map(([id, name]) => ({ label: name, value: id })),
    ];
  }, [policies]);

  const statusCounts = useMemo(() => {
    return {
      all: policies.length,
      draft: policies.filter(p => p.status === "draft").length,
      active: policies.filter(p => p.status === "active").length,
      deactivated: policies.filter(p => p.status === "deactivated").length,
    };
  }, [policies]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleCreateNew = () => router.push("/policies/new");
  const handleCreateFromTemplate = (templateId: string) => router.push(`/policies/new?template=${templateId}`);

  const handleClone = (policy: PolicyListItem) => {
    setCloneTarget(policy);
  };

  const confirmClone = (name: string) => {
    if (!cloneTarget) return;
    const newId = Math.random().toString(36).substr(2, 9);
    const sourceData = policyDataMap[cloneTarget.id];
    const newPolicy: PolicyListItem = {
      ...cloneTarget,
      id: newId,
      name,
      code: `${cloneTarget.code}-CLONE`,
      status: "draft",
      createdAt: new Date().toISOString(),
      clonedFrom: cloneTarget.name,
    };
    // Deep clone groups and benefits for the new policy
    if (sourceData) {
      const newGroups = sourceData.groups.map(g => ({
        ...g,
        id: `${g.id}-clone-${newId}`,
        policyId: newId,
      }));
      const newBenefits = sourceData.benefits.map(b => {
        const newGroupId = newGroups.find(g => g.name === sourceData.groups.find(sg => sg.id === b.groupId)?.name)?.id || b.groupId;
        return { ...b, id: `${b.id}-clone-${newId}`, groupId: newGroupId };
      });
      setPolicyDataMap(prev => ({
        ...prev,
        [newId]: { groups: newGroups, benefits: newBenefits },
      }));
    }
    setPolicies(prev => [...prev, newPolicy]);
    setCloneTarget(null);
    showToast(`Policy "${name}" cloned successfully`);
  };

  const handleDeactivate = (policy: PolicyListItem) => {
    const activeAssignments = 0; // Mock: would come from API
    const activeSubPolicies = policies.filter(p => p.parentPolicyId === policy.id && p.status === "active").length;
    const warningParts: string[] = [];
    if (activeAssignments > 0) warningParts.push(`Policy has ${activeAssignments} active employee assignments.`);
    if (activeSubPolicies > 0) warningParts.push(`This policy has ${activeSubPolicies} active sub-polic${activeSubPolicies === 1 ? "y" : "ies"}. They will continue to function but can no longer receive new assignments.`);
    setConfirmDialog({
      open: true,
      title: "Deactivate Policy",
      description: "Existing assignments will be unaffected. No new assignments will be possible.",
      warning: warningParts.length > 0 ? warningParts.join(" ") : undefined,
      confirmLabel: "Deactivate",
      onConfirm: () => {
        setPolicies(prev => prev.map(p => p.id === policy.id ? { ...p, status: "deactivated" as const } : p));
        setConfirmDialog(prev => ({ ...prev, open: false }));
        showToast(`Policy "${policy.name}" deactivated`);
      },
    });
  };

  const handleDelete = (policy: PolicyListItem) => {
    const activeAssignments = 0; // Mock: would come from API
    if (activeAssignments > 0) {
      showToast(`Cannot delete — ${activeAssignments} active assignments reference this policy.`);
      return;
    }
    setConfirmDialog({
      open: true,
      title: `Permanently delete ${policy.name}?`,
      description: "This action cannot be undone. All groups, services, and tier overrides will be permanently removed.",
      confirmLabel: "Delete Policy",
      isDanger: true,
      onConfirm: () => {
        setPolicies(prev => prev.filter(p => p.id !== policy.id));
        setConfirmDialog(prev => ({ ...prev, open: false }));
        showToast(`Policy "${policy.name}" deleted`);
      },
    });
  };

  const columns: Column<PolicyListItem>[] = [
    {
      header: "Policy Name",
      accessorKey: "name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
            <IdentificationCard size={20} weight="duotone" />
          </div>
          <div>
            <p className="text-body font-semibold text-foreground">{row.name}</p>
            <p className="text-label font-mono text-faint tracking-tight leading-none mt-0.5">{row.code}</p>
          </div>
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
      header: "Eligible Types",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.eligibleEmploymentTypes.map(t => (
            <span key={t} className="px-2 py-0.5 rounded-full bg-muted text-label font-medium text-muted-foreground capitalize">
              {t.replace("-", " ")}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: "Groups",
      accessorKey: "groupCount",
      align: "center",
      render: (row) => <span className="text-body font-medium text-subtle tabular-nums">{row.groupCount}</span>,
    },
    {
      header: "Organisation",
      render: (row) => (
        <span className="text-body text-subtle font-medium">
          {row.orgName || row.organizationId || "—"}
        </span>
      ),
    },
    {
      header: "Created",
      accessorKey: "createdAt",
      render: (row) => (
        <span className="text-body text-faint font-medium">
          {new Date(row.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
        </span>
      ),
    },
    {
      header: "Actions",
      headerClassName: "text-right",
      align: "right",
      render: (row) => {
        const actions: ActionItem[] = [
          {
            label: "View policy details",
            onClick: (e: React.MouseEvent) => {
              e.stopPropagation();
              updateQueryParams({ policyId: row.id, mode: "view", wizard: "open" });
            },
          },
          {
            label: "Edit policy",
            onClick: (e: React.MouseEvent) => {
              e.stopPropagation();
              router.push(`/policies/${row.id}/edit`);
            },
          },
          {
            label: "Clone policy",
            onClick: (e: React.MouseEvent) => {
              e.stopPropagation();
              handleClone(row);
            },
            className: "text-primary font-semibold",
          },
        ];

        if (row.status === "active") {
          actions.push(
            { label: "Management", isSectionTitle: true },
            {
              label: "Deactivate policy",
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                handleDeactivate(row);
              },
              isDanger: true,
            }
          );
        }

        if (row.status === "draft" || row.status === "deactivated") {
          actions.push(
            { label: "Management", isSectionTitle: true },
            {
              label: "Delete policy",
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                handleDelete(row);
              },
              isDanger: true,
            }
          );
        }

        return (
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <ActionPopover actions={actions} />
          </div>
        );
      },
    },
  ];

  // Detail view
  if (showWizard && wizardMode === "view" && activePolicyId) {
    const policy = policies.find(p => p.id === activePolicyId);
    const data = policy ? policyDataMap[policy.id] : undefined;
    if (policy && data) {
      const versions = policies
        .filter(p => p.parentPolicyId === policy.id)
        .map(p => ({ ...p, parentPolicyName: policy.name }));
      const parentPolicyName = policy.parentPolicyId
        ? policies.find(p => p.id === policy.parentPolicyId)?.name
        : undefined;
      const parentBenefits = policy.parentPolicyId
        ? policyDataMap[policy.parentPolicyId]?.benefits
        : undefined;
      const versionOverrideCounts: Record<string, number> = {};
      versions.forEach(v => {
        const versionData = policyDataMap[v.id];
        if (versionData && data) {
          versionOverrideCounts[v.id] = versionData.benefits.filter(vb => {
            const parent = data.benefits.find(pb => pb.serviceId === vb.serviceId);
            return parent && parent.amount !== vb.amount;
          }).length;
        }
      });
      return (
        <div className="flex flex-col flex-1">
          <PolicyDetailView
            key={policy.id}
            policy={policy}
            groups={data.groups}
            benefits={data.benefits}
            versions={versions}
            versionOverrideCounts={versionOverrideCounts}
            employees={MOCK_EMPLOYEES.filter(e => e.orgId === policy.organizationId)}
            parentPolicyName={parentPolicyName}
            parentBenefits={parentBenefits}
            onEdit={() => router.push(`/policies/${policy.id}/edit`)}
            onClone={() => handleClone(policy)}
            onDeactivate={() => handleDeactivate(policy)}
            onDelete={() => handleDelete(policy)}
            onEditVersion={(versionId) => router.push(`/policies/${versionId}/edit`)}
            onRemoveVersion={(versionId) => {
              setConfirmDialog({
                open: true,
                title: "Remove Version",
                description: "This version will be permanently removed. Assigned employees will revert to the parent policy.",
                confirmLabel: "Remove Version",
                isDanger: true,
                onConfirm: () => {
                  setPolicies(prev => prev.filter(p => p.id !== versionId));
                  setConfirmDialog(prev => ({ ...prev, open: false }));
                  showToast("Version removed");
                },
              });
            }}
          />
        </div>
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-heading font-semibold text-foreground text-balance">Benefit Policies</h1>
          <p className="text-subtle text-body mt-1 font-normal">
            Design and oversee flexible benefit structures for your workforce. Define eligibility, pool strategies, and individual service rules.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-9 text-body font-medium hover:bg-muted/50">
            <DownloadSimple size={16} className="mr-1.5 opacity-60" />
            Export
          </Button>
          <div className="h-4 w-[1px] bg-border mx-1" />
          <PolicyCreationLauncher
            onManual={handleCreateNew}
            onTemplate={handleCreateFromTemplate}
          />
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative w-full sm:w-80">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            type="text"
            placeholder="Search policies or benefit IDs..."
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-body font-medium outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/40 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <FilterItem
          label="Organisation"
          value={orgFilter}
          onChange={setOrgFilter}
          options={orgFilterOptions}
        />

        <FilterItem
          label="Status"
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as StatusFilter)}
          options={[
            { label: `All (${statusCounts.all})`, value: "all" },
            { label: `Draft (${statusCounts.draft})`, value: "draft" },
            { label: `Active (${statusCounts.active})`, value: "active" },
            { label: `Deactivated (${statusCounts.deactivated})`, value: "deactivated" },
          ]}
        />
      </div>

      {/* Table */}
      {filteredPolicies.length === 0 ? (
        <EmptyState
          isPageLevel
          icon={<TreeStructure size={48} weight="duotone" />}
          title="No policies found"
          description="Design and oversee flexible benefit structures for your workforce. Adjust your filters or create a new policy to get started."
          action={
            <Button
              variant="default"
              onClick={handleCreateNew}
              className="mt-8 px-6 h-10 font-medium shadow-sm"
            >
               Add Benefit Policy
             </Button>
           }
         />
      ) : (
        <SharedDataTable
          data={filteredPolicies}
          columns={columns}
          freezeFirst
          freezeLast
          onRowClick={(row) => updateQueryParams({ policyId: row.id, mode: "view", wizard: "open" })}
        />
      )}

      {/* Clone Dialog */}
      <ClonePolicyDialog
        isOpen={!!cloneTarget}
        original={cloneTarget}
        onClose={() => setCloneTarget(null)}
        onConfirm={confirmClone}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.open}
        title={confirmDialog.title}
        description={confirmDialog.description}
        warning={confirmDialog.warning}
        confirmLabel={confirmDialog.confirmLabel}
        isDanger={confirmDialog.isDanger}
        onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        onConfirm={confirmDialog.onConfirm}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[200] animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center gap-2.5 px-4 py-3 bg-card border border-border rounded-lg shadow-xl">
            <CheckCircle size={18} weight="fill" className="text-emerald-600 dark:text-emerald-400" />
            <p className="text-body font-medium text-foreground">{toast}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PoliciesPage() {
  return (
    <Suspense fallback={null}>
      <PoliciesContent />
    </Suspense>
  );
}
