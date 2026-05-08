"use client";

import { useMemo, useState } from "react";
import { Barbell, Brain, PencilSimpleLine, Sparkle, Circle, Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { usePolicyTemplates } from "@/hooks/use-policy-templates";

const ICON_MAP: Record<string, React.ElementType> = {
  Barbell,
  Brain,
  Circle,
  PencilSimpleLine,
};

interface PolicyCreationLauncherProps {
  onManual: () => void;
  onTemplate: (templateId: string) => void;
}

export function PolicyCreationLauncher({ onManual, onTemplate }: PolicyCreationLauncherProps) {
  const [open, setOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<"scratch" | "template" | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const { templates, isLoading } = usePolicyTemplates();

  const hasTemplates = useMemo(() => templates.length > 0, [templates]);

  const closeAll = () => {
    setOpen(false);
    setSelectedMode(null);
    setSelectedTemplateId("");
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

            <div className="grid grid-cols-1 gap-3 px-8 pb-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => setSelectedMode("scratch")}
                className="text-left p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/30 transition-all"
              >
                <p className="text-body font-semibold text-foreground">From Scratch</p>
                <p className="text-label text-muted-foreground mt-0.5">Start from a blank policy and configure each section.</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMode("template")}
                className="text-left p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/30 transition-all"
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
                      <select
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                        className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-body font-medium text-foreground outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="">Select a template</option>
                        {templates.map((template) => {
                          const Icon = ICON_MAP[template.icon] || Circle;
                          return (
                            <option key={template.id} value={template.id}>
                              {template.name}
                            </option>
                          );
                        })}
                      </select>
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

            <div className="mt-6 flex items-center justify-between border-t border-border bg-muted/30 p-8 pt-4">
              {selectedMode === "scratch" ? (
                <Button
                  className="h-11 rounded-4xl px-5 text-body font-medium"
                  onClick={() => {
                    closeAll();
                    onManual();
                  }}
                >
                  Continue From Scratch
                </Button>
              ) : selectedMode === "template" ? (
                <Button
                  className="h-11 rounded-4xl px-5 text-body font-medium"
                  disabled={!selectedTemplateId}
                  onClick={() => {
                    if (!selectedTemplateId) return;
                    closeAll();
                    onTemplate(selectedTemplateId);
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
