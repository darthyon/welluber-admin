"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import {
  ShieldCheck,
  CaretLeft,
  CaretRight,
  IdentificationCard,
  Users,
  User,
  UsersFour,
  Gear,
  TreeStructure,
  Plus,
  Trash,
  NotePencil,
  CheckCircle,
  XCircle,
  CaretDown,
  Receipt,
  Check,
  Warning,
  CalendarBlank,
  Calendar,
  ArrowCounterClockwise,
  ChartLineUp,
  type IconProps
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChoiceCard } from "@/components/shared/choice-card";
import { FieldHelp } from "@/components/shared/field-help";
import { DetailSection } from "@/components/shared/detail-section";
import { FormSelect } from "@/components/shared/form-select";
import { DatePickerField } from "@/components/shared/date-picker-field";
import { SuccessCelebration } from "@/components/shared/success-celebration";
import { PolicyLaunchConfirmModal } from "@/components/host/policies/policy-launch-confirm-modal";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { BenefitPolicy, BenefitGroup, Benefit, PolicyStatus, DistributionType, DependentsPoolType, ProrateUnit, RefreshCycle, DependentCoverageType, UtilisationMode } from "@/types/policy";
import { UtilisationClaimsTable } from "@/components/shared/utilisation-claims-table";
import { MOCK_EMPLOYEES, MOCK_ORGS } from "@/lib/mock-data";
import type { EmployeeDirectoryItem } from "@/features/employees/types";
import { MOCK_EMPLOYEE_UTILISATION, SERVICES } from "@/lib/mock-data";
import type { MainServiceId } from "@/lib/mock-data/service-catalog";
import { BenefitServiceSelector } from "@/components/host/policies/benefit-service-selector";
import { MonthPickerField } from "@/components/shared/month-picker-field";
import { validateBenefit, validateGroupInsert } from "@/lib/policy/validation";
import { usePolicyDraft } from "@/hooks/use-policy-draft";

// ─── Constants ───────────────────────────────────────────────────────────────

const CONTENT_TABS = [
  { id: 1, title: "Overview" },
  { id: 2, title: "Pool & Cycle" },
  { id: 3, title: "Benefit Groups" },
  { id: 4, title: "Claims Usage", viewOnly: true },
];

const CREATE_STEPS = [
  { id: 1, title: "Basics" },
  { id: 2, title: "Pool Config" },
  { id: 3, title: "Benefit Groups" },
  { id: 4, title: "Assign Employees" },
  { id: 5, title: "Review" },
];

const EMPLOYMENT_TYPES = [
  { id: "full-time", label: "Full-time" },
  { id: "part-time", label: "Part-time" },
  { id: "contract", label: "Contract" },
  { id: "internship", label: "Internship" },
];

const PRORATE_UNITS: ProrateUnit[] = ["Daily", "Weekly", "Monthly", "Quarterly"];
const REFRESH_CYCLES: RefreshCycle[] = ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"];

const DEPENDENTS_POOL_OPTIONS: { value: DependentsPoolType; title: string; description: string; icon: React.ElementType<IconProps> }[] = [
  { value: "Individual", title: "Individual", description: "Each dependent has their own benefit pool.", icon: User },
  { value: "Shared", title: "Shared", description: "All dependents share the same pool.", icon: UsersFour },
  { value: "SharedWithEmployee", title: "Shared with Employee", description: "Dependents share the employee's pool.", icon: Users },
];

function getAvailableRefreshCycles(
  utilisationMode: "Fixed" | "Prorated",
  prorateUnit?: ProrateUnit
): RefreshCycle[] {
  if (utilisationMode === "Fixed") {
    return ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"];
  }
  if (!prorateUnit) return REFRESH_CYCLES;
  const unitIdx = PRORATE_UNITS.indexOf(prorateUnit);
  return REFRESH_CYCLES.slice(unitIdx + 1);
}

const STATUS_CONFIG: Record<PolicyStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  draft: { label: "Draft", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20", icon: NotePencil },
  active: { label: "Active", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20", icon: CheckCircle },
  deactivated: { label: "Deactivated", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20", icon: XCircle },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ReadField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-label font-semibold text-subtle">{label}</p>
      <p className="text-body font-medium text-foreground">{value || <span className="text-faint dark:text-muted-foreground italic">—</span>}</p>
    </div>
  );
}

function StatusPicker({ value, onChange, disabled }: { value: PolicyStatus; onChange: (v: PolicyStatus) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CONFIG[value];
  const Icon = cfg.icon;

  return (
    <div className="relative">
      <button
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full border text-label font-semibold transition-all",
          cfg.bg, cfg.color,
          !disabled && "hover:opacity-80 cursor-pointer"
        )}
      >
        <Icon size={13} weight="fill" />
        {cfg.label}
        {!disabled && <CaretDown size={11} weight="bold" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 right-0 z-50 bg-popover border border-border rounded-lg shadow-lg shadow-black/20 overflow-hidden min-w-[160px]"
          >
            {(Object.keys(STATUS_CONFIG) as PolicyStatus[]).map((s) => {
              const c = STATUS_CONFIG[s];
              const SI = c.icon;
              return (
                <button
                  key={s}
                  onClick={() => { onChange(s); setOpen(false); }}
                  className={cn(
                    "flex items-center gap-2.5 w-full px-4 py-2.5 text-body font-semibold hover:bg-muted transition-colors text-left",
                    c.color,
                    s === value && "bg-muted"
                  )}
                >
                  <SI size={14} weight="fill" />
                  {c.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface BenefitPolicyWizardProps {
  onCancel: () => void;
  onSuccess: (data: { policy: Partial<BenefitPolicy>; groups: BenefitGroup[]; benefits: Benefit[]; assignedEmployeeIds?: string[] }) => void;
  onSaveDraft?: (data: { policy: Partial<BenefitPolicy>; groups: BenefitGroup[]; benefits: Benefit[] }) => void;
  onEdit?: () => void;
  mode?: "create" | "edit" | "view";
  orgId?: string;
  initialData?: {
    policy: Partial<BenefitPolicy>;
    groups: BenefitGroup[];
    benefits: Benefit[];
  };
}

export function BenefitPolicyWizard({ onCancel, onSuccess, onSaveDraft, onEdit, mode = "create", orgId, initialData }: BenefitPolicyWizardProps) {
  const isViewMode = mode === "view";

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [depModalGroupId, setDepModalGroupId] = useState<string | null>(null);

  const [policyData, setPolicyData] = useState<Partial<BenefitPolicy>>(initialData?.policy || {
    name: "",
    description: "",
    eligibleEmploymentTypes: ["full-time", "part-time", "contract", "internship"],
    dependentCoverages: [],
    benefitPoolType: "Individual",
    utilisationMode: "Fixed",
    refreshCycle: "Yearly",
    refreshStartReference: "financial_year",
    refreshStartMonth: 1,
    status: "draft",
  });

  const [groups, setGroups] = useState<BenefitGroup[]>(initialData?.groups || []);
  const [benefits, setBenefits] = useState<Benefit[]>(initialData?.benefits || []);
  const [splitBenefitIds, setSplitBenefitIds] = useState<Set<string>>(new Set());

  // Employee assignment step state
  const [assignedEmployeeIds, setAssignedEmployeeIds] = useState<string[]>([]);
  const [assignmentOrgId, setAssignmentOrgId] = useState<string>(orgId ?? "");

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showPostCreateModal, setShowPostCreateModal] = useState(false);
  const [showLaunchConfirmModal, setShowLaunchConfirmModal] = useState(false);
  const [showCustomizeAssignment, setShowCustomizeAssignment] = useState(false);
  const policyIdRef = useRef(0);
  const groupIdRef = useRef(0);
  const benefitIdRef = useRef(0);

  const draftState = useMemo(
    () => ({
      policyData,
      groups,
      benefits,
      assignedEmployeeIds,
      assignmentOrgId,
      currentStep,
    }),
    [policyData, groups, benefits, assignedEmployeeIds, assignmentOrgId, currentStep]
  );

  const {
    hasDraft,
    savedAt: draftSavedAt,
    restored: draftRestored,
    restore: restoreDraft,
    clear: clearDraft,
  } = usePolicyDraft(
    policyData.organizationId || orgId,
    draftState,
    mode === "create"
  );

  // ── Validation helpers ────────────────────────────────────────────────────

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!policyData.name?.trim()) errors.name = "Policy name is required";
      else if (policyData.name.length > 100) errors.name = "Max 100 characters";
      if (!policyData.eligibleEmploymentTypes || policyData.eligibleEmploymentTypes.length === 0) {
        errors.eligibleEmploymentTypes = "Select at least one employment type";
      }
    }

    if (step === 2) {
      if (policyData.utilisationMode === "Prorated" && !policyData.prorateUnit) {
        errors.prorateUnit = "Pick a prorate unit (Monthly is most common)";
      }

      const hasDependents = (policyData.dependentCoverages?.length ?? 0) > 0;

      if (hasDependents && !policyData.dependentsPoolType) {
        errors.dependentsPoolType = "Select a pool type for dependents";
      }

      if (policyData.refreshStartReference === "calendar_year" && (!policyData.refreshStartMonth || policyData.refreshStartMonth < 1 || policyData.refreshStartMonth > 12)) {
        errors.refreshStartMonth = "Select a start month";
      }

      if (policyData.utilisationMode === "Prorated" && policyData.prorateUnit) {
        const available = getAvailableRefreshCycles("Prorated", policyData.prorateUnit);
        if (policyData.refreshCycle && !available.includes(policyData.refreshCycle)) {
          errors.refreshCycle = `${policyData.refreshCycle} is not valid for ${policyData.prorateUnit} prorate. Valid: ${available.join(", ")}`;
        }
      }
    }

    if (step === 3) {
      if (groups.length === 0) errors.groups = "Add at least one benefit group";
      groups.forEach((group, idx) => {
        const groupIssue = validateGroupInsert(policyData.id || "temp", group.name, groups, group.id);
        if (groupIssue) {
          errors[`group_name_${group.id}`] = groupIssue.message;
        }

        if (group.distributionType === "SharedAmount" && (!group.maxUsagePerCycle || group.maxUsagePerCycle <= 0)) {
          errors[`group_cap_${group.id}`] = "Shared pools need a cap (e.g. RM 1000)";
        }

        const groupBenefits = benefits.filter(b => b.groupId === group.id);
        if (groupBenefits.length === 0) {
          errors[`group_${idx}`] = `Select at least one benefit for ${group.name || "this group"}`;
        }
        groupBenefits.forEach((benefit) => {
          const issues = validateBenefit(benefit, benefits);
          issues.forEach((issue) => {
            if (issue.field === "amount") {
              errors[`benefit_${group.id}_${benefit.serviceId}`] = issue.message;
            }
            if (issue.field === "coPayment.value") {
              errors[`copay_${group.id}_${benefit.serviceId}`] = issue.message;
            }
            if (issue.field === "serviceId") {
              errors[`group_${idx}`] = issue.message;
            }
          });
        });
      });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const toggleEmploymentType = (id: string) => {
    setPolicyData(prev => {
      const current = prev.eligibleEmploymentTypes || [];
      return {
        ...prev,
        eligibleEmploymentTypes: current.includes(id) ? current.filter(x => x !== id) : [...current, id],
      };
    });
  };

  const addGroup = useCallback(() => {
    groupIdRef.current += 1;
    const newGroup: BenefitGroup = {
      id: `grp-new-${groupIdRef.current}`,
      policyId: policyData.id || "temp",
      name: "New Benefit Group",
      distributionType: "IndividualBenefitAmount",
    };
    setGroups(prev => [...prev, newGroup]);
  }, [policyData.id]);

  const removeGroup = (groupId: string) => {
    setGroups(groups.filter(g => g.id !== groupId));
    setBenefits(benefits.filter(b => b.groupId !== groupId));
  };

  const updateGroup = (groupId: string, field: keyof BenefitGroup, value: string | number | boolean | DistributionType | UtilisationMode | ProrateUnit | undefined) => {
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, [field]: value } : g));
  };

  const updateGroupCoPayment = (groupId: string, field: "required" | "type" | "value", value: boolean | string | number) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const coPayment = g.coPayment ?? { required: false, type: "Percentage" as const, value: 0 };
        return { ...g, coPayment: { ...coPayment, [field]: value } };
      })
    );
  };

  const updateDependentCoPayment = (groupId: string, field: "required" | "type" | "value", value: boolean | string | number) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const coPayment = g.dependentCoPayment ?? { required: false, type: "Percentage" as const, value: 0 };
        return { ...g, dependentCoPayment: { ...coPayment, [field]: value } };
      })
    );
  };
  const toggleService = (groupId: string, serviceId: MainServiceId) => {
    const exists = benefits.find(b => b.groupId === groupId && b.serviceId === serviceId);
    if (exists) {
      setBenefits(benefits.filter(b => !(b.groupId === groupId && b.serviceId === serviceId)));
    } else {
      benefitIdRef.current += 1;
      setBenefits([...benefits, {
        id: `ben-new-${benefitIdRef.current}`,
        groupId,
        serviceId,
        amount: 0,
        coPayment: { required: false, type: "Percentage", value: 0 },
      }]);
    }
  };

  const updateBenefit = (benefitId: string, field: string, value: string | number | boolean | string[]) => {
    setBenefits(benefits.map(b => {
      if (b.id !== benefitId) return b;
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        if (parent === "coPayment") {
          return { ...b, coPayment: { ...b.coPayment, [child]: value } } as Benefit;
        }
        return b;
      }
      return { ...b, [field]: value };
    }));
  };

  const handleToggleSplit = (benefitId: string) => {
    const next = new Set(splitBenefitIds);
    if (next.has(benefitId)) {
      next.delete(benefitId);
      updateBenefit(benefitId, "employeeAmount", 0);
      updateBenefit(benefitId, "dependantAmount", 0);
    } else {
      next.add(benefitId);
    }
    setSplitBenefitIds(next);
  };

  const nextStep = async () => {
    if (isSubmitting) return;
    if (!validateStep(currentStep)) return;
    if (mode === "create" && currentStep === 1 && !policyData.id) {
      setIsSubmitting(true);
      await new Promise(resolve => setTimeout(resolve, 650));
      policyIdRef.current += 1;
      const id = `POL-new-${String(policyIdRef.current).padStart(4, "0")}`;
      const shellPolicy: Partial<BenefitPolicy> = {
        ...policyData,
        id,
        status: policyData.status ?? "draft",
      };
      setPolicyData(shellPolicy);
      onSaveDraft?.({ policy: shellPolicy, groups, benefits });
      setIsSubmitting(false);
    }
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const goToStep = (stepId: number) => {
    if (isSubmitting) return;
    // Allow going back freely; going forward requires current step validation
    if (stepId > currentStep) {
      if (!validateStep(currentStep)) return;
    }
    setCurrentStep(stepId);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setIsSubmitting(false);
    setIsSuccess(true);
    clearDraft();
    setTimeout(() => onSuccess({ policy: policyData, groups, benefits, assignedEmployeeIds }), 1800);
  };

  const handleSaveDraft = () => {
    if (!validateStep(currentStep)) return;
    if (mode === "create") {
      setShowPostCreateModal(true);
    } else {
      onSaveDraft?.({ policy: policyData, groups, benefits });
    }
  };

  const handleActivateFromModal = async () => {
    setShowPostCreateModal(false);
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setIsSuccess(true);
    clearDraft();
    setTimeout(() => onSuccess({ policy: { ...policyData, status: "active" }, groups, benefits }), 1800);
  };

  const handleLaunchClick = () => {
    if (!validateStep(currentStep)) return;
    setShowLaunchConfirmModal(true);
  };

  const handleRestoreDraft = () => {
    const restored = restoreDraft();
    if (!restored) return;
    setPolicyData(restored.policyData);
    setGroups(restored.groups);
    setBenefits(restored.benefits);
    setAssignedEmployeeIds(restored.assignedEmployeeIds);
    setAssignmentOrgId(restored.assignmentOrgId);
    setCurrentStep(restored.currentStep);
  };

  const handleViewFromModal = () => {
    setShowPostCreateModal(false);
    onSaveDraft?.({ policy: policyData, groups, benefits });
  };

  // ── Success ────────────────────────────────────────────────────────────────

  if (isSuccess) {
    return (
      <div className="py-12">
        <SuccessCelebration
          title={mode === "edit" ? "Policy Updated!" : "Benefit Policy Created!"}
          message="The policy details have been saved and applied."
        />
      </div>
    );
  }

  // ─ Step rendering helpers ─────────────────────────────────────────────────

  const renderBasicsStep = () => {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-3xl">
        <DetailSection
          title="Policy Basics"
          icon={<IdentificationCard size={18} weight="duotone" />}
          description="Name your policy and define who is eligible"
          ghost
        >
          <div className="space-y-5 md:max-w-xl">
            <div className="space-y-1.5">
              <label className="text-label font-medium text-subtle">
                Policy Name <span className="text-rose-600 dark:text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Wellness Premium 2026"
                className={cn(
                  "w-full px-4 py-3 bg-background border rounded-lg text-body outline-none transition-all font-semibold text-foreground focus:ring-4 focus:ring-primary/10 focus:border-primary/40",
                  validationErrors.name ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : "border-border"
                )}
                value={policyData.name || ""}
                onChange={(e) => setPolicyData({ ...policyData, name: e.target.value })}
                disabled={isViewMode}
              />
              {validationErrors.name && <p className="text-label text-rose-600 dark:text-rose-400 font-medium">{validationErrors.name}</p>}
              <p className="text-micro text-faint">Max 100 characters. Must be unique in your account.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-label font-medium text-subtle">Description</label>
              <textarea
                placeholder="Describe the purpose of this benefit policy..."
                rows={3}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-body outline-none transition-all font-medium text-muted-foreground min-h-[80px] resize-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40"
                value={policyData.description || ""}
                onChange={(e) => setPolicyData({ ...policyData, description: e.target.value })}
                disabled={isViewMode}
              />
              <p className="text-micro text-faint">Optional. Max 300 characters.</p>
            </div>

            <div className="space-y-3">
              <label className="text-label font-medium text-subtle">
                Employment Types <span className="text-rose-600 dark:text-rose-400">*</span>
              </label>
              {validationErrors.eligibleEmploymentTypes && (
                <p className="text-label text-rose-600 dark:text-rose-400 font-medium">{validationErrors.eligibleEmploymentTypes}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const allSelected = EMPLOYMENT_TYPES.every((t) => policyData.eligibleEmploymentTypes?.includes(t.id));
                  return (
                    <button
                      type="button"
                      disabled={isViewMode}
                      onClick={() => setPolicyData({ ...policyData, eligibleEmploymentTypes: allSelected ? policyData.eligibleEmploymentTypes : EMPLOYMENT_TYPES.map((t) => t.id) })}
                      className={cn(
                        "px-4 py-2 rounded-full text-body font-semibold border transition-all",
                        allSelected ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-background text-muted-foreground border-border hover:border-primary/30"
                      )}
                    >
                      {allSelected && <Check size={12} weight="bold" className="inline mr-1.5" />}
                      All
                    </button>
                  );
                })()}
                {EMPLOYMENT_TYPES.map((type) => {
                  const selected = policyData.eligibleEmploymentTypes?.includes(type.id) || false;
                  return (
                    <button
                      key={type.id}
                      disabled={isViewMode}
                      onClick={() => toggleEmploymentType(type.id)}
                      className={cn(
                        "px-4 py-2 rounded-full text-body font-semibold border transition-all",
                        selected
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-background text-muted-foreground border-border hover:border-primary/30"
                      )}
                    >
                      {selected && <Check size={12} weight="bold" className="inline mr-1.5" />}
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tier eligibility */}
            {(() => {
              const activeOrgId = orgId ?? policyData.organizationId;
              if (!activeOrgId) return null;
              const org = MOCK_ORGS.find((item) => item.id === activeOrgId);
              const tierOptions = (org?.tierConfigs ?? []).map((tier) => ({
                value: tier.id,
                label: tier.code ? `${tier.code} - ${tier.name}` : tier.name,
              }));
              if (tierOptions.length === 0) return null;
              return (
                <div className="space-y-3">
                  <label className="text-label font-medium text-subtle">Eligible Tiers</label>
                  <div className="flex flex-wrap gap-2">
                    {tierOptions.map((tier) => {
                      const selected = policyData.eligibility?.tierIds?.includes(tier.value) ?? false;
                      return (
                        <button
                          key={tier.value}
                          type="button"
                          disabled={isViewMode}
                          onClick={() => {
                            const current = policyData.eligibility?.tierIds ?? [];
                            const updated = selected
                              ? current.filter((id) => id !== tier.value)
                              : [...current, tier.value];
                            setPolicyData({ ...policyData, eligibility: { ...policyData.eligibility, tierIds: updated } });
                          }}
                          className={cn(
                            "px-3 py-1.5 rounded-lg border text-label font-medium transition-all",
                            selected ? "bg-primary/5 border-primary text-primary" : "bg-background border-border text-muted-foreground hover:border-primary/30"
                          )}
                        >
                          {tier.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-micro text-faint">Leave all unchecked to apply to all tiers.</p>
                </div>
              );
            })()}
          </div>
        </DetailSection>
      </div>
    );
  };

  const renderPoolStep = () => {
    const availableCycles = getAvailableRefreshCycles(policyData.utilisationMode ?? "Fixed", policyData.prorateUnit);

    if (isViewMode) {
      const refreshLabels: Record<string, string> = {
        financial_year: "Financial Year",
        calendar_year: "Calendar Year",
      };
      return (
        <div className="space-y-8 animate-in fade-in duration-300">
          <DetailSection title="Benefit Pool Strategy" icon={<Gear size={18} weight="duotone" />} description="Fund allocation configuration" ghost>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ReadField label="Pool Type" value={policyData.benefitPoolType === "Shared" ? "Shared Pool" : "Individual"} />
              <ReadField label="Dependents" value={(policyData.dependentCoverages?.length ?? 0) > 0 ? "Covered" : "Employee Only"} />
              <ReadField label="Employee Policy Amount" value={policyData.totalCapAmount ? `RM ${policyData.totalCapAmount.toFixed(2)}` : "Not Set"} />
              {(policyData.dependentCoverages?.length ?? 0) > 0 && (
                <ReadField label="Dependents Pool Type" value={policyData.dependentsPoolType === "SharedWithEmployee" ? "Shared with Employee" : policyData.dependentsPoolType} />
              )}
              <ReadField label="Utilisation Mode" value={policyData.utilisationMode === "Fixed" ? "Fixed Allocation" : "Prorated Allocation"} />
              {policyData.utilisationMode === "Prorated" && (
                <ReadField label="Prorate Unit" value={policyData.prorateUnit} />
              )}
            </div>
          </DetailSection>
          <DetailSection title="Cycle & Lifecycle" icon={<Gear size={18} weight="duotone" />} description="Refresh intervals" ghost>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ReadField label="Refresh Cycle" value={policyData.refreshCycle} />
              <ReadField label="Refresh Start Reference" value={refreshLabels[policyData.refreshStartReference || ""] || policyData.refreshStartReference} />
              {policyData.refreshStartMonth && (
                <ReadField label="Start Month" value={["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][policyData.refreshStartMonth - 1]} />
              )}
            </div>
          </DetailSection>
        </div>
      );
    }

    return (
      <div className="space-y-8 max-w-3xl">
        <DetailSection title="Benefit Pool Strategy" icon={<Gear size={18} weight="duotone" />} description="Choose how funds are allocated" ghost>
          <div className="space-y-6 md:max-w-xl">
            {/* ── Employee Policy Amount ── */}
            <div className="space-y-1.5">
              <label className="text-label font-medium text-subtle inline-flex items-center gap-1.5">Employee Policy Amount <FieldHelp termKey="spendingCap" /></label>
              <input
                type="number"
                min={0}
                placeholder="e.g. 3000"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-body font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                value={policyData.totalCapAmount ?? ""}
                onChange={(e) =>
                  setPolicyData({
                    ...policyData,
                    totalCapAmount: e.target.value === "" ? undefined : parseFloat(e.target.value),
                  })
                }
                disabled={isViewMode}
              />
              <p className="text-micro text-faint">Optional. Maximum total an employee can claim under this policy per cycle.</p>
            </div>

            {/* ── Cover Dependents ── */}
            <div className="space-y-3">
              <label className="text-label font-medium text-subtle inline-flex items-center gap-1.5">Cover Dependents <FieldHelp termKey="dependentsPooling" /></label>
              <label className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-body font-medium text-foreground w-fit">
                <input
                  type="checkbox"
                  checked={(policyData.dependentCoverages?.length ?? 0) > 0}
                  onChange={(e) =>
                    setPolicyData({
                      ...policyData,
                      dependentCoverages: e.target.checked
                        ? (policyData.dependentCoverages?.length ? policyData.dependentCoverages : [{ type: "spouse" }, { type: "child" }, { type: "mother" }, { type: "father" }, { type: "sibling" }, { type: "inlaw" }])
                        : [],
                      dependentsPoolType: e.target.checked ? (policyData.dependentsPoolType ?? "SharedWithEmployee") : undefined,
                    })
                  }
                  className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
                  disabled={isViewMode}
                />
                Include dependents in this policy
              </label>
              {(policyData.dependentCoverages?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const DEPENDENT_TYPES = [
                      { value: "spouse" as const,  label: "Spouse" },
                      { value: "child" as const,   label: "Child" },
                      { value: "mother" as const,  label: "Mother" },
                      { value: "father" as const,  label: "Father" },
                      { value: "sibling" as const, label: "Sibling" },
                      { value: "inlaw" as const,   label: "In-law" },
                    ];
                    const allSelected = DEPENDENT_TYPES.every((t) => policyData.dependentCoverages?.some((c) => c.type === t.value));
                    return (
                      <>
                        <button
                          type="button"
                          disabled={isViewMode}
                          onClick={() => setPolicyData({ ...policyData, dependentCoverages: allSelected ? [] : DEPENDENT_TYPES.map((t) => ({ type: t.value })), dependentsPoolType: allSelected ? undefined : (policyData.dependentsPoolType ?? "SharedWithEmployee") })}
                          className={cn("px-3 py-1.5 rounded-full text-label font-medium border transition-all", allSelected ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-background text-muted-foreground border-border hover:border-primary/30")}
                        >
                          {allSelected && <Check size={11} weight="bold" className="inline mr-1.5" />}All
                        </button>
                        {DEPENDENT_TYPES.map((opt) => {
                          const isSelected = policyData.dependentCoverages?.some((c) => c.type === opt.value) ?? false;
                          const selected = isSelected;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              disabled={isViewMode}
                              onClick={() => {
                                const next = isSelected
                                  ? (policyData.dependentCoverages ?? []).filter((c) => c.type !== opt.value)
                                  : [...(policyData.dependentCoverages ?? []), { type: opt.value }];
                                setPolicyData({ ...policyData, dependentCoverages: next, dependentsPoolType: next.length > 0 ? (policyData.dependentsPoolType ?? "SharedWithEmployee") : undefined });
                              }}
                              className={cn("px-3 py-1.5 rounded-full text-label font-medium border transition-all", selected ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-background text-muted-foreground border-border hover:border-primary/30")}
                            >
                              {selected && <Check size={11} weight="bold" className="inline mr-1.5" />}{opt.label}
                            </button>
                          );
                        })}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* ── Dependents Pool Type ── */}
            {(policyData.dependentCoverages?.length ?? 0) > 0 && (
              <div className="space-y-3">
                <label className="text-label font-medium text-subtle inline-flex items-center gap-1.5">
                  Dependents Pool Type <span className="text-rose-600 dark:text-rose-400">*</span>
                  <FieldHelp termKey="dependentsPooling" />
                </label>
                {validationErrors.dependentsPoolType && <p className="text-label text-rose-600 dark:text-rose-400 font-medium">{validationErrors.dependentsPoolType}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:max-w-2xl">
                  {DEPENDENTS_POOL_OPTIONS.map((opt) => (
                    <ChoiceCard
                      key={opt.value}
                      title={opt.title}
                      description={opt.description}
                      icon={opt.icon}
                      selected={policyData.dependentsPoolType === opt.value}
                      onSelect={() => setPolicyData({ ...policyData, dependentsPoolType: opt.value })}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── Dependent Amount (Shared pool) ── */}
            {(policyData.dependentCoverages?.length ?? 0) > 0 && policyData.dependentsPoolType === "Shared" && (
              <div className="space-y-1.5">
                <label className="text-label font-medium text-subtle">Dependent Pool Amount</label>
                <input
                  type="number"
                  min={0}
                  placeholder="e.g. 1500"
                  className="w-full max-w-xs px-4 py-2.5 bg-background border border-border rounded-lg text-body font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                  value={policyData.dependentCapAmount ?? ""}
                  onChange={(e) => setPolicyData({ ...policyData, dependentCapAmount: e.target.value === "" ? undefined : parseFloat(e.target.value) })}
                  disabled={isViewMode}
                />
                <p className="text-micro text-faint">Total shared pool for all dependents per cycle.</p>
              </div>
            )}

            {/* ── Dependent Amounts (Individual pool) ── */}
            {(policyData.dependentCoverages?.length ?? 0) > 0 && policyData.dependentsPoolType === "Individual" && (
              <div className="space-y-3">
                <label className="text-label font-medium text-subtle">Dependent Amounts <span className="text-rose-600 dark:text-rose-400">*</span></label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                  {(policyData.dependentCoverages ?? []).map((coverage) => (
                    <div key={coverage.type} className="space-y-1.5">
                      <label className="block text-label font-medium text-subtle">{coverage.type === "spouse" ? "Spouse" : coverage.type === "child" ? "Child" : coverage.type === "mother" ? "Mother" : coverage.type === "father" ? "Father" : coverage.type === "sibling" ? "Sibling" : "In-law"}</label>
                      <input
                        type="number"
                        min={0}
                        placeholder="e.g. 1500"
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-body font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                        value={coverage.capAmount ?? ""}
                        onChange={(e) => setPolicyData((prev) => ({ ...prev, dependentCoverages: (prev.dependentCoverages ?? []).map((c) => c.type === coverage.type ? { ...c, capAmount: e.target.value === "" ? undefined : parseFloat(e.target.value) } : c) }))}
                        disabled={isViewMode}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* ── Utilisation Mode ── */}
            <div className="space-y-3">
              <label className="text-label font-medium text-subtle inline-flex items-center gap-1.5">Utilisation Mode <FieldHelp termKey="utilisationMode" /></label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:max-w-xl">
                <ChoiceCard title="Fixed Allocation" description="Full benefit pool is granted upon assignment." icon={Gear} selected={policyData.utilisationMode === "Fixed"} onSelect={() => setPolicyData({ ...policyData, utilisationMode: "Fixed", prorateUnit: undefined })} />
                <ChoiceCard title="Prorated Allocation" description="Benefit amounts are prorated based on time." icon={Gear} selected={policyData.utilisationMode === "Prorated"} onSelect={() => setPolicyData({ ...policyData, utilisationMode: "Prorated", prorateUnit: policyData.prorateUnit ?? "Monthly" })} />
              </div>
            </div>

            {policyData.utilisationMode === "Prorated" && (
              <div className="space-y-1.5">
                <label className="text-label font-medium text-subtle inline-flex items-center gap-1.5">
                  Prorate Unit <span className="text-rose-600 dark:text-rose-400">*</span>
                  <FieldHelp termKey="prorateUnit" />
                </label>
                <FormSelect
                  value={policyData.prorateUnit || ""}
                  onChange={(v) => {
                    const newUnit = v as ProrateUnit;
                    const newAvailable = newUnit ? getAvailableRefreshCycles("Prorated", newUnit) : REFRESH_CYCLES;
                    const currentCycle = policyData.refreshCycle;
                    const adjustedCycle = currentCycle && newAvailable.includes(currentCycle) ? currentCycle : newAvailable[0];
                    setPolicyData({ ...policyData, prorateUnit: newUnit || undefined, refreshCycle: adjustedCycle });
                  }}
                  options={PRORATE_UNITS.map((u) => ({ label: u, value: u }))}
                  placeholder="Select prorate unit..."
                  error={!!validationErrors.prorateUnit}
                />
                {validationErrors.prorateUnit && <p className="text-label text-rose-600 dark:text-rose-400 font-medium">{validationErrors.prorateUnit}</p>}
              </div>
            )}
          </div>
        </DetailSection>

        <DetailSection title="Cycle & Lifecycle" icon={<Gear size={18} weight="duotone" />} description="Refresh intervals and start reference" ghost>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-label font-medium text-subtle inline-flex items-center gap-1.5">Refresh Cycle <FieldHelp termKey="refreshCycle" /></label>
              <FormSelect
                value={policyData.refreshCycle}
                onChange={(v) => setPolicyData({ ...policyData, refreshCycle: v as RefreshCycle })}
                options={availableCycles.map((c) => ({ label: c, value: c }))}
                error={!!validationErrors.refreshCycle}
              />
              {validationErrors.refreshCycle && <p className="text-label text-rose-600 dark:text-rose-400 font-medium">{validationErrors.refreshCycle}</p>}
            </div>

            <div className="space-y-3">
              <label className="text-label font-medium text-subtle inline-flex items-center gap-1.5">Refresh Start Reference <FieldHelp termKey="refreshCycle" /></label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ChoiceCard
                  title="Financial Year"
                  description="Cycle aligns to the organisation's financial year."
                  icon={CalendarBlank}
                  selected={policyData.refreshStartReference === "financial_year"}
                  onSelect={() => setPolicyData({ ...policyData, refreshStartReference: "financial_year", refreshStartMonth: undefined })}
                />
                <ChoiceCard
                  title="Calendar Year"
                  description="Cycle aligns to the standard Jan–Dec calendar year."
                  icon={Calendar}
                  selected={policyData.refreshStartReference === "calendar_year"}
                  onSelect={() => setPolicyData({ ...policyData, refreshStartReference: "calendar_year" })}
                />
              </div>
              {policyData.refreshStartReference === "calendar_year" && (
                <div className="space-y-2">
                  <p className="text-label font-medium text-subtle">Start Month</p>
                  {validationErrors.refreshStartMonth && <p className="text-label text-rose-600 dark:text-rose-400 font-medium">{validationErrors.refreshStartMonth}</p>}
                  <MonthPickerField
                    value={policyData.refreshStartMonth}
                    onChange={(m) => setPolicyData({ ...policyData, refreshStartMonth: m })}
                    error={!!validationErrors.refreshStartMonth}
                  />
                </div>
              )}
            </div>

          </div>
        </DetailSection>
      </div>
    );
  };

  const renderGroupsStep = () => {
    const groupErrors = validationErrors;

    return (
      <DetailSection
        title="Benefit Groups"
        icon={<TreeStructure size={18} weight="duotone" />}
        description="Organize benefits into logical groups with budget controls"
        ghost
        action={
          !isViewMode ? (
            <Button onClick={addGroup} size="sm" className="rounded-full flex items-center gap-2 text-label h-8 px-4">
              <Plus size={14} weight="bold" />
              Add Group
            </Button>
          ) : undefined
        }
      >
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-muted/20 rounded-lg border border-dashed border-border text-center">
            <TreeStructure size={36} weight="duotone" className="text-faint mb-3 mx-auto" />
            <p className="text-muted-foreground font-medium text-body">{isViewMode ? "No benefit groups configured." : "No benefit groups yet."}</p>
            {!isViewMode && (
              <Button variant="ghost" onClick={addGroup} className="mt-2 text-primary font-semibold text-body">
                Create your first group
              </Button>
            )}
            {groupErrors.groups && <p className="text-label text-rose-600 dark:text-rose-400 font-medium mt-2">{groupErrors.groups}</p>}
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((group, gIdx) => {
              const groupBenefits = benefits.filter(b => b.groupId === group.id);
              return (
                <div key={group.id} className="rounded-lg border border-border bg-card/40 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                  {/* Card header */}
                  <div className="flex items-start justify-between gap-3 p-4 border-b border-border">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <TreeStructure size={18} weight="duotone" />
                      </div>
                      {isViewMode ? (
                        <div className="min-w-0">
                          <p className="text-body font-semibold text-foreground truncate">{group.name}</p>
                          {group.description && <p className="text-label text-muted-foreground truncate">{group.description}</p>}
                        </div>
                      ) : (
                        <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            className="text-body font-semibold text-foreground bg-transparent border border-border rounded-md px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-primary/10 w-full"
                            value={group.name}
                            onChange={(e) => updateGroup(group.id, "name", e.target.value)}
                            placeholder="Group Name"
                          />
                          {groupErrors[`group_name_${group.id}`] && (
                            <p className="text-micro text-rose-600 dark:text-rose-400">{groupErrors[`group_name_${group.id}`]}</p>
                          )}
                          <input
                            className="text-label text-muted-foreground bg-transparent border border-border rounded-md px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-primary/10 w-full"
                            value={group.description || ""}
                            onChange={(e) => updateGroup(group.id, "description", e.target.value)}
                            placeholder="Brief description..."
                          />
                        </div>
                      )}
                    </div>
                    {!isViewMode && (
                      <button onClick={() => removeGroup(group.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-faint hover:text-rose-600 dark:hover:text-rose-400 transition-colors shrink-0">
                        <Trash size={16} />
                      </button>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-4 space-y-5">

                    {/* Employee / Dependent two-column grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Employee column */}
                      <div className="rounded-lg border border-border bg-muted/10 p-4 space-y-4">
                        <p className="text-label font-semibold text-foreground flex items-center gap-1.5">
                          <User size={14} weight="duotone" className="text-primary" />
                          Employee
                        </p>
                        <div className="space-y-1.5">
                          <p className="text-label font-medium text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">Group Cap <FieldHelp termKey="groupCap" /></span>
                          </p>
                          <input
                            type="number"
                            className={cn("w-32 px-2.5 py-1.5 border bg-background rounded-lg text-label outline-none focus:ring-2 focus:ring-primary/10", groupErrors[`group_cap_${group.id}`] ? "border-rose-300" : "border-border")}
                            value={group.maxUsagePerCycle || ""}
                            onChange={(e) => updateGroup(group.id, "maxUsagePerCycle", e.target.value === "" ? undefined : parseFloat(e.target.value))}
                            placeholder="0.00"
                          />
                          {groupErrors[`group_cap_${group.id}`] && <p className="text-micro text-rose-600 dark:text-rose-400">{groupErrors[`group_cap_${group.id}`]}</p>}
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-label font-medium text-muted-foreground inline-flex items-center gap-1.5">
                            Co-payment <FieldHelp termKey="coPayment" />
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateGroupCoPayment(group.id, "required", !(group.coPayment?.required ?? false))}
                              aria-pressed={group.coPayment?.required ?? false}
                              className={cn("w-9 h-5 rounded-full border transition-colors relative shrink-0", group.coPayment?.required ? "bg-primary border-primary" : "bg-muted border-border")}
                            >
                              <div className={cn("w-3.5 h-3.5 rounded-full bg-background shadow-sm absolute top-[2px] transition-all", group.coPayment?.required ? "right-0.5" : "left-0.5")} />
                            </button>
                            {group.coPayment?.required && (
                              <div className="flex items-center gap-1.5">
                                <FormSelect
                                  value={group.coPayment?.type ?? "Percentage"}
                                  onChange={(v) => updateGroupCoPayment(group.id, "type", v)}
                                  options={[{ label: "%", value: "Percentage" }, { label: "RM", value: "Fixed" }]}
                                  triggerClassName="w-16 h-8"
                                />
                                <input
                                  type="number"
                                  className="w-20 px-2.5 py-1.5 bg-background border border-border rounded-lg text-label font-mono outline-none text-right"
                                  value={group.coPayment?.value || ""}
                                  onChange={(e) => updateGroupCoPayment(group.id, "value", e.target.value === "" ? 0 : parseFloat(e.target.value))}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Dependent column */}
                      {(policyData.dependentCoverages?.length ?? 0) > 0 ? (
                        <div className="rounded-lg border border-border bg-muted/10 p-4 space-y-4">
                          <p className="text-label font-semibold text-foreground flex items-center gap-1.5">
                            <UsersFour size={14} weight="duotone" className="text-primary" />
                            Dependent
                          </p>
                          <div className="space-y-1.5">
                            <p className="text-label font-medium text-muted-foreground">
                              <span className="inline-flex items-center gap-1.5">Group Cap <FieldHelp termKey="groupCap" /></span>
                              <span className="text-faint font-normal ml-1">(optional)</span>
                            </p>
                            <input
                              type="number"
                              className="w-32 px-2.5 py-1.5 border border-border bg-background rounded-lg text-label outline-none focus:ring-2 focus:ring-primary/10"
                              value={group.dependentGroupCap || ""}
                              onChange={(e) => updateGroup(group.id, "dependentGroupCap", e.target.value === "" ? undefined : parseFloat(e.target.value))}
                              placeholder="0.00"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-label font-medium text-muted-foreground inline-flex items-center gap-1.5">
                              Co-payment <FieldHelp termKey="coPayment" />
                            </label>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updateDependentCoPayment(group.id, "required", !(group.dependentCoPayment?.required ?? false))}
                                aria-pressed={group.dependentCoPayment?.required ?? false}
                                className={cn("w-9 h-5 rounded-full border transition-colors relative shrink-0", group.dependentCoPayment?.required ? "bg-primary border-primary" : "bg-muted border-border")}
                              >
                                <div className={cn("w-3.5 h-3.5 rounded-full bg-background shadow-sm absolute top-[2px] transition-all", group.dependentCoPayment?.required ? "right-0.5" : "left-0.5")} />
                              </button>
                              {group.dependentCoPayment?.required && (
                                <div className="flex items-center gap-1.5">
                                  <FormSelect
                                    value={group.dependentCoPayment?.type ?? "Percentage"}
                                    onChange={(v) => updateDependentCoPayment(group.id, "type", v)}
                                    options={[{ label: "%", value: "Percentage" }, { label: "RM", value: "Fixed" }]}
                                    triggerClassName="w-16 h-8"
                                  />
                                  <input
                                    type="number"
                                    className="w-20 px-2.5 py-1.5 bg-background border border-border rounded-lg text-label font-mono outline-none text-right"
                                    value={group.dependentCoPayment?.value || ""}
                                    onChange={(e) => updateDependentCoPayment(group.id, "value", e.target.value === "" ? 0 : parseFloat(e.target.value))}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed border-border bg-muted/5 p-4 flex flex-col items-center justify-center gap-2 text-center min-h-[120px]">
                          <UsersFour size={28} weight="duotone" className="text-border" />
                          <p className="text-label font-medium text-faint">No dependent coverage</p>
                          <button
                            type="button"
                            onClick={() => setDepModalGroupId(group.id)}
                            className="text-label text-primary font-medium hover:underline"
                          >
                            Add dependent coverage →
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Dependent coverage mini modal */}
                    {depModalGroupId === group.id && (() => {
                      const DEP_TYPES: { value: DependentCoverageType; label: string }[] = [
                        { value: "spouse",  label: "Spouse" },
                        { value: "child",   label: "Child" },
                        { value: "mother",  label: "Mother" },
                        { value: "father",  label: "Father" },
                        { value: "sibling", label: "Sibling" },
                        { value: "inlaw",   label: "In-law" },
                      ];
                      const current = policyData.dependentCoverages ?? [];
                      const allSelected = DEP_TYPES.every((t) => current.some((c) => c.type === t.value));
                      return (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]">
                          <div className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl">
                            <div className="p-6 pb-4 space-y-1">
                              <p className="text-body font-semibold text-foreground">Add Dependent Coverage</p>
                              <p className="text-label text-subtle">Select which dependents this group covers.</p>
                            </div>
                            <div className="px-6 pb-4">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => setPolicyData({ ...policyData, dependentCoverages: allSelected ? [] : DEP_TYPES.map((t) => ({ type: t.value, capAmount: undefined })), dependentsPoolType: allSelected ? undefined : (policyData.dependentsPoolType ?? "SharedWithEmployee") })}
                                  className={cn("px-3 py-1.5 rounded-full text-label font-medium border transition-all", allSelected ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-background text-muted-foreground border-border hover:border-primary/30")}
                                >
                                  {allSelected && <Check size={11} weight="bold" className="inline mr-1.5" />}All
                                </button>
                                {DEP_TYPES.map((opt) => {
                                  const isSelected = current.some((c) => c.type === opt.value);
                                  return (
                                    <button
                                      key={opt.value}
                                      type="button"
                                      onClick={() => {
                                        const next = isSelected
                                          ? current.filter((c) => c.type !== opt.value)
                                          : [...current, { type: opt.value, capAmount: undefined }];
                                        setPolicyData({ ...policyData, dependentCoverages: next, dependentsPoolType: next.length > 0 ? (policyData.dependentsPoolType ?? "SharedWithEmployee") : undefined });
                                      }}
                                      className={cn("px-3 py-1.5 rounded-full text-label font-medium border transition-all", isSelected ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-background text-muted-foreground border-border hover:border-primary/30")}
                                    >
                                      {isSelected && <Check size={11} weight="bold" className="inline mr-1.5" />}{opt.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
                              <button
                                type="button"
                                onClick={() => setDepModalGroupId(null)}
                                className="px-4 py-2 text-label font-medium text-muted-foreground hover:text-foreground transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                disabled={(policyData.dependentCoverages?.length ?? 0) === 0}
                                onClick={() => setDepModalGroupId(null)}
                                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-label font-medium disabled:opacity-40"
                              >
                                Confirm
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Utilisation mode override */}
                    <div className="space-y-3 pt-2 border-t border-border/60">
                      <div className="flex items-center justify-between">
                        <p className="text-label font-medium text-muted-foreground">Utilisation Mode</p>
                        {group.utilisationMode ? (
                          <button
                            type="button"
                            onClick={() => { updateGroup(group.id, "utilisationMode", undefined); updateGroup(group.id, "prorateUnit", undefined); }}
                            className="flex items-center gap-1 text-micro text-faint hover:text-muted-foreground transition-colors"
                          >
                            <ArrowCounterClockwise size={11} />
                            Reset to policy default
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-micro text-faint bg-muted px-2 py-0.5 rounded-full">
                            <ArrowCounterClockwise size={11} />
                            Inheriting: {policyData.utilisationMode === "Prorated" ? `Prorated · ${policyData.prorateUnit ?? "Monthly"}` : "Fixed Allocation"}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <ChoiceCard
                          title="Fixed Allocation"
                          description="Full allocation granted immediately."
                          icon={Gear}
                          selected={group.utilisationMode === "Fixed"}
                          onSelect={() => {
                            updateGroup(group.id, "utilisationMode", "Fixed");
                            updateGroup(group.id, "prorateUnit", undefined);
                          }}
                        />
                        <ChoiceCard
                          title="Prorated Allocation"
                          description="Amounts prorated based on time."
                          icon={ChartLineUp}
                          selected={group.utilisationMode === "Prorated"}
                          onSelect={() => {
                            updateGroup(group.id, "utilisationMode", "Prorated");
                            if (!group.prorateUnit) updateGroup(group.id, "prorateUnit", "Monthly");
                          }}
                        />
                      </div>
                      {group.utilisationMode === "Prorated" && (
                        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                          <p className="text-label font-medium text-muted-foreground">Prorate Unit</p>
                          <FormSelect
                            value={group.prorateUnit ?? "Monthly"}
                            onChange={(v) => updateGroup(group.id, "prorateUnit", v)}
                            options={PRORATE_UNITS.map((u) => ({ label: u, value: u }))}
                            triggerClassName="max-w-[240px]"
                          />
                        </div>
                      )}
                    </div>

                    {/* Benefits selector */}
                    <div className="space-y-3 pt-2 border-t border-border/60">
                      <div className="flex items-center justify-between">
                        <p className="text-label font-semibold text-foreground">Services</p>
                        {groupErrors[`group_${gIdx}`] && <p className="text-label text-rose-600 dark:text-rose-400 font-medium">{groupErrors[`group_${gIdx}`]}</p>}
                      </div>
                      <BenefitServiceSelector
                        groupId={group.id}
                        groupBenefits={groupBenefits}
                        isViewMode={isViewMode}
                        splitBenefitIds={splitBenefitIds}
                        groupErrors={groupErrors}
                        hasDependents={(policyData.dependentCoverages?.length ?? 0) > 0}
                        dependentCoverageTypes={(policyData.dependentCoverages ?? []).map((c) => c.type)}
                        policyEmployeeCap={policyData.totalCapAmount}
                        policyDependentCap={policyData.dependentCapAmount}
                        onToggleService={(serviceId) => toggleService(group.id, serviceId)}
                        onUpdateBenefit={updateBenefit}
                        onToggleSplit={handleToggleSplit}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DetailSection>
    );
  };

  const renderEmployeeAssignmentStep = () => {
    const activeOrgId = orgId ?? assignmentOrgId;

    // Derive eligible employees from mock data
    const eligibleEmployees: EmployeeDirectoryItem[] = activeOrgId
      ? MOCK_EMPLOYEES.filter((emp) => {
          if (emp.orgId !== activeOrgId) return false;
          if (
            policyData.eligibleEmploymentTypes?.length &&
            emp.employmentType &&
            !policyData.eligibleEmploymentTypes.includes(emp.employmentType)
          )
            return false;
          const tierIds = policyData.eligibility?.tierIds;
          if (tierIds?.length && emp.tier && !tierIds.includes(emp.tier)) return false;
          return true;
        })
      : [];

    const assignCount = assignedEmployeeIds.filter(
      (id) => !MOCK_EMPLOYEES.find((e) => e.id === id)?.benefitPolicies?.length
    ).length;
    const reassignCount = assignedEmployeeIds.filter(
      (id) => (MOCK_EMPLOYEES.find((e) => e.id === id)?.benefitPolicies?.length ?? 0) > 0
    ).length;

    // Minimal org options for global picker
    const MOCK_ORG_OPTIONS = [
      { id: "ORG-20260115-0001", name: "Acme Corporation Sdn Bhd" },
      { id: "ORG-20260301-0002", name: "Global Tech Solutions" },
      { id: "ORG-20260401-0003", name: "Zenith Wellness Sdn Bhd" },
    ];

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-3xl">
        <DetailSection
          title="Assign Employees"
          icon={<Users size={18} weight="duotone" />}
          description="Assign all eligible employees now, customize selection, or do it later"
          ghost
        >
          <div className="space-y-5">
            {/* Global mode org picker */}
              {!orgId && (
                <div className="space-y-1.5">
                  <label className="text-label font-medium text-subtle">Organisation (optional)</label>
                  <FormSelect
                    value={assignmentOrgId}
                    onChange={(v) => {
                      setAssignmentOrgId(v);
                      setAssignedEmployeeIds([]);
                    }}
                    options={[{ label: "Select organisation…", value: "" }, ...MOCK_ORG_OPTIONS.map((o) => ({ label: o.name, value: o.id }))]}
                    triggerClassName="md:w-80"
                  />
                  <p className="text-micro text-faint">Select an organisation to preview and assign eligible employees.</p>
              </div>
            )}

            {activeOrgId ? (
              eligibleEmployees.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center border border-dashed border-border rounded-lg">
                  <Users size={28} className="text-faint" />
                  <p className="text-body font-medium text-muted-foreground">No eligible employees found</p>
                  <p className="text-label text-faint max-w-xs">
                    No employees match the current eligibility filters (employment type, tier). You can assign employees later from the employee table.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="rounded-4xl"
                      onClick={() => {
                        setShowCustomizeAssignment(false);
                        setAssignedEmployeeIds(eligibleEmployees.map((employee) => employee.id));
                        nextStep();
                      }}
                    >
                      Assign All Eligible ({eligibleEmployees.length})
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={showCustomizeAssignment ? "default" : "outline"}
                      className="rounded-4xl"
                      onClick={() => setShowCustomizeAssignment(true)}
                    >
                      Customize
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="rounded-4xl"
                      onClick={() => {
                        setShowCustomizeAssignment(false);
                        nextStep();
                      }}
                    >
                      Later
                    </Button>
                  </div>

                  {!showCustomizeAssignment && (
                    <p className="text-label text-faint">
                      Pick Customize to choose a specific employee subset, or continue with Assign All Eligible / Later.
                    </p>
                  )}

                  {showCustomizeAssignment && assignedEmployeeIds.length > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary/5 border border-primary/15">
                      <Check size={14} weight="bold" className="text-primary shrink-0" />
                      <p className="text-label font-medium text-primary">
                        {assignCount > 0 && `${assignCount} employee${assignCount !== 1 ? "s" : ""} will be assigned`}
                        {assignCount > 0 && reassignCount > 0 && " · "}
                        {reassignCount > 0 && `${reassignCount} reassigned from existing policy`}
                      </p>
                    </div>
                  )}

                  {showCustomizeAssignment && <div className="border border-border rounded-lg overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-muted/30 border-b border-border">
                      <button
                        type="button"
                        onClick={() => {
                          const allIds = eligibleEmployees.map((e) => e.id);
                          const allSelected = allIds.every((id) => assignedEmployeeIds.includes(id));
                          setAssignedEmployeeIds(allSelected ? [] : allIds);
                        }}
                        className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0",
                          eligibleEmployees.every((e) => assignedEmployeeIds.includes(e.id))
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-border bg-background"
                        )}
                      >
                        {eligibleEmployees.every((e) => assignedEmployeeIds.includes(e.id)) && <Check size={10} weight="bold" />}
                      </button>
                      <span className="text-label font-semibold text-muted-foreground">Employee</span>
                      <span className="ml-auto text-label font-semibold text-muted-foreground">Current Policy</span>
                    </div>
                    <div className="divide-y divide-border/50">
                      {eligibleEmployees.map((emp) => {
                        const isSelected = assignedEmployeeIds.includes(emp.id);
                        const hasPolicy = (emp.benefitPolicies?.length ?? 0) > 0;
                        return (
                          <div
                            key={emp.id}
                            className={cn(
                              "flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer hover:bg-muted/20",
                              isSelected && "bg-primary/5"
                            )}
                            onClick={() =>
                              setAssignedEmployeeIds((prev) =>
                                isSelected ? prev.filter((id) => id !== emp.id) : [...prev, emp.id]
                              )
                            }
                          >
                            <button
                              type="button"
                              className={cn(
                                "w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0",
                                isSelected ? "bg-primary border-primary text-primary-foreground" : "border-border bg-background"
                              )}
                            >
                              {isSelected && <Check size={10} weight="bold" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className="text-body font-medium text-foreground truncate">{emp.name}</p>
                              <p className="text-label text-faint font-medium">{emp.empCode} · {emp.department ?? "—"}</p>
                            </div>
                            <span className="text-label text-faint shrink-0">{emp.tier ?? "—"}</span>
                            <div className="shrink-0">
                              {hasPolicy ? (
                                <span className="px-2 py-0.5 rounded-full text-micro font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                                  {emp.benefitPolicies![0].policyName}
                                </span>
                              ) : (
                                <Badge variant="outline" className="text-micro font-semibold">
                                  None
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>}
                </>
              )
            ) : (
              <div className="flex flex-col items-center gap-3 py-10 text-center border border-dashed border-border rounded-lg">
                <Users size={28} className="text-faint" />
                <p className="text-body font-medium text-muted-foreground">Select an organisation to preview eligible employees</p>
                <p className="text-label text-faint">You can assign this policy to employees after creation.</p>
              </div>
            )}

            <button
              type="button"
              onClick={nextStep}
              className="text-label text-faint hover:text-muted-foreground transition-colors"
            >
              Continue to Review →
            </button>
          </div>
        </DetailSection>
      </div>
    );
  };

  const renderReviewStep = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {(() => {
        const activeOrgId = orgId ?? assignmentOrgId;
        const eligibleEmployees = activeOrgId
          ? MOCK_EMPLOYEES.filter((emp) => {
              if (emp.orgId !== activeOrgId) return false;
              if (
                policyData.eligibleEmploymentTypes?.length &&
                emp.employmentType &&
                !policyData.eligibleEmploymentTypes.includes(emp.employmentType)
              ) {
                return false;
              }
              const tierIds = policyData.eligibility?.tierIds;
              if (tierIds?.length && emp.tier && !tierIds.includes(emp.tier)) return false;
              return true;
            })
          : [];

        const isAssignAllSelection =
          eligibleEmployees.length > 0 &&
          assignedEmployeeIds.length === eligibleEmployees.length &&
          eligibleEmployees.every((emp) => assignedEmployeeIds.includes(emp.id));

        const assignmentSummary = !activeOrgId
          ? "Later"
          : showCustomizeAssignment
            ? assignedEmployeeIds.length > 0
              ? `Customized (${assignedEmployeeIds.length} selected)`
              : "Customized (none selected yet)"
            : isAssignAllSelection
              ? `Assign All Eligible (${eligibleEmployees.length})`
              : "Later";

        return (
          <DetailSection title="Assignment" icon={<Users size={18} weight="duotone" />} ghost>
            <div className="space-y-4">
              <ReadField label="Employee Assignment" value={assignmentSummary} />
              <ReadField label="Eligible Employees" value={activeOrgId ? String(eligibleEmployees.length) : "—"} />
            </div>
          </DetailSection>
        );
      })()}

      <div className="mb-10">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <ShieldCheck size={22} weight="duotone" />
          </div>
          <div>
            <h3 className="text-display font-semibold text-foreground tracking-tight">Review & Finalize</h3>
            <p className="text-subtle mt-0.5">Verify your configuration before saving.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Basics */}
        <DetailSection title="Basics" icon={<IdentificationCard size={18} weight="duotone" />} ghost>
          <div className="space-y-4">
            <ReadField label="Policy Name" value={policyData.name || undefined} />
            <ReadField label="Description" value={policyData.description || undefined} />
            <ReadField label="Employment Types" value={policyData.eligibleEmploymentTypes?.map(t => t.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")).join(", ")} />
          </div>
        </DetailSection>

        {/* Pool & Cycle */}
        <DetailSection title="Pool & Cycle" icon={<Gear size={18} weight="duotone" />} ghost>
          <div className="space-y-4">
            <ReadField label="Dependents" value={(policyData.dependentCoverages?.length ?? 0) > 0 ? "Covered" : "Employee Only"} />
            <ReadField label="Employee Policy Amount" value={policyData.totalCapAmount ? `RM ${policyData.totalCapAmount.toFixed(2)}` : "Not Set"} />
            {(policyData.dependentCoverages?.length ?? 0) > 0 && <ReadField label="Dependents Pool Type" value={policyData.dependentsPoolType === "SharedWithEmployee" ? "Shared with Employee" : policyData.dependentsPoolType} />}
            <ReadField label="Utilisation Mode" value={policyData.utilisationMode === "Fixed" ? "Fixed Allocation" : "Prorated Allocation"} />
            {policyData.utilisationMode === "Prorated" && <ReadField label="Prorate Unit" value={policyData.prorateUnit} />}
            <ReadField label="Refresh Cycle" value={policyData.refreshCycle} />
            <ReadField label="Start Reference" value={policyData.refreshStartReference === "financial_year" ? "Financial Year" : "Calendar Year"} />
            {policyData.refreshStartMonth && <ReadField label="Start Month" value={["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][policyData.refreshStartMonth - 1]} />}
          </div>
        </DetailSection>

        {/* Groups Summary */}
        <DetailSection title="Benefit Groups" icon={<TreeStructure size={18} weight="duotone" />} className="lg:col-span-2" ghost>
          <div className="space-y-4">
            {groups.length === 0 ? (
              <p className="text-center py-6 text-body text-faint font-medium">No benefit groups configured.</p>
            ) : groups.map(group => {
              const groupBenefits = benefits.filter(b => b.groupId === group.id);
              return (
                <div key={group.id} className="p-4 rounded-lg border border-border/60 flex items-center justify-between bg-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-primary shadow-sm border border-border/60">
                      <TreeStructure size={16} />
                    </div>
                    <div>
                      <p className="text-body font-medium text-foreground">{group.name}</p>
                      <p className="text-label text-muted-foreground font-semibold">{groupBenefits.length} benefits · {group.distributionType === "SharedAmount" ? "Shared Pool" : "Individual"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-body font-semibold text-primary">
                      {group.distributionType === "SharedAmount" ? `RM ${group.maxUsagePerCycle?.toFixed(2) || "0.00"}` : `${groupBenefits.length} benefits`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </DetailSection>
      </div>

      {/* Info callout */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
        <NotePencil size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-body font-semibold text-amber-700 dark:text-amber-300">Saved as Draft</p>
          <p className="text-label text-amber-600 dark:text-amber-400 mt-0.5">Activate to make this policy visible to organisations.</p>
        </div>
      </div>
    </div>
  );

  // ── Main Render ────────────────────────────────────────────────────────────

  // ── Status section renderer (used in content area for edit/view) ──────────
  const renderStatusSection = () => (
    <div className="mt-10 pt-6 border-t border-border">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-body font-medium text-foreground">Policy Status</h4>
          <p className="text-label text-faint mt-0.5">Control the visibility and lifecycle state of this policy.</p>
        </div>
        <StatusPicker
          value={(policyData.status as PolicyStatus) || "draft"}
          onChange={(s) => setPolicyData({ ...policyData, status: s })}
          disabled={isViewMode}
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Sticky header + nav */}
      <div className="bg-background/80 backdrop-blur-md sticky top-0 z-10 transition-all border-none shadow-none px-6">
        {/* Title + actions row */}
        <div className="flex items-center justify-between py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={onCancel}
              className="w-10 h-10 rounded-lg border border-border/60 flex items-center justify-center hover:bg-muted/50 transition-all shadow-none"
            >
              <CaretLeft size={20} weight="bold" />
            </button>
            <h2 className="text-heading font-semibold text-foreground text-balance">
              {isViewMode ? "View Benefit Policy" : mode === "edit" ? "Edit Benefit Policy" : "Add Benefit Policy"}
            </h2>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {isViewMode ? (
              onEdit && (
                <Button
                  onClick={onEdit}
                  className="rounded-full px-6 flex items-center gap-2 bg-primary text-primary-foreground shadow-none"
                >
                  <NotePencil size={16} weight="bold" />
                  Edit Policy
                </Button>
              )
            ) : (
              <>
                <button
                  onClick={handleSaveDraft}
                  className="text-muted-foreground font-medium text-body px-4 py-2 rounded-full hover:bg-muted transition-colors"
                >
                  Save as Draft
                </button>
                {mode === "create" && currentStep > 1 && (
                  <Button variant="ghost" onClick={prevStep} className="rounded-full px-6">Back</Button>
                )}
                {mode === "create" && currentStep < 5 ? (
                  <Button
                    onClick={nextStep}
                    className="rounded-full px-8 bg-primary text-primary-foreground shadow-none"
                  >
                    Next Step
                    <CaretRight size={16} weight="bold" className="ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={mode === "create" ? handleLaunchClick : handleSubmit}
                    disabled={isSubmitting}
                    className="rounded-full px-8 bg-primary text-primary-foreground shadow-none min-w-[140px]"
                  >
                    {isSubmitting ? "Finalizing..." : mode === "edit" ? "Save Changes" : "Launch Policy"}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Active policy edit banner */}
        {mode === "edit" && policyData.status === "active" && policyData.organizationId && (
          <div className="flex items-start gap-2.5 px-4 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 mb-3">
            <Warning size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-label text-amber-700 dark:text-amber-300 font-medium">
              Changes apply to future assignments only. Existing employee assignments are unaffected.
            </p>
          </div>
        )}

        {/* Underline tabs — view & edit; hide tab 4 in edit */}
        {(isViewMode || mode === "edit") && (
          <div className="flex">
            {CONTENT_TABS.filter(t => !t.viewOnly || isViewMode).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentStep(tab.id)}
                className={cn(
                  "px-5 py-3 text-body font-semibold transition-all border-b-2 -mb-px",
                  currentStep === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                {tab.title}
              </button>
            ))}
          </div>
        )}

        {/* Numbered stepper — create only */}
        {mode === "create" && (
          <div className="flex items-center gap-2 pb-5">
            {CREATE_STEPS.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => goToStep(step.id)}
                className={cn(
                  "flex items-center gap-2 group transition-all cursor-pointer shrink-0",
                  currentStep === step.id ? "opacity-100" : "opacity-40 hover:opacity-100"
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded-md flex items-center justify-center text-label font-semibold shadow-sm transition-all",
                  currentStep === step.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-muted/50"
                )}>
                  {currentStep > step.id ? <Check size={14} weight="bold" /> : step.id}
                </div>
                <span className={cn(
                  "text-body font-semibold whitespace-nowrap transition-colors",
                  currentStep === step.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {step.title}
                </span>
                {idx < CREATE_STEPS.length - 1 && (
                  <div className="w-8 h-[2px] bg-muted rounded-full mx-1" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 pt-8 pb-12">
        {mode === "create" && hasDraft && !draftRestored && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 dark:border-amber-500/20 dark:bg-amber-500/10">
            <p className="text-label font-medium text-amber-700 dark:text-amber-300">
              Draft available{draftSavedAt ? ` · saved ${new Date(draftSavedAt).toLocaleString()}` : ""}
            </p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={clearDraft} className="rounded-4xl px-4">Discard</Button>
              <Button size="sm" onClick={handleRestoreDraft} className="rounded-4xl px-4">Resume</Button>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {currentStep === 1 && (
              <>
                {renderBasicsStep()}
                {(isViewMode || mode === "edit") && renderStatusSection()}
              </>
            )}
            {currentStep === 2 && renderPoolStep()}
            {currentStep === 3 && renderGroupsStep()}
            {currentStep === 4 && mode === "create" && renderEmployeeAssignmentStep()}
            {currentStep === 5 && mode === "create" && renderReviewStep()}
            {currentStep === 4 && isViewMode && (
              <DetailSection
                title="Claims Usage"
                icon={<Receipt size={18} weight="duotone" />}
                description="Benefit usage and claim history for all employees on this policy"
                ghost
              >
                <UtilisationClaimsTable data={MOCK_EMPLOYEE_UTILISATION} />
              </DetailSection>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {showLaunchConfirmModal && (
        <PolicyLaunchConfirmModal
          policy={policyData}
          assignedEmployeeIds={assignedEmployeeIds}
          groups={groups}
          benefits={benefits}
          onConfirm={() => {
            setShowLaunchConfirmModal(false);
            void handleSubmit();
          }}
          onCancel={() => setShowLaunchConfirmModal(false)}
        />
      )}

      {/* Post-creation activation modal (SCR-POL-03) */}
      <AnimatePresence>
        {showPostCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md overflow-hidden rounded-[24px] border border-border bg-card shadow-2xl"
            >
              <div className="p-8 pb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/10">
                    <ShieldCheck size={20} weight="duotone" />
                  </div>
                  <div>
                    <h3 className="text-heading font-semibold text-foreground">Policy Created</h3>
                    <p className="text-label text-muted-foreground">{policyData.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label font-medium border",
                    STATUS_CONFIG.draft.bg, STATUS_CONFIG.draft.color
                  )}>
                    <NotePencil size={12} weight="fill" />
                    Draft
                  </span>
                  <span className="text-label text-faint">
                    {groups.length} group{groups.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div className="px-8 pb-2 space-y-3">
                <Button
                  onClick={handleActivateFromModal}
                  className="w-full h-12 rounded-lg font-semibold shadow-lg shadow-primary/20"
                >
                  Activate policy →
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleViewFromModal}
                  className="w-full h-11 rounded-lg font-semibold hover:bg-muted"
                >
                  View policy
                </Button>
                <button
                  onClick={handleViewFromModal}
                  className="w-full text-center text-label font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  Skip — let org admin handle tiers
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
