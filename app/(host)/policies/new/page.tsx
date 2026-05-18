"use client";

import { useMemo, Suspense, useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CaretLeft, NavigationArrow, Barbell, Brain, Circle, PencilSimpleLine, Copy } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { FloatingAnchorNav } from "@/components/shared/floating-anchor-nav";
import { StatusBadge } from "@/components/shared/status-badge";
import { PolicyWizardContent } from "@/components/host/policies/policy-wizard-content";
import { TargetingPreviewCard } from "@/components/host/policies/targeting-preview-card";
import { usePolicyTemplates } from "@/hooks/use-policy-templates";
import { readPolicyDraft, clearPolicyDraft } from "@/hooks/use-policy-draft";
import { BenefitPolicy, BenefitGroup, Benefit } from "@/types/policy";
import { MOCK_POLICIES, MOCK_POLICY_DATA_MAP } from "@/lib/mock-data";
import { UnsavedChangesDialog } from "@/components/shared/unsaved-changes-dialog";

const ICON_MAP: Record<string, React.ElementType> = {
  Barbell, Brain, Circle, PencilSimpleLine,
};

const ANCHOR_ITEMS = [
  { id: "policy-details", label: "Policy Details" },
  { id: "pool-cycle", label: "Pool & Cycle" },
];

type DraftShape = { policy: Partial<BenefitPolicy>; groups: BenefitGroup[]; benefits: Benefit[] };

function NewPolicyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { templates: policyTemplates, isLoading: templatesLoading } = usePolicyTemplates();

  const templateId = searchParams.get("template");
  const cloneId = searchParams.get("clone");
  const paramOrgId = searchParams.get("orgId");

  const [sectionErrors, setSectionErrors] = useState<Record<string, number>>({});
  const [resumePromptOpen, setResumePromptOpen] = useState(false);
  const [resumeDecided, setResumeDecided] = useState(false);
  const [resumedDraft, setResumedDraft] = useState<DraftShape | null>(null);
  const [pendingDraftMeta, setPendingDraftMeta] = useState<{ savedAt?: string; data: DraftShape } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [targeting, setTargeting] = useState<{
    organizationId?: string;
    employmentTypes: string[];
    tierIds: string[];
    departmentIds: string[];
  }>({ employmentTypes: [], tierIds: [], departmentIds: [] });
  const [issues, setIssues] = useState<Array<{ key: string; label: string; target: string }>>([]);
  const [saveState, setSaveState] = useState<{ status: "idle" | "saving" | "saved"; savedAt?: string }>({ status: "idle" });
  const [savedAgo, setSavedAgo] = useState<string>("");
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false);
  const pendingLeaveRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!saveState.savedAt) return;
    const savedAtIso = saveState.savedAt;
    const update = () => {
      const diff = Math.floor((Date.now() - new Date(savedAtIso).getTime()) / 1000);
      if (diff < 5) setSavedAgo("just now");
      else if (diff < 60) setSavedAgo(`${diff}s ago`);
      else setSavedAgo(`${Math.floor(diff / 60)}m ago`);
    };
    update();
    const t = setInterval(update, 5000);
    return () => clearInterval(t);
  }, [saveState.savedAt]);

  const jumpToIssue = useCallback((target: string) => {
    if (typeof window === "undefined") return;
    const el = document.getElementById(target);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  const guardedLeave = useCallback(
    (target: () => void) => {
      if (!dirty || typeof window === "undefined") {
        target();
        return;
      }
      pendingLeaveRef.current = () => {
        clearPolicyDraft(paramOrgId ?? undefined);
        target();
      };
      setUnsavedDialogOpen(true);
    },
    [dirty, paramOrgId]
  );

  const handleConfirmLeave = useCallback(() => {
    setUnsavedDialogOpen(false);
    pendingLeaveRef.current?.();
    pendingLeaveRef.current = null;
  }, []);

  const handleCancelLeave = useCallback(() => {
    setUnsavedDialogOpen(false);
    pendingLeaveRef.current = null;
  }, []);
  const handleValidationChange = useCallback(
    (counts: Record<string, number>) => setSectionErrors(counts),
    []
  );

  const anchorItemsWithErrors = useMemo(
    () => ANCHOR_ITEMS.map((item) => ({ ...item, errorCount: sectionErrors[item.id] ?? 0 })),
    [sectionErrors]
  );

  useEffect(() => {
    if (resumeDecided) return;
    if (templateId || cloneId) {
      setResumeDecided(true);
      return;
    }
    const sessionDraft = typeof window !== "undefined" ? sessionStorage.getItem("policy-draft") : null;
    if (sessionDraft) {
      setTimeout(() => setResumeDecided(true), 0);
      return;
    }
    const draft = readPolicyDraft<DraftShape>(paramOrgId ?? undefined);
    if (draft) {
      setTimeout(() => {
        setPendingDraftMeta({ savedAt: draft.savedAt, data: draft.data });
        setResumePromptOpen(true);
      }, 0);
    } else {
      setTimeout(() => setResumeDecided(true), 0);
    }
  }, [paramOrgId, templateId, cloneId, resumeDecided]);

  const handleResume = useCallback(() => {
    if (pendingDraftMeta) setResumedDraft(pendingDraftMeta.data);
    setResumePromptOpen(false);
    setResumeDecided(true);
  }, [pendingDraftMeta]);

  const handleDiscardDraft = useCallback(() => {
    clearPolicyDraft(paramOrgId ?? undefined);
    setPendingDraftMeta(null);
    setResumePromptOpen(false);
    setResumeDecided(true);
  }, [paramOrgId]);
  const selectedTemplate = policyTemplates.find((t) => t.id === templateId);
  const cloneSource = MOCK_POLICIES.find((policy) => policy.id === cloneId);

  const initialData = useMemo(() => {
    if (resumedDraft) {
      const policy = paramOrgId && resumedDraft.policy.organizationId !== paramOrgId
        ? { ...resumedDraft.policy, organizationId: paramOrgId }
        : resumedDraft.policy;
      return { ...resumedDraft, policy };
    }
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("policy-draft");
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as { policy: Partial<BenefitPolicy>; groups: BenefitGroup[]; benefits: Benefit[] };
          if (paramOrgId && parsed.policy.organizationId !== paramOrgId) {
            parsed.policy = { ...parsed.policy, organizationId: paramOrgId };
          }
          return parsed;
        }
        catch { /* fall through */ }
      }
    }

    if (paramOrgId && !cloneSource && !selectedTemplate) {
      return {
        policy: {
          organizationId: paramOrgId,
          name: "",
          description: "",
          eligibleEmploymentTypes: ["full-time"],
          benefitPoolType: "Individual" as const,
          utilisationMode: "Fixed" as const,
          refreshCycle: "Yearly" as const,
          refreshStartReference: "fy_start" as const,
          status: "draft" as const,
        },
        groups: [],
        benefits: [],
      };
    }

    if (cloneSource) {
      const sourceData = MOCK_POLICY_DATA_MAP[cloneSource.id];
      if (!sourceData) return undefined;

      const idMap = new Map<string, string>();
      const newGroups: BenefitGroup[] = sourceData.groups.map((group) => {
        const newId = `${group.id}-new`;
        idMap.set(group.id, newId);
        return { ...group, id: newId, policyId: "temp" };
      });

      const newBenefits: Benefit[] = sourceData.benefits.map((benefit) => ({
        ...benefit,
        id: `${benefit.id}-new`,
        groupId: idMap.get(benefit.groupId) || benefit.groupId,
      }));

      return {
        policy: {
          ...cloneSource,
          id: undefined,
          name: "",
          status: "draft" as const,
          clonedFrom: cloneSource.id,
          ...(paramOrgId ? { organizationId: paramOrgId } : {}),
        },
        groups: newGroups,
        benefits: newBenefits,
      };
    }

    if (!selectedTemplate) return undefined;
    const prefill = selectedTemplate.prefill;
    const idMap = new Map<string, string>();
    const newGroups: BenefitGroup[] = prefill.groups.map((g) => {
      const newId = `${g.id}-new`;
      idMap.set(g.id, newId);
      return { ...g, id: newId, policyId: "temp" };
    });
    const newBenefits: Benefit[] = prefill.benefits.map((b) => ({
      ...b,
      id: `${b.id}-new`,
      groupId: idMap.get(b.groupId) || b.groupId,
    }));
    return {
      policy: {
        name: prefill.name || "",
        description: prefill.description || "",
        eligibleEmploymentTypes: [...prefill.eligibleEmploymentTypes],
        dependentCoverages: prefill.dependentCoverages ? [...prefill.dependentCoverages] : [],
        benefitPoolType: prefill.benefitPoolType,
        utilisationMode: prefill.utilisationMode,
        refreshCycle: prefill.refreshCycle,
        refreshStartReference: prefill.refreshStartReference,
        templateId: selectedTemplate.id,
        status: "draft" as const,
        ...(paramOrgId ? { organizationId: paramOrgId } : {}),
      },
      groups: newGroups,
      benefits: newBenefits,
    };
  }, [cloneSource, selectedTemplate, paramOrgId, resumedDraft]);

  const handleReview = (data: { policy: Partial<BenefitPolicy>; groups: BenefitGroup[]; benefits: Benefit[] }) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("policy-draft", JSON.stringify(data));
      if (paramOrgId) {
        sessionStorage.setItem("policy-org-context", paramOrgId);
      } else {
        sessionStorage.removeItem("policy-org-context");
      }
    }
    router.push("/policies/new/review");
  };

  if (templateId && templatesLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <span className="ml-3 text-body font-medium text-muted-foreground">Loading template...</span>
      </div>
    );
  }

  return (
    <div className="pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mx-auto max-w-[1280px] flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
        {/* Left Column: Navigation */}
        <aside className="hidden xl:flex flex-col gap-4 w-52 shrink-0 sticky top-20 self-start">
          <FloatingAnchorNav items={anchorItemsWithErrors} />
          <TargetingPreviewCard
            organizationId={targeting.organizationId}
            employmentTypes={targeting.employmentTypes}
            tierIds={targeting.tierIds}
            departmentIds={targeting.departmentIds}
          />
          {issues.length > 0 && (
            <div
              role="alert"
              aria-live="polite"
              className="rounded-lg border border-destructive/30 bg-destructive/[0.04] p-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-300"
            >
              <p className="text-label font-semibold text-destructive">Issues</p>
              <ul className="space-y-1">
                {issues.slice(0, 6).map((entry) => (
                  <li key={entry.key}>
                    <button
                      type="button"
                      onClick={() => jumpToIssue(entry.target)}
                      className="text-micro text-destructive hover:underline text-left leading-snug"
                    >
                      {entry.label}
                    </button>
                  </li>
                ))}
                {issues.length > 6 && (
                  <li className="text-micro text-muted-foreground">+{issues.length - 6} more</li>
                )}
              </ul>
            </div>
          )}
        </aside>

        {/* Right Column: Form Content */}
        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() =>
                  guardedLeave(() =>
                    paramOrgId
                      ? router.push(`/organizations/${paramOrgId}?tab=policies`)
                      : router.back()
                  )
                }
                className="inline-flex items-center gap-1.5 text-body font-medium text-subtle hover:text-foreground transition-colors w-fit"
              >
                <CaretLeft size={16} /> {paramOrgId ? "Back to Organisation" : "Back to Policies"}
              </button>
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h1 className="text-heading font-semibold text-foreground text-balance">
                    Add Benefit Policy
                  </h1>
                  <p className="text-subtle text-body mt-1">
                    Define eligibility rules, pool strategies, and service groups for your workforce.
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2 text-label text-muted-foreground pt-2" aria-live="polite">
                  {saveState.status === "saving" ? (
                    <StatusBadge status="Saving…" variant="amber" dot className="animate-pulse" />
                  ) : saveState.status === "saved" && saveState.savedAt ? (
                    <StatusBadge status={`Saved ${savedAgo}`} variant="emerald" dot />
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                      <span>Draft</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Selected template bar */}
            {cloneSource ? (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-primary/20 bg-primary/[0.03]">
                <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <Copy size={16} weight="duotone" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-label font-semibold text-foreground">Cloned from {cloneSource.name}</p>
                  <p className="text-micro text-muted-foreground">Policy settings copied. Name and assignments are reset.</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/policies")}
                  className="text-label text-primary hover:bg-primary/5 shrink-0"
                >
                  Change
                </Button>
              </div>
            ) : selectedTemplate ? (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-primary/20 bg-primary/[0.03]">
                <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  {(() => {
                    const Icon = ICON_MAP[selectedTemplate.icon] || Circle;
                    return <Icon size={16} weight="duotone" />;
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-label font-semibold text-foreground">{selectedTemplate.name}</p>
                  <p className="text-micro text-muted-foreground">Template applied. You can edit all fields below.</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/policies")}
                  className="text-label text-primary hover:bg-primary/5 shrink-0"
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-border bg-muted/20">
                <div className="w-8 h-8 rounded-md bg-muted text-muted-foreground flex items-center justify-center">
                  <PencilSimpleLine size={16} weight="duotone" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-label font-semibold text-foreground">Manual Policy Setup</p>
                  <p className="text-micro text-muted-foreground">Build your own policy with custom services and amounts.</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/policies")}
                  className="text-label text-primary hover:bg-primary/5 shrink-0"
                >
                  Change
                </Button>
              </div>
            )}

            {resumeDecided && (
              <PolicyWizardContent
                mode="create"
                initialData={initialData}
                onReview={handleReview}
                onSubmit={handleReview}
                lockedOrganizationId={paramOrgId ?? undefined}
                onValidationChange={handleValidationChange}
                onDirtyChange={setDirty}
                onTargetingChange={setTargeting}
                onIssuesChange={setIssues}
                onSaveStatusChange={setSaveState}
              />
            )}

            {/* Sticky Action Bar */}
            <div className="sticky bottom-8 z-50 mx-auto flex items-center gap-4 p-2 px-6 bg-background/80 backdrop-blur-2xl border border-border shadow-lg rounded-full animate-in slide-in-from-bottom-10 duration-700 ease-out w-fit">
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="text-body font-medium px-6 transition-colors"
                onClick={() =>
                  guardedLeave(() =>
                    paramOrgId
                      ? router.push(`/organizations/${paramOrgId}?tab=policies`)
                      : router.back()
                  )
                }
              >
                Cancel
              </Button>
              <div className="w-px h-6 bg-border/40" />
              <Button
                type="submit"
                form="policyWizardForm"
                size="lg"
                className="text-body font-medium px-8 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Review
                <NavigationArrow size={14} weight="bold" className="rotate-90" />
              </Button>
            </div>

          </div>
        </div>
      </div>

      <Dialog open={resumePromptOpen} onOpenChange={(open) => { if (!open) handleDiscardDraft(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resume your draft?</DialogTitle>
            <DialogDescription>
              {pendingDraftMeta?.savedAt
                ? `An autosaved draft from ${new Date(pendingDraftMeta.savedAt).toLocaleString()} was found.`
                : "An autosaved draft was found."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={handleDiscardDraft}>Start fresh</Button>
            <Button onClick={handleResume}>Resume draft</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UnsavedChangesDialog
        open={unsavedDialogOpen}
        onOpenChange={setUnsavedDialogOpen}
        onConfirm={handleConfirmLeave}
        onCancel={handleCancelLeave}
        description="You have unsaved changes. If you leave now, your changes will be lost. Your autosaved draft will also be removed."
        confirmLabel="Discard Changes"
        cancelLabel="Keep Editing"
      />
    </div>
  );
}

export default function NewPolicyPage() {
  return (
    <Suspense fallback={<div data-test="fallback">FALLBACK</div>}>
      <NewPolicyForm />
    </Suspense>
  );
}
