"use client";

import { Barbell, Brain, CaretLeft, Circle, Copy, NavigationArrow, PencilSimpleLine } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FloatingAnchorNav } from "@/components/shared/floating-anchor-nav";
import { StatusBadge } from "@/components/shared/status-badge";
import { TargetingPreviewCard } from "@/components/host/policies/targeting-preview-card";
import { UnsavedChangesDialog } from "@/components/shared/unsaved-changes-dialog";
import type { Benefit, BenefitGroup, BenefitPolicy } from "@/types/policy";

const ICON_MAP: Record<string, React.ElementType> = { Barbell, Brain, Circle, PencilSimpleLine };

export const NEW_POLICY_ANCHOR_ITEMS = [
  { id: "policy-details", label: "Policy Details" },
  { id: "pool-cycle", label: "Pool & Cycle" },
];

export type NewPolicyDraftShape = {
  policy: Partial<BenefitPolicy>;
  groups: BenefitGroup[];
  benefits: Benefit[];
};

export function NewPolicySidebar({
  anchorItemsWithErrors,
  issues,
  jumpToIssue,
  targeting,
}: {
  anchorItemsWithErrors: Array<{ id: string; label: string; errorCount: number }>;
  issues: Array<{ key: string; label: string; target: string }>;
  jumpToIssue: (target: string) => void;
  targeting: { organizationId?: string; employmentTypes: string[]; tierIds: string[]; departmentIds: string[] };
}) {
  return (
    <aside className="sticky top-20 hidden w-52 shrink-0 flex-col gap-4 self-start xl:flex">
      <FloatingAnchorNav items={anchorItemsWithErrors} />
      <TargetingPreviewCard
        organizationId={targeting.organizationId}
        employmentTypes={targeting.employmentTypes}
        tierIds={targeting.tierIds}
        departmentIds={targeting.departmentIds}
      />
      {issues.length > 0 ? (
        <div role="alert" aria-live="polite" className="animate-in space-y-2 rounded-lg border border-destructive/30 bg-destructive/[0.04] p-3 duration-300 fade-in slide-in-from-top-1">
          <p className="text-label font-semibold text-destructive">Issues</p>
          <ul className="space-y-1">
            {issues.slice(0, 6).map((entry) => (
              <li key={entry.key}>
                <button type="button" onClick={() => jumpToIssue(entry.target)} className="text-micro leading-snug text-destructive hover:underline">
                  {entry.label}
                </button>
              </li>
            ))}
            {issues.length > 6 ? <li className="text-micro text-muted-foreground">+{issues.length - 6} more</li> : null}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}

export function NewPolicyPageHeader({
  onBack,
  paramOrgId,
  saveState,
  savedAgo,
}: {
  onBack: () => void;
  paramOrgId: string | null;
  saveState: { status: "idle" | "saving" | "saved"; savedAt?: string };
  savedAgo: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <button type="button" onClick={onBack} className="inline-flex w-fit items-center gap-1.5 text-body font-medium text-subtle transition-colors hover:text-foreground">
          <CaretLeft size={16} />
          {paramOrgId ? "Back to Organisation" : "Back to Policies"}
        </button>
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-heading font-semibold text-balance text-foreground">Add Benefit Policy</h1>
            <p className="mt-1 text-body text-subtle">Define eligibility rules, pool strategies, and service groups for your workforce.</p>
          </div>
          <div className="flex shrink-0 items-center gap-2 pt-2 text-label text-muted-foreground" aria-live="polite">
            {saveState.status === "saving" ? (
              <StatusBadge status="Saving…" variant="amber" dot className="animate-pulse" />
            ) : saveState.status === "saved" && saveState.savedAt ? (
              <StatusBadge status={`Saved ${savedAgo}`} variant="emerald" dot />
            ) : (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                <span>Draft</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PolicySetupBanner({
  cloneSource,
  onChange,
  selectedTemplate,
}: {
  cloneSource: { name: string } | null;
  onChange: () => void;
  selectedTemplate?: { icon: string; name: string };
}) {
  if (cloneSource) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/[0.03] p-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary"><Copy size={16} weight="duotone" /></div>
        <div className="min-w-0 flex-1">
          <p className="text-label font-semibold text-foreground">Cloned from {cloneSource.name}</p>
          <p className="text-micro text-muted-foreground">Policy settings copied. Name and assignments are reset.</p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onChange} className="shrink-0 text-label text-primary hover:bg-primary/5">Change</Button>
      </div>
    );
  }

  if (selectedTemplate) {
    const Icon = ICON_MAP[selectedTemplate.icon] || Circle;
    return (
      <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/[0.03] p-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon size={16} weight="duotone" /></div>
        <div className="min-w-0 flex-1">
          <p className="text-label font-semibold text-foreground">{selectedTemplate.name}</p>
          <p className="text-micro text-muted-foreground">Template applied. You can edit all fields below.</p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onChange} className="shrink-0 text-label text-primary hover:bg-primary/5">Change</Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-muted/20 p-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground"><PencilSimpleLine size={16} weight="duotone" /></div>
      <div className="min-w-0 flex-1">
        <p className="text-label font-semibold text-foreground">Manual Policy Setup</p>
        <p className="text-micro text-muted-foreground">Build your own policy with custom services and amounts.</p>
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={onChange} className="shrink-0 text-label text-primary hover:bg-primary/5">Change</Button>
    </div>
  );
}

export function NewPolicyPageActionBar({ onCancel, onReview }: { onCancel: () => void; onReview: () => void; }) {
  return (
    <div className="sticky bottom-8 z-50 mx-auto flex w-fit animate-in items-center gap-4 rounded-full border border-border bg-background/80 p-2 px-6 shadow-lg backdrop-blur-2xl duration-700 ease-out slide-in-from-bottom-10">
      <Button type="button" variant="ghost" size="lg" className="px-6 text-body font-medium transition-colors" onClick={onCancel}>Cancel</Button>
      <div className="h-6 w-px bg-border/40" />
      <Button type="submit" form="policyWizardForm" size="lg" className="flex items-center gap-2 px-8 text-body font-medium transition-all hover:scale-[1.02] active:scale-[0.98]" onClick={onReview}>
        Review
        <NavigationArrow size={14} weight="bold" className="rotate-90" />
      </Button>
    </div>
  );
}

export function PolicyDraftResumeDialog({
  onDiscard,
  onResume,
  open,
  pendingDraftMeta,
}: {
  onDiscard: () => void;
  onResume: () => void;
  open: boolean;
  pendingDraftMeta: { savedAt?: string; data: NewPolicyDraftShape } | null;
}) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onDiscard(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resume your draft?</DialogTitle>
          <DialogDescription>
            {pendingDraftMeta?.savedAt ? `An autosaved draft from ${new Date(pendingDraftMeta.savedAt).toLocaleString()} was found.` : "An autosaved draft was found."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onDiscard}>Start fresh</Button>
          <Button onClick={onResume}>Resume draft</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function NewPolicyUnsavedDialog({
  onCancel,
  onConfirm,
  onOpenChange,
  open,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  return (
    <UnsavedChangesDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      onCancel={onCancel}
      description="You have unsaved changes. If you leave now, your changes will be lost. Your autosaved draft will also be removed."
      confirmLabel="Discard Changes"
      cancelLabel="Keep Editing"
    />
  );
}
