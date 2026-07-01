"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useQueryState, useUpdateQueryParams } from "@/hooks/use-tab-persistence";
import { PolicyDetailView, type TabId } from "@/components/host/policies/policy-detail-view";
import {
  buildPoliciesColumns,
  ClonePolicyDialog,
  ConfirmDialog,
  PoliciesPageTableSection,
  PoliciesPageToast,
  PoliciesPageToolbar,
  type StatusFilter,
} from "@/components/host/policies/policies-page-sections";
import { MOCK_POLICIES, MOCK_POLICY_DATA_MAP, MOCK_EMPLOYEES } from "@/lib/mock-data";
import type { PolicyListItem, PolicyData } from "@/features/policies/types";

function PoliciesContent() {
  const router = useRouter();
  const [wizardStatus] = useQueryState("wizard");
  const [wizardMode] = useQueryState("mode");
  const [activePolicyId] = useQueryState("policyId");
  const [activeTabParam] = useQueryState("tab");
  const updateQueryParams = useUpdateQueryParams();
  const showWizard = wizardStatus === "open";

  const [policies, setPolicies] = useState<PolicyListItem[]>(MOCK_POLICIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [orgFilter, setOrgFilter] = useState<string>("all");
  const [policyDataMap, setPolicyDataMap] = useState<Record<string, PolicyData>>(MOCK_POLICY_DATA_MAP);
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

  // The list shows parent/standalone policies only. Versions (parentPolicyId set)
  // live under their parent's Versions tab, so they are excluded here. The full
  // `policies` set is still used for detail lookups (version lineage, parent name).
  const parentPolicies = useMemo(
    () => policies.filter((policy) => !policy.parentPolicyId),
    [policies]
  );

  const filteredPolicies = useMemo(
    () =>
      parentPolicies.filter((policy) => {
        const matchesSearch =
          !searchQuery ||
          policy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          policy.code?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || policy.status === statusFilter;
        const matchesOrg = orgFilter === "all" || policy.orgName === orgFilter || policy.organizationId === orgFilter;
        return matchesSearch && matchesStatus && matchesOrg;
      }),
    [orgFilter, parentPolicies, searchQuery, statusFilter]
  );

  const orgFilterOptions = useMemo(() => {
    const allOrgs = new Map<string, string>();
    policies.forEach((policy) => {
      if (policy.orgName || policy.organizationId) allOrgs.set(policy.organizationId, policy.orgName || policy.organizationId);
    });
    return [{ label: "All Organisations", value: "all" }, ...Array.from(allOrgs.entries()).map(([id, name]) => ({ label: name, value: id }))];
  }, [policies]);

  const statusCounts = useMemo(
    () => ({
      all: parentPolicies.length,
      draft: parentPolicies.filter((policy) => policy.status === "draft").length,
      active: parentPolicies.filter((policy) => policy.status === "active").length,
      deactivated: parentPolicies.filter((policy) => policy.status === "deactivated").length,
    }),
    [parentPolicies]
  );

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateNew = (orgId?: string) =>
    router.push(
      orgId
        ? `/policies/new?source=org&orgId=${encodeURIComponent(orgId)}`
        : "/policies/new?source=global"
    );
  const handleCreateFromTemplate = (templateId: string, orgId?: string) =>
    router.push(
      orgId
        ? `/policies/new?source=org&template=${encodeURIComponent(templateId)}&orgId=${encodeURIComponent(orgId)}`
        : `/policies/new?source=global&template=${encodeURIComponent(templateId)}`
    );

  const handleClone = (policy: PolicyListItem) => setCloneTarget(policy);

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
    if (sourceData) {
      const newGroups = sourceData.groups.map((group) => ({ ...group, id: `${group.id}-clone-${newId}`, policyId: newId }));
      const newBenefits = sourceData.benefits.map((benefit) => {
        const newGroupId = newGroups.find((group) => group.name === sourceData.groups.find((sourceGroup) => sourceGroup.id === benefit.groupId)?.name)?.id || benefit.groupId;
        return { ...benefit, id: `${benefit.id}-clone-${newId}`, groupId: newGroupId };
      });
      setPolicyDataMap((prev) => ({ ...prev, [newId]: { groups: newGroups, benefits: newBenefits } }));
    }
    setPolicies((prev) => [...prev, newPolicy]);
    setCloneTarget(null);
    showToast(`Policy "${name}" cloned successfully`);
  };

  const handleDeactivate = (policy: PolicyListItem) => {
    const activeSubPolicies = policies.filter((item) => item.parentPolicyId === policy.id && item.status === "active").length;
    const warning = activeSubPolicies > 0 ? `This policy has ${activeSubPolicies} active sub-polic${activeSubPolicies === 1 ? "y" : "ies"}. They will continue to function but can no longer receive new assignments.` : undefined;
    setConfirmDialog({
      open: true,
      title: "Deactivate Policy",
      description: "Existing assignments will be unaffected. No new assignments will be possible.",
      warning,
      confirmLabel: "Deactivate",
      onConfirm: () => {
        setPolicies((prev) => prev.map((item) => (item.id === policy.id ? { ...item, status: "deactivated" as const } : item)));
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        showToast(`Policy "${policy.name}" deactivated`);
      },
    });
  };

  const handleDelete = (policy: PolicyListItem) => {
    setConfirmDialog({
      open: true,
      title: `Permanently delete ${policy.name}?`,
      description: "This action cannot be undone. All groups, services, and tier overrides will be permanently removed.",
      confirmLabel: "Delete Policy",
      isDanger: true,
      onConfirm: () => {
        setPolicies((prev) => prev.filter((item) => item.id !== policy.id));
        setConfirmDialog((prev) => ({ ...prev, open: false }));
        showToast(`Policy "${policy.name}" deleted`);
      },
    });
  };

  const columns = buildPoliciesColumns({
    onClone: handleClone,
    onDeactivate: handleDeactivate,
    onDelete: handleDelete,
    onEdit: (policy) => router.push(`/policies/${policy.id}/edit?source=global`),
    onView: (policy) => updateQueryParams({ policyId: policy.id, mode: "view", wizard: "open" }),
  });

  if (showWizard && wizardMode === "view" && activePolicyId) {
    const policy = policies.find((item) => item.id === activePolicyId);
    const data = policy ? policyDataMap[policy.id] : undefined;
    if (policy && data) {
      const versions = policies.filter((item) => item.parentPolicyId === policy.id).map((item) => ({ ...item, parentPolicyName: policy.name }));
      const parentPolicyName = policy.parentPolicyId ? policies.find((item) => item.id === policy.parentPolicyId)?.name : undefined;
      const parentBenefits = policy.parentPolicyId ? policyDataMap[policy.parentPolicyId]?.benefits : undefined;
      const versionOverrideCounts: Record<string, number> = {};
      versions.forEach((version) => {
        const versionData = policyDataMap[version.id];
        if (versionData) versionOverrideCounts[version.id] = versionData.benefits.filter((benefit) => {
          const parent = data.benefits.find((parentBenefit) => parentBenefit.serviceId === benefit.serviceId);
          return parent && parent.amount !== benefit.amount;
        }).length;
      });
      return (
        <div className="flex flex-1 flex-col">
          <PolicyDetailView
            key={policy.id}
            policy={policy}
            groups={data.groups}
            benefits={data.benefits}
            versions={versions}
            versionOverrideCounts={versionOverrideCounts}
            employees={MOCK_EMPLOYEES.filter((employee) => employee.orgId === policy.organizationId)}
            parentPolicyName={parentPolicyName}
            parentBenefits={parentBenefits}
            initialTab={(activeTabParam as TabId | null) ?? "overview"}
            onEdit={() => router.push(`/policies/${policy.id}/edit?source=global`)}
            onClone={() => handleClone(policy)}
            onDeactivate={() => handleDeactivate(policy)}
            onDelete={() => handleDelete(policy)}
            onEditVersion={(versionId) =>
              router.push(`/policies/${versionId}/edit?source=global`)
            }
            onRemoveVersion={(versionId) =>
              setConfirmDialog({
                open: true,
                title: "Remove Version",
                description: "This version will be permanently removed. Assigned employees will revert to the parent policy.",
                confirmLabel: "Remove Version",
                isDanger: true,
                onConfirm: () => {
                  setPolicies((prev) => prev.filter((item) => item.id !== versionId));
                  setConfirmDialog((prev) => ({ ...prev, open: false }));
                  showToast("Version removed");
                },
              })
            }
          />
        </div>
      );
    }
  }

  return (
    <div className="space-y-6">
      <PoliciesPageToolbar
        onCreateNew={() => handleCreateNew()}
        onCreateFromTemplate={(templateId) => handleCreateFromTemplate(templateId)}
        orgFilter={orgFilter}
        orgFilterOptions={orgFilterOptions}
        onOrgFilterChange={setOrgFilter}
        searchQuery={searchQuery}
        statusCounts={statusCounts}
        statusFilter={statusFilter}
        onSearchChange={setSearchQuery}
        onStatusFilterChange={setStatusFilter}
      />

      <PoliciesPageTableSection
        columns={columns}
        data={filteredPolicies}
        onCreateNew={() => handleCreateNew()}
        onRowClick={(row) => updateQueryParams({ policyId: row.id, mode: "view", wizard: "open" })}
      />

      <ClonePolicyDialog isOpen={!!cloneTarget} original={cloneTarget} onClose={() => setCloneTarget(null)} onConfirm={confirmClone} />
      <ConfirmDialog
        isOpen={confirmDialog.open}
        title={confirmDialog.title}
        description={confirmDialog.description}
        warning={confirmDialog.warning}
        confirmLabel={confirmDialog.confirmLabel}
        isDanger={confirmDialog.isDanger}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
        onConfirm={confirmDialog.onConfirm}
      />
      <PoliciesPageToast message={toast} />
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
