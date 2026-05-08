"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CaretLeft, NavigationArrow, Check, Users, CaretDown, PencilSimpleLine } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { SuccessModal } from "@/components/shared/success-modal";
import { SharedDataTable, type Column } from "@/components/shared/data-table";
import { toast } from "sonner";
import { PolicyReviewCards } from "@/components/host/policies/policy-wizard-content";
import { TargetingFilterBar } from "@/components/host/policies/targeting-filter-bar";
import { BenefitPolicy, BenefitGroup, Benefit } from "@/types/policy";
import { MOCK_ORGS, MOCK_EMPLOYEES } from "@/lib/mock-data";
import type { EmployeeDirectoryItem } from "@/features/employees/types";

type Draft = { policy: Partial<BenefitPolicy>; groups: BenefitGroup[]; benefits: Benefit[] };

const normEmpType = (s?: string) => (s ?? "").replace(/-/g, "_");

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

function getTargetedEmployees(draft: Draft | null) {
  if (!draft) return [];
  const orgId = draft.policy.organizationId;
  const empTypes = (draft.policy.eligibleEmploymentTypes ?? []).map(normEmpType);
  const tierIds = draft.policy.eligibility?.tierIds ?? [];
  const deptIds = draft.policy.eligibility?.departmentIds ?? [];
  return MOCK_EMPLOYEES.filter((e) => {
    if (orgId && e.orgId !== orgId) return false;
    if (empTypes.length > 0 && !empTypes.includes(normEmpType(e.employmentType))) return false;
    if (tierIds.length > 0 && (!e.tierId || !tierIds.includes(e.tierId))) return false;
    if (deptIds.length > 0 && (!e.departmentId || !deptIds.includes(e.departmentId))) return false;
    return true;
  });
}

const employeeColumns: Column<EmployeeDirectoryItem>[] = [
  {
    header: "Employee",
    accessorKey: "name",
    render: (e) => (
      <div>
        <p className="text-body font-semibold text-foreground">{e.name}</p>
        <p className="text-label font-mono text-faint mt-0.5">{e.empCode}</p>
      </div>
    ),
  },
  {
    header: "Employment Type",
    render: (e) => (
      <span className="text-body text-subtle capitalize">{(e.employmentType ?? "—").replace(/_/g, " ")}</span>
    ),
  },
  {
    header: "Tier",
    render: (e) => {
      if (!e.tier) return <span className="text-body text-faint">—</span>;
      return (
        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-label font-medium">
          {e.tier}
        </span>
      );
    },
  },
  {
    header: "Department",
    render: (e) => (
      <span className="text-body text-subtle">{e.department ?? "—"}</span>
    ),
  },
];

export default function NewPolicyReviewPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(() => {
    const stored = sessionStorage.getItem("policy-draft");
    if (!stored) return null;
    try { return JSON.parse(stored); } catch { return null; }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdPolicyName, setCreatedPolicyName] = useState("");

  useEffect(() => {
    if (!draft) { router.replace("/policies/new"); return; }
  }, [draft, router]);

  const tierOptions = getTierOptions(draft?.policy.organizationId);
  const departmentOptions = getDepartmentOptions(draft?.policy.organizationId);
  const targetedEmployees = getTargetedEmployees(draft);

  const updateDraft = (next: Draft) => {
    setDraft(next);
    sessionStorage.setItem("policy-draft", JSON.stringify(next));
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
    setCreatedPolicyName(draft.policy.name || "Benefit Policy");
    sessionStorage.removeItem("policy-draft");
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
            onClick={() => router.push("/policies/new")}
            className="inline-flex items-center gap-1.5 text-body font-medium text-subtle hover:text-foreground transition-colors w-fit"
          >
            <CaretLeft size={16} /> Back to Edit
          </button>
          <div>
            <h1 className="text-heading font-semibold text-foreground text-balance">
              Review & Confirm
            </h1>
            <p className="text-subtle text-body mt-1">
              Verify which employees will be assigned this policy. Adjust filters before confirming.
            </p>
          </div>
        </div>

        {/* Targeted Employees — compact filters + table */}
        <section className="bg-card border border-border rounded-lg shadow-sm p-6 md:p-8 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                <Users size={18} weight="duotone" />
              </div>
              <div>
                <h3 className="text-lead font-semibold text-foreground">Targeted Employees</h3>
                <p className="text-label text-muted-foreground mt-0.5">
                  {targetedEmployees.length} employee{targetedEmployees.length !== 1 ? "s" : ""} matching
                </p>
              </div>
            </div>
          </div>

          {/* Filter bar — summary + sheet */}
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

          {/* Employee table */}
          <div className="border-t border-border/60 pt-5">
            <SharedDataTable
              data={targetedEmployees}
              columns={employeeColumns}
              rowsPerPage={10}
              ghost
            />
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
            onClick={() => router.push("/policies/new")}
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

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Policy Created"
        message={`${createdPolicyName} has been saved as a draft.`}
        primaryAction={{
          label: "View Policies",
          onClick: () => { setShowSuccess(false); router.push("/policies"); },
        }}
        secondaryAction={{
          label: "Done",
          onClick: () => { setShowSuccess(false); router.push("/policies"); },
        }}
      />
    </div>
  );
}
