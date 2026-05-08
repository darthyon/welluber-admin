"use client";

import { useEffect, useMemo, useState, use } from "react";
import { useRouter } from "next/navigation";
import { CaretLeft, NavigationArrow, Check, Users, Funnel, CaretDown } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { SuccessModal } from "@/components/shared/success-modal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PolicyReviewCards } from "@/components/host/policies/policy-wizard-content";
import { BenefitPolicy, BenefitGroup, Benefit } from "@/types/policy";
import { MOCK_ORGS, MOCK_EMPLOYEES } from "@/lib/mock-data";

type Draft = { policy: Partial<BenefitPolicy>; groups: BenefitGroup[]; benefits: Benefit[] };

const EMPLOYMENT_TYPES = [
  { id: "full-time", label: "Full-time" },
  { id: "part-time", label: "Part-time" },
  { id: "contract", label: "Contract" },
  { id: "internship", label: "Internship" },
];

const normEmpType = (s?: string) => (s ?? "").replace(/-/g, "_");

export default function EditPolicyReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const draftKey = `policy-draft-edit-${id}`;
  const [draft, setDraft] = useState<Draft | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [updatedPolicyName, setUpdatedPolicyName] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem(draftKey);
    if (!stored) { router.replace(`/policies/${id}/edit`); return; }
    try { setDraft(JSON.parse(stored)); } catch { router.replace(`/policies/${id}/edit`); }
  }, [router, draftKey, id]);

  const tierOptions = useMemo(() => {
    if (!draft?.policy.organizationId) return [];
    const org = MOCK_ORGS.find((o) => o.id === draft.policy.organizationId);
    return (org?.tierConfigs ?? []).map((t) => ({ value: t.id, label: t.code ? `${t.code} - ${t.name}` : t.name }));
  }, [draft?.policy.organizationId]);

  const departmentOptions = useMemo(() => {
    if (!draft?.policy.organizationId) return [];
    const org = MOCK_ORGS.find((o) => o.id === draft.policy.organizationId);
    return (org?.departmentConfigs ?? []).map((d) => ({ value: d.id, label: d.code ? `${d.code} - ${d.name}` : d.name }));
  }, [draft?.policy.organizationId]);

  const targetedEmployees = useMemo(() => {
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
  }, [draft]);

  const updateDraft = (next: Draft) => {
    setDraft(next);
    sessionStorage.setItem(draftKey, JSON.stringify(next));
  };

  const toggleEmpType = (etId: string) => {
    if (!draft) return;
    const current = draft.policy.eligibleEmploymentTypes ?? [];
    const updated = current.includes(etId) ? current.filter((x) => x !== etId) : [...current, etId];
    updateDraft({ ...draft, policy: { ...draft.policy, eligibleEmploymentTypes: updated } });
  };

  const toggleTier = (tId: string) => {
    if (!draft) return;
    const current = draft.policy.eligibility?.tierIds ?? [];
    const updated = current.includes(tId) ? current.filter((x) => x !== tId) : [...current, tId];
    updateDraft({ ...draft, policy: { ...draft.policy, eligibility: { ...draft.policy.eligibility, tierIds: updated } } });
  };

  const toggleDept = (dId: string) => {
    if (!draft) return;
    const current = draft.policy.eligibility?.departmentIds ?? [];
    const updated = current.includes(dId) ? current.filter((x) => x !== dId) : [...current, dId];
    updateDraft({ ...draft, policy: { ...draft.policy, eligibility: { ...draft.policy.eligibility, departmentIds: updated } } });
  };

  const handleConfirm = async () => {
    if (!draft) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsSubmitting(false);
    setUpdatedPolicyName(draft.policy.name || "Policy");
    sessionStorage.removeItem(draftKey);
    toast.success("Policy updated successfully");
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
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => router.push(`/policies/${id}/edit`)}
            className="inline-flex items-center gap-1.5 text-body font-medium text-subtle hover:text-foreground transition-colors w-fit"
          >
            <CaretLeft size={16} /> Back to Edit
          </button>
          <div>
            <h1 className="text-heading font-semibold text-foreground text-balance">
              Review & Confirm Changes
            </h1>
            <p className="text-subtle text-body mt-1">
              Verify which employees will be affected by these changes.
            </p>
          </div>
        </div>

        <section className="bg-card border border-border rounded-lg shadow-sm">
          <Collapsible defaultOpen={false}>
            <CollapsibleTrigger className="w-full flex items-center gap-3 p-4 group">
              <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                <Funnel size={14} weight="duotone" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-body font-semibold text-foreground">Targeting</p>
                <p className="text-label text-muted-foreground truncate">
                  {(draft.policy.eligibleEmploymentTypes?.length ?? 0)} employment type(s)
                  {" · "}{(draft.policy.eligibility?.tierIds?.length ?? 0)} tier(s)
                  {" · "}{(draft.policy.eligibility?.departmentIds?.length ?? 0)} department(s)
                </p>
              </div>
              <CaretDown size={14} weight="bold" className="text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4 space-y-4">
              <div className="space-y-2">
                <label className="text-label font-medium text-subtle">Employment Types</label>
                <div className="flex flex-wrap gap-1.5">
                  {EMPLOYMENT_TYPES.map((t) => {
                    const selected = draft.policy.eligibleEmploymentTypes?.includes(t.id) ?? false;
                    return (
                      <button type="button" key={t.id} onClick={() => toggleEmpType(t.id)}
                        className={cn(
                          "px-3 py-1 rounded-full text-label font-medium border transition-all",
                          selected ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-primary/30"
                        )}>
                        {selected && <Check size={10} weight="bold" className="inline mr-1" />}
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-label font-medium text-subtle">Tiers</label>
                {tierOptions.length === 0 ? (
                  <p className="text-label text-faint italic">No tiers configured.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {tierOptions.map((tier) => {
                      const selected = draft.policy.eligibility?.tierIds?.includes(tier.value) ?? false;
                      return (
                        <button type="button" key={tier.value} onClick={() => toggleTier(tier.value)}
                          className={cn(
                            "px-3 py-1 rounded-full text-label font-medium border transition-all",
                            selected ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-primary/30"
                          )}>
                          {selected && <Check size={10} weight="bold" className="inline mr-1" />}
                          {tier.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-label font-medium text-subtle">Departments</label>
                {departmentOptions.length === 0 ? (
                  <p className="text-label text-faint italic">No departments configured.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {departmentOptions.map((dept) => {
                      const selected = draft.policy.eligibility?.departmentIds?.includes(dept.value) ?? false;
                      return (
                        <button type="button" key={dept.value} onClick={() => toggleDept(dept.value)}
                          className={cn(
                            "px-3 py-1 rounded-full text-label font-medium border transition-all",
                            selected ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-primary/30"
                          )}>
                          {selected && <Check size={10} weight="bold" className="inline mr-1" />}
                          {dept.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </section>

        <section className="bg-card border border-border rounded-lg shadow-sm p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <Users size={18} weight="duotone" />
            </div>
            <div>
              <h3 className="text-lead font-semibold text-foreground">Targeted Employees</h3>
              <p className="text-label text-muted-foreground mt-0.5">{targetedEmployees.length} employee(s) match your filters.</p>
            </div>
          </div>

          {targetedEmployees.length === 0 ? (
            <p className="text-label text-faint italic px-4 py-6 text-center border border-dashed border-border/60 rounded-lg">
              No employees match these filters. Adjust targeting above.
            </p>
          ) : (
            <div className="border border-border/60 rounded-lg overflow-hidden">
              <table className="w-full text-label">
                <thead className="bg-muted/30 text-subtle">
                  <tr>
                    <th className="text-left font-medium px-4 py-2.5">Name</th>
                    <th className="text-left font-medium px-4 py-2.5">Employment Type</th>
                    <th className="text-left font-medium px-4 py-2.5">Tier</th>
                    <th className="text-left font-medium px-4 py-2.5">Department</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {targetedEmployees.map((e) => (
                    <tr key={e.id} className="text-foreground">
                      <td className="px-4 py-2.5 font-medium">{e.name}</td>
                      <td className="px-4 py-2.5 text-muted-foreground capitalize">{(e.employmentType ?? "—").replace(/_/g, " ")}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{e.tier ?? "—"}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{e.department ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="bg-card border border-border rounded-lg shadow-sm p-6 md:p-8">
          <PolicyReviewCards policy={draft.policy} groups={draft.groups} benefits={draft.benefits} />
        </section>

        <div className="sticky bottom-8 z-50 mx-auto flex items-center gap-4 p-2 px-6 bg-background/80 backdrop-blur-2xl border border-border shadow-lg rounded-full animate-in slide-in-from-bottom-10 duration-700 ease-out w-fit">
          <Button type="button" variant="ghost" size="lg" className="text-body font-medium px-6 transition-colors" onClick={() => router.push(`/policies/${id}/edit`)}>
            Back to Edit
          </Button>
          <div className="w-px h-6 bg-border/40" />
          <Button type="button" size="lg" disabled={isSubmitting} onClick={handleConfirm}
            className="text-body font-medium px-8 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]">
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
        title="Policy Updated"
        message={`${updatedPolicyName} has been updated successfully.`}
        primaryAction={{ label: "View Policies", onClick: () => { setShowSuccess(false); router.push("/policies"); } }}
        secondaryAction={{ label: "Done", onClick: () => { setShowSuccess(false); router.push("/policies"); } }}
      />
    </div>
  );
}
