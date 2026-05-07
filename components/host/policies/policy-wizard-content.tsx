"use client";

import { useState, useCallback } from "react";
import {
  IdentificationCard,
  Gear,
  Users,
  User,
  UsersFour,
  Briefcase,
  TreeStructure,
  Plus,
  Trash,
  Check,
  ShieldCheck,
  DiceFive,
  PencilSimpleLine,
  CaretDown,
  CalendarCheck,
  RocketLaunch,
  ClockCountdown,
  type IconProps,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ChoiceCard } from "@/components/shared/choice-card";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  BenefitPolicy,
  BenefitGroup,
  Benefit,
  ProrateUnit,
  RefreshCycle,
  DependentsPoolType,
  ActivationMode,
} from "@/types/policy";
import { MOCK_EMPLOYEES, SERVICES } from "@/lib/mock-data";
import type { MainServiceId } from "@/lib/mock-data/service-catalog";

// ─── Constants ───────────────────────────────────────────────────────────────

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

const ACTIVATION_MODES: { value: ActivationMode; label: string; description: string; icon: React.ElementType<IconProps> }[] = [
  { value: "after_join", label: "After Join Date", description: "Policy activates when the employee joins.", icon: RocketLaunch },
  { value: "after_probation", label: "After Probation Ends", description: "Policy activates once probation is completed.", icon: ClockCountdown },
  { value: "custom_date", label: "Custom Date", description: "Set a specific activation date.", icon: CalendarCheck },
];

function getAvailableRefreshCycles(
  utilisationMode: "Fixed" | "Prorated",
  prorateUnit?: ProrateUnit
): RefreshCycle[] {
  if (utilisationMode === "Fixed") {
    return ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"];
  }
  // Prorated — strictly coarser than prorate unit
  if (!prorateUnit) return REFRESH_CYCLES;
  const unitIdx = PRORATE_UNITS.indexOf(prorateUnit);
  return REFRESH_CYCLES.slice(unitIdx + 1);
}


// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description?: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
        <Icon size={18} weight="duotone" />
      </div>
      <div>
        <h3 className="text-lead font-semibold text-foreground">{title}</h3>
        {description && <p className="text-label text-muted-foreground mt-0.5">{description}</p>}
      </div>
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-label font-medium text-subtle block">
      {children}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </label>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="text-label text-destructive font-medium mt-1">{children}</p>;
}

function HelpText({ children }: { children: React.ReactNode }) {
  return <p className="text-micro text-faint mt-1">{children}</p>;
}

function ReadField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-label font-medium text-muted-foreground">{label}</p>
      <p className="text-body font-semibold text-foreground">{value || <span className="text-faint italic">—</span>}</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const AI_POLICY_NAMES = [
  "Wellness Allocation 2026",
  "Active Living Plan",
  "Mind & Care Essentials",
  "Executive Health Plus",
  "Fitness First Bundle",
  "Holistic Wellness Program",
  "Recovery & Recharge",
  "Corporate Vitality Plan",
];

interface PolicyReviewCardsProps {
  policy: Partial<BenefitPolicy>;
  groups: BenefitGroup[];
  benefits: Benefit[];
}

export function PolicyReviewCards({ policy, groups, benefits }: PolicyReviewCardsProps) {
  return (
    <div className="space-y-6">
      <SectionHeader icon={ShieldCheck} title="Review" description="Verify your configuration before saving" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-lg p-5 space-y-4">
          <h4 className="text-body font-semibold text-foreground flex items-center gap-2">
            <IdentificationCard size={16} weight="duotone" className="text-primary" />
            Policy Details
          </h4>
          <ReadField label="Policy Name" value={policy.name || undefined} />
          <ReadField label="Description" value={policy.description || undefined} />
          <ReadField label="Eligible Employment Types" value={policy.eligibleEmploymentTypes?.join(", ")} />
        </div>

        <div className="bg-card border border-border rounded-lg p-5 space-y-4">
          <h4 className="text-body font-semibold text-foreground flex items-center gap-2">
            <Users size={16} weight="duotone" className="text-primary" />
            Employee Eligibility
          </h4>
          <ReadField
            label="Age Range"
            value={
              policy.eligibility?.minAge || policy.eligibility?.maxAge
                ? `${policy.eligibility?.minAge || "Any"} — ${policy.eligibility?.maxAge || "Any"}`
                : "Any age"
            }
          />
          <ReadField
            label="Gender"
            value={policy.eligibility?.gender ? policy.eligibility.gender.charAt(0).toUpperCase() + policy.eligibility.gender.slice(1) : "All"}
          />
        </div>

        <div className="bg-card border border-border rounded-lg p-5 space-y-4">
          <h4 className="text-body font-semibold text-foreground flex items-center gap-2">
            <Gear size={16} weight="duotone" className="text-primary" />
            Pool & Cycle
          </h4>
          <ReadField label="Dependents" value={policy.coversDependents ? "Covered" : "Employee Only"} />
          <ReadField label="Employee Pool Type" value={policy.benefitPoolType} />
          {policy.coversDependents && <ReadField label="Dependents Pool Type" value={policy.dependentsPoolType === "SharedWithEmployee" ? "Shared with Employee" : policy.dependentsPoolType} />}
          <ReadField label="Utilisation Mode" value={policy.utilisationMode === "Fixed" ? "Fixed Allocation" : "Prorated Allocation"} />
          {policy.utilisationMode === "Prorated" && <ReadField label="Prorate Unit" value={policy.prorateUnit} />}
          <ReadField label="Refresh Cycle" value={policy.refreshCycle} />
          <ReadField
            label="Start Reference"
            value={
              policy.refreshStartReference === "fy_start"
                ? "Organisation Financial Year"
                : policy.refreshStartReference === "join_date"
                ? "Employee Join Date"
                : "Custom Start Date"
            }
          />
          {policy.refreshStartReference === "custom_date" && <ReadField label="Custom Date" value={policy.refreshCustomDate} />}
          <ReadField
            label="Activation"
            value={
              policy.activationMode === "after_join"
                ? "After Join Date"
                : policy.activationMode === "after_probation"
                ? "After Probation Ends"
                : "Custom Date"
            }
          />
          {policy.activationMode === "custom_date" && <ReadField label="Activation Date" value={policy.activationCustomDate} />}
        </div>

        <div className="bg-card border border-border rounded-lg p-5 space-y-4 md:col-span-2">
          <h4 className="text-body font-semibold text-foreground flex items-center gap-2">
            <TreeStructure size={16} weight="duotone" className="text-primary" />
            Groups & Benefits
          </h4>
          {groups.length === 0 ? (
            <p className="text-body text-faint font-medium">No benefit groups configured.</p>
          ) : (
            <div className="space-y-3">
              {groups.map((group) => {
                const groupBenefits = benefits.filter((b) => b.groupId === group.id);
                return (
                  <div key={group.id} className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-transparent">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-primary border border-border/60">
                        <TreeStructure size={16} />
                      </div>
                      <div>
                        <p className="text-body font-medium text-foreground">{group.name}</p>
                        <p className="text-label text-muted-foreground font-semibold">
                          {groupBenefits.length} benefits · {group.distributionType === "SharedAmount" ? "Shared Pool" : "Individual"}
                        </p>
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
          )}
        </div>
      </div>

      {policy.status !== "active" && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
          <PencilSimpleLine size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-body font-semibold text-amber-700 dark:text-amber-300">Saved as Draft</p>
            <p className="text-label text-amber-600 dark:text-amber-400 mt-0.5">Activate to make this policy visible to organisations.</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface PolicyWizardContentProps {
  mode?: "create" | "edit";
  initialData?: {
    policy: Partial<BenefitPolicy>;
    groups: BenefitGroup[];
    benefits: Benefit[];
  };
  onSubmit: (data: { policy: Partial<BenefitPolicy>; groups: BenefitGroup[]; benefits: Benefit[] }) => void;
  onReview?: (data: { policy: Partial<BenefitPolicy>; groups: BenefitGroup[]; benefits: Benefit[] }) => void;
}

export function PolicyWizardContent({ mode = "create", initialData, onSubmit, onReview }: PolicyWizardContentProps) {
  // ── Form state ────────────────────────────────────────────────────────────
  const [policyData, setPolicyData] = useState<Partial<BenefitPolicy>>(
    initialData?.policy || {
      name: "",
      description: "",
      eligibleEmploymentTypes: ["full-time"],
      coversDependents: false,
      benefitPoolType: "Individual",
      utilisationMode: "Fixed",
      refreshCycle: "Yearly",
      refreshStartReference: "fy_start",
      activationMode: "after_join",
      status: "draft",
    }
  );

  const [groups, setGroups] = useState<BenefitGroup[]>(initialData?.groups || []);
  const [benefits, setBenefits] = useState<Benefit[]>(initialData?.benefits || []);
  const [splitBenefitIds, setSplitBenefitIds] = useState<Set<string>>(new Set());
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!policyData.name?.trim()) errors.name = "Policy name is required";
    else if (policyData.name.length > 100) errors.name = "Max 100 characters";

    if (!policyData.eligibleEmploymentTypes || policyData.eligibleEmploymentTypes.length === 0) {
      errors.eligibleEmploymentTypes = "Select at least one employment type";
    }

    if (policyData.utilisationMode === "Prorated" && !policyData.prorateUnit) {
      errors.prorateUnit = "Select a prorate unit for Prorated mode";
    }

    if (policyData.coversDependents && !policyData.dependentsPoolType) {
      errors.dependentsPoolType = "Select a pool type for dependents";
    }

    if (policyData.refreshStartReference === "custom_date" && !policyData.refreshCustomDate) {
      errors.refreshCustomDate = "Enter a custom refresh date";
    }

    if (policyData.activationMode === "custom_date" && !policyData.activationCustomDate) {
      errors.activationCustomDate = "Enter a custom activation date";
    }

    if (policyData.utilisationMode === "Prorated" && policyData.prorateUnit) {
      const available = getAvailableRefreshCycles("Prorated", policyData.prorateUnit);
      if (policyData.refreshCycle && !available.includes(policyData.refreshCycle)) {
        errors.refreshCycle = `${policyData.refreshCycle} is not valid for ${policyData.prorateUnit} prorate. Valid: ${available.join(", ")}`;
      }
    }

    if (groups.length === 0) errors.groups = "Add at least one benefit group";

    groups.forEach((group, idx) => {
      const groupBenefits = benefits.filter((b) => b.groupId === group.id);
      if (groupBenefits.length === 0) {
        errors[`group_${idx}`] = `Select at least one benefit for ${group.name || "this group"}`;
      }
      groupBenefits.forEach((b, bIdx) => {
        if (b.amount <= 0) errors[`benefit_${group.id}_${bIdx}`] = "Amount must be greater than 0";
        if (b.coPayment.required && b.coPayment.value <= 0) {
          errors[`copay_${group.id}_${bIdx}`] = "Co-payment value must be greater than 0";
        }
      });
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const toggleEmploymentType = (id: string) => {
    setPolicyData((prev) => {
      const current = prev.eligibleEmploymentTypes || [];
      return {
        ...prev,
        eligibleEmploymentTypes: current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
      };
    });
  };

  const addGroup = useCallback(() => {
    const newGroup: BenefitGroup = {
      id: `grp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      policyId: policyData.id || "temp",
      name: "New Benefit Group",
      distributionType: "IndividualBenefitAmount",
    };
    setGroups((prev) => [...prev, newGroup]);
  }, [policyData.id]);

  const removeGroup = (groupId: string) => {
    setGroups(groups.filter((g) => g.id !== groupId));
    setBenefits(benefits.filter((b) => b.groupId !== groupId));
  };

  const updateGroup = (groupId: string, field: keyof BenefitGroup, value: string | number | undefined) => {
    setGroups(groups.map((g) => (g.id === groupId ? { ...g, [field]: value } : g)));
  };

  const toggleService = useCallback((groupId: string, serviceId: MainServiceId) => {
    setBenefits((prev) => {
      const exists = prev.find((b) => b.groupId === groupId && b.serviceId === serviceId);
      if (exists) {
        return prev.filter((b) => !(b.groupId === groupId && b.serviceId === serviceId));
      }
      return [
        ...prev,
        {
          id: `ben-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          groupId,
          serviceId,
          amount: 0,
          coPayment: { required: false, type: "Percentage", value: 0 },
        },
      ];
    });
  }, []);

  const updateBenefit = (benefitId: string, field: string, value: string | number | boolean) => {
    setBenefits((prev) =>
      prev.map((b) => {
        if (b.id !== benefitId) return b;
        if (field.includes(".")) {
          const [parent, child] = field.split(".");
          if (parent === "coPayment") {
            return { ...b, coPayment: { ...b.coPayment, [child]: value } } as Benefit;
          }
          return b;
        }
        return { ...b, [field]: value };
      })
    );
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const data = { policy: policyData, groups, benefits };
    if (mode === "create" && onReview) {
      onReview(data);
    } else {
      onSubmit(data);
    }
  };

  // ── Policy Details section ────────────────────────────────────────────────
  const renderPolicyDetailsSection = () => (
    <div className="space-y-5">
      <SectionHeader icon={IdentificationCard} title="Policy Details" description="Name your policy and define who is eligible" />

      <div className="space-y-1.5">
        <FieldLabel required>Policy Name</FieldLabel>
        <div className="relative">
          <input
            type="text"
            placeholder="e.g. Wellness Premium 2026"
            className={cn(
              "w-full px-4 py-3 pr-24 bg-background border rounded-lg text-body outline-none transition-all font-semibold text-foreground focus:ring-2 focus:ring-primary/10 focus:border-primary/40",
              validationErrors.name ? "border-destructive focus:border-destructive" : "border-border"
            )}
            value={policyData.name || ""}
            onChange={(e) => setPolicyData({ ...policyData, name: e.target.value })}
          />
          <button
            type="button"
            onClick={() => {
              const random = AI_POLICY_NAMES[Math.floor(Math.random() * AI_POLICY_NAMES.length)];
              setPolicyData({ ...policyData, name: random });
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-label font-medium text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded-md hover:bg-primary/5"
          >
            <DiceFive size={14} weight="bold" />
            Suggest
          </button>
        </div>
        {validationErrors.name && <ErrorText>{validationErrors.name}</ErrorText>}
        <HelpText>Max 100 characters. Must be unique in your account.</HelpText>
      </div>

      <div className="space-y-1.5">
        <FieldLabel>Description</FieldLabel>
        <textarea
          placeholder="Describe the purpose of this benefit policy..."
          rows={3}
          className="w-full px-4 py-3 bg-background border border-border rounded-lg text-body outline-none transition-all font-medium text-muted-foreground min-h-[80px] resize-none focus:ring-2 focus:ring-primary/10 focus:border-primary/40"
          value={policyData.description || ""}
          onChange={(e) => setPolicyData({ ...policyData, description: e.target.value })}
        />
        <HelpText>Optional. Max 300 characters.</HelpText>
      </div>

      <div className="space-y-1.5">
        <FieldLabel required>Organisation</FieldLabel>
        <input
          type="text"
          placeholder="e.g. ORG-20260115-0001"
          className={cn(
            "w-full px-4 py-3 bg-background border rounded-lg text-body outline-none transition-all font-semibold text-foreground focus:ring-2 focus:ring-primary/10 focus:border-primary/40",
            validationErrors.organizationId ? "border-destructive focus:border-destructive" : "border-border"
          )}
          value={policyData.organizationId || ""}
          onChange={(e) => setPolicyData({ ...policyData, organizationId: e.target.value })}
        />
        {validationErrors.organizationId && <ErrorText>{validationErrors.organizationId}</ErrorText>}
        <HelpText>The organisation this policy belongs to. Cannot be changed after creation.</HelpText>
      </div>

      <div className="space-y-3">
        <FieldLabel required>Eligible Employment Types</FieldLabel>
        {validationErrors.eligibleEmploymentTypes && <ErrorText>{validationErrors.eligibleEmploymentTypes}</ErrorText>}
        <div className="flex flex-wrap gap-2">
          {EMPLOYMENT_TYPES.map((type) => {
            const selected = policyData.eligibleEmploymentTypes?.includes(type.id) || false;
            return (
                <button
                type="button"
                key={type.id}
                onClick={() => toggleEmploymentType(type.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-body font-semibold border transition-all",
                  selected ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-background text-muted-foreground border-border hover:border-primary/30"
                )}
              >
                {selected && <Check size={12} weight="bold" className="inline mr-1.5" />}
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Filters — collapsed accordion, only when needed */}
      <div className="pt-4 border-t border-border/60">
        <Collapsible defaultOpen={false}>
          <CollapsibleTrigger className="group flex items-center gap-2 w-full text-left">
            <CaretDown
              size={14}
              weight="bold"
              className="text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
            />
            <span className="text-body font-semibold text-foreground">Advanced Filters</span>
            <span className="text-label text-faint font-medium ml-1">(optional)</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <p className="text-label text-muted-foreground mb-4">Narrow which employees are automatically assigned this policy.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <FieldLabel>Age Range (Min)</FieldLabel>
                <input
                  type="number"
                  placeholder="e.g. 18"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-body font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                  value={policyData.eligibility?.minAge || ""}
                  onChange={(e) =>
                    setPolicyData({
                      ...policyData,
                      eligibility: {
                        ...policyData.eligibility,
                        minAge: e.target.value ? parseInt(e.target.value) : undefined,
                      },
                    })
                  }
                />
                <HelpText>Leave blank for no minimum.</HelpText>
              </div>

              <div className="space-y-1.5">
                <FieldLabel>Age Range (Max)</FieldLabel>
                <input
                  type="number"
                  placeholder="e.g. 65"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-body font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                  value={policyData.eligibility?.maxAge || ""}
                  onChange={(e) =>
                    setPolicyData({
                      ...policyData,
                      eligibility: {
                        ...policyData.eligibility,
                        maxAge: e.target.value ? parseInt(e.target.value) : undefined,
                      },
                    })
                  }
                />
                <HelpText>Leave blank for no maximum.</HelpText>
              </div>

              <div className="space-y-1.5">
                <FieldLabel>Gender</FieldLabel>
                <div className="flex gap-2">
                  {(["all", "male", "female"] as const).map((g) => (
                    <button
                      type="button"
                      key={g}
                      onClick={() =>
                        setPolicyData({
                          ...policyData,
                          eligibility: { ...policyData.eligibility, gender: g },
                        })
                      }
                      className={cn(
                        "flex-1 px-3 py-2 rounded-lg border text-body font-medium transition-all capitalize",
                        policyData.eligibility?.gender === g || (!policyData.eligibility?.gender && g === "all")
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-border/80"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tier eligibility */}
            <div className="mt-5 space-y-1.5">
              <FieldLabel>Eligible Tiers</FieldLabel>
              {(() => {
                const availableTiers = [...new Set(MOCK_EMPLOYEES.map((e) => e.tier).filter(Boolean))] as string[];
                if (availableTiers.length === 0) return (
                  <p className="text-label text-faint italic">No tier data available yet.</p>
                );
                return (
                  <div className="flex flex-wrap gap-2">
                    {availableTiers.map((tier) => {
                      const selected = policyData.eligibility?.tierIds?.includes(tier) ?? false;
                      return (
                        <button
                          type="button"
                          key={tier}
                          onClick={() => {
                            const current = policyData.eligibility?.tierIds ?? [];
                            const updated = selected
                              ? current.filter((id) => id !== tier)
                              : [...current, tier];
                            setPolicyData({
                              ...policyData,
                              eligibility: { ...policyData.eligibility, tierIds: updated },
                            });
                          }}
                          className={cn(
                            "px-3 py-1.5 rounded-lg border text-label font-medium transition-all",
                            selected
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border bg-card text-muted-foreground hover:border-border/80"
                          )}
                        >
                          {tier}
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
              <HelpText>Leave all unchecked to apply to all tiers.</HelpText>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );

  // ── Pool section ──────────────────────────────────────────────────────────
  const renderPoolSection = () => {
    const availableCycles = getAvailableRefreshCycles(policyData.utilisationMode ?? "Fixed", policyData.prorateUnit);

    return (
    <div className="space-y-6">
      <SectionHeader icon={Gear} title="Pool & Cycle" description="Configure fund allocation, refresh intervals, and activation" />

      {/* ── Cover Dependents ── */}
      <div className="space-y-3">
        <FieldLabel>Cover Dependents</FieldLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ChoiceCard
            title="Employee Only"
            description="This policy covers employees only."
            icon={User}
            selected={policyData.coversDependents !== true}
            onSelect={() => setPolicyData({ ...policyData, coversDependents: false, dependentsPoolType: undefined })}
          />
          <ChoiceCard
            title="Cover Dependents"
            description="This policy also covers employee dependents."
            icon={Users}
            selected={policyData.coversDependents === true}
            onSelect={() => setPolicyData({ ...policyData, coversDependents: true })}
          />
        </div>
      </div>

      {/* ── Employee Pool Type ── */}
      <div className="space-y-3">
        <FieldLabel>Employee Pool Type</FieldLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ChoiceCard
            title="Individual"
            description="Each employee gets their own benefit pool."
            icon={User}
            selected={policyData.benefitPoolType === "Individual"}
            onSelect={() => setPolicyData({ ...policyData, benefitPoolType: "Individual" })}
          />
          <ChoiceCard
            title="Shared"
            description="Employees share a common pool of funds."
            icon={Briefcase}
            selected={policyData.benefitPoolType === "Shared"}
            onSelect={() => setPolicyData({ ...policyData, benefitPoolType: "Shared" })}
          />
        </div>
      </div>

      {/* ── Dependents Pool Type ── */}
      {policyData.coversDependents && (
        <div className="space-y-3">
          <FieldLabel required>Dependents Pool Type</FieldLabel>
          {validationErrors.dependentsPoolType && <ErrorText>{validationErrors.dependentsPoolType}</ErrorText>}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

      {/* ── Policy Spending Cap ── */}
      <div className="space-y-1.5">
        <FieldLabel>Policy Spending Cap (RM)</FieldLabel>
        <input
          type="number"
          min={0}
          placeholder="e.g. 3000"
          className="w-full md:w-64 px-4 py-2.5 bg-background border border-border rounded-lg text-body font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all"
          value={policyData.totalCapAmount ?? ""}
          onChange={(e) =>
            setPolicyData({
              ...policyData,
              totalCapAmount: e.target.value === "" ? undefined : parseFloat(e.target.value),
            })
          }
        />
        <HelpText>Optional. Maximum total an employee can claim under this policy per cycle.</HelpText>
      </div>

      {/* ── Separator ── */}
      <div className="border-t border-border/60 pt-6 space-y-6">

      {/* ── Utilisation Mode ── */}
      <div className="space-y-3">
        <FieldLabel>Utilisation Mode</FieldLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ChoiceCard
            title="Fixed Allocation"
            description="Full benefit pool is granted upon assignment."
            icon={Gear}
            selected={policyData.utilisationMode === "Fixed"}
            onSelect={() => setPolicyData({ ...policyData, utilisationMode: "Fixed", prorateUnit: undefined })}
          />
          <ChoiceCard
            title="Prorated Allocation"
            description="Benefit amounts are prorated based on time."
            icon={Gear}
            selected={policyData.utilisationMode === "Prorated"}
            onSelect={() => setPolicyData({ ...policyData, utilisationMode: "Prorated" })}
          />
        </div>
      </div>

      {policyData.utilisationMode === "Prorated" && (
        <div className="space-y-1.5">
          <FieldLabel required>Prorate Unit</FieldLabel>
          <select
            className={cn(
              "w-full px-4 py-2.5 bg-background border rounded-lg text-body font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all",
              validationErrors.prorateUnit ? "border-destructive" : "border-border"
            )}
            value={policyData.prorateUnit || ""}
            onChange={(e) => {
              const newUnit = e.target.value as ProrateUnit;
              // Reset refresh cycle if current selection becomes invalid
              const newAvailable = newUnit ? getAvailableRefreshCycles("Prorated", newUnit) : REFRESH_CYCLES;
              const currentCycle = policyData.refreshCycle;
              const adjustedCycle = currentCycle && newAvailable.includes(currentCycle) ? currentCycle : newAvailable[0];
              setPolicyData({ ...policyData, prorateUnit: newUnit || undefined, refreshCycle: adjustedCycle });
            }}
          >
            <option value="">Select prorate unit...</option>
            {PRORATE_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          {validationErrors.prorateUnit && <ErrorText>{validationErrors.prorateUnit}</ErrorText>}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <FieldLabel>Refresh Cycle</FieldLabel>
          <select
            className={cn(
              "w-full px-4 py-2.5 bg-background border rounded-lg text-body font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all",
              validationErrors.refreshCycle ? "border-destructive" : "border-border"
            )}
            value={policyData.refreshCycle}
            onChange={(e) => setPolicyData({ ...policyData, refreshCycle: e.target.value as RefreshCycle })}
          >
            {availableCycles.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {validationErrors.refreshCycle && <ErrorText>{validationErrors.refreshCycle}</ErrorText>}
        </div>

        <div className="space-y-1.5">
          <FieldLabel>Refresh Start Reference</FieldLabel>
          <div className="space-y-2">
            {(["fy_start", "join_date", "custom_date"] as const).map((ref) => (
              <button
                type="button"
                key={ref}
                onClick={() => setPolicyData({ ...policyData, refreshStartReference: ref })}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg border text-body font-medium transition-all text-left w-full",
                  policyData.refreshStartReference === ref
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-border/80"
                )}
              >
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                    policyData.refreshStartReference === ref ? "border-primary" : "border-border"
                  )}
                >
                  {policyData.refreshStartReference === ref && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <div className="flex flex-col">
                  <span>{ref === "fy_start" ? "Organisation Financial Year" : ref === "join_date" ? "Employee Joining Date" : "Custom Date"}</span>
                  <span className="text-label text-faint font-normal">{ref === "fy_start" ? "Follows the organisation's FY settings" : ref === "join_date" ? "Based on the employee's join date" : "Set a fixed start date"}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {policyData.refreshStartReference === "custom_date" && (
        <div className="space-y-1.5">
          <FieldLabel required>Custom Refresh Date</FieldLabel>
          <input
            type="date"
            className={cn(
              "w-full px-4 py-2.5 bg-background border rounded-lg text-body font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all",
              validationErrors.refreshCustomDate ? "border-destructive" : "border-border"
            )}
            value={policyData.refreshCustomDate || ""}
            onChange={(e) => setPolicyData({ ...policyData, refreshCustomDate: e.target.value })}
          />
          {validationErrors.refreshCustomDate && <ErrorText>{validationErrors.refreshCustomDate}</ErrorText>}
        </div>
      )}

      </div>

      {/* ── Activation Mode ── */}
      <div className="border-t border-border/60 pt-6 space-y-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
            <RocketLaunch size={14} weight="duotone" />
          </div>
          <div>
            <h4 className="text-body font-semibold text-foreground">Activation</h4>
            <p className="text-label text-muted-foreground">When the policy takes effect for new members</p>
          </div>
        </div>

        <div className="space-y-2">
          {ACTIVATION_MODES.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                type="button"
                key={mode.value}
                onClick={() => setPolicyData({ ...policyData, activationMode: mode.value, activationCustomDate: mode.value !== "custom_date" ? undefined : policyData.activationCustomDate })}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg border text-body font-medium transition-all text-left w-full",
                  policyData.activationMode === mode.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-border/80"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                    policyData.activationMode === mode.value ? "border-primary" : "border-border"
                  )}
                >
                  {policyData.activationMode === mode.value && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  )}
                </div>
                <Icon size={18} weight={policyData.activationMode === mode.value ? "fill" : "regular"} className="shrink-0" />
                <div className="flex flex-col">
                  <span>{mode.label}</span>
                  <span className="text-label text-faint font-normal">{mode.description}</span>
                </div>
              </button>
            );
          })}
        </div>

        {policyData.activationMode === "custom_date" && (
          <div className="space-y-1.5 pt-2">
            <FieldLabel required>Custom Activation Date</FieldLabel>
            <input
              type="date"
              className={cn(
                "w-full px-4 py-2.5 bg-background border rounded-lg text-body font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all",
                validationErrors.activationCustomDate ? "border-destructive" : "border-border"
              )}
              value={policyData.activationCustomDate || ""}
              onChange={(e) => setPolicyData({ ...policyData, activationCustomDate: e.target.value })}
            />
            {validationErrors.activationCustomDate && <ErrorText>{validationErrors.activationCustomDate}</ErrorText>}
          </div>
        )}
      </div>
    </div>
    );
  };

  // ── Groups section ────────────────────────────────────────────────────────
  const renderGroupsSection = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <SectionHeader icon={TreeStructure} title="Groups & Benefits" description="Organize benefits into logical groups with budget controls" />
        <Button onClick={addGroup} size="sm" className="rounded-full flex items-center gap-2 text-label h-8 px-4">
          <Plus size={14} weight="bold" />
          Add Group
        </Button>
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-muted/20 rounded-lg border border-dashed border-border text-center">
          <TreeStructure size={36} weight="duotone" className="text-faint mb-3" />
          <p className="text-muted-foreground font-medium text-body">No benefit groups yet.</p>
          <Button variant="ghost" onClick={addGroup} className="mt-2 text-primary font-semibold text-body">
            Create your first group
          </Button>
          {validationErrors.groups && <ErrorText>{validationErrors.groups}</ErrorText>}
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map((group, gIdx) => {
            const groupBenefits = benefits.filter((b) => b.groupId === group.id);
            const groupError = validationErrors[`group_${gIdx}`];
            return (
              <div key={group.id} className="rounded-lg border border-border bg-card overflow-hidden">
                {/* Card header */}
                <div className="flex items-start justify-between gap-3 p-4 border-b border-border">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <TreeStructure size={18} weight="duotone" />
                    </div>
                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        className="text-body font-semibold text-foreground bg-transparent border border-border rounded-md px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-primary/10 w-full"
                        value={group.name}
                        onChange={(e) => updateGroup(group.id, "name", e.target.value)}
                        placeholder="Group Name"
                      />
                      <input
                        className="text-label text-muted-foreground bg-transparent border border-border rounded-md px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-primary/10 w-full"
                        value={group.description || ""}
                        onChange={(e) => updateGroup(group.id, "description", e.target.value)}
                        placeholder="Brief description..."
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeGroup(group.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-faint hover:text-destructive transition-colors shrink-0"
                  >
                    <Trash size={16} />
                  </button>
                </div>

                {/* Card body */}
                <div className="p-4 space-y-4">
                  {/* Distribution + max usage */}
                  <div className="flex items-start gap-6 flex-wrap">
                    <div className="space-y-1.5">
                      <p className="text-label font-medium text-muted-foreground">Distribution</p>
                      <div className="flex p-0.5 bg-muted rounded-lg">
                        {(["SharedAmount", "IndividualBenefitAmount"] as const).map((type) => (
                          <button
                            type="button"
                            key={type}
                            onClick={() => updateGroup(group.id, "distributionType", type)}
                            className={cn(
                              "px-2.5 py-1 text-label font-medium rounded-md transition-all",
                              group.distributionType === type ? "bg-background text-primary shadow-sm" : "text-muted-foreground"
                            )}
                          >
                            {type === "SharedAmount" ? "Shared Pool" : "Individual"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-label font-medium text-muted-foreground">
                        Group Cap (RM)
                        {group.distributionType !== "SharedAmount" && (
                          <span className="text-faint font-normal ml-1">(optional)</span>
                        )}
                      </p>
                      <input
                        type="number"
                        className="w-28 px-2.5 py-1 border border-border bg-background rounded-lg text-label outline-none focus:ring-2 focus:ring-primary/10"
                        value={group.maxUsagePerCycle || ""}
                        onChange={(e) =>
                          updateGroup(group.id, "maxUsagePerCycle", e.target.value === "" ? undefined : parseFloat(e.target.value))
                        }
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Benefits checklist */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-label font-medium text-muted-foreground">Benefits</p>
                      {groupError && <ErrorText>{groupError}</ErrorText>}
                    </div>
                    <div className="divide-y divide-border/50 border border-border/60 rounded-lg overflow-hidden">
                      {SERVICES.map((service) => {
                        const benefit = groupBenefits.find((b) => b.serviceId === service.id);
                        const isChecked = !!benefit;
                        return (
                          <div key={service.id} className={cn("transition-colors", isChecked && "bg-muted/30")}>
                            <div className="flex items-center gap-3 px-4 py-3">
                              <button
                                type="button"
                                onClick={() => toggleService(group.id, service.id)}
                                className={cn(
                                  "w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0",
                                  isChecked ? "bg-primary border-primary text-primary-foreground" : "border-border hover:border-primary/50 bg-background"
                                )}
                              >
                                {isChecked && <Check size={12} weight="bold" />}
                              </button>
                              <span className={cn("text-body font-medium flex-1", isChecked ? "text-foreground" : "text-muted-foreground")}>
                                {service.name}
                              </span>
                              <span className="text-label text-faint">{service.category}</span>
                            </div>

                            {isChecked && (
                              <div className="px-4 pb-4">
                                <div className="flex items-start gap-4 flex-wrap pl-8">
                                  {policyData.coversDependents && (
                                    <div className="flex items-center gap-2 w-full mb-1">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const next = new Set(splitBenefitIds);
                                          const isSplit = next.has(benefit!.id);
                                          if (isSplit) {
                                            next.delete(benefit!.id);
                                            updateBenefit(benefit!.id, "employeeAmount", 0);
                                            updateBenefit(benefit!.id, "dependantAmount", 0);
                                          } else {
                                            next.add(benefit!.id);
                                          }
                                          setSplitBenefitIds(next);
                                        }}
                                        className={cn(
                                          "w-7 h-3.5 rounded-full transition-colors relative shrink-0",
                                          splitBenefitIds.has(benefit!.id) ? "bg-primary" : "bg-muted/50"
                                        )}
                                      >
                                        <div
                                          className={cn(
                                            "w-2.5 h-2.5 rounded-full bg-background absolute top-[2px] transition-all",
                                            splitBenefitIds.has(benefit!.id) ? "right-0.5" : "left-0.5"
                                          )}
                                        />
                                      </button>
                                      <span className="text-micro text-faint font-medium">Split employee / dependant amounts</span>
                                    </div>
                                  )}

                                  {splitBenefitIds.has(benefit!.id) ? (
                                    <>
                                      <div className="space-y-1.5">
                                        <label className="text-micro font-medium text-faint">Employee (RM)</label>
                                        <input
                                          type="number"
                                          className="w-24 px-2 py-1.5 bg-background border border-border rounded-lg text-label font-mono outline-none text-right"
                                          value={benefit!.employeeAmount || ""}
                                          onChange={(e) => {
                                            const emp = e.target.value === "" ? 0 : parseFloat(e.target.value);
                                            const dep = benefit!.dependantAmount ?? 0;
                                            updateBenefit(benefit!.id, "employeeAmount", emp);
                                            updateBenefit(benefit!.id, "amount", emp + dep);
                                          }}
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <label className="text-micro font-medium text-faint">Dependant (RM)</label>
                                        <input
                                          type="number"
                                          className="w-24 px-2 py-1.5 bg-background border border-border rounded-lg text-label font-mono outline-none text-right"
                                          value={benefit!.dependantAmount || ""}
                                          onChange={(e) => {
                                            const dep = e.target.value === "" ? 0 : parseFloat(e.target.value);
                                            const emp = benefit!.employeeAmount ?? 0;
                                            updateBenefit(benefit!.id, "dependantAmount", dep);
                                            updateBenefit(benefit!.id, "amount", emp + dep);
                                          }}
                                        />
                                      </div>
                                      <div className="space-y-1.5 self-end pb-1.5">
                                        <span className="text-micro text-faint font-medium">
                                          Total: RM {((benefit!.employeeAmount ?? 0) + (benefit!.dependantAmount ?? 0)).toLocaleString()}
                                        </span>
                                      </div>
                                    </>
                                  ) : (
                                  <div className="space-y-1.5">
                                    <label className="text-micro font-medium text-faint">Amount (RM)</label>
                                    <input
                                      type="number"
                                      className={cn(
                                        "w-24 px-2 py-1.5 bg-background border rounded-lg text-label font-mono outline-none text-right",
                                        validationErrors[`benefit_${group.id}_${service.id}`] ? "border-destructive" : "border-border"
                                      )}
                                      value={benefit!.amount || ""}
                                      onChange={(e) =>
                                        updateBenefit(benefit!.id, "amount", e.target.value === "" ? 0 : parseFloat(e.target.value))
                                      }
                                    />
                                    {validationErrors[`benefit_${group.id}_${service.id}`] && (
                                      <ErrorText>{validationErrors[`benefit_${group.id}_${service.id}`]}</ErrorText>
                                    )}
                                  </div>
                                  )}

                                  <div className="space-y-1.5">
                                    <label className="text-micro font-medium text-faint">Co-payment</label>
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => updateBenefit(benefit!.id, "coPayment.required", !benefit!.coPayment.required)}
                                        className={cn(
                                          "w-8 h-4 rounded-full transition-colors relative shrink-0",
                                          benefit!.coPayment.required ? "bg-primary" : "bg-muted/50"
                                        )}
                                      >
                                        <div
                                          className={cn(
                                            "w-3 h-3 rounded-full bg-background absolute top-[2px] transition-all",
                                            benefit!.coPayment.required ? "right-0.5" : "left-0.5"
                                          )}
                                        />
                                      </button>
                                      {benefit!.coPayment.required && (
                                        <div className="flex items-center gap-1.5">
                                          <select
                                            className="px-1.5 py-1.5 bg-background border border-border rounded text-label outline-none"
                                            value={benefit!.coPayment.type}
                                            onChange={(e) => updateBenefit(benefit!.id, "coPayment.type", e.target.value)}
                                          >
                                            <option value="Percentage">%</option>
                                            <option value="Fixed">RM</option>
                                          </select>
                                          <input
                                            type="number"
                                            className={cn(
                                              "w-16 px-2 py-1.5 bg-background border rounded-lg text-label font-mono outline-none text-right",
                                              validationErrors[`copay_${group.id}_${service.id}`] ? "border-destructive" : "border-border"
                                            )}
                                            value={benefit!.coPayment.value || ""}
                                            onChange={(e) =>
                                              updateBenefit(benefit!.id, "coPayment.value", e.target.value === "" ? 0 : parseFloat(e.target.value))
                                            }
                                          />
                                        </div>
                                      )}
                                    </div>
                                    {validationErrors[`copay_${group.id}_${service.id}`] && (
                                      <ErrorText>{validationErrors[`copay_${group.id}_${service.id}`]}</ErrorText>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <form
      id="policyWizardForm"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="space-y-8"
    >
      {/* Policy Details */}
      <section id="policy-details" className="scroll-mt-32">
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">{renderPolicyDetailsSection()}</div>
        </div>
      </section>

      {/* Pool & Cycle */}
      <section id="pool-cycle" className="scroll-mt-32">
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">{renderPoolSection()}</div>
        </div>
      </section>

      {/* Groups & Services */}
      <section id="groups-services" className="scroll-mt-32">
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">{renderGroupsSection()}</div>
        </div>
      </section>

      {/* Review step is handled by the parent in create mode; edit mode renders everything inline */}
    </form>
  );
}
