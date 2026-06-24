"use client";

import { useMemo, useState } from "react";
import { Sparkle, Plus, Buildings } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { usePolicyTemplates } from "@/hooks/use-policy-templates";
import { MOCK_ORGS } from "@/lib/mock-data";
import { FormSelect } from "@/components/shared/form-select";

interface PolicyCreationLauncherProps {
  onManual: (orgId?: string) => void;
  onTemplate: (templateId: string, orgId?: string) => void;
  preselectedOrgId?: string;
  hideOrgPicker?: boolean;
}

export function PolicyCreationLauncher({ onManual, onTemplate, preselectedOrgId, hideOrgPicker }: PolicyCreationLauncherProps) {
  const [open, setOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<"scratch" | "template" | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState(preselectedOrgId ?? "");
  const { templates, isLoading } = usePolicyTemplates();

  const hasTemplates = useMemo(() => templates.length > 0, [templates]);

  // Orgs that have at least one employee
  const orgOptions = useMemo(() => {
    return MOCK_ORGS.map((o) => ({ value: o.id, label: o.name }));
  }, []);

  const canContinue = selectedOrgId !== "" && (selectedMode === "scratch" || (selectedMode === "template" && selectedTemplateId !== ""));

  const closeAll = () => {
    setOpen(false);
    setSelectedMode(null);
    setSelectedTemplateId("");
    setSelectedOrgId("");
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="h-9 text-body font-medium shadow-sm">
        <Plus size={16} weight="bold" className="mr-1.5" />
        Add Benefit Policy
      </Button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-muted-foreground/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-2xl overflow-hidden rounded-[24px] border border-border bg-card shadow-2xl">
            <div className="p-8 pb-4">
              <h3 className="text-heading font-semibold text-foreground">Add Benefit Policy</h3>
              <p className="text-body text-subtle mt-1">Choose how you want to start creating this policy.</p>
            </div>

            <div className="px-8 pb-2 space-y-4">
              {/* Organisation — required first step (hidden when org is pre-selected) */}
              {!hideOrgPicker && (
                <div className="space-y-1.5">
                  <label className="text-label font-medium text-subtle flex items-center gap-1.5">
                    <Buildings size={14} />
                    Organisation
                    <span className="text-destructive">*</span>
                  </label>
                  <FormSelect
                    value={selectedOrgId}
                    onChange={(v) => setSelectedOrgId(v)}
                    options={[{ label: "Select organisation...", value: "" }, ...orgOptions]}
                    placeholder="Select organisation..."
                  />
                  <p className="text-micro text-faint">Tiers and departments will load automatically once an organisation is selected.</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setSelectedMode("scratch")}
                  disabled={!selectedOrgId}
                  className="text-left p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                  <p className="text-body font-semibold text-foreground">From Scratch</p>
                  <p className="text-label text-muted-foreground mt-0.5">Start from a blank policy and configure each section.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMode("template")}
                  disabled={!selectedOrgId}
                  className="text-left p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                  <p className="text-body font-semibold text-foreground">From Template</p>
                  <p className="text-label text-muted-foreground mt-0.5">Use a curated starter and adjust details before launch.</p>
                </button>

                <button
                  type="button"
                  disabled
                  className="text-left p-4 rounded-lg border border-border bg-muted/20 text-muted-foreground cursor-not-allowed"
                >
                  <div className="inline-flex items-center gap-2">
                    <Sparkle size={14} weight="duotone" />
                    <p className="text-body font-semibold">AI Assist (Deferred)</p>
                  </div>
                  <p className="text-label mt-0.5">Deferred per rollout plan. Use scratch or template for now.</p>
                </button>

                {selectedMode === "template" && (
                  <div className="sm:col-span-3 rounded-lg border border-border bg-muted/20 p-4">
                    <p className="text-label font-semibold text-foreground">Choose Template</p>
                    {isLoading ? (
                      <p className="mt-2 text-label text-muted-foreground">Loading templates...</p>
                    ) : !hasTemplates ? (
                      <p className="mt-2 text-label text-muted-foreground">No templates available yet.</p>
                    ) : (
                      <>
                        <FormSelect
                          value={selectedTemplateId}
                          onChange={(v) => setSelectedTemplateId(v)}
                          options={[{ label: "Select a template", value: "" }, ...templates.map((template) => ({ label: template.name, value: template.id }))]}
                          placeholder="Select a template"
                        />
                        {selectedTemplateId && (
                          <p className="mt-2 text-label text-muted-foreground">
                            {templates.find((template) => template.id === selectedTemplateId)?.tagline}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-border bg-muted/30 p-8 pt-4">
              {selectedMode === "scratch" ? (
                <Button
                  className="h-11 rounded-4xl px-5 text-body font-medium"
                  disabled={!canContinue}
                  onClick={() => {
                    closeAll();
                    onManual(selectedOrgId);
                  }}
                >
                  Continue From Scratch
                </Button>
              ) : selectedMode === "template" ? (
                <Button
                  className="h-11 rounded-4xl px-5 text-body font-medium"
                  disabled={!canContinue}
                  onClick={() => {
                    if (!selectedTemplateId) return;
                    closeAll();
                    onTemplate(selectedTemplateId, selectedOrgId);
                  }}
                >
                  Continue With Template
                </Button>
              ) : (
                <div />
              )}
              <Button variant="ghost" className="h-12 px-6 rounded-lg font-semibold" onClick={closeAll}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
