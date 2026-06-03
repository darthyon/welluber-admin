"use client";

import {
  CaretDown,
  Check,
  ClipboardText,
  MagnifyingGlass,
  NavigationArrow,
  PencilSimpleLine,
  Users,
  Warning,
  X,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TargetingFilterBar } from "@/components/host/policies/targeting-filter-bar";
import { PolicyReviewCards } from "@/components/host/policies/policy-wizard-content";
import type { EmployeeDirectoryItem } from "@/features/employees/types";
import { cn } from "@/lib/utils";
import type { Benefit, BenefitGroup, BenefitPolicy } from "@/types/policy";

export type PolicyReviewDraft = {
  policy: Partial<BenefitPolicy>;
  groups: BenefitGroup[];
  benefits: Benefit[];
};

interface PolicyReviewHeaderProps {
  onBack: () => void;
}

interface PolicyReviewAssignmentSectionProps {
  departmentOptions: { value: string; label: string }[];
  draft: PolicyReviewDraft;
  finalEmployees: EmployeeDirectoryItem[];
  includedIds: Set<string>;
  isSubmitting: boolean;
  onConfirm: () => void;
  onEffectiveDateChange: (values: { effectiveDate: "immediate" | "scheduled"; scheduledDate?: string }) => void;
  onPromptInclude: (employee: EmployeeDirectoryItem) => void;
  onRemoveSelected: () => void;
  onSaveDraft: () => void;
  onSearchChange: (query: string) => void;
  onToggleDept: (id: string) => void;
  onToggleEmpType: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onToggleTier: (id: string) => void;
  orgContext?: string | null;
  searchQuery: string;
  searchResults: EmployeeDirectoryItem[];
  selectedIds: Set<string>;
  tierOptions: { value: string; label: string }[];
  routerBack: () => void;
}

interface PolicyReviewBypassModalProps {
  employee: EmployeeDirectoryItem | null;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function PolicyReviewHeader({ onBack }: PolicyReviewHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex w-fit items-center gap-1.5 text-body font-medium text-subtle transition-colors hover:text-foreground"
      >
        Back to Edit
      </button>
      <div>
        <h1 className="text-heading font-semibold text-foreground text-balance">Review</h1>
        <p className="mt-1 text-body text-subtle">
          Verify which employees will be assigned this policy. Adjust filters before confirming.
        </p>
      </div>
    </div>
  );
}

export function PolicyReviewAssignmentSection({
  departmentOptions,
  draft,
  finalEmployees,
  includedIds,
  isSubmitting,
  onConfirm,
  onEffectiveDateChange,
  onPromptInclude,
  onRemoveSelected,
  onSaveDraft,
  onSearchChange,
  onToggleDept,
  onToggleEmpType,
  onToggleSelect,
  onToggleSelectAll,
  onToggleTier,
  orgContext,
  searchQuery,
  searchResults,
  selectedIds,
  tierOptions,
  routerBack,
}: PolicyReviewAssignmentSectionProps) {
  void orgContext;
  return (
    <>
      <section className="space-y-5 rounded-lg border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
              <Users size={18} weight="duotone" />
            </div>
            <div>
              <h3 className="text-lead font-semibold text-foreground">Targeted Employees</h3>
              <p className="mt-0.5 text-label text-muted-foreground">
                {finalEmployees.length} employee{finalEmployees.length !== 1 ? "s" : ""} will be assigned
              </p>
            </div>
          </div>
          {selectedIds.size > 0 ? (
            <Button variant="outline" size="sm" onClick={onRemoveSelected} className="h-8 text-label font-medium">
              <X size={14} weight="bold" className="mr-1.5" />
              Remove {selectedIds.size} selected
            </Button>
          ) : null}
        </div>

        <div className="rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
          <TargetingFilterBar
            selectedEmpTypes={draft.policy.eligibleEmploymentTypes ?? []}
            selectedTierIds={draft.policy.eligibility?.tierIds ?? []}
            selectedDeptIds={draft.policy.eligibility?.departmentIds ?? []}
            tierOptions={tierOptions}
            departmentOptions={departmentOptions}
            effectiveDate={draft.policy.effectiveDate ?? "immediate"}
            scheduledDate={draft.policy.effectiveCustomDate}
            onToggleEmpType={onToggleEmpType}
            onToggleTier={onToggleTier}
            onToggleDept={onToggleDept}
            onEffectiveDateChange={onEffectiveDateChange}
          />
        </div>

        <div className="relative">
          <MagnifyingGlass size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search employees to include..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-4 text-body text-foreground outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
          />
          {searchQuery.trim() ? (
            <button
              onClick={() => onSearchChange("")}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-faint hover:text-foreground"
            >
              <X size={14} weight="bold" />
            </button>
          ) : null}
          {searchResults.length > 0 ? (
            <div className="absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
              {searchResults.map((employee) => (
                <button
                  key={employee.id}
                  onClick={() => onPromptInclude(employee)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-label font-semibold text-primary">
                    {employee.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-body font-medium leading-tight text-foreground">{employee.name}</p>
                    <p className="text-label font-mono text-subtle">{employee.empCode}</p>
                  </div>
                  <span className="ml-auto text-label font-medium text-primary">Include</span>
                </button>
              ))}
            </div>
          ) : searchQuery.trim() ? (
            <div className="absolute top-full right-0 left-0 z-50 mt-1 rounded-lg border border-border bg-popover px-4 py-3 shadow-lg">
              <p className="text-body text-muted-foreground">No employees found.</p>
            </div>
          ) : null}
        </div>

        <div className="border-t border-border/60 pt-5">
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="w-10 p-3">
                    <button
                      onClick={onToggleSelectAll}
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded border transition-all",
                        selectedIds.size === finalEmployees.length && finalEmployees.length > 0
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background"
                      )}
                    >
                      {selectedIds.size === finalEmployees.length && finalEmployees.length > 0 ? (
                        <Check size={12} weight="bold" />
                      ) : null}
                    </button>
                  </th>
                  {["Employee", "Employment Type", "Tier", "Department"].map((label) => (
                    <th key={label} className="p-3 text-label font-medium text-subtle">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {finalEmployees.map((employee) => {
                  const isSelected = selectedIds.has(employee.id);
                  const isBypassed = includedIds.has(employee.id);
                  return (
                    <tr key={employee.id} className="transition-colors hover:bg-muted/20">
                      <td className="p-3">
                        <button
                          onClick={() => onToggleSelect(employee.id)}
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded border transition-all",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background"
                          )}
                        >
                          {isSelected ? <Check size={12} weight="bold" /> : null}
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <p className="text-body font-medium text-foreground">{employee.name}</p>
                          {isBypassed ? (
                            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 text-micro font-medium text-amber-600 dark:text-amber-400">
                              Added
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-label font-mono text-subtle">{employee.empCode}</p>
                      </td>
                      <td className="p-3">
                        <span className="text-body capitalize text-subtle">
                          {(employee.employmentType ?? "—").replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="p-3">
                        {employee.tier ? <Badge variant="secondary">{employee.tier}</Badge> : <span className="text-body text-faint">—</span>}
                      </td>
                      <td className="p-3">
                        <span className="text-body text-subtle">{employee.department ?? "—"}</span>
                      </td>
                    </tr>
                  );
                })}
                {finalEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center">
                      <Users size={32} weight="duotone" className="mx-auto mb-3 text-muted/30" />
                      <p className="text-body font-medium text-muted-foreground">No employees match the current criteria.</p>
                      <p className="mt-1 text-label text-faint">Use the search above to include specific employees.</p>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card shadow-sm">
        <Collapsible defaultOpen={false}>
          <CollapsibleTrigger className="group flex w-full items-center gap-3 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted">
              <ClipboardText size={14} weight="duotone" className="text-primary" />
            </div>
            <div className="min-w-0 flex-1 text-left">
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

      <div className="sticky bottom-8 z-50 mx-auto flex w-fit animate-in items-center gap-4 rounded-full border border-border bg-background/80 p-2 px-6 shadow-lg backdrop-blur-2xl duration-700 ease-out slide-in-from-bottom-10">
        <Button type="button" variant="ghost" size="lg" className="px-6 text-body font-medium transition-colors" onClick={routerBack}>
          Back to Edit
        </Button>
        <div className="h-6 w-px bg-border/40" />
        <Button type="button" variant="ghost" size="lg" disabled={isSubmitting} className="px-6 text-body font-medium transition-colors" onClick={onSaveDraft}>
          <PencilSimpleLine size={14} weight="bold" className="mr-1.5" />
          Save as Draft
        </Button>
        <div className="h-6 w-px bg-border/40" />
        <Button
          type="button"
          size="lg"
          disabled={isSubmitting}
          onClick={onConfirm}
          className="flex items-center gap-2 px-8 text-body font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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
    </>
  );
}

export function PolicyReviewBypassModal({ employee, isOpen, onCancel, onConfirm }: PolicyReviewBypassModalProps) {
  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md overflow-hidden rounded-[24px] border border-border bg-card shadow-2xl">
        <div className="p-8 pb-4">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Warning size={24} weight="duotone" />
          </div>
          <h3 className="text-heading font-semibold text-foreground">Employee Outside Filters</h3>
          <p className="mt-1 text-body text-subtle">
            <span className="font-semibold text-foreground">{employee.name}</span> does not match the current eligibility filters for this policy.
          </p>
          <ul className="mt-3 space-y-1 text-label text-muted-foreground">
            <li>• Employment type: {(employee.employmentType ?? "—").replace(/_/g, " ")}</li>
            <li>• Tier: {employee.tier ?? "—"}</li>
            <li>• Department: {employee.department ?? "—"}</li>
          </ul>
          <p className="mt-3 text-label text-muted-foreground">Do you still want to include this employee?</p>
        </div>
        <div className="flex items-center gap-3 border-t border-border bg-muted/30 p-8 pt-4">
          <Button variant="ghost" className="h-12 flex-1 rounded-lg font-semibold" onClick={onCancel}>
            Cancel
          </Button>
          <Button className="h-12 flex-1 rounded-lg font-semibold" onClick={onConfirm}>
            Include Anyway
          </Button>
        </div>
      </div>
    </div>
  );
}
