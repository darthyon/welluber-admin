"use client";

import { useState, useMemo } from "react";
import { Funnel, Check } from "@phosphor-icons/react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DatePickerField } from "@/components/shared/date-picker-field";
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
  effectiveDate?: "immediate" | "scheduled";
  scheduledDate?: string;
  onToggleEmpType: (id: string) => void;
  onToggleTier: (id: string) => void;
  onToggleDept: (id: string) => void;
  onEffectiveDateChange?: (value: { effectiveDate: "immediate" | "scheduled"; scheduledDate?: string }) => void;
}

export function TargetingFilterBar({
  selectedEmpTypes,
  selectedTierIds,
  selectedDeptIds,
  tierOptions,
  departmentOptions,
  effectiveDate = "immediate",
  scheduledDate,
  onToggleEmpType,
  onToggleTier,
  onToggleDept,
  onEffectiveDateChange,
}: TargetingFilterBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const isAllEmpTypes = selectedEmpTypes.length === 0 || selectedEmpTypes.length === EMPLOYMENT_TYPES.length;
  const isAllTiers = selectedTierIds.length === 0 || selectedTierIds.length === tierOptions.length;
  const isAllDepts = selectedDeptIds.length === 0 || selectedDeptIds.length === departmentOptions.length;

  const filterCount = useMemo(() => {
    let count = 0;
    if (!isAllTiers) count++;
    if (!isAllDepts) count++;
    if (!isAllEmpTypes) count++;
    return count;
  }, [isAllDepts, isAllEmpTypes, isAllTiers]);

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
            <>
              <button
                type="button"
                onClick={() => selectedTierIds.forEach(onToggleTier)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-label font-medium border transition-all",
                  isAllTiers
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/30"
                )}
              >
                {isAllTiers && <Check size={10} weight="bold" className="inline mr-1" />}
                All
              </button>
              {tierOptions.map((tier) => {
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
              })}
            </>
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
          {/* Effective Date */}
          <div className="space-y-2">
            <label className="text-label font-semibold text-foreground">Effective Date</label>
            <div className="flex flex-wrap gap-2">
              {([
                { id: "immediate", label: "Immediate" },
                { id: "scheduled", label: "Scheduled" },
              ] as const).map((opt) => {
                const selected = effectiveDate === opt.id;
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() =>
                      onEffectiveDateChange?.({
                        effectiveDate: opt.id,
                        scheduledDate: opt.id === "scheduled" ? scheduledDate : undefined,
                      })
                    }
                    className={cn(
                      "px-3 py-1.5 rounded-full text-label font-medium border transition-all",
                      selected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary/30"
                    )}
                  >
                    {selected && <Check size={10} weight="bold" className="inline mr-1" />}
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {effectiveDate === "scheduled" && (
              <div className="pt-2">
                <DatePickerField
                  value={scheduledDate || ""}
                  onChange={(v) => onEffectiveDateChange?.({ effectiveDate: "scheduled", scheduledDate: v })}
                  placeholder="Select date"
                  clearable={false}
                />
              </div>
            )}
          </div>

          {/* Employment Types */}
          <div className="space-y-2">
            <label className="text-label font-semibold text-foreground">Employment Types</label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => selectedEmpTypes.forEach(onToggleEmpType)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-label font-medium border transition-all",
                  isAllEmpTypes
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:border-primary/30"
                )}
              >
                {isAllEmpTypes && <Check size={10} weight="bold" className="inline mr-1" />}
                All
              </button>
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
                <button
                  type="button"
                  onClick={() => selectedDeptIds.forEach(onToggleDept)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-label font-medium border transition-all",
                    isAllDepts
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary/30"
                  )}
                >
                  {isAllDepts && <Check size={10} weight="bold" className="inline mr-1" />}
                  All
                </button>
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
