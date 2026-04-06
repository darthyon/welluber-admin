"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ShieldCheck,
  CaretLeft,
  CaretRight,
  IdentificationCard,
  Quotes,
  Users,
  Briefcase,
  Gear,
  TreeStructure,
  Plus,
  Trash,
  NotePencil,
  CheckCircle,
  XCircle,
  EyeSlash,
  CaretDown,
  Receipt,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ChoiceCard } from "@/components/shared/choice-card";
import { DetailSection } from "@/components/shared/detail-section";
import { SuccessCelebration } from "@/components/shared/success-celebration";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { BenefitPolicy, BenefitGroup, Benefit, PolicyStatus, DistributionType } from "@/types/policy";
import { UtilisationClaimsTable, type EmployeeUtilisationRow } from "@/components/shared/utilisation-claims-table";

// ─── Constants ───────────────────────────────────────────────────────────────

const CONTENT_TABS = [
  { id: 1, title: "Benefit Policy Details" },
  { id: 2, title: "Benefit Pool & Cycle" },
  { id: 3, title: "Benefit Groups" },
  { id: 4, title: "Utilisation & Claims", viewOnly: true },
];

const CREATE_STEPS = [
  { id: 1, title: "Benefit Policy Details" },
  { id: 2, title: "Benefit Pool & Cycle" },
  { id: 3, title: "Benefit Groups" },
  { id: 4, title: "Review" },
];

const EMPLOYMENT_TYPES = [
  { id: "full-time", title: "Full-time", description: "Standard permanent role" },
  { id: "part-time", title: "Part-time", description: "Standard part-time role" },
  { id: "contract", title: "Contract", description: "Fixed-term engagement" },
  { id: "internship", title: "Internship", description: "Temporary role" },
];

const ROLES = [
  { id: "executive", title: "Executive", description: "CXO, VPs, Directors" },
  { id: "management", title: "Management", description: "Heads, Managers, Leads" },
  { id: "staff", title: "Staff", description: "Senior and Junior associates" },
];

const SERVICES = [
  { id: "s1", category: "Physical Wellbeing", name: "Gymnasium Facilities", subServices: ["Standard Gym Access", "Boutique Studio Memberships"] },
  { id: "s2", category: "Physical Wellbeing", name: "Group Fitness", subServices: ["Yoga", "Pilates", "Indoor Cycling", "Zumba"] },
  { id: "s3", category: "Psychological Wellbeing", name: "Clinical Therapy", subServices: ["Psychotherapy", "CBT", "Psychiatric Care"] },
  { id: "s4", category: "Psychological Wellbeing", name: "Mental Fitness", subServices: ["Meditation Apps", "Mindfulness Workshops"] },
  { id: "s5", category: "Nutritional Support", name: "Dietary Counseling", subServices: ["Dietitian Consultations", "Diabetic Management"] },
  { id: "s6", category: "Personal Care", name: "Therapeutic Spa Services", subServices: ["Relaxation Massage", "Hydrotherapy"] },
];

const STATUS_CONFIG: Record<PolicyStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  Draft: { label: "Draft", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: NotePencil },
  Published: { label: "Published", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle },
  Unlisted: { label: "Unlisted", color: "text-zinc-500", bg: "bg-zinc-50 border-zinc-200", icon: EyeSlash },
  Deactivated: { label: "Deactivated", color: "text-rose-600", bg: "bg-rose-50 border-rose-200", icon: XCircle },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ReadField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">{label}</p>
      <p className="text-[14px] font-medium text-zinc-800">{value || <span className="text-zinc-300 italic">—</span>}</p>
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
          "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[12px] font-bold transition-all",
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
            className="absolute top-full mt-2 right-0 z-50 bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden min-w-[160px]"
          >
            {(Object.keys(STATUS_CONFIG) as PolicyStatus[]).map((s) => {
              const c = STATUS_CONFIG[s];
              const SI = c.icon;
              return (
                <button
                  key={s}
                  onClick={() => { onChange(s); setOpen(false); }}
                  className={cn(
                    "flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] font-semibold hover:bg-zinc-50 transition-colors text-left",
                    c.color,
                    s === value && "bg-zinc-50"
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
  onSuccess: (data: { policy: Partial<BenefitPolicy>; groups: BenefitGroup[]; benefits: Benefit[] }) => void;
  onSaveDraft?: (data: { policy: Partial<BenefitPolicy>; groups: BenefitGroup[]; benefits: Benefit[] }) => void;
  onEdit?: () => void;
  mode?: "create" | "edit" | "view";
  initialData?: {
    policy: Partial<BenefitPolicy>;
    groups: BenefitGroup[];
    benefits: Benefit[];
  };
}

export function BenefitPolicyWizard({ onCancel, onSuccess, onSaveDraft, onEdit, mode = "create", initialData }: BenefitPolicyWizardProps) {
  const isViewMode = mode === "view";

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [policyData, setPolicyData] = useState<Partial<BenefitPolicy>>(initialData?.policy || {
    code: "",
    name: "",
    description: "",
    eligibility: { roles: [], employeeTypes: ["full-time"] },
    benefitPoolType: { employee: "Individual", dependents: "None" },
    utilisationMode: "Fixed",
    refreshCycle: "Yearly",
    refreshStartReference: "OrgFY",
    activationMode: "JoinDate",
    status: "Draft",
  });

  const [groups, setGroups] = useState<BenefitGroup[]>(initialData?.groups || []);
  const [benefits, setBenefits] = useState<Benefit[]>(initialData?.benefits || []);

  useEffect(() => {
    if (initialData) {
      setPolicyData(initialData.policy);
      setGroups(initialData.groups);
      setBenefits(initialData.benefits);
    }
  }, [initialData]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const toggleEligibility = (type: "roles" | "employeeTypes", id: string) => {
    setPolicyData(prev => {
      const current = prev.eligibility?.[type] || [];
      return {
        ...prev,
        eligibility: {
          ...prev.eligibility!,
          [type]: current.includes(id) ? current.filter(x => x !== id) : [...current, id],
        },
      };
    });
  };

  const addGroup = useCallback(() => {
    const newGroup: BenefitGroup = {
      id: `ben-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      policyId: policyData.id || "temp",
      name: "New Benefit Group",
      description: "",
      distributionType: "IndividualBenefitAmount",
    };
    setGroups([...groups, newGroup]);
  }, [groups, policyData.id]);

  const removeGroup = (groupId: string) => {
    setGroups(groups.filter(g => g.id !== groupId));
    setBenefits(benefits.filter(b => b.groupId !== groupId));
  };

  const updateGroup = (groupId: string, field: keyof BenefitGroup, value: string | number | DistributionType) => {
    setGroups(groups.map(g => g.id === groupId ? { ...g, [field]: value } : g));
  };

  const addBenefit = useCallback((groupId: string) => {
    setBenefits([...benefits, {
      id: `ben-svc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      groupId,
      serviceId: SERVICES[0].id,
      amount: 0,
      coPayment: { required: false, type: "Percentage", value: 0 },
    }]);
  }, [benefits]);

  const updateBenefit = (benefitId: string, field: string, value: string | number | boolean) => {
    setBenefits(benefits.map(b => {
      if (b.id !== benefitId) return b;
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        if (parent === "coPayment") {
          return { 
            ...b, 
            coPayment: { ...b.coPayment, [child]: value } 
          } as Benefit;
        }
        return { ...b, [parent]: { ...(b as any)[parent], [child]: value } };
      }
      return { ...b, [field]: value };
    }));
  };

  const removeBenefit = (benefitId: string) => {
    setBenefits(benefits.filter(b => b.id !== benefitId));
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSuccess(true);
    setTimeout(() => onSuccess({ policy: policyData, groups, benefits }), 2000);
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

  const renderIdentityStep = () => {
    if (isViewMode) {
      const empTypeLabels = EMPLOYMENT_TYPES.filter(t => policyData.eligibility?.employeeTypes.includes(t.id)).map(t => t.title);
      const roleLabels = ROLES.filter(r => policyData.eligibility?.roles.includes(r.id)).map(r => r.title);
      return (
        <div className="space-y-8 animate-in fade-in duration-300">
          <DetailSection title="Policy Identity" icon={<IdentificationCard size={18} weight="duotone" />} description="Primary administrative details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-1">
              <ReadField label="Policy Name" value={policyData.name} />
              <ReadField label="Policy Code" value={policyData.code} />
              <div className="md:col-span-2">
                <ReadField label="Description" value={policyData.description} />
              </div>
            </div>
          </DetailSection>

          <DetailSection title="Target Audience (Eligibility)" icon={<Users size={18} weight="duotone" />} description="Who this policy applies to">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-1">
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Employment Types</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {empTypeLabels.length > 0 ? empTypeLabels.map(t => (
                    <span key={t} className="px-2.5 py-1 bg-primary/5 border border-primary/20 text-primary text-[12px] font-bold rounded-full">{t}</span>
                  )) : <span className="text-zinc-300 italic text-[13px]">None selected</span>}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Eligible Roles</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {roleLabels.length > 0 ? roleLabels.map(r => (
                    <span key={r} className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-600 text-[12px] font-bold rounded-full">{r}</span>
                  )) : <span className="text-zinc-300 italic text-[13px]">None selected</span>}
                </div>
              </div>
            </div>
          </DetailSection>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <DetailSection title="Policy Identity" icon={<IdentificationCard size={18} weight="duotone" />} description="Primary administrative details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                Policy Name <span className="text-rose-500">*</span>
              </label>
              <input
                placeholder="e.g. Wellness Premium 2026"
                className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-[14px] outline-none transition-all font-medium text-zinc-700 focus:ring-2 focus:ring-primary/10 focus:border-primary/30"
                value={policyData.name}
                onChange={(e) => setPolicyData({ ...policyData, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                Policy Code <span className="text-rose-500">*</span>
              </label>
              <input
                placeholder="e.g. BEN-W-01"
                className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-[14px] outline-none transition-all font-medium font-mono text-zinc-800 focus:ring-2 focus:ring-primary/10 focus:border-primary/30"
                value={policyData.code}
                onChange={(e) => setPolicyData({ ...policyData, code: e.target.value })}
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Description</label>
              <div className="relative">
                <Quotes size={16} className="absolute left-3 top-3 text-zinc-300" />
                <textarea
                  placeholder="What makes this policy unique?"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-[14px] outline-none transition-all font-medium text-zinc-700 min-h-[100px] resize-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30"
                  value={policyData.description}
                  onChange={(e) => setPolicyData({ ...policyData, description: e.target.value })}
                />
              </div>
            </div>
          </div>
        </DetailSection>

        <DetailSection title="Target Audience (Eligibility)" icon={<Users size={18} weight="duotone" />} description="Define who can be assigned to this policy">
          <div className="space-y-8 p-1">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Briefcase size={16} className="text-primary" />
                <span className="text-[13px] font-bold text-zinc-700">Employment Types</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {EMPLOYMENT_TYPES.map((type) => (
                  <ChoiceCard
                    key={type.id}
                    title={type.title}
                    description={type.description}
                    icon={Briefcase}
                    selected={policyData.eligibility?.employeeTypes.includes(type.id) || false}
                    onSelect={() => toggleEligibility("employeeTypes", type.id)}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <IdentificationCard size={16} className="text-primary" />
                <span className="text-[13px] font-bold text-zinc-700">Eligible Roles</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {ROLES.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => toggleEligibility("roles", role.id)}
                    className={cn(
                      "flex flex-col items-start px-4 py-3 rounded-xl border text-left transition-all",
                      policyData.eligibility?.roles.includes(role.id)
                        ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                        : "border-zinc-200 bg-white hover:border-zinc-300"
                    )}
                  >
                    <span className={cn("text-[14px] font-bold", policyData.eligibility?.roles.includes(role.id) ? "text-primary" : "text-zinc-700")}>{role.title}</span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">{role.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DetailSection>
      </div>
    );
  };

  const renderPoolStep = () => {
    if (isViewMode) {
      const refreshLabels: Record<string, string> = {
        OrgFY: "Organisation Financial Year",
        JoinDate: "Employee Join Date",
        CustomDate: "Custom Start Date",
      };
      const activationLabels: Record<string, string> = {
        JoinDate: "Immediately after joining",
        ProbationEnds: "After probation period ends",
        CustomDate: "Set specific activation date",
      };
      return (
        <div className="space-y-8 animate-in fade-in duration-300">
          <DetailSection title="Benefit Pool Strategy" icon={<Gear size={18} weight="duotone" />} description="Fund allocation configuration">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-1">
              <ReadField label="Employee Pool Type" value={policyData.benefitPoolType?.employee} />
              <ReadField label="Dependent Pool Type" value={policyData.benefitPoolType?.dependents} />
              <ReadField label="Utilisation Mode" value={policyData.utilisationMode === "Fixed" ? "Fixed Allocation" : "Prorated Allocation"} />
            </div>
          </DetailSection>
          <DetailSection title="Cycle & Lifecycle" icon={<Gear size={18} weight="duotone" />} description="Refresh intervals and activation">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-1">
              <ReadField label="Refresh Cycle" value={policyData.refreshCycle} />
              <ReadField label="Refresh Start Reference" value={refreshLabels[policyData.refreshStartReference || ""] || policyData.refreshStartReference} />
              <ReadField label="Activation Mode" value={activationLabels[policyData.activationMode || ""] || policyData.activationMode} />
            </div>
          </DetailSection>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <DetailSection title="Benefit Pool Strategy" icon={<Gear size={18} weight="duotone" />} description="Choose how funds are allocated across the workforce">
          <div className="space-y-8 p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Employee Pool Type</label>
                <div className="flex gap-2 p-1 bg-zinc-100 rounded-xl">
                  {(["Individual", "Shared"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setPolicyData({ ...policyData, benefitPoolType: { ...policyData.benefitPoolType!, employee: type } })}
                      className={cn("flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all", policyData.benefitPoolType?.employee === type ? "bg-white text-primary shadow-sm" : "text-zinc-500 hover:text-zinc-800")}
                    >{type}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Dependent Pool Type</label>
                <div className="flex gap-2 p-1 bg-zinc-100 rounded-xl">
                  {(["None", "Individual", "Shared"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setPolicyData({ ...policyData, benefitPoolType: { ...policyData.benefitPoolType!, dependents: type } })}
                      className={cn("flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all", policyData.benefitPoolType?.dependents === type ? "bg-white text-primary shadow-sm" : "text-zinc-500 hover:text-zinc-800")}
                    >{type}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Utilisation Mode</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ChoiceCard title="Fixed Allocation" description="Full benefit amounts granted upfront upon assignment." icon={Gear} selected={policyData.utilisationMode === "Fixed"} onSelect={() => setPolicyData({ ...policyData, utilisationMode: "Fixed" })} />
                <ChoiceCard title="Prorated Allocation" description="Benefit amounts calculated based on join date/time." icon={Gear} selected={policyData.utilisationMode === "Prorated"} onSelect={() => setPolicyData({ ...policyData, utilisationMode: "Prorated" })} />
              </div>
            </div>
          </div>
        </DetailSection>

        <DetailSection title="Cycle & Lifecycle" icon={<Gear size={18} weight="duotone" />} description="Refresh intervals and activation triggers">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Refresh Cycle</label>
              <select
                className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-[14px] font-medium outline-none focus:ring-2 focus:ring-primary/10"
                value={policyData.refreshCycle}
                onChange={(e) => setPolicyData({ ...policyData, refreshCycle: e.target.value as any })}
              >
                {["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Refresh Start Reference</label>
              <select
                className="w-full px-4 py-2 bg-white border border-zinc-200 rounded-xl text-[14px] font-medium outline-none focus:ring-2 focus:ring-primary/10"
                value={policyData.refreshStartReference}
                onChange={(e) => setPolicyData({ ...policyData, refreshStartReference: e.target.value as any })}
              >
                <option value="OrgFY">Organisation Financial Year</option>
                <option value="JoinDate">Employee Joining Date</option>
                <option value="CustomDate">Custom Start Date</option>
              </select>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Activation Mode</label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {(["JoinDate", "ProbationEnds", "CustomDate"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setPolicyData({ ...policyData, activationMode: m })}
                    className={cn("flex items-center gap-3 px-4 py-2.5 rounded-xl border text-[13px] font-medium transition-all text-left", policyData.activationMode === m ? "border-primary bg-primary/5 text-primary" : "border-zinc-100 bg-white text-zinc-600 hover:border-zinc-200")}
                  >
                    <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center shrink-0", policyData.activationMode === m ? "border-primary" : "border-zinc-200")}>
                      {policyData.activationMode === m && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    {m === "JoinDate" ? "Immediately after joining" : m === "ProbationEnds" ? "After probation period ends" : "Set specific activation date"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DetailSection>
      </div>
    );
  };

  const renderStructureStep = () => (
    <DetailSection
      title="Benefit Groups"
      icon={<TreeStructure size={18} weight="duotone" />}
      description="Organize services into logical groups with budget controls"
      action={
        !isViewMode ? (
          <Button onClick={addGroup} size="sm" className="rounded-full flex items-center gap-2 text-[12px] h-8 px-4">
            <Plus size={14} weight="bold" />
            Add Group
          </Button>
        ) : undefined
      }
    >
      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-zinc-50 rounded-xl border border-dashed border-zinc-200 text-center">
          <TreeStructure size={36} weight="duotone" className="text-zinc-300 mb-3 mx-auto" />
          <p className="text-zinc-500 font-medium text-[13px]">{isViewMode ? "No benefit groups configured." : "No benefit groups yet."}</p>
          {!isViewMode && (
            <Button variant="ghost" onClick={addGroup} className="mt-2 text-primary font-bold text-[13px]">
              Create your first group
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
          {groups.map((group) => (
            <div key={group.id} className="rounded-2xl border border-zinc-200 bg-white overflow-hidden animate-in fade-in zoom-in-95 duration-300">
              {/* Card header */}
              <div className="flex items-start justify-between gap-3 p-4 border-b border-zinc-100">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <TreeStructure size={18} weight="duotone" />
                  </div>
                  {isViewMode ? (
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold text-zinc-900 truncate">{group.name}</p>
                      {group.description && <p className="text-[12px] text-zinc-500 truncate">{group.description}</p>}
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <input
                        className="text-[14px] font-bold text-zinc-900 bg-transparent border-none p-0 outline-none w-full focus:ring-0 truncate"
                        value={group.name}
                        onChange={(e) => updateGroup(group.id, "name", e.target.value)}
                        placeholder="Group Name"
                      />
                      <input
                        className="text-[12px] text-zinc-500 bg-transparent border-none p-0 outline-none w-full focus:ring-0"
                        value={group.description}
                        onChange={(e) => updateGroup(group.id, "description", e.target.value)}
                        placeholder="Brief description..."
                      />
                    </div>
                  )}
                </div>
                {!isViewMode && (
                  <button onClick={() => removeGroup(group.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-300 hover:text-rose-500 transition-colors shrink-0">
                    <Trash size={16} />
                  </button>
                )}
              </div>

              {/* Card body */}
              <div className="p-4 space-y-4">
                {/* Distribution type + max usage */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Distribution</p>
                    {isViewMode ? (
                      <p className="text-[12px] font-semibold text-zinc-700">{group.distributionType === "SharedAmount" ? "Shared Pool" : "Individual Per Service"}</p>
                    ) : (
                      <div className="flex p-0.5 bg-zinc-100 rounded-lg">
                        {(["SharedAmount", "IndividualBenefitAmount"] as const).map((type) => (
                          <button key={type} onClick={() => updateGroup(group.id, "distributionType", type)}
                            className={cn("px-2.5 py-1 text-[10px] font-bold rounded-md transition-all", group.distributionType === type ? "bg-white text-primary shadow-sm" : "text-zinc-500")}
                          >
                            {type === "SharedAmount" ? "Shared Pool" : "Individual"}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {group.distributionType === "SharedAmount" && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Max Usage</p>
                      {isViewMode ? (
                        <p className="text-[12px] font-semibold text-zinc-700">{group.maxUsagePerCycle ? `RM ${group.maxUsagePerCycle.toFixed(2)}` : "—"}</p>
                      ) : (
                        <input type="number" className="w-28 px-2.5 py-1 border border-zinc-200 rounded-lg text-[12px] outline-none focus:ring-2 focus:ring-primary/10" value={group.maxUsagePerCycle} onChange={(e) => updateGroup(group.id, "maxUsagePerCycle", parseFloat(e.target.value))} placeholder="0.00" />
                      )}
                    </div>
                  )}
                </div>

                {/* Services */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Services</p>
                  <div className="space-y-1.5">
                    {benefits.filter(b => b.groupId === group.id).map((benefit) => (
                      <div key={benefit.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-100">
                        <div className="flex-1 min-w-0">
                          {isViewMode ? (
                            <p className="text-[12px] font-semibold text-zinc-700 truncate">{SERVICES.find(s => s.id === benefit.serviceId)?.name}</p>
                          ) : (
                            <select className="w-full bg-transparent border-none p-0 text-[12px] font-semibold text-zinc-700 outline-none" value={benefit.serviceId} onChange={(e) => updateBenefit(benefit.id, "serviceId", e.target.value)}>
                              {SERVICES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {isViewMode ? (
                            <span className="text-[12px] font-bold text-zinc-800 font-mono">RM {benefit.amount.toFixed(2)}</span>
                          ) : (
                            <input type="number" className="w-20 px-2 py-1 bg-white border border-zinc-200 rounded-lg text-[11px] font-mono outline-none text-right" value={benefit.amount} onChange={(e) => updateBenefit(benefit.id, "amount", parseFloat(e.target.value))} />
                          )}
                          {isViewMode ? (
                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", benefit.coPayment.required ? "bg-primary/10 text-primary" : "bg-zinc-100 text-zinc-400")}>
                              {benefit.coPayment.required ? "Co-pay" : "No co-pay"}
                            </span>
                          ) : (
                            <button onClick={() => updateBenefit(benefit.id, "coPayment.required", !benefit.coPayment.required)} className={cn("w-8 h-4 rounded-full transition-colors relative shrink-0", benefit.coPayment.required ? "bg-primary" : "bg-zinc-200")}>
                              <div className={cn("w-3 h-3 rounded-full bg-white absolute top-[2px] transition-all", benefit.coPayment.required ? "right-0.5" : "left-0.5")} />
                            </button>
                          )}
                          {!isViewMode && (
                            <button onClick={() => removeBenefit(benefit.id)} className="text-zinc-300 hover:text-rose-500 transition-colors">
                              <Trash size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {!isViewMode && (
                    <button onClick={() => addBenefit(group.id)} className="w-full h-8 border-dashed border-2 border-zinc-200 rounded-xl text-[11px] font-bold text-zinc-400 hover:border-primary/40 hover:text-primary transition-all flex items-center justify-center gap-1.5">
                      <Plus size={12} />
                      Add Service
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DetailSection>
  );

  const renderReviewStep = () => (
    <div className="space-y-8">
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
          <ShieldCheck size={32} weight="duotone" />
        </div>
        <h3 className="text-2xl font-bold text-zinc-900">Review & Launch Policy</h3>
        <p className="text-zinc-500 mt-1">Ensure all details are correct before activating the policy.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="p-5 rounded-2xl border border-zinc-100 bg-zinc-50/50 space-y-4">
            <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">General Info</h4>
            <div className="space-y-3">
              {[
                { label: "Code", value: policyData.code },
                { label: "Refresh", value: policyData.refreshCycle },
                { label: "Mode", value: policyData.utilisationMode },
                { label: "Status", value: policyData.status },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center text-[13px]">
                  <span className="text-zinc-500">{label}</span>
                  <span className="font-bold text-zinc-900 font-mono">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="md:col-span-2 space-y-4">
          <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Structure Summary</h4>
          {groups.map(group => (
            <div key={group.id} className="p-4 rounded-xl border border-zinc-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <TreeStructure size={16} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-zinc-900">{group.name}</p>
                  <p className="text-[11px] text-zinc-400">{benefits.filter(b => b.groupId === group.id).length} services</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[14px] font-bold text-primary">{group.distributionType === "SharedAmount" ? `RM ${group.maxUsagePerCycle?.toFixed(2)}` : "Individual Caps"}</p>
                <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-tighter">Budget Model</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Main Render ────────────────────────────────────────────────────────────

  // ── Status section renderer (used in content area for edit/view) ──────────
  const renderStatusSection = () => (
    <div className="mt-12 pt-8 border-t border-zinc-100">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-[13px] font-bold text-zinc-900">Policy Status</h4>
          <p className="text-[12px] text-zinc-400 mt-0.5">Control the visibility and lifecycle state of this policy.</p>
        </div>
        <StatusPicker
          value={(policyData.status as PolicyStatus) || "Draft"}
          onChange={(s) => setPolicyData({ ...policyData, status: s })}
          disabled={isViewMode}
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Sticky header + nav */}
      <div className="bg-white sticky top-0 z-10 border-b border-zinc-200">
        {/* Title + actions row */}
        <div className="flex items-center justify-between py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={onCancel}
              className="w-10 h-10 rounded-xl border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-colors shadow-sm"
            >
              <CaretLeft size={20} weight="bold" />
            </button>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900">
              {isViewMode ? "View Benefit Policy" : mode === "edit" ? "Edit Benefit Policy" : "Create Benefit Policy"}
            </h2>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {isViewMode ? (
              onEdit && (
                <Button
                  onClick={onEdit}
                  className="rounded-full px-6 flex items-center gap-2 bg-primary text-white shadow-sm shadow-primary/20"
                >
                  <NotePencil size={16} weight="bold" />
                  Edit Policy
                </Button>
              )
            ) : (
              <>
                <button
                  onClick={() => onSaveDraft?.({ policy: policyData, groups, benefits })}
                  className="text-zinc-500 font-medium text-[14px] px-4 py-2 rounded-full hover:bg-zinc-100 transition-colors"
                >
                  Save as Draft
                </button>
                {mode === "create" && currentStep > 1 && (
                  <Button variant="outline" onClick={prevStep} className="rounded-full px-6">Back</Button>
                )}
                {mode === "create" && currentStep < 4 ? (
                  <Button
                    onClick={nextStep}
                    disabled={currentStep === 1 && (!policyData.name || !policyData.code)}
                    className="rounded-full px-8 bg-primary text-white shadow-sm shadow-primary/20"
                  >
                    Next Step
                    <CaretRight size={16} weight="bold" className="ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="rounded-full px-8 bg-primary text-white shadow-sm shadow-primary/20 min-w-[140px]"
                  >
                    {isSubmitting ? "Finalizing..." : mode === "edit" ? "Save Changes" : "Launch Policy"}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>


        {/* Underline tabs — view & edit; hide tab 4 in edit */}
        {(isViewMode || mode === "edit") && (
          <div className="flex">
            {CONTENT_TABS.filter(t => !t.viewOnly || isViewMode).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentStep(tab.id)}
                className={cn(
                  "px-5 py-3 text-[13px] font-semibold transition-all border-b-2 -mb-px",
                  currentStep === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-200"
                )}
              >
                {tab.title}
              </button>
            ))}
          </div>
        )}

        {/* Numbered stepper — create only */}
        {mode === "create" && (
          <div className="flex items-center gap-2 pb-4">
            {CREATE_STEPS.map((step) => (
              <div
                key={step.id}
                className={cn("flex items-center gap-1.5 transition-all text-[12px]", currentStep === step.id ? "opacity-100" : "opacity-35")}
              >
                <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold", currentStep === step.id ? "bg-primary text-white" : "bg-zinc-200 text-zinc-600")}>{step.id}</div>
                <span className="font-medium hidden sm:inline">{step.title}</span>
                {step.id < 4 && <div className="w-4 h-[1px] bg-zinc-200 ml-1" />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-1 pt-8">
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
                {renderIdentityStep()}
                {(isViewMode || mode === "edit") && renderStatusSection()}
              </>
            )}
            {currentStep === 2 && renderPoolStep()}
            {currentStep === 3 && renderStructureStep()}
            {currentStep === 4 && mode === "create" && renderReviewStep()}
            {currentStep === 4 && isViewMode && (
              <DetailSection
                title="Utilisation & Claims"
                icon={<Receipt size={18} weight="duotone" />}
                description="Benefit usage and claim history for all employees on this policy"
              >
                <UtilisationClaimsTable data={MOCK_UTILISATION} />
              </DetailSection>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Mock utilisation data (replace with API) ─────────────────────────────────

const MOCK_UTILISATION: EmployeeUtilisationRow[] = [
  {
    id: "emp_1", name: "Robert Fox", empCode: "ACM-001", branch: "ACME HQ",
    allocated: 2500, used: 1200,
    claims: [
      { id: "c1", voucherCode: "VCH-2024-0081", service: "Gymnasium Facilities", provider: "Celebrity Fitness KLCC", location: "Kuala Lumpur", date: "12 Mar 2024", amount: 180, status: "Approved" },
      { id: "c2", voucherCode: "VCH-2024-0114", service: "Clinical Therapy",     provider: "Mind & Soul Clinic",   location: "Mont Kiara",   date: "20 Mar 2024", amount: 320, status: "Approved" },
      { id: "c3", voucherCode: "VCH-2024-0198", service: "Group Fitness",        provider: "Ritual Yoga Studio",   location: "Bangsar",       date: "01 Apr 2024", amount: 95,  status: "Pending"  },
      { id: "c4", voucherCode: "VCH-2024-0211", service: "Dietary Counseling",   provider: "NutriCare Clinic",     location: "Damansara",     date: "05 Apr 2024", amount: 605, status: "Approved" },
    ],
  },
  {
    id: "emp_2", name: "Jenny Wilson", empCode: "ACM-042", branch: "ACME Subang Jaya",
    allocated: 2500, used: 2125,
    claims: [
      { id: "c5", voucherCode: "VCH-2024-0033", service: "Gymnasium Facilities", provider: "Fitness First Subang",   location: "Subang Jaya", date: "03 Jan 2024", amount: 200, status: "Approved" },
      { id: "c6", voucherCode: "VCH-2024-0057", service: "Therapeutic Spa",      provider: "Hammam Spa & Wellness", location: "Shah Alam",   date: "18 Feb 2024", amount: 380, status: "Approved" },
      { id: "c7", voucherCode: "VCH-2024-0089", service: "Mental Fitness",        provider: "Calm Studio KL",        location: "Subang Jaya", date: "10 Mar 2024", amount: 145, status: "Approved" },
      { id: "c8", voucherCode: "VCH-2024-0132", service: "Group Fitness",         provider: "Barry's Bootcamp",      location: "TTDI",        date: "22 Mar 2024", amount: 200, status: "Rejected" },
      { id: "c9", voucherCode: "VCH-2024-0201", service: "Clinical Therapy",      provider: "Therapy Works PJ",      location: "Petaling Jaya", date: "08 Apr 2024", amount: 400, status: "Approved" },
      { id: "c10", voucherCode: "VCH-2024-0215", service: "Dietary Counseling",   provider: "NutriCare Clinic",      location: "Subang Jaya", date: "10 Apr 2024", amount: 800, status: "Pending" },
    ],
  },
  {
    id: "emp_3", name: "Dianne Russell", empCode: "ACM-156", branch: "ACME HQ",
    allocated: 2500, used: 375,
    claims: [
      { id: "c11", voucherCode: "VCH-2024-0177", service: "Therapeutic Spa", provider: "Relaxe Spa KL", location: "KLCC", date: "15 Mar 2024", amount: 250, status: "Approved" },
      { id: "c12", voucherCode: "VCH-2024-0190", service: "Group Fitness",   provider: "TRX Studio KL", location: "Bukit Bintang", date: "28 Mar 2024", amount: 125, status: "Pending" },
    ],
  },
  {
    id: "emp_4", name: "Marvin McKinney", empCode: "ACM-089", branch: "ACME Subang Jaya",
    allocated: 2500, used: 300,
    claims: [
      { id: "c13", voucherCode: "VCH-2024-0144", service: "Mental Fitness", provider: "Headspace Partner KL", location: "Online", date: "01 Apr 2024", amount: 120, status: "Approved" },
      { id: "c14", voucherCode: "VCH-2024-0188", service: "Clinical Therapy", provider: "Mind & Soul Clinic", location: "Mont Kiara", date: "09 Apr 2024", amount: 180, status: "Pending" },
    ],
  },
];


