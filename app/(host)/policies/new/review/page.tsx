"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CaretLeft, NavigationArrow, Check, Users, CaretDown, PencilSimpleLine, MagnifyingGlass, X, Warning } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { SuccessModal } from "@/components/shared/success-modal";
import { toast } from "sonner";
import { PolicyReviewCards } from "@/components/host/policies/policy-wizard-content";
import { TargetingFilterBar } from "@/components/host/policies/targeting-filter-bar";
import { clearPolicyDraft } from "@/hooks/use-policy-draft";
import { BenefitPolicy, BenefitGroup, Benefit } from "@/types/policy";
import { MOCK_ORGS, MOCK_EMPLOYEES } from "@/lib/mock-data";
import type { EmployeeDirectoryItem } from "@/features/employees/types";
import { cn } from "@/lib/utils";

type Draft = { policy: Partial<BenefitPolicy>; groups: BenefitGroup[]; benefits: Benefit[] };

const normEmpType = (s?: string) => (s ?? "").replace(/-/g, "_");

function matchesFilters(emp: EmployeeDirectoryItem, draft: Draft): boolean {
  const orgId = draft.policy.organizationId;
  const empTypes = (draft.policy.eligibleEmploymentTypes ?? []).map(normEmpType);
  const tierIds = draft.policy.eligibility?.tierIds ?? [];
  const deptIds = draft.policy.eligibility?.departmentIds ?? [];
  if (orgId && emp.orgId !== orgId) return false;
  if (empTypes.length > 0 && !empTypes.includes(normEmpType(emp.employmentType))) return false;
  if (tierIds.length > 0 && (!emp.tierId || !tierIds.includes(emp.tierId))) return false;
  if (deptIds.length > 0 && (!emp.departmentId || !deptIds.includes(emp.departmentId))) return false;
  return true;
}

function getTargetedEmployees(draft: Draft | null) {
  if (!draft) return [];
  return MOCK_EMPLOYEES.filter((e) => matchesFilters(e, draft));
}

function getTierOptions(orgId: string | undefined) {
  if (!orgId) return [] as { value: string; label: string }[];
  const org = MOCK_ORGS.find((o) => o.id === orgId);
  return (org?.tierConfigs ?? []).map((t) => ({ value: t.id, label: t.code ? `${t.code} - ${t.name}` : t.name }));
}

function getDepartmentOptions(orgId: string | undefined) {
  if (!orgId) return [] as { value: string; label: string }[];
  const org = MOCK_ORGS.find((o) => o.id === orgId);
  return (org?.departmentConfigs ?? []).map((d) => ({ value: d.id, label: d.code ? `${d.code} - ${d.name}` : d.name }));
}

function NewPolicyReviewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const simulateError = searchParams.get("simulate");
  const [draft, setDraft] = useState<Draft | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = sessionStorage.getItem("policy-draft");
    if (!stored) return null;
    try { return JSON.parse(stored); } catch { return null; }
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

  // Bypass warning modal
  const [bypassModalOpen, setBypassModalOpen] = useState(false);
  const [pendingIncludeEmp, setPendingIncludeEmp] = useState<EmployeeDirectoryItem | null>(null);

  useEffect(() => {
    if (!draft) { router.replace("/policies/new"); return; }
  }, [draft, router]);

  const tierOptions = getTierOptions(draft?.policy.organizationId);
  const departmentOptions = getDepartmentOptions(draft?.policy.organizationId);
  const targetedEmployees = getTargetedEmployees(draft);

  const finalEmployees = MOCK_EMPLOYEES.filter((e) => {
    if (includedIds.has(e.id)) return true;
    if (excludedIds.has(e.id)) return false;
    return targetedEmployees.some((t) => t.id === e.id);
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
    const updated = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    updateDraft({ ...draft, policy: { ...draft.policy, eligibleEmploymentTypes: updated } });
  };

  const toggleTier = (id: string) => {
    if (!draft) return;
    const current = draft.policy.eligibility?.tierIds ?? [];
    const updated = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    updateDraft({ ...draft, policy: { ...draft.policy, eligibility: { ...draft.policy.eligibility, tierIds: updated } } });
  };

  const toggleDept = (id: string) => {
    if (!draft) return;
    const current = draft.policy.eligibility?.departmentIds ?? [];
    const updated = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
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
    if (selectedIds.size === finalEmployees.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(finalEmployees.map((e) => e.id)));
    }
  };

  const removeSelected = () => {
    const nextExcluded = new Set(excludedIds);
    selectedIds.forEach((id) => {
      if (targetedEmployees.some((t) => t.id === id)) {
        nextExcluded.add(id);
      } else {
        // Was manually included — just remove from included
        const nextIncluded = new Set(includedIds);
        nextIncluded.delete(id);
        persistIncluded(nextIncluded);
      }
    });
    persistExcluded(nextExcluded);
    setSelectedIds(new Set());
  };

  const searchResults = searchQuery.trim()
    ? MOCK_EMPLOYEES.filter((e) => {
        if (finalEmployees.some((f) => f.id === e.id)) return false;
        if (draft?.policy.organizationId && e.orgId !== draft.policy.organizationId) return false;
        const q = searchQuery.toLowerCase();
        return e.name.toLowerCase().includes(q) || e.empCode.toLowerCase().includes(q);
      }).slice(0, 6)
    : [];

  const promptInclude = (emp: EmployeeDirectoryItem) => {
    if (!draft) return;
    if (matchesFilters(emp, draft)) {
      // Directly include (was probably excluded before)
      const nextExcluded = new Set(excludedIds);
      nextExcluded.delete(emp.id);
      persistExcluded(nextExcluded);
    } else {
      setPendingIncludeEmp(emp);
      setBypassModalOpen(true);
    }
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
    await new Promise((r) => setTimeout(r, 800));
    setIsSubmitting(false);
    toast.success("Draft saved");
  };

  const handleConfirm = async () => {
    if (!draft) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
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
      router.push(orgContext ? `/policies/new?orgId=${orgContext}` : "/policies/new");
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
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <span className="ml-3 text-body font-medium text-muted-foreground">Loading draft...</span>
      </div>
    );
  }

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mx-auto max-w-[1280px] flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => router.push(orgContext ? `/policies/new?orgId=${orgContext}` : "/policies/new")}
            className="inline-flex items-center gap-1.5 text-body font-medium text-subtle hover:text-foreground transition-colors w-fit"
          >
            <CaretLeft size={16} /> Back to Edit
          </button>
          <div>
            <h1 className="text-heading font-semibold text-foreground text-balance">Review</h1>
            <p className="text-subtle text-body mt-1">
              Verify which employees will be assigned this policy. Adjust filters before confirming.
            </p>
          </div>
        </div>

        {/* Targeted Employees */}
        <section className="bg-card border border-border rounded-lg shadow-sm p-6 md:p-8 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                <Users size={18} weight="duotone" />
              </div>
              <div>
                <h3 className="text-lead font-semibold text-foreground">Targeted Employees</h3>
                <p className="text-label text-muted-foreground mt-0.5">
                  {finalEmployees.length} employee{finalEmployees.length !== 1 ? "s" : ""} will be assigned
                </p>
              </div>
            </div>
            {selectedIds.size > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={removeSelected}
                className="text-label font-medium h-8"
              >
                <X size={14} weight="bold" className="mr-1.5" />
                Remove {selectedIds.size} selected
              </Button>
            )}
          </div>

          {/* Filter bar */}
          <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
            <TargetingFilterBar
              selectedEmpTypes={draft.policy.eligibleEmploymentTypes ?? []}
              selectedTierIds={draft.policy.eligibility?.tierIds ?? []}
              selectedDeptIds={draft.policy.eligibility?.departmentIds ?? []}
              tierOptions={tierOptions}
              departmentOptions={departmentOptions}
              onToggleEmpType={toggleEmpType}
              onToggleTier={toggleTier}
              onToggleDept={toggleDept}
            />
          </div>

          {/* Search to include */}
          <div className="relative">
            <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search employees to include..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-lg text-body text-foreground outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/40 transition-all"
            />
            {searchQuery.trim() && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-foreground"
              >
                <X size={14} weight="bold" />
              </button>
            )}
            {searchResults.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
                {searchResults.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => promptInclude(emp)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-label font-semibold shrink-0">
                      {emp.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-body font-semibold text-foreground leading-tight">{emp.name}</p>
                      <p className="text-label text-faint font-mono">{emp.empCode}</p>
                    </div>
                    <span className="ml-auto text-label text-primary font-medium">Include</span>
                  </button>
                ))}
              </div>
            )}
            {searchQuery.trim() && searchResults.length === 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-popover border border-border rounded-lg shadow-lg px-4 py-3">
                <p className="text-body text-muted-foreground">No employees found.</p>
              </div>
            )}
          </div>

          {/* Employee table */}
          <div className="border-t border-border/60 pt-5">
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="p-3 w-10">
                      <button
                        onClick={toggleSelectAll}
                        className={cn(
                          "w-5 h-5 rounded border flex items-center justify-center transition-all",
                          selectedIds.size === finalEmployees.length && finalEmployees.length > 0
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-border bg-background"
                        )}
                      >
                        {selectedIds.size === finalEmployees.length && finalEmployees.length > 0 && <Check size={12} weight="bold" />}
                      </button>
                    </th>
                    <th className="font-medium text-subtle text-label p-3">Employee</th>
                    <th className="font-medium text-subtle text-label p-3">Employment Type</th>
                    <th className="font-medium text-subtle text-label p-3">Tier</th>
                    <th className="font-medium text-subtle text-label p-3">Department</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {finalEmployees.map((emp) => {
                    const isSelected = selectedIds.has(emp.id);
                    const isBypassed = includedIds.has(emp.id);
                    return (
                      <tr key={emp.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3">
                          <button
                            onClick={() => toggleSelect(emp.id)}
                            className={cn(
                              "w-5 h-5 rounded border flex items-center justify-center transition-all",
                              isSelected ? "bg-primary border-primary text-primary-foreground" : "border-border bg-background"
                            )}
                          >
                            {isSelected && <Check size={12} weight="bold" />}
                          </button>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <p className="text-body font-semibold text-foreground">{emp.name}</p>
                            {isBypassed && (
                              <span className="px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-micro font-medium">
                                Added
                              </span>
                            )}
                          </div>
                          <p className="text-label font-mono text-faint mt-0.5">{emp.empCode}</p>
                        </td>
                        <td className="p-3">
                          <span className="text-body text-subtle capitalize">{(emp.employmentType ?? "—").replace(/_/g, " ")}</span>
                        </td>
                        <td className="p-3">
                          {emp.tier ? (
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-label font-medium">{emp.tier}</span>
                          ) : (
                            <span className="text-body text-faint">—</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="text-body text-subtle">{emp.department ?? "—"}</span>
                        </td>
                      </tr>
                    );
                  })}
                  {finalEmployees.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center">
                        <Users size={32} weight="duotone" className="text-muted/30 mx-auto mb-3" />
                        <p className="text-body font-medium text-muted-foreground">No employees match the current criteria.</p>
                        <p className="text-label text-faint mt-1">Use the search above to include specific employees.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Review — collapsed by default */}
        <section className="bg-card border border-border rounded-lg shadow-sm">
          <Collapsible defaultOpen={false}>
            <CollapsibleTrigger className="w-full flex items-center gap-3 p-4 group">
              <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                <Check size={14} weight="duotone" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-body font-semibold text-foreground">Review</p>
                <p className="text-label text-muted-foreground">Verify your configuration before saving</p>
              </div>
              <CaretDown size={14} weight="bold" className="text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4">
              <PolicyReviewCards policy={draft.policy} groups={draft.groups} benefits={draft.benefits} />
            </CollapsibleContent>
          </Collapsible>
        </section>

        {/* Sticky Action Bar */}
        <div className="sticky bottom-8 z-50 mx-auto flex items-center gap-4 p-2 px-6 bg-background/80 backdrop-blur-2xl border border-border shadow-lg rounded-full animate-in slide-in-from-bottom-10 duration-700 ease-out w-fit">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="text-body font-medium px-6 transition-colors"
            onClick={() => router.push(orgContext ? `/policies/new?orgId=${orgContext}` : "/policies/new")}
          >
            Back to Edit
          </Button>
          <div className="w-px h-6 bg-border/40" />
          <Button
            type="button"
            variant="ghost"
            size="lg"
            disabled={isSubmitting}
            className="text-body font-medium px-6 transition-colors"
            onClick={handleSaveDraft}
          >
            <PencilSimpleLine size={14} weight="bold" className="mr-1.5" />
            Save as Draft
          </Button>
          <div className="w-px h-6 bg-border/40" />
          <Button
            type="button"
            size="lg"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className="text-body font-medium px-8 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Confirm
                <NavigationArrow size={14} weight="bold" className="rotate-90" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Bypass Warning Modal */}
      {bypassModalOpen && pendingIncludeEmp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md overflow-hidden rounded-[24px] border border-border bg-card shadow-2xl">
            <div className="p-8 pb-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Warning size={24} weight="duotone" />
              </div>
              <h3 className="text-heading font-semibold text-foreground">Employee Outside Filters</h3>
              <p className="text-body text-subtle mt-1">
                <span className="font-semibold text-foreground">{pendingIncludeEmp.name}</span> does not match the current eligibility filters for this policy.
              </p>
              <ul className="mt-3 space-y-1 text-label text-muted-foreground">
                <li>• Employment type: {(pendingIncludeEmp.employmentType ?? "—").replace(/_/g, " ")}</li>
                <li>• Tier: {pendingIncludeEmp.tier ?? "—"}</li>
                <li>• Department: {pendingIncludeEmp.department ?? "—"}</li>
              </ul>
              <p className="text-label text-muted-foreground mt-3">Do you still want to include this employee?</p>
            </div>
            <div className="flex items-center gap-3 border-t border-border bg-muted/30 p-8 pt-4">
              <Button variant="ghost" className="h-12 flex-1 rounded-lg font-semibold" onClick={() => { setBypassModalOpen(false); setPendingIncludeEmp(null); }}>
                Cancel
              </Button>
              <Button className="h-12 flex-1 rounded-lg font-semibold" onClick={confirmBypassInclude}>
                Include Anyway
              </Button>
            </div>
          </div>
        </div>
      )}

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Policy Created"
        message={`${createdPolicyName} has been saved as a draft.`}
        primaryAction={{
          label: "View Policy",
          onClick: () => {
            setShowSuccess(false);
            if (createdPolicyId) router.push(`/policies/${createdPolicyId}`);
            else router.push("/policies");
          },
        }}
        secondaryAction={{
          label: orgContext ? "Back to Organisation" : "Done",
          onClick: () => {
            setShowSuccess(false);
            router.push(orgContext ? `/organizations/${orgContext}?tab=policies` : "/policies");
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
