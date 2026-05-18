"use client";

import { useState, useMemo } from "react";
import { MagnifyingGlass, CaretDown, CaretRight, Check } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { FormSelect } from "@/components/shared/form-select";
import { FieldHelp } from "@/components/shared/field-help";
import { SERVICES } from "@/lib/mock-data/service-catalog";
import type { MainServiceId } from "@/lib/mock-data/service-catalog";
import type { Benefit, DependentCoverageType } from "@/types/policy";

interface BenefitServiceSelectorProps {
  groupId: string;
  groupBenefits: Benefit[];
  isViewMode: boolean;
  splitBenefitIds: Set<string>;
  groupErrors: Record<string, string>;
  hasDependents: boolean;
  dependentCoverageTypes?: DependentCoverageType[];
  policyEmployeeCap?: number;
  policyDependentCap?: number;
  onToggleService: (serviceId: MainServiceId) => void;
  onUpdateBenefit: (benefitId: string, field: string, value: string | number | boolean | string[]) => void;
  onToggleSplit: (benefitId: string) => void;
}

// Group flat SERVICES catalog by category for the tree view
const GROUPED_SERVICES = SERVICES.reduce<{ category: string; services: typeof SERVICES }[]>(
  (acc, service) => {
    const group = acc.find((g) => g.category === service.category);
    if (group) {
      group.services.push(service);
    } else {
      acc.push({ category: service.category, services: [service] });
    }
    return acc;
  },
  []
);

function CoPaymentToggle({
  required,
  type,
  value,
  errorKey,
  groupErrors,
  onToggle,
  onChangeType,
  onChangeValue,
}: {
  required: boolean;
  type: "Percentage" | "Fixed";
  value: number;
  errorKey: string;
  groupErrors: Record<string, string>;
  onToggle: () => void;
  onChangeType: (v: string) => void;
  onChangeValue: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-micro font-medium text-faint inline-flex items-center gap-1">
        Co-payment <FieldHelp termKey="coPayment" />
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggle}
          className={cn("w-8 h-4 rounded-full transition-colors relative shrink-0", required ? "bg-primary" : "bg-border")}
        >
          <div className={cn("w-3 h-3 rounded-full bg-background border border-border/40 absolute top-[2px] transition-all", required ? "right-0.5" : "left-0.5")} />
        </button>
        {required && (
          <div className="flex items-center gap-1.5">
            <FormSelect
              value={type}
              onChange={onChangeType}
              options={[{ label: "%", value: "Percentage" }, { label: "RM", value: "Fixed" }]}
              triggerClassName="w-16 h-8"
            />
            <input
              type="number"
              className={cn(
                "w-16 px-2 py-1.5 bg-background border rounded-lg text-label font-mono outline-none text-right focus:ring-2 focus:ring-primary/10",
                groupErrors[errorKey] ? "border-rose-300" : "border-border"
              )}
              value={value || ""}
              onChange={(e) => onChangeValue(e.target.value === "" ? 0 : parseFloat(e.target.value))}
            />
          </div>
        )}
      </div>
      {groupErrors[errorKey] && (
        <p className="text-micro text-rose-600 dark:text-rose-400">{groupErrors[errorKey]}</p>
      )}
    </div>
  );
}

export function BenefitServiceSelector({
  groupId,
  groupBenefits,
  isViewMode,
  splitBenefitIds,
  groupErrors,
  hasDependents,
  dependentCoverageTypes = [],
  policyEmployeeCap,
  policyDependentCap,
  onToggleService,
  onUpdateBenefit,
  onToggleSplit,
}: BenefitServiceSelectorProps) {
  const [search, setSearch] = useState("");
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [expandedBenefits, setExpandedBenefits] = useState<Set<string>>(new Set());

  const selectedServiceIds = useMemo(
    () => new Set(groupBenefits.map((b) => b.serviceId)),
    [groupBenefits]
  );

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return GROUPED_SERVICES;
    const q = search.toLowerCase();
    return GROUPED_SERVICES.flatMap((g) => {
      const matched = g.services.filter((s) => s.name.toLowerCase().includes(q));
      return matched.length > 0 ? [{ ...g, services: matched }] : [];
    });
  }, [search]);

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const toggleBenefitExpanded = (benefitId: string) => {
    setExpandedBenefits((prev) => {
      const next = new Set(prev);
      if (next.has(benefitId)) next.delete(benefitId);
      else next.add(benefitId);
      return next;
    });
  };

  // View mode: simple flat list
  if (isViewMode) {
    return (
      <div className="divide-y divide-border/50 border border-border/60 rounded-lg overflow-hidden">
        {groupBenefits.length === 0 ? (
          <p className="text-center py-4 text-label text-faint italic">No benefits configured for this group.</p>
        ) : (
          groupBenefits.map((benefit) => {
            const service = SERVICES.find((s) => s.id === benefit.serviceId);
            return (
              <div key={benefit.id} className="flex items-center justify-between px-4 py-3 bg-muted/20">
                <div className="flex items-center gap-3">
                  <Check size={14} weight="bold" className="text-primary shrink-0" />
                  <span className="text-body font-medium text-foreground">{service?.name ?? benefit.serviceId}</span>
                  <span className="text-label text-faint">{service?.category}</span>
                </div>
                <div className="flex items-center gap-3">
                  {benefit.coPayment.required && (
                    <span className="text-label text-faint font-medium">
                      Co-pay{" "}
                      {benefit.coPayment.type === "Percentage"
                        ? `${benefit.coPayment.value}%`
                        : `RM ${benefit.coPayment.value}`}
                    </span>
                  )}
                  <span className="text-body font-semibold text-foreground font-mono tabular-nums">
                    RM {benefit.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  }

  return (
    <div className="flex border border-border/60 rounded-lg overflow-hidden min-h-[320px]">
      {/* Left: Service catalog */}
      <div className="w-52 shrink-0 border-r border-border/60 flex flex-col bg-muted/20">
        {/* Search */}
        <div className="p-2 border-b border-border/60">
          <div className="flex items-center gap-2 px-2 py-1.5 bg-background border border-border rounded-md">
            <MagnifyingGlass size={13} className="text-faint shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services…"
              className="flex-1 text-label bg-transparent outline-none placeholder:text-faint min-w-0"
            />
          </div>
        </div>

        {/* Category tree */}
        <div className="flex-1 overflow-y-auto py-1">
          {filteredGroups.length === 0 ? (
            <p className="text-center py-6 text-label text-faint">No results</p>
          ) : (
            filteredGroups.map((group) => {
              const isCollapsed = collapsedCategories.has(group.category) && !search.trim();
              const selectedCount = group.services.filter((s) => selectedServiceIds.has(s.id as MainServiceId)).length;

              return (
                <div key={group.category}>
                  <button
                    type="button"
                    onClick={() => toggleCategory(group.category)}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-micro font-semibold text-muted-foreground uppercase tracking-wider hover:bg-muted/40 transition-colors"
                  >
                    <span className="truncate">{group.category}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {selectedCount > 0 && (
                        <span className="text-micro font-medium text-primary bg-primary/10 px-1.5 rounded">
                          {selectedCount}
                        </span>
                      )}
                      {search.trim() ? null : isCollapsed ? (
                        <CaretRight size={10} className="text-faint" />
                      ) : (
                        <CaretDown size={10} className="text-faint" />
                      )}
                    </div>
                  </button>

                  {!isCollapsed &&
                    group.services.map((service) => {
                      const isChecked = selectedServiceIds.has(service.id as MainServiceId);
                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => onToggleService(service.id as MainServiceId)}
                          className={cn(
                            "w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors",
                            isChecked
                              ? "bg-primary/8 text-primary"
                              : "text-foreground hover:bg-muted/40"
                          )}
                        >
                          <div
                            className={cn(
                              "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all",
                              isChecked
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-border bg-background"
                            )}
                          >
                            {isChecked && <Check size={10} weight="bold" />}
                          </div>
                          <span className="text-label truncate">{service.name}</span>
                        </button>
                      );
                    })}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right: Selected services config — accordion rows */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-4 py-2.5 border-b border-border/60 bg-muted/10">
          <p className="text-label font-medium text-muted-foreground">
            {groupBenefits.length === 0
              ? "Selected services"
              : `Selected (${groupBenefits.length})`}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {groupBenefits.length === 0 ? (
            <div className="flex items-center justify-center h-full py-12">
              <p className="text-label text-faint italic">Select services from the list</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {groupBenefits.map((benefit) => {
                const service = SERVICES.find((s) => s.id === benefit.serviceId);
                const isSplit = splitBenefitIds.has(benefit.id);
                const isExpanded = expandedBenefits.has(benefit.id);
                const amountSummary = isSplit
                  ? `RM ${(benefit.employeeAmount ?? 0).toLocaleString()} emp / RM ${(benefit.dependantAmount ?? 0).toLocaleString()} dep`
                  : benefit.amount > 0
                  ? `RM ${benefit.amount.toLocaleString()}`
                  : "Set amount";

                return (
                  <div key={benefit.id}>
                    {/* Accordion header */}
                    <button
                      type="button"
                      onClick={() => toggleBenefitExpanded(benefit.id)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-label font-medium text-foreground truncate">{service?.name ?? benefit.serviceId}</span>
                        <span className="text-micro text-faint shrink-0">{service?.category}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className={cn("text-label font-mono tabular-nums", benefit.amount > 0 ? "text-foreground font-semibold" : "text-faint italic")}>
                          {amountSummary}
                        </span>
                        <CaretDown size={12} weight="bold" className={cn("text-muted-foreground transition-transform duration-200 shrink-0", isExpanded && "rotate-180")} />
                      </div>
                    </button>

                    {/* Accordion body */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 space-y-3 bg-muted/10 border-t border-border/40 animate-in fade-in slide-in-from-top-1 duration-150">

                        {/* Policy defaults hint */}
                        {(policyEmployeeCap || policyDependentCap) && (
                          <p className="text-micro text-faint">
                            Policy default:{" "}
                            {policyEmployeeCap ? `RM ${policyEmployeeCap.toLocaleString()} emp` : ""}
                            {policyEmployeeCap && policyDependentCap ? " / " : ""}
                            {policyDependentCap ? `RM ${policyDependentCap.toLocaleString()} dep` : ""}
                          </p>
                        )}

                        <div className="flex items-end gap-3 flex-wrap">
                          {/* Split toggle */}
                          {hasDependents && (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => onToggleSplit(benefit.id)}
                                className={cn("w-7 h-3.5 rounded-full transition-colors relative shrink-0", isSplit ? "bg-primary" : "bg-border")}
                              >
                                <div className={cn("w-2.5 h-2.5 rounded-full bg-background border border-border/40 absolute top-[2px] transition-all", isSplit ? "right-0.5" : "left-0.5")} />
                              </button>
                              <span className="text-micro text-faint">Split emp / dep</span>
                            </div>
                          )}

                          {/* Amount inputs */}
                          {isSplit ? (
                            <>
                              <div className="space-y-1">
                                <label className="text-micro font-medium text-faint block">Emp (RM)</label>
                                <input
                                  type="number"
                                  className="w-20 px-2 py-1.5 bg-background border border-border rounded-lg text-label font-mono outline-none text-right focus:ring-2 focus:ring-primary/10"
                                  value={benefit.employeeAmount || ""}
                                  onChange={(e) => {
                                    const emp = e.target.value === "" ? 0 : parseFloat(e.target.value);
                                    const dep = benefit.dependantAmount ?? 0;
                                    onUpdateBenefit(benefit.id, "employeeAmount", emp);
                                    onUpdateBenefit(benefit.id, "amount", emp + dep);
                                  }}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-micro font-medium text-faint block">Dep (RM)</label>
                                <input
                                  type="number"
                                  className="w-20 px-2 py-1.5 bg-background border border-border rounded-lg text-label font-mono outline-none text-right focus:ring-2 focus:ring-primary/10"
                                  value={benefit.dependantAmount || ""}
                                  onChange={(e) => {
                                    const dep = e.target.value === "" ? 0 : parseFloat(e.target.value);
                                    const emp = benefit.employeeAmount ?? 0;
                                    onUpdateBenefit(benefit.id, "dependantAmount", dep);
                                    onUpdateBenefit(benefit.id, "amount", emp + dep);
                                  }}
                                />
                              </div>
                              <span className="text-micro text-faint pb-2">
                                Total: RM {((benefit.employeeAmount ?? 0) + (benefit.dependantAmount ?? 0)).toLocaleString()}
                              </span>
                            </>
                          ) : (
                            <div className="space-y-1">
                              <label className="text-micro font-medium text-faint block">Amount (RM)</label>
                              <input
                                type="number"
                                className={cn(
                                  "w-24 px-2 py-1.5 bg-background border rounded-lg text-label font-mono outline-none text-right focus:ring-2 focus:ring-primary/10",
                                  groupErrors[`benefit_${groupId}_${benefit.serviceId}`] ? "border-rose-300" : "border-border"
                                )}
                                value={benefit.amount || ""}
                                onChange={(e) =>
                                  onUpdateBenefit(benefit.id, "amount", e.target.value === "" ? 0 : parseFloat(e.target.value))
                                }
                              />
                              {groupErrors[`benefit_${groupId}_${benefit.serviceId}`] && (
                                <p className="text-micro text-rose-600 dark:text-rose-400">
                                  {groupErrors[`benefit_${groupId}_${benefit.serviceId}`]}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Co-payment */}
                          <CoPaymentToggle
                            required={benefit.coPayment.required}
                            type={benefit.coPayment.type}
                            value={benefit.coPayment.value}
                            errorKey={`copay_${groupId}_${benefit.serviceId}`}
                            groupErrors={groupErrors}
                            onToggle={() => onUpdateBenefit(benefit.id, "coPayment.required", !benefit.coPayment.required)}
                            onChangeType={(v) => onUpdateBenefit(benefit.id, "coPayment.type", v)}
                            onChangeValue={(v) => onUpdateBenefit(benefit.id, "coPayment.value", v)}
                          />
                        </div>

                        {/* Dependent type selector (when split) */}
                        {isSplit && dependentCoverageTypes.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="text-micro font-medium text-faint">Which dependents get this override?</p>
                            <div className="flex flex-wrap gap-1.5">
                              {dependentCoverageTypes.map((depType) => {
                                const isSelected = benefit.dependantTypes?.includes(depType) ?? false;
                                return (
                                  <button
                                    key={depType}
                                    type="button"
                                    onClick={() => {
                                      const current = benefit.dependantTypes ?? [];
                                      const next = isSelected
                                        ? current.filter((t) => t !== depType)
                                        : [...current, depType];
                                      onUpdateBenefit(benefit.id, "dependantTypes", next);
                                    }}
                                    className={cn(
                                      "px-2.5 py-1 rounded-full text-micro font-medium border transition-all capitalize",
                                      isSelected
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-background text-muted-foreground border-border hover:border-primary/30"
                                    )}
                                  >
                                    {depType}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
