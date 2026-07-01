"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SuccessModal } from "@/components/shared/success-modal";
import {
  PolicyReviewAssignmentSection,
  PolicyReviewBypassModal,
  PolicyReviewHeader,
  type PolicyReviewDraft,
} from "@/components/host/policies/policy-review-page-sections";
import { toast } from "sonner";
import { clearPolicyDraft } from "@/hooks/use-policy-draft";
import { MOCK_ORGS, MOCK_EMPLOYEES } from "@/lib/mock-data";
import type { EmployeeDirectoryItem } from "@/features/employees/types";

type Draft = PolicyReviewDraft;

const normEmpType = (value?: string) => (value ?? "").replace(/-/g, "_");

function matchesFilters(employee: EmployeeDirectoryItem, draft: Draft): boolean {
  const orgId = draft.policy.organizationId;
  const employmentTypes = (draft.policy.eligibleEmploymentTypes ?? []).map(normEmpType);
  const tierIds = draft.policy.eligibility?.tierIds ?? [];
  const departmentIds = draft.policy.eligibility?.departmentIds ?? [];
  if (orgId && employee.orgId !== orgId) return false;
  if (employmentTypes.length > 0 && !employmentTypes.includes(normEmpType(employee.employmentType))) return false;
  if (tierIds.length > 0 && (!employee.tierId || !tierIds.includes(employee.tierId))) return false;
  if (departmentIds.length > 0 && (!employee.departmentId || !departmentIds.includes(employee.departmentId))) return false;
  return true;
}

function getTargetedEmployees(draft: Draft | null) {
  if (!draft) return [];
  return MOCK_EMPLOYEES.filter((employee) => matchesFilters(employee, draft));
}

function getTierOptions(orgId: string | undefined) {
  if (!orgId) return [] as { value: string; label: string }[];
  const org = MOCK_ORGS.find((item) => item.id === orgId);
  return (org?.tierConfigs ?? []).map((tier) => ({ value: tier.id, label: tier.code ? `${tier.code} - ${tier.name}` : tier.name }));
}

function getDepartmentOptions(orgId: string | undefined) {
  if (!orgId) return [] as { value: string; label: string }[];
  const org = MOCK_ORGS.find((item) => item.id === orgId);
  return (org?.departmentConfigs ?? []).map((department) => ({ value: department.id, label: department.code ? `${department.code} - ${department.name}` : department.name }));
}

function NewPolicyReviewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const simulateError = searchParams.get("simulate");
  const source = searchParams.get("source") ?? "global";
  const orgIdFromQuery = searchParams.get("orgId");
  const [draft, setDraft] = useState<Draft | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = sessionStorage.getItem("policy-draft");
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });
  const [excludedIds, setExcludedIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    const raw = sessionStorage.getItem("policy-review-excluded");
    return raw ? new Set(JSON.parse(raw)) : new Set();
  });
  const [includedIds, setIncludedIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    const raw = sessionStorage.getItem("policy-review-included");
    return raw ? new Set(JSON.parse(raw)) : new Set();
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdPolicyName, setCreatedPolicyName] = useState("");
  const [createdPolicyId, setCreatedPolicyId] = useState<string | null>(null);
  const policyIdRef = useRef(0);
  const [orgContext] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("policy-org-context");
  });
  const [bypassModalOpen, setBypassModalOpen] = useState(false);
  const [pendingIncludeEmp, setPendingIncludeEmp] = useState<EmployeeDirectoryItem | null>(null);
  const effectiveOrgContext = orgIdFromQuery ?? orgContext;
  const reviewBackHref =
    source === "org" && effectiveOrgContext
      ? `/policies/new?source=org&orgId=${effectiveOrgContext}`
      : "/policies/new?source=global";
  const doneHref =
    source === "org" && effectiveOrgContext
      ? `/organizations/${effectiveOrgContext}?tab=policies`
      : "/policies";

  useEffect(() => {
    if (!draft) {
      router.replace(reviewBackHref);
    }
  }, [draft, reviewBackHref, router]);

  const tierOptions = getTierOptions(draft?.policy.organizationId);
  const departmentOptions = getDepartmentOptions(draft?.policy.organizationId);
  const targetedEmployees = getTargetedEmployees(draft);
  const finalEmployees = MOCK_EMPLOYEES.filter((employee) => {
    if (includedIds.has(employee.id)) return true;
    if (excludedIds.has(employee.id)) return false;
    return targetedEmployees.some((targetEmployee) => targetEmployee.id === employee.id);
  });

  const updateDraft = (next: Draft) => {
    setDraft(next);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("policy-draft", JSON.stringify(next));
    }
  };

  const persistExcluded = (ids: Set<string>) => {
    setExcludedIds(ids);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("policy-review-excluded", JSON.stringify(Array.from(ids)));
    }
  };

  const persistIncluded = (ids: Set<string>) => {
    setIncludedIds(ids);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("policy-review-included", JSON.stringify(Array.from(ids)));
    }
  };

  const toggleEmpType = (id: string) => {
    if (!draft) return;
    const current = draft.policy.eligibleEmploymentTypes ?? [];
    const updated = current.includes(id) ? current.filter((value) => value !== id) : [...current, id];
    updateDraft({ ...draft, policy: { ...draft.policy, eligibleEmploymentTypes: updated } });
  };

  const toggleTier = (id: string) => {
    if (!draft) return;
    const current = draft.policy.eligibility?.tierIds ?? [];
    const updated = current.includes(id) ? current.filter((value) => value !== id) : [...current, id];
    updateDraft({ ...draft, policy: { ...draft.policy, eligibility: { ...draft.policy.eligibility, tierIds: updated } } });
  };

  const toggleDept = (id: string) => {
    if (!draft) return;
    const current = draft.policy.eligibility?.departmentIds ?? [];
    const updated = current.includes(id) ? current.filter((value) => value !== id) : [...current, id];
    updateDraft({ ...draft, policy: { ...draft.policy, eligibility: { ...draft.policy.eligibility, departmentIds: updated } } });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds(
      selectedIds.size === finalEmployees.length ? new Set() : new Set(finalEmployees.map((employee) => employee.id))
    );
  };

  const removeSelected = () => {
    const nextExcluded = new Set(excludedIds);
    const nextIncluded = new Set(includedIds);
    selectedIds.forEach((id) => {
      if (targetedEmployees.some((employee) => employee.id === id)) nextExcluded.add(id);
      else nextIncluded.delete(id);
    });
    persistExcluded(nextExcluded);
    persistIncluded(nextIncluded);
    setSelectedIds(new Set());
  };

  const searchResults = searchQuery.trim()
    ? MOCK_EMPLOYEES.filter((employee) => {
        if (finalEmployees.some((finalEmployee) => finalEmployee.id === employee.id)) return false;
        if (draft?.policy.organizationId && employee.orgId !== draft.policy.organizationId) return false;
        const query = searchQuery.toLowerCase();
        return employee.name.toLowerCase().includes(query) || employee.empCode.toLowerCase().includes(query);
      }).slice(0, 6)
    : [];

  const promptInclude = (employee: EmployeeDirectoryItem) => {
    if (!draft) return;
    if (matchesFilters(employee, draft)) {
      const nextExcluded = new Set(excludedIds);
      nextExcluded.delete(employee.id);
      persistExcluded(nextExcluded);
      return;
    }
    setPendingIncludeEmp(employee);
    setBypassModalOpen(true);
  };

  const confirmBypassInclude = () => {
    if (!pendingIncludeEmp) return;
    const nextIncluded = new Set(includedIds);
    nextIncluded.add(pendingIncludeEmp.id);
    persistIncluded(nextIncluded);
    setBypassModalOpen(false);
    setPendingIncludeEmp(null);
    setSearchQuery("");
  };

  const handleSaveDraft = async () => {
    if (!draft) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    toast.success("Draft saved");
  };

  const handleConfirm = async () => {
    if (!draft) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsSubmitting(false);

    if (simulateError === "network") {
      toast.error("Couldn't save policy", {
        description: "Network error. Your draft is safe.",
        action: { label: "Retry", onClick: () => void handleConfirm() },
        duration: 8000,
      });
      return;
    }

    if (simulateError === "409") {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "policy-submit-error",
          JSON.stringify({ field: "name", message: `"${draft.policy.name}" is already in use. Pick another name.` })
        );
      }
      toast.error("Name already in use", { description: "Pick a different name and try again." });
      router.push(reviewBackHref);
      return;
    }

    setCreatedPolicyName(draft.policy.name || "Benefit Policy");
    setCreatedPolicyId(`pol-${++policyIdRef.current}`);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("policy-draft");
      sessionStorage.removeItem("policy-org-context");
      sessionStorage.removeItem("policy-review-excluded");
      sessionStorage.removeItem("policy-review-included");
      clearPolicyDraft(draft.policy.organizationId);
    }
    toast.success("Policy created successfully");
    setShowSuccess(true);
  };

  if (!draft) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        <span className="ml-3 text-body font-medium text-muted-foreground">Loading draft...</span>
      </div>
    );
  }

  return (
    <div className="animate-in pb-24 duration-500 fade-in slide-in-from-bottom-4">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8">
        <PolicyReviewHeader
          onBack={() => router.push(reviewBackHref)}
        />

        <PolicyReviewAssignmentSection
          departmentOptions={departmentOptions}
          draft={draft}
          finalEmployees={finalEmployees}
          includedIds={includedIds}
          isSubmitting={isSubmitting}
          onConfirm={handleConfirm}
          onEffectiveDateChange={({ effectiveDate, scheduledDate }) =>
            updateDraft({
              ...draft,
              policy: {
                ...draft.policy,
                effectiveDate,
                effectiveCustomDate: effectiveDate === "scheduled" ? scheduledDate : undefined,
              },
            })
          }
          onPromptInclude={promptInclude}
          onRemoveSelected={removeSelected}
          onSaveDraft={handleSaveDraft}
          onSearchChange={setSearchQuery}
          onToggleDept={toggleDept}
          onToggleEmpType={toggleEmpType}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onToggleTier={toggleTier}
          orgContext={effectiveOrgContext}
          routerBack={() => router.push(reviewBackHref)}
          searchQuery={searchQuery}
          searchResults={searchResults}
          selectedIds={selectedIds}
          tierOptions={tierOptions}
        />
      </div>

      <PolicyReviewBypassModal
        employee={pendingIncludeEmp}
        isOpen={bypassModalOpen}
        onCancel={() => {
          setBypassModalOpen(false);
          setPendingIncludeEmp(null);
        }}
        onConfirm={confirmBypassInclude}
      />

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Policy Created"
        message={`${createdPolicyName} has been saved as a draft.`}
        primaryAction={{
          label: "Add Benefit Groups",
          onClick: () => {
            setShowSuccess(false);
            router.push(createdPolicyId ? `/policies?policyId=${createdPolicyId}&wizard=open&mode=view&tab=benefit-groups` : "/policies");
          },
        }}
        secondaryAction={{
          label: source === "org" ? "Back to Organisation" : "Done",
          onClick: () => {
            setShowSuccess(false);
            router.push(doneHref);
          },
        }}
      />
    </div>
  );
}

export default function NewPolicyReviewPage() {
  return (
    <Suspense fallback={<div data-test="fallback">FALLBACK</div>}>
      <NewPolicyReviewPageContent />
    </Suspense>
  );
}
