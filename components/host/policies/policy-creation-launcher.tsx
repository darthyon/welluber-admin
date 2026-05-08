"use client";

import { useMemo, useState } from "react";
import { Barbell, Brain, Copy, PencilSimpleLine, Sparkle, Circle, Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import type { PolicyListItem } from "@/features/policies/types";
import { usePolicyTemplates } from "@/hooks/use-policy-templates";

const ICON_MAP: Record<string, React.ElementType> = {
  Barbell,
  Brain,
  Circle,
  PencilSimpleLine,
};

interface PolicyCreationLauncherProps {
  policies: PolicyListItem[];
  onManual: () => void;
  onClone: (policyId: string) => void;
  onTemplate: (templateId: string) => void;
}

export function PolicyCreationLauncher({ policies, onManual, onClone, onTemplate }: PolicyCreationLauncherProps) {
  const [open, setOpen] = useState(false);
  const [showCloneList, setShowCloneList] = useState(false);
  const { templates, isLoading } = usePolicyTemplates();

  const cloneablePolicies = useMemo(
    () => policies.filter((policy) => policy.status === "active" || policy.status === "draft"),
    [policies]
  );

  const closeAll = () => {
    setOpen(false);
    setShowCloneList(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="h-9 text-body font-medium shadow-sm">
        <Plus size={16} weight="bold" className="mr-1.5" />
        Add Benefit Policy
      </Button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-2xl overflow-hidden rounded-[24px] border border-border bg-card shadow-2xl">
            <div className="p-8 pb-4">
              <h3 className="text-heading font-semibold text-foreground">Add Benefit Policy</h3>
              <p className="text-body text-subtle mt-1">Choose how you want to start creating this policy.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-8 pb-2">
              <button
                type="button"
                onClick={() => {
                  closeAll();
                  onManual();
                }}
                className="text-left p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/30 transition-all"
              >
                <p className="text-body font-semibold text-foreground">Manual</p>
                <p className="text-label text-muted-foreground mt-0.5">Start from a blank policy and configure each section.</p>
              </button>

              <button
                type="button"
                onClick={() => setShowCloneList(true)}
                className="text-left p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/30 transition-all"
              >
                <div className="inline-flex items-center gap-2">
                  <Copy size={14} weight="duotone" className="text-primary" />
                  <p className="text-body font-semibold text-foreground">Clone Existing</p>
                </div>
                <p className="text-label text-muted-foreground mt-0.5">Duplicate an existing policy and edit before launch.</p>
              </button>

              {isLoading ? (
                <div className="sm:col-span-2 py-4 text-label text-muted-foreground">Loading templates...</div>
              ) : (
                templates.map((template) => {
                  const Icon = ICON_MAP[template.icon] || Circle;
                  return (
                    <button
                      type="button"
                      key={template.id}
                      onClick={() => {
                        closeAll();
                        onTemplate(template.id);
                      }}
                      className="text-left p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/30 transition-all"
                    >
                      <div className="inline-flex items-center gap-2">
                        <Icon size={14} weight="duotone" className="text-primary" />
                        <p className="text-body font-semibold text-foreground">From Template · {template.name}</p>
                      </div>
                      <p className="text-label text-muted-foreground mt-0.5">{template.tagline}</p>
                    </button>
                  );
                })
              )}

              <button
                type="button"
                disabled
                className="sm:col-span-2 text-left p-4 rounded-lg border border-border bg-muted/20 text-muted-foreground cursor-not-allowed"
              >
                <div className="inline-flex items-center gap-2">
                  <Sparkle size={14} weight="duotone" />
                  <p className="text-body font-semibold">AI Assist (Deferred)</p>
                </div>
                <p className="text-label mt-0.5">Deferred per rollout plan. Manual, Clone, and Template are available now.</p>
              </button>
            </div>

            <div className="flex justify-end border-t border-border bg-muted/30 p-8 pt-4 mt-6">
              <Button variant="ghost" className="h-12 px-6 rounded-lg font-semibold" onClick={closeAll}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {showCloneList && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-xl overflow-hidden rounded-[24px] border border-border bg-card shadow-2xl">
            <div className="p-8 pb-4">
              <h3 className="text-heading font-semibold text-foreground">Clone Existing Policy</h3>
              <p className="text-body text-subtle mt-1">Pick a policy to prefill the wizard.</p>
            </div>

            <div className="px-8 pb-2 max-h-[50vh] overflow-y-auto space-y-2">
              {cloneablePolicies.length === 0 ? (
                <p className="text-label text-muted-foreground py-4">No policies available to clone yet.</p>
              ) : (
                cloneablePolicies.map((policy) => (
                  <button
                    key={policy.id}
                    type="button"
                    onClick={() => {
                      closeAll();
                      onClone(policy.id);
                    }}
                    className="w-full text-left rounded-lg border border-border p-3 hover:bg-muted/30 hover:border-primary/30 transition-all"
                  >
                    <p className="text-body font-semibold text-foreground">{policy.name}</p>
                    <p className="text-label text-muted-foreground">{policy.orgName || policy.organizationId}</p>
                  </button>
                ))
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 p-8 pt-4 mt-6">
              <Button variant="ghost" className="h-12 px-6 rounded-lg font-semibold" onClick={() => setShowCloneList(false)}>
                Back
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
