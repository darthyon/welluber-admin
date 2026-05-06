"use client";

import { useState, useMemo } from "react";
import {
  CaretLeft,
  CaretRight,
  TreeStructure,
  Check,
  MagnifyingGlass,
  X,
  Users,
  Buildings,
  CheckSquare,
  Square,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { SuccessCelebration } from "@/components/shared/success-celebration";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { BenefitPolicy, BenefitGroup, Benefit } from "@/types/policy";
import { SERVICES } from "@/features/policies/mock-data";
import type { EmployeeDirectoryItem } from "@/components/host/employees/employee-directory-table";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BenefitOverride {
  benefitId: string;
  amount?: number;
  employeeAmount?: number;
  dependantAmount?: number;
}

interface SubPolicyResult {
  policy: Partial<BenefitPolicy>;
  benefitOverrides: BenefitOverride[];
  targetEmployeeIds: string[];
}

export interface SubPolicyWizardProps {
  parentPolicy: BenefitPolicy;
  parentGroups: BenefitGroup[];
  parentBenefits: Benefit[];
  employees: EmployeeDirectoryItem[];
  orgTierConfigs?: { id: string; name: string; code?: string }[];
  onSuccess: (data: SubPolicyResult) => void;
  onCancel: () => void;
}

const WIZARD_STEPS = [
  { id: 1, label: "Override Amounts" },
  { id: 2, label: "Targeting" },
  { id: 3, label: "Review & Assign" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getServiceName(serviceId: string): string {
  return SERVICES.find(s => s.id === serviceId)?.name ?? serviceId;
}

function formatRM(amount: number): string {
  return `RM ${amount.toFixed(2)}`;
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-2">
      {WIZARD_STEPS.map((step, idx) => {
        const isDone = currentStep > step.id;
        const isActive = currentStep === step.id;
        return (
          <div key={step.id} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-label font-semibold transition-all",
                  isDone && "bg-primary text-primary-foreground",
                  isActive && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                  !isDone && !isActive && "bg-muted text-muted-foreground border border-border"
                )}
              >
                {isDone ? <Check size={13} weight="bold" /> : step.id}
              </div>
              <span
                className={cn(
                  "text-label font-medium hidden sm:block",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < WIZARD_STEPS.length - 1 && (
              <div className={cn("w-8 h-px", currentStep > step.id ? "bg-primary" : "bg-border")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SubPolicyWizard({
  parentPolicy,
  parentGroups,
  parentBenefits,
  employees,
  orgTierConfigs = [],
  onSuccess,
  onCancel,
}: SubPolicyWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Step 1 state
  const [capOverride, setCapOverride] = useState<string>(
    parentPolicy.totalCapAmount ? String(parentPolicy.totalCapAmount) : ""
  );
  const [overrides, setOverrides] = useState<Record<string, BenefitOverride>>({});

  // Step 2 state
  const [tierFilter, setTierFilter] = useState<string[]>(parentPolicy.eligibility?.tierIds ?? []);
  const [departmentFilter, setDepartmentFilter] = useState<string[]>([]);
  const [pinnedEmployeeIds, setPinnedEmployeeIds] = useState<string[]>([]);
  const [empSearch, setEmpSearch] = useState("");
  const [showEmpDropdown, setShowEmpDropdown] = useState(false);

  // Step 3 state
  const [confirmedEmployeeIds, setConfirmedEmployeeIds] = useState<string[]>([]);

  // ── Derived ──────────────────────────────────────────────────────────────────

  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach(e => { if (e.department) set.add(e.department); });
    return Array.from(set).sort();
  }, [employees]);

  const tierOptions = useMemo(() => {
    if (orgTierConfigs.length > 0) {
      return orgTierConfigs.map(tc => tc.code || tc.name);
    }
    const set = new Set<string>();
    employees.forEach(e => { if (e.tier) set.add(e.tier); });
    return Array.from(set).sort();
  }, [orgTierConfigs, employees]);

  const targetedEmployees = useMemo(() => {
    const filtered = employees.filter(emp => {
      const matchesTier = tierFilter.length === 0 || tierFilter.includes(emp.tier ?? "");
      const matchesDept = departmentFilter.length === 0 || departmentFilter.includes(emp.department ?? "");
      return matchesTier && matchesDept;
    });
    const pinnedEmps = employees.filter(e => pinnedEmployeeIds.includes(e.id) && !filtered.find(f => f.id === e.id));
    return [...filtered, ...pinnedEmps];
  }, [employees, tierFilter, departmentFilter, pinnedEmployeeIds]);

  const empSearchResults = useMemo(() => {
    if (!empSearch.trim()) return [];
    const q = empSearch.toLowerCase();
    return employees
      .filter(e => !pinnedEmployeeIds.includes(e.id) && (e.name.toLowerCase().includes(q) || e.empCode.toLowerCase().includes(q)))
      .slice(0, 6);
  }, [employees, empSearch, pinnedEmployeeIds]);

  const overriddenBenefits = useMemo(() => {
    return parentBenefits.filter(b => overrides[b.id]?.amount !== undefined || overrides[b.id]?.employeeAmount !== undefined);
  }, [parentBenefits, overrides]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const setOverride = (benefitId: string, field: keyof BenefitOverride, value: number | undefined) => {
    setOverrides(prev => ({
      ...prev,
      [benefitId]: { ...prev[benefitId], benefitId, [field]: value },
    }));
  };

  const clearOverride = (benefitId: string, field: keyof BenefitOverride) => {
    setOverrides(prev => {
      const next = { ...prev };
      if (next[benefitId]) {
        const updated = { ...next[benefitId] };
        delete updated[field];
        const hasValues = Object.keys(updated).some(k => k !== "benefitId");
        if (hasValues) {
          next[benefitId] = updated;
        } else {
          delete next[benefitId];
        }
      }
      return next;
    });
  };

  const toggleDept = (dept: string) => {
    setDepartmentFilter(prev => prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]);
  };

  const toggleTier = (tier: string) => {
    setTierFilter(prev => prev.includes(tier) ? prev.filter(t => t !== tier) : [...prev, tier]);
  };

  const pinEmployee = (empId: string) => {
    setPinnedEmployeeIds(prev => [...prev, empId]);
    setEmpSearch("");
    setShowEmpDropdown(false);
  };

  const unpinEmployee = (empId: string) => {
    setPinnedEmployeeIds(prev => prev.filter(id => id !== empId));
  };

  const goNext = () => {
    if (currentStep === 2) {
      // Pre-populate confirmed employees when moving to review
      setConfirmedEmployeeIds(targetedEmployees.map(e => e.id));
    }
    setCurrentStep(s => s + 1);
  };

  const goPrev = () => setCurrentStep(s => s - 1);

  const toggleConfirmed = (empId: string) => {
    setConfirmedEmployeeIds(prev =>
      prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
    );
  };

  const toggleAllConfirmed = () => {
    if (confirmedEmployeeIds.length === targetedEmployees.length) {
      setConfirmedEmployeeIds([]);
    } else {
      setConfirmedEmployeeIds(targetedEmployees.map(e => e.id));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
    setTimeout(() => {
      const capNum = capOverride ? parseFloat(capOverride) : undefined;
      const benefitOverrides = Object.values(overrides);
      onSuccess({
        policy: {
          ...parentPolicy,
          id: undefined as unknown as string,
          parentPolicyId: parentPolicy.id,
          totalCapAmount: capNum,
          targetEmployeeIds: confirmedEmployeeIds,
          status: "active",
        },
        benefitOverrides,
        targetEmployeeIds: confirmedEmployeeIds,
      });
    }, 800);
  };

  // ── Render Steps ─────────────────────────────────────────────────────────────

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Policy cap */}
      <div className="glass-card rounded-xl p-5">
        <p className="text-label font-semibold text-subtle mb-1">Override Spending Cap (RM)</p>
        <p className="text-label text-faint mb-3">
          {parentPolicy.totalCapAmount
            ? `Parent cap: ${formatRM(parentPolicy.totalCapAmount)} — leave blank to inherit`
            : "Parent has no spending cap"}
        </p>
        <input
          type="number"
          min={0}
          placeholder={parentPolicy.totalCapAmount ? `Inherited (${formatRM(parentPolicy.totalCapAmount)})` : "No cap"}
          value={capOverride}
          onChange={e => setCapOverride(e.target.value)}
          className="w-full max-w-xs px-4 py-2.5 bg-background border border-border rounded-lg text-body font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/40 transition-all"
        />
      </div>

      {/* Per-group benefit overrides */}
      {parentGroups.map(group => {
        const groupBenefits = parentBenefits.filter(b => b.groupId === group.id);
        return (
          <div key={group.id} className="glass-card rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-muted/30">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <TreeStructure size={16} weight="duotone" />
              </div>
              <div>
                <p className="text-body font-semibold text-foreground">{group.name}</p>
                <p className="text-label text-faint">
                  {group.distributionType === "SharedAmount"
                    ? `Shared pool · ${formatRM(group.maxUsagePerCycle ?? 0)}`
                    : "Individual per service"}
                </p>
              </div>
            </div>
            <div className="divide-y divide-border/40">
              {groupBenefits.map(benefit => {
                const override = overrides[benefit.id];
                const hasOverride = override?.amount !== undefined;
                const overrideVal = hasOverride ? String(override.amount) : "";

                return (
                  <div
                    key={benefit.id}
                    className={cn(
                      "px-5 py-4 transition-colors",
                      hasOverride && "bg-primary/5 ring-1 ring-inset ring-primary/20"
                    )}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-body font-semibold text-foreground">{getServiceName(benefit.serviceId)}</p>
                        <p className="text-label text-faint italic mt-0.5">
                          Inherited: {formatRM(benefit.amount)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-label text-faint font-medium">RM</span>
                        <input
                          type="number"
                          min={0}
                          placeholder={benefit.amount.toFixed(2)}
                          value={overrideVal}
                          onChange={e => {
                            const val = e.target.value;
                            if (val === "") {
                              clearOverride(benefit.id, "amount");
                            } else {
                              setOverride(benefit.id, "amount", parseFloat(val));
                            }
                          }}
                          className="w-28 px-3 py-1.5 bg-background border border-border rounded-lg text-body font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/40 transition-all text-right"
                        />
                        {hasOverride && (
                          <button
                            onClick={() => clearOverride(benefit.id, "amount")}
                            className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center hover:bg-rose-200 dark:hover:bg-rose-500/20 transition-colors"
                          >
                            <X size={12} weight="bold" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Tier filter */}
      {tierOptions.length > 0 && (
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-primary" weight="duotone" />
            <p className="text-label font-semibold text-foreground">Tier Filter</p>
          </div>
          <p className="text-label text-faint mb-4">
            {orgTierConfigs.length > 0
              ? "Filter by organisation tier configuration."
              : "Filter by employee tier labels."}
          </p>
          <div className="flex flex-wrap gap-2">
            {tierOptions.map(tier => (
              <button
                key={tier}
                onClick={() => toggleTier(tier)}
                className={cn(
                  "px-3 py-1.5 rounded-full border text-label font-medium transition-all",
                  tierFilter.includes(tier)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border hover:border-primary/40"
                )}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Department filter */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <Buildings size={16} className="text-primary" weight="duotone" />
          <p className="text-label font-semibold text-foreground">Department Filter</p>
        </div>
        <p className="text-label text-faint mb-4">Leave empty to include all departments.</p>
        <div className="flex flex-wrap gap-2">
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => toggleDept(dept)}
              className={cn(
                "px-3 py-1.5 rounded-full border text-label font-medium transition-all",
                departmentFilter.includes(dept)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-border hover:border-primary/40"
              )}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Individual employee pins */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <Check size={16} className="text-primary" weight="bold" />
          <p className="text-label font-semibold text-foreground">Pin Individuals</p>
        </div>
        <p className="text-label text-faint mb-4">
          Pinned employees are always included regardless of tier or department filters.
        </p>
        <div className="relative mb-3">
          <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or employee code…"
            value={empSearch}
            onChange={e => { setEmpSearch(e.target.value); setShowEmpDropdown(true); }}
            onFocus={() => setShowEmpDropdown(true)}
            className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-lg text-body text-foreground outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/40 transition-all"
          />
          {showEmpDropdown && empSearchResults.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
              {empSearchResults.map(emp => (
                <button
                  key={emp.id}
                  onClick={() => pinEmployee(emp.id)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-label font-semibold shrink-0">
                    {emp.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-body font-semibold text-foreground leading-tight">{emp.name}</p>
                    <p className="text-label text-faint font-mono">{emp.empCode}</p>
                  </div>
                  <span className="ml-auto text-label text-faint">{emp.department}</span>
                </button>
              ))}
            </div>
          )}
          {showEmpDropdown && empSearch.trim() && empSearchResults.length === 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-popover border border-border rounded-lg shadow-lg px-4 py-3">
              <p className="text-body text-muted-foreground">No employees found.</p>
            </div>
          )}
        </div>
        {showEmpDropdown && <div className="fixed inset-0 z-40" onClick={() => setShowEmpDropdown(false)} />}

        {pinnedEmployeeIds.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {pinnedEmployeeIds.map(id => {
              const emp = employees.find(e => e.id === id);
              if (!emp) return null;
              return (
                <span key={id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-label font-medium">
                  {emp.name}
                  <button onClick={() => unpinEmployee(id)} className="hover:text-destructive transition-colors">
                    <X size={12} weight="bold" />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-border bg-muted/30 px-5 py-3 text-body font-medium text-foreground">
        Targeting <span className="font-semibold text-primary">{targetedEmployees.length}</span> employee{targetedEmployees.length !== 1 ? "s" : ""}
        {pinnedEmployeeIds.length > 0 && (
          <span className="text-muted-foreground text-label ml-1">
            ({pinnedEmployeeIds.length} pinned)
          </span>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => {
    const allSelected = confirmedEmployeeIds.length === targetedEmployees.length;

    return (
      <div className="space-y-6">
        {/* Diff summary */}
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-muted/30">
            <p className="text-body font-semibold text-foreground">Benefit Overrides</p>
            <p className="text-label text-muted-foreground mt-0.5">Changes relative to parent policy</p>
          </div>
          <div className="divide-y divide-border/40">
            {capOverride && parseFloat(capOverride) !== parentPolicy.totalCapAmount && (
              <div className="px-5 py-3 grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <p className="text-label font-semibold text-foreground">Spending Cap</p>
                  <p className="text-body font-semibold text-primary">{formatRM(parseFloat(capOverride))}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-label font-semibold text-faint">Parent</p>
                  <p className="text-body text-faint italic">
                    {parentPolicy.totalCapAmount ? formatRM(parentPolicy.totalCapAmount) : "No cap"}
                  </p>
                </div>
              </div>
            )}
            {parentBenefits.map(benefit => {
              const override = overrides[benefit.id];
              const isOverridden = override?.amount !== undefined;
              return (
                <div key={benefit.id} className="px-5 py-3 grid grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <p className="text-label font-semibold text-foreground">{getServiceName(benefit.serviceId)}</p>
                    <p className={cn("text-body font-semibold", isOverridden ? "text-primary" : "text-faint italic")}>
                      {isOverridden ? formatRM(override.amount!) : "Inherited"}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-label font-semibold text-faint">Parent</p>
                    <p className="text-body text-faint">{formatRM(benefit.amount)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Employee roster */}
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
            <div>
              <p className="text-body font-semibold text-foreground">Employee Assignment</p>
              <p className="text-label text-muted-foreground mt-0.5">
                {confirmedEmployeeIds.length} of {targetedEmployees.length} selected
              </p>
            </div>
            <button onClick={toggleAllConfirmed} className="flex items-center gap-1.5 text-label text-primary font-medium hover:opacity-80 transition-opacity">
              {allSelected ? <CheckSquare size={16} weight="fill" /> : <Square size={16} />}
              {allSelected ? "Deselect all" : "Select all"}
            </button>
          </div>
          {targetedEmployees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users size={32} weight="duotone" className="text-muted/30 mb-3" />
              <p className="text-body font-medium text-muted-foreground">No employees match the targeting criteria.</p>
              <p className="text-label text-faint mt-1">Go back and adjust tier, department, or pin individuals.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {targetedEmployees.map(emp => {
                const isSelected = confirmedEmployeeIds.includes(emp.id);
                const isPinned = pinnedEmployeeIds.includes(emp.id);
                return (
                  <button
                    key={emp.id}
                    onClick={() => toggleConfirmed(emp.id)}
                    className={cn(
                      "w-full grid grid-cols-12 items-center px-5 py-3 text-left transition-colors hover:bg-muted/20",
                      isSelected && "bg-primary/5"
                    )}
                  >
                    <div className="col-span-1">
                      <div className={cn(
                        "w-5 h-5 rounded border flex items-center justify-center transition-all",
                        isSelected ? "bg-primary border-primary text-primary-foreground" : "border-border bg-background"
                      )}>
                        {isSelected && <Check size={11} weight="bold" />}
                      </div>
                    </div>
                    <div className="col-span-5">
                      <div className="flex items-center gap-2">
                        <p className="text-body font-semibold text-foreground">{emp.name}</p>
                        {isPinned && (
                          <span className="px-1.5 py-0.5 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/20 text-micro font-medium">
                            Pinned
                          </span>
                        )}
                      </div>
                      <p className="text-label font-mono text-faint">{emp.empCode}</p>
                    </div>
                    <div className="col-span-3">
                      <span className="text-body text-subtle">{emp.department}</span>
                    </div>
                    <div className="col-span-3">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-label font-medium">
                        {emp.tier}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── Success State ─────────────────────────────────────────────────────────────

  if (isSuccess) {
    return (
      <SuccessCelebration
        title="Sub-Policy Created"
        message={`Sub-policy derived from ${parentPolicy.name} has been created and assigned to ${confirmedEmployeeIds.length} employee${confirmedEmployeeIds.length !== 1 ? "s" : ""}.`}
      />
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      {/* Step indicator */}
      <div className="glass-card rounded-xl px-5 py-4">
        <StepIndicator currentStep={currentStep} />
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 p-2 px-6 bg-background/80 backdrop-blur-2xl border border-border shadow-lg rounded-full animate-in slide-in-from-bottom-10 duration-700 ease-out">
        <Button
          variant="ghost"
          size="lg"
          className="text-body font-medium px-6 transition-colors"
          onClick={currentStep === 1 ? onCancel : goPrev}
        >
          {currentStep === 1 ? "Cancel" : (
            <span className="flex items-center gap-1.5">
              <CaretLeft size={14} weight="bold" />
              Back
            </span>
          )}
        </Button>
        <div className="w-px h-6 bg-border/40" />
        {currentStep < 3 ? (
          <Button
            size="lg"
            className="text-body font-medium px-8 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            onClick={goNext}
          >
            Continue
            <CaretRight size={14} weight="bold" />
          </Button>
        ) : (
          <Button
            size="lg"
            disabled={isSubmitting}
            className="text-body font-medium px-8 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating…
              </>
            ) : (
              "Create Sub-Policy"
            )}
          </Button>
        )}
      </div>

      {/* Bottom spacer for floating nav */}
      <div className="h-20" />
    </div>
  );
}
