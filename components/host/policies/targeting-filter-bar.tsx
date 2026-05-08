"use client";

import { useState, useMemo } from "react";
import { Funnel, Check } from "@phosphor-icons/react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EMPLOYMENT_TYPES = [
  { id: "full-time", label: "Full-time" },
  { id: "part-time", label: "Part-time" },
  { id: "contract", label: "Contract" },
  { id: "internship", label: "Internship" },
] as const;

interface TargetingFilterBarProps {
  selectedEmpTypes: string[];
  selectedTierIds: string[];
  selectedDeptIds: string[];
  tierOptions: { value: string; label: string }[];
  departmentOptions: { value: string; label: string }[];
  onToggleEmpType: (id: string) => void;
  onToggleTier: (id: string) => void;
  onToggleDept: (id: string) => void;
}

export function TargetingFilterBar({
  selectedEmpTypes,
  selectedTierIds,
  selectedDeptIds,
  tierOptions,
  departmentOptions,
  onToggleEmpType,
  onToggleTier,
  onToggleDept,
}: TargetingFilterBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const filterCount = useMemo(() => {
    let count = 0;
    if (selectedDeptIds.length > 0) count++;
    if (selectedEmpTypes.length < 4) count++;
    return count;
  }, [selectedEmpTypes.length, selectedDeptIds.length]);

  const hasActiveFilters = filterCount > 0;

  return (
    <>
      {/* Inline tier chips + Filters button */}
      <div className="flex items-start gap-3">
        <span className="text-label font-semibold text-foreground shrink-0 pt-1.5">Tiers</span>
        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
          {tierOptions.length === 0 ? (
            <span className="text-body text-faint">No tiers configured</span>
          ) : (
            tierOptions.map((tier) => {
              const selected = selectedTierIds.includes(tier.value);
              return (
                <button
                  type="button"
                  key={tier.value}
                  onClick={() => onToggleTier(tier.value)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-label font-medium border transition-all",
                    selected
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary/30"
                  )}
                >
                  {selected && <Check size={10} weight="bold" className="inline mr-1" />}
                  {tier.label}
                </button>
              );
            })
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSheetOpen(true)}
            className="h-7 rounded-full text-label font-medium shrink-0 ml-1"
          >
            <Funnel size={11} weight="bold" className="mr-1" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-micro font-semibold leading-none">
                {filterCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Filter Sheet */}
      <Sheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Targeting Filters"
        description="Refine which employees this policy applies to"
        size="md"
        footer={
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="lg"
              className="flex-1 text-body font-medium"
              onClick={() => setSheetOpen(false)}
            >
              Done
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Employment Types */}
          <div className="space-y-2">
            <label className="text-label font-semibold text-foreground">Employment Types</label>
            <div className="flex flex-wrap gap-1.5">
              {EMPLOYMENT_TYPES.map((t) => {
                const selected = selectedEmpTypes.includes(t.id);
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => onToggleEmpType(t.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-label font-medium border transition-all",
                      selected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary/30"
                    )}
                  >
                    {selected && <Check size={10} weight="bold" className="inline mr-1" />}
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Departments */}
          {departmentOptions.length > 0 && (
            <div className="space-y-2">
              <label className="text-label font-semibold text-foreground">Departments</label>
              <div className="flex flex-wrap gap-1.5">
                {departmentOptions.map((dept) => {
                  const selected = selectedDeptIds.includes(dept.value);
                  return (
                    <button
                      type="button"
                      key={dept.value}
                      onClick={() => onToggleDept(dept.value)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-label font-medium border transition-all",
                        selected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground border-border hover:border-primary/30"
                      )}
                    >
                      {selected && <Check size={10} weight="bold" className="inline mr-1" />}
                      {dept.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {departmentOptions.length === 0 && (
            <p className="text-label text-faint italic">No department filters available for this organisation.</p>
          )}
        </div>
      </Sheet>
    </>
  );
}
