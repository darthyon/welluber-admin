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
  Sparkle,
  Check,
  MagnifyingGlass,
  Funnel,
  SelectionAll,
  Eraser,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ChoiceCard } from "@/components/shared/choice-card";
import { DetailSection } from "@/components/shared/detail-section";
import { SuccessCelebration } from "@/components/shared/success-celebration";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { BenefitPolicy, BenefitGroup, Benefit, PolicyStatus, DistributionType } from "@/types/policy";
import { UtilisationClaimsTable, type EmployeeUtilisationRow } from "@/components/shared/utilisation-claims-table";
import { SharedDataTable, type Column } from "@/components/shared/data-table";
import { FilterItem } from "@/components/shared/filter-item";
import { DataFilterBar } from "@/components/shared/data-filter-bar";

// ─── Constants ───────────────────────────────────────────────────────────────

const CONTENT_TABS = [
  { id: 1, title: "Benefit Policy Details" },
  { id: 2, title: "Benefit Pool & Cycle" },
  { id: 3, title: "Benefit Groups" },
  { id: 4, title: "Utilisation & Claims", viewOnly: true },
];

const CREATE_STEPS = [
  { id: 1, title: "Target Workforce" },
  { id: 2, title: "Benefit Pool & Cycle" },
  { id: 3, title: "Benefit Groups" },
  { id: 4, title: "Finalize & Review" },
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

const MOCK_EMPLOYEES = [
  { id: "emp-1", name: "Sarah Chen", email: "sarah.chen@welluber.com", department: "Engineering", role: "Staff", gender: "Female", age: 28, status: "Active", needsAction: "None", branch: "HQ (Kuala Lumpur)" },
  { id: "emp-2", name: "Michael Rodriguez", email: "m.rodriguez@welluber.com", department: "Marketing", role: "Management", gender: "Male", age: 34, status: "Active", needsAction: "None", branch: "HQ (Kuala Lumpur)" },
  { id: "emp-3", name: "Emily Wong", email: "emily.wong@welluber.com", department: "Product", role: "Staff", gender: "Female", age: 25, status: "Terminated", needsAction: "None", branch: "Subang Jaya" },
  { id: "emp-4", name: "David Kim", email: "david.kim@welluber.com", department: "Engineering", role: "Management", gender: "Male", age: 41, status: "Active", needsAction: "Missing Info", branch: "HQ (Kuala Lumpur)" },
  { id: "emp-5", name: "Jessica Taylor", email: "j.taylor@welluber.com", department: "Sales", role: "Staff", gender: "Female", age: 31, status: "Active", needsAction: "None", branch: "Penang Office" },
  { id: "emp-6", name: "Alex Rivera", email: "alex.rivera@welluber.com", department: "Marketing", role: "Executive", gender: "Non-binary", age: 39, status: "Active", needsAction: "None", branch: "HQ (Kuala Lumpur)" },
  { id: "emp-7", name: "Hassan Al-Fayed", email: "hassan.a@welluber.com", department: "Engineering", role: "Staff", gender: "Male", age: 27, status: "Active", needsAction: "None", branch: "Subang Jaya" },
  { id: "emp-8", name: "Sophie Mueller", email: "sophie.m@welluber.com", department: "HR", role: "Management", gender: "Female", age: 36, status: "Active", needsAction: "Missing Info", branch: "HQ (Kuala Lumpur)" },
  { id: "emp-9", name: "James Wilson", email: "james.w@welluber.com", department: "Sales", role: "Staff", gender: "Male", age: 29, status: "Active", needsAction: "None", branch: "Penang Office" },
  { id: "emp-10", name: "Chloe Dupont", email: "chloe.d@welluber.com", department: "Product", role: "Staff", gender: "Female", age: 24, status: "Terminated", needsAction: "None", branch: "HQ (Kuala Lumpur)" },
  { id: "emp-11", name: "Ryan Gupta", email: "ryan.g@welluber.com", department: "Engineering", role: "Staff", gender: "Male", age: 33, status: "Active", needsAction: "None", branch: "Subang Jaya" },
  { id: "emp-12", name: "Maria Garcia", email: "maria.g@welluber.com", department: "Marketing", role: "Staff", gender: "Female", age: 30, status: "Active", needsAction: "None", branch: "HQ (Kuala Lumpur)" },
];

const STATUS_CONFIG: Record<PolicyStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  Draft: { label: "Draft", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20", icon: NotePencil },
  Published: { label: "Published", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20", icon: CheckCircle },
  Unlisted: { label: "Unlisted", color: "text-muted-foreground dark:text-muted-foreground/60", bg: "bg-muted dark:bg-muted0/10 border-zinc-200 dark:border-zinc-500/20", icon: EyeSlash },
  Deactivated: { label: "Deactivated", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20", icon: XCircle },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function ReadField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-caption font-semibold text-muted-foreground/80">{label}</p>
      <p className="text-body font-medium text-foreground">{value || <span className="text-muted-foreground/40 dark:text-muted-foreground italic">—</span>}</p>
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
            className="absolute top-full mt-2 right-0 z-50 bg-popover border border-border rounded-xl shadow-lg shadow-black/20 overflow-hidden min-w-[160px]"
          >
            {(Object.keys(STATUS_CONFIG) as PolicyStatus[]).map((s) => {
              const c = STATUS_CONFIG[s];
              const SI = c.icon;
              return (
                <button
                  key={s}
                  onClick={() => { onChange(s); setOpen(false); }}
                  className={cn(
                    "flex items-center gap-2.5 w-full px-4 py-2.5 text-nav font-semibold hover:bg-muted transition-colors text-left",
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [genContext, setGenContext] = useState("");

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

  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set());
  const [assignmentFilters, setAssignmentFilters] = useState({
    department: "all",
    role: "all",
    gender: "all",
    status: "all",
    needsAction: "all",
    branch: "all",
    ageRange: "all",
  });
  const [isGenerated, setIsGenerated] = useState(false);
  const [assignmentSearchQuery, setAssignmentSearchQuery] = useState("");

  const filteredWorkforce = useMemo(() => {
    return MOCK_EMPLOYEES.filter(emp => {
      const searchMatch = !assignmentSearchQuery || 
        emp.name.toLowerCase().includes(assignmentSearchQuery.toLowerCase()) || 
        emp.email.toLowerCase().includes(assignmentSearchQuery.toLowerCase());
      const deptMatch = assignmentFilters.department === "all" || emp.department === assignmentFilters.department;
      const roleMatch = assignmentFilters.role === "all" || emp.role === assignmentFilters.role;
      const genderMatch = assignmentFilters.gender === "all" || emp.gender === assignmentFilters.gender;
      const statusMatch = assignmentFilters.status === "all" || emp.status === assignmentFilters.status;
      const needsActionMatch = assignmentFilters.needsAction === "all" || emp.needsAction === assignmentFilters.needsAction;
      const branchMatch = assignmentFilters.branch === "all" || emp.branch === assignmentFilters.branch;
      
      let ageMatch = true;
      if (assignmentFilters.ageRange !== "all") {
        if (assignmentFilters.ageRange === "20-30") ageMatch = emp.age >= 20 && emp.age <= 30;
        else if (assignmentFilters.ageRange === "31-40") ageMatch = emp.age >= 31 && emp.age <= 40;
        else if (assignmentFilters.ageRange === "41plus") ageMatch = emp.age > 40;
      }

      return searchMatch && deptMatch && roleMatch && genderMatch && statusMatch && needsActionMatch && branchMatch && ageMatch;
    });
  }, [assignmentSearchQuery, assignmentFilters]);

  const toggleEmployeeSelection = useCallback((id: string) => {
    setSelectedEmployeeIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const assignVisibleWorkforce = useCallback(() => {
    setSelectedEmployeeIds(prev => {
      const next = new Set(prev);
      filteredWorkforce.forEach(emp => next.add(emp.id));
      return next;
    });
  }, [filteredWorkforce]);

  const clearVisibleWorkforce = useCallback(() => {
    setSelectedEmployeeIds(prev => {
      const next = new Set(prev);
      filteredWorkforce.forEach(emp => next.delete(emp.id));
      return next;
    });
  }, [filteredWorkforce]);

  const workforceColumns = useMemo(() => {
    const cols: Column<typeof MOCK_EMPLOYEES[0]>[] = [
      {
        header: "Employee Name",
        accessorKey: "name",
        render: (row) => (
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">{row.name}</span>
            <span className="text-caption text-muted-foreground/60 font-medium">{row.email}</span>
          </div>
        )
      },
      { header: "Department", accessorKey: "department" },
      { header: "Role", accessorKey: "role" },
      { header: "Gender", accessorKey: "gender" },
      { header: "Age", accessorKey: "age", align: "center" },
    ];

    if (!isViewMode) {
      cols.unshift({
        header: "",
        headerClassName: "w-[50px]",
        render: (row) => (
          <button 
            onClick={(e) => { e.stopPropagation(); toggleEmployeeSelection(row.id); }}
            className={cn(
              "w-5 h-5 rounded border flex items-center justify-center transition-all",
              selectedEmployeeIds.has(row.id) ? "bg-primary border-primary text-white" : "border-border hover:border-primary/50 bg-background/50"
            )}
          >
            {selectedEmployeeIds.has(row.id) && <Check size={12} weight="bold" />}
          </button>
        )
      });
    }

    return cols;
  }, [isViewMode, selectedEmployeeIds, toggleEmployeeSelection]);

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

  const nextStep = async () => {
    if (currentStep === 3 && !isGenerated) {
      await generateIdentitySuggestions();
    }
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const goToStep = async (stepId: number) => {
    if (isSubmitting || isGenerating) return;
    
    // If moving to step 4 for the first time, generate suggestions
    if (stepId === 4 && !isGenerated) {
      setCurrentStep(4);
      await generateIdentitySuggestions();
      return;
    }
    
    setCurrentStep(stepId);
  };

  const generateIdentitySuggestions = async () => {
    // Collect context for generation
    const mainServices = benefits.map(b => SERVICES.find(s => s.id === b.serviceId)?.name).filter(Boolean);
    const uniqueServices = Array.from(new Set(mainServices));
    const deptFilter = assignmentFilters.department !== "all" ? assignmentFilters.department : "Whole Team";
    
    setGenContext(uniqueServices.slice(0, 2).join(" & ") + (uniqueServices.length > 2 ? "..." : ""));
    setIsGenerating(true);
    
    await new Promise(resolve => setTimeout(resolve, 2200));

    const primaryService = uniqueServices[0] || "Health";
    const suggestedName = `${primaryService} ${new Date().getFullYear()} - ${deptFilter}`;
    const suggestedCode = `BEN-${primaryService.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const suggestedDesc = `A ${policyData.utilisationMode?.toLowerCase() || "standard"} wellbeing policy designed specifically for the ${deptFilter === "Whole Team" ? "workforce" : deptFilter + " department"}, focusing on ${uniqueServices.join(", ") || "essential services"}.`;

    setPolicyData(prev => ({ 
      ...prev, 
      name: prev.name || suggestedName, 
      code: prev.code || suggestedCode,
      description: prev.description || suggestedDesc
    }));
    
    setIsGenerated(true);
    setIsGenerating(false);
  };

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

  const renderWorkforceStep = () => {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <DetailSection 
          title="Target Workforce" 
          icon={<Users size={18} weight="duotone" />} 
          description="Identify and assign employees to this benefit policy"
          ghost
          action={
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={assignVisibleWorkforce}
                className="h-8 px-3 gap-2 text-caption font-semibold text-primary hover:bg-primary/5 transition-all"
              >
                <SelectionAll size={14} />
                Assign Filtered
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearVisibleWorkforce}
                className="h-8 px-3 gap-2 text-caption font-semibold text-rose-500 hover:bg-rose-500/10 transition-all border-l border-border"
              >
                <Eraser size={14} />
                Clear
              </Button>
              <span className="text-label font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full ring-1 ring-primary/20">
                {selectedEmployeeIds.size} Assigned
              </span>
            </div>
          }
        >
          <div className="space-y-5">
            {/* Filter Bar - Reusable DataFilterBar component */}
            <DataFilterBar
              searchQuery={assignmentSearchQuery}
              onSearchChange={setAssignmentSearchQuery}
              searchPlaceholder="Search employees..."
              filters={
                <>
                  <FilterItem
                    label="Department"
                    options={[
                      { label: "All Depts", value: "all" },
                      { label: "Engineering", value: "Engineering" },
                      { label: "Marketing", value: "Marketing" },
                      { label: "Product", value: "Product" },
                      { label: "Sales", value: "Sales" },
                      { label: "HR", value: "HR" },
                    ]}
                    value={assignmentFilters.department}
                    onChange={(v) => setAssignmentFilters({ ...assignmentFilters, department: v })}
                  />
                  <FilterItem
                    label="Role"
                    options={[
                      { label: "All Roles", value: "all" },
                      { label: "Executive", value: "Executive" },
                      { label: "Management", value: "Management" },
                      { label: "Staff", value: "Staff" },
                    ]}
                    value={assignmentFilters.role}
                    onChange={(v) => setAssignmentFilters({ ...assignmentFilters, role: v })}
                  />
                  <FilterItem
                    label="Age Range"
                    options={[
                      { label: "Any Age", value: "all" },
                      { label: "20 - 30", value: "20-30" },
                      { label: "31 - 40", value: "31-40" },
                      { label: "41+", value: "41plus" },
                    ]}
                    value={assignmentFilters.ageRange}
                    onChange={(v) => setAssignmentFilters({ ...assignmentFilters, ageRange: v })}
                  />
                  <FilterItem
                    label="Branch"
                    options={[
                      { label: "All Branches", value: "all" },
                      { label: "HQ (KL)", value: "HQ (Kuala Lumpur)" },
                      { label: "Subang Jaya", value: "Subang Jaya" },
                      { label: "Penang", value: "Penang Office" },
                    ]}
                    value={assignmentFilters.branch}
                    onChange={(v) => setAssignmentFilters({ ...assignmentFilters, branch: v })}
                  />
                </>
              }
            />

            {/* Employee Table */}
            <SharedDataTable 
              data={filteredWorkforce} 
              columns={workforceColumns}
              rowsPerPage={6}
              className="border-zinc-200/60"
              ghost
              onRowClick={(row) => toggleEmployeeSelection(row.id)}
            />
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
          <DetailSection title="Benefit Pool Strategy" icon={<Gear size={18} weight="duotone" />} description="Fund allocation configuration" ghost>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-1">
              <ReadField label="Employee Pool Type" value={policyData.benefitPoolType?.employee} />
              <ReadField label="Dependent Pool Type" value={policyData.benefitPoolType?.dependents} />
              <ReadField label="Utilisation Mode" value={policyData.utilisationMode === "Fixed" ? "Fixed Allocation" : "Prorated Allocation"} />
            </div>
          </DetailSection>
          <DetailSection title="Cycle & Lifecycle" icon={<Gear size={18} weight="duotone" />} description="Refresh intervals and activation" ghost>
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
        <DetailSection title="Benefit Pool Strategy" icon={<Gear size={18} weight="duotone" />} description="Choose how funds are allocated across the workforce" ghost>
          <div className="space-y-8 p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-caption font-semibold text-muted-foreground/60 tracking-wider">Employee pool type</label>
                <div className="flex gap-2 p-1 bg-muted rounded-xl">
                  {(["Individual", "Shared"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setPolicyData({ ...policyData, benefitPoolType: { ...policyData.benefitPoolType!, employee: type } })}
                      className={cn("flex-1 py-2 text-nav font-semibold rounded-lg transition-all", policyData.benefitPoolType?.employee === type ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground")}
                    >{type}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-caption font-semibold text-muted-foreground/60 tracking-wider">Dependent Pool Type</label>
                <div className="flex gap-2 p-1 bg-muted rounded-xl">
                  {(["None", "Individual", "Shared"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setPolicyData({ ...policyData, benefitPoolType: { ...policyData.benefitPoolType!, dependents: type } })}
                      className={cn("flex-1 py-2 text-nav font-semibold rounded-lg transition-all", policyData.benefitPoolType?.dependents === type ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground")}
                    >{type}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-caption font-semibold text-muted-foreground">Utilisation Mode</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ChoiceCard title="Fixed Allocation" description="Full benefit amounts granted upfront upon assignment." icon={Gear} selected={policyData.utilisationMode === "Fixed"} onSelect={() => setPolicyData({ ...policyData, utilisationMode: "Fixed" })} />
                <ChoiceCard title="Prorated Allocation" description="Benefit amounts calculated based on join date/time." icon={Gear} selected={policyData.utilisationMode === "Prorated"} onSelect={() => setPolicyData({ ...policyData, utilisationMode: "Prorated" })} />
              </div>
            </div>
          </div>
        </DetailSection>

        <DetailSection title="Cycle & Lifecycle" icon={<Gear size={18} weight="duotone" />} description="Refresh intervals and activation triggers" ghost>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
            <div className="space-y-1.5">
              <label className="text-caption font-semibold text-muted-foreground">Refresh Cycle</label>
              <select
                className="w-full px-4 py-2 bg-muted/20 border border-border rounded-xl text-body font-medium outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                value={policyData.refreshCycle}
                onChange={(e) => setPolicyData({ ...policyData, refreshCycle: e.target.value as any })}
              >
                {["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-caption font-semibold text-muted-foreground">Refresh Start Reference</label>
              <select
                className="w-full px-4 py-2 bg-transparent border border-zinc-200 rounded-xl text-body font-medium outline-none focus:ring-2 focus:ring-primary/10"
                value={policyData.refreshStartReference}
                onChange={(e) => setPolicyData({ ...policyData, refreshStartReference: e.target.value as any })}
              >
                <option value="OrgFY">Organisation Financial Year</option>
                <option value="JoinDate">Employee Joining Date</option>
                <option value="CustomDate">Custom Start Date</option>
              </select>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-caption font-semibold text-muted-foreground">Activation Mode</label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {(["JoinDate", "ProbationEnds", "CustomDate"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setPolicyData({ ...policyData, activationMode: m })}
                    className={cn("flex items-center gap-3 px-4 py-2.5 rounded-xl border text-nav font-medium transition-all text-left", policyData.activationMode === m ? "border-primary bg-primary/5 text-primary" : "border-border bg-card text-muted-foreground hover:border-border/80")}
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
        <div className="flex flex-col items-center justify-center py-16 bg-muted/20 rounded-xl border border-dashed border-border text-center">
          <TreeStructure size={36} weight="duotone" className="text-muted-foreground/40 mb-3 mx-auto" />
          <p className="text-muted-foreground font-medium text-nav">{isViewMode ? "No benefit groups configured." : "No benefit groups yet."}</p>
          {!isViewMode && (
            <Button variant="ghost" onClick={addGroup} className="mt-2 text-primary font-semibold text-nav">
              Create your first group
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((group) => (
            <div key={group.id} className="rounded-2xl border border-border bg-card/40 overflow-hidden animate-in fade-in zoom-in-95 duration-300 h-full flex flex-col hover:border-primary/20 transition-all">
              {/* Card header */}
              <div className="flex items-start justify-between gap-3 p-4 border-b border-border">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <TreeStructure size={18} weight="duotone" />
                  </div>
                  {isViewMode ? (
                    <div className="min-w-0">
                      <p className="text-body font-semibold text-foreground truncate">{group.name}</p>
                      {group.description && <p className="text-label text-muted-foreground truncate">{group.description}</p>}
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <input
                        className="text-body font-semibold text-foreground bg-transparent border-none p-0 outline-none w-full focus:ring-0 truncate"
                        value={group.name}
                        onChange={(e) => updateGroup(group.id, "name", e.target.value)}
                        placeholder="Group Name"
                      />
                      <input
                        className="text-label text-muted-foreground bg-transparent border-none p-0 outline-none w-full focus:ring-0"
                        value={group.description}
                        onChange={(e) => updateGroup(group.id, "description", e.target.value)}
                        placeholder="Brief description..."
                      />
                    </div>
                  )}
                </div>
                {!isViewMode && (
                  <button onClick={() => removeGroup(group.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:text-rose-500 transition-colors shrink-0">
                    <Trash size={16} />
                  </button>
                )}
              </div>

              {/* Card body */}
              <div className="p-4 space-y-4">
                {/* Distribution type + max usage */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="space-y-1">
                    <p className="text-micro font-semibold text-muted-foreground">Distribution</p>
                    {isViewMode ? (
                      <p className="text-label font-semibold text-foreground/80">{group.distributionType === "SharedAmount" ? "Shared Pool" : "Individual Per Service"}</p>
                    ) : (
                      <div className="flex p-0.5 bg-muted rounded-lg">
                        {(["SharedAmount", "IndividualBenefitAmount"] as const).map((type) => (
                          <button key={type} onClick={() => updateGroup(group.id, "distributionType", type)}
                            className={cn("px-2.5 py-1 text-micro font-semibold rounded-md transition-all", group.distributionType === type ? "bg-background text-primary shadow-sm" : "text-muted-foreground")}
                          >
                            {type === "SharedAmount" ? "Shared Pool" : "Individual"}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {group.distributionType === "SharedAmount" && (
                    <div className="space-y-1">
                      <p className="text-micro font-semibold text-muted-foreground">Max Usage</p>
                      {isViewMode ? (
                        <p className="text-label font-semibold text-foreground">{group.maxUsagePerCycle ? `RM ${group.maxUsagePerCycle.toFixed(2)}` : "—"}</p>
                      ) : (
                        <input type="number" className="w-28 px-2.5 py-1 border border-border bg-background rounded-lg text-label outline-none focus:ring-2 focus:ring-primary/10" value={group.maxUsagePerCycle} onChange={(e) => updateGroup(group.id, "maxUsagePerCycle", parseFloat(e.target.value))} placeholder="0.00" />
                      )}
                    </div>
                  )}
                </div>

                {/* Services */}
                <div className="space-y-2">
                  <p className="text-micro font-semibold text-muted-foreground">Services</p>
                  <div className="space-y-1.5">
                    {benefits.filter(b => b.groupId === group.id).map((benefit) => (
                      <div key={benefit.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-muted/40 border border-border">
                        <div className="flex-1 min-w-0">
                          {isViewMode ? (
                            <p className="text-label font-semibold text-foreground truncate">{SERVICES.find(s => s.id === benefit.serviceId)?.name}</p>
                          ) : (
                            <select className="w-full bg-transparent border-none p-0 text-label font-semibold text-foreground/80 outline-none" value={benefit.serviceId} onChange={(e) => updateBenefit(benefit.id, "serviceId", e.target.value)}>
                              {SERVICES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {isViewMode ? (
                            <span className="text-label font-semibold text-foreground font-mono">RM {benefit.amount.toFixed(2)}</span>
                          ) : (
                            <input type="number" className="w-20 px-2 py-1 bg-background border border-border rounded-lg text-caption font-mono outline-none text-right" value={benefit.amount} onChange={(e) => updateBenefit(benefit.id, "amount", parseFloat(e.target.value))} />
                          )}
                          {isViewMode ? (
                            <span className={cn("text-micro font-semibold px-2 py-0.5 rounded-full", benefit.coPayment.required ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/60")}>
                              {benefit.coPayment.required ? "Co-pay" : "No co-pay"}
                            </span>
                          ) : (
                            <button onClick={() => updateBenefit(benefit.id, "coPayment.required", !benefit.coPayment.required)} className={cn("w-8 h-4 rounded-full transition-colors relative shrink-0", benefit.coPayment.required ? "bg-primary" : "bg-muted/50")}>
                              <div className={cn("w-3 h-3 rounded-full bg-white absolute top-[2px] transition-all", benefit.coPayment.required ? "right-0.5" : "left-0.5")} />
                            </button>
                          )}
                          {!isViewMode && (
                            <button onClick={() => removeBenefit(benefit.id)} className="text-muted-foreground/40 hover:text-rose-500 transition-colors">
                              <Trash size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {!isViewMode && (
                    <button onClick={() => addBenefit(group.id)} className="w-full h-8 border-dashed border-2 border-zinc-200 rounded-xl text-caption font-semibold text-muted-foreground/60 hover:border-primary/40 hover:text-primary transition-all flex items-center justify-center gap-1.5">
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
      {/* Inline Generation Overlay */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-2xl shadow-primary/20 ring-4 ring-primary/5"
            >
              <Sparkle size={40} weight="fill" className="animate-pulse" />
            </motion.div>
            <h3 className="text-xl font-semibold text-foreground">Crafting Policy Identity...</h3>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              Optimizing for <span className="text-primary font-semibold">{genContext || "Workforce"}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4 shadow-sm">
          <ShieldCheck size={28} weight="duotone" />
        </div>
        <h3 className="text-2xl font-semibold text-foreground tracking-tight">Finalize & Launch Policy</h3>
        <p className="text-muted-foreground mt-1">Review the AI-suggested identity and verify configured benefits.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column: AI Identity */}
        <div className="lg:col-span-3 space-y-6">
          <DetailSection 
            title="Policy Identity" 
            icon={<IdentificationCard size={18} weight="duotone" />} 
            description="AI-generated suggestions based on your configuration"
            ghost
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-1">
              <div className="space-y-1.5 flex-1">
                <label className="text-caption font-semibold text-muted-foreground tracking-tight pl-1">Policy Name</label>
                <div className={cn(
                  "relative group transition-all",
                  !isGenerated && "opacity-50 grayscale pointer-events-none"
                )}>
                  <input
                    placeholder="e.g. Wellness Premium 2026"
                    className="w-full px-4 py-3 bg-white border border-border rounded-xl text-body outline-none transition-all font-semibold text-foreground focus:ring-4 focus:ring-primary/10 focus:border-primary/40 group-hover:border-primary/30"
                    value={policyData.name}
                    onChange={(e) => setPolicyData({ ...policyData, name: e.target.value })}
                  />
                  {isGenerated && <Sparkle size={14} weight="fill" className="absolute right-3 top-1/2 -translate-y-1/2 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />}
                </div>
              </div>

              <div className="space-y-1.5 flex-1">
                <label className="text-caption font-semibold text-muted-foreground tracking-tight pl-1">Benefit ID</label>
                <input
                  placeholder="e.g. BEN-W-01"
                  className="w-full px-4 py-3 bg-white border border-border rounded-xl text-body outline-none transition-all font-semibold font-mono text-foreground focus:ring-4 focus:ring-zinc-500/5 focus:border-zinc-400"
                  value={policyData.code}
                  onChange={(e) => setPolicyData({ ...policyData, code: e.target.value })}
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-caption font-semibold text-muted-foreground tracking-tight pl-1">Suggested Description</label>
                <div className="relative group">
                  <Quotes size={16} className="absolute left-3 top-4 text-muted-foreground/40" />
                  <textarea
                    placeholder="Describe the purpose of this benefit..."
                    className="w-full pl-10 pr-4 py-3.5 bg-white border border-border rounded-xl text-nav leading-relaxed outline-none transition-all font-medium text-muted-foreground min-h-[100px] resize-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 group-hover:border-primary/10"
                    value={policyData.description}
                    onChange={(e) => setPolicyData({ ...policyData, description: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </DetailSection>

          <DetailSection 
            title="Workforce Summary" 
            icon={<Users size={18} weight="duotone" />} 
            description="Individuals assigned to this policy"
            ghost
          >
            <div className="p-5 rounded-2xl border border-zinc-200/50 flex items-center justify-between transition-all hover:border-primary/20 bg-transparent">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-zinc-200/60">
                  <SelectionAll size={20} className="text-muted-foreground" />
                </div>
                <div>
                  <p className="text-body font-semibold text-foreground">{selectedEmployeeIds.size} Employees Selected</p>
                  <p className="text-caption text-muted-foreground font-medium tracking-tight">Assignment effective immediately upon activation</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => goToStep(1)}
                className="text-primary font-semibold text-label hover:bg-primary/5 transition-colors"
              >
                Change Selection
              </Button>
            </div>
          </DetailSection>
        </div>

        {/* Right Column: Structure Preview */}
        <div className="lg:col-span-2 space-y-6">
          <DetailSection 
            title="Benefits Recap" 
            icon={<TreeStructure size={18} weight="duotone" />} 
            description="Budget and service breakdown"
            ghost
          >
            <div className="space-y-3">
              {groups.length === 0 ? (
                <p className="text-center py-8 text-nav text-muted-foreground/60 font-medium bg-muted/50 rounded-xl border border-dashed border-zinc-200">No benefit groups configured.</p>
              ) : groups.map(group => (
                 <div key={group.id} className="p-4 rounded-2xl border border-zinc-200/60 flex items-center justify-between bg-transparent hover:border-primary/20 transition-all cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-primary shadow-sm border border-zinc-200/60">
                      <TreeStructure size={16} />
                    </div>
                    <div>
                      <p className="text-nav font-semibold text-foreground">{group.name}</p>
                      <p className="text-micro text-muted-foreground font-semibold tracking-tight">{benefits.filter(b => b.groupId === group.id).length} services</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-body font-semibold text-primary">{group.distributionType === "SharedAmount" ? `RM ${group.maxUsagePerCycle?.toFixed(2)}` : "Individual"}</p>
                  </div>
                </div>
              ))}
              
              <div className="mt-4 p-4 rounded-2xl border border-zinc-200/60 bg-transparent flex items-center justify-between">
                <div>
                  <p className="text-caption font-semibold text-muted-foreground tracking-tight leading-none">Global Refresh</p>
                  <p className="text-body font-semibold text-foreground mt-1">{policyData.refreshCycle}</p>
                </div>
                <div className="h-8 w-px bg-muted/50 mx-2" />
                <div className="flex-1 text-right">
                  <p className="text-caption font-semibold text-muted-foreground tracking-tight leading-none">Trigger</p>
                  <p className="text-body font-semibold text-foreground mt-1 truncate">{policyData.activationMode === "JoinDate" ? "On Joining" : "Post-probation"}</p>
                </div>
              </div>
            </div>
          </DetailSection>
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
          <h4 className="text-nav font-semibold text-foreground">Policy Status</h4>
          <p className="text-label text-muted-foreground/60 mt-0.5">Control the visibility and lifecycle state of this policy.</p>
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
    <div className="flex flex-col h-full bg-transparent">
      {/* Sticky header + nav */}
      <div className="bg-background/80 backdrop-blur-md sticky top-0 z-10 transition-all border-none shadow-none">
        {/* Title + actions row */}
        <div className="flex items-center justify-between py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={onCancel}
              className="w-10 h-10 rounded-xl border border-zinc-200/60 flex items-center justify-center hover:bg-muted/50 transition-all shadow-none"
            >
              <CaretLeft size={20} weight="bold" />
            </button>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {isViewMode ? "View Benefit Policy" : mode === "edit" ? "Edit Benefit Policy" : "Create Benefit Policy"}
            </h2>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {isViewMode ? (
              onEdit && (
                <Button
                  onClick={onEdit}
                  className="rounded-full px-6 flex items-center gap-2 bg-primary text-white shadow-none"
                >
                  <NotePencil size={16} weight="bold" />
                  Edit Policy
                </Button>
              )
            ) : (
              <>
                <button
                  onClick={() => onSaveDraft?.({ policy: policyData, groups, benefits })}
                  className="text-muted-foreground font-medium text-body px-4 py-2 rounded-full hover:bg-muted transition-colors"
                >
                  Save as Draft
                </button>
                {mode === "create" && currentStep > 1 && (
                  <Button variant="outline" onClick={prevStep} className="rounded-full px-6">Back</Button>
                )}
                {mode === "create" && currentStep < 4 ? (
                  <Button
                    onClick={nextStep}
                    disabled={currentStep === 1 && selectedEmployeeIds.size === 0}
                    className="rounded-full px-8 bg-primary text-white shadow-none"
                  >
                    Next Step
                    <CaretRight size={16} weight="bold" className="ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="rounded-full px-8 bg-primary text-white shadow-none min-w-[140px]"
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
                  "px-5 py-3 text-nav font-semibold transition-all border-b-2 -mb-px",
                  currentStep === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-zinc-200"
                )}
              >
                {tab.title}
              </button>
            ))}
          </div>
        )}

        {/* Numbered stepper — create only */}
        {mode === "create" && (
          <div className="flex items-center gap-4 pb-4">
            {CREATE_STEPS.map((step) => (
              <button
                key={step.id}
                onClick={() => goToStep(step.id)}
                className={cn(
                  "flex items-center gap-2 group transition-all cursor-pointer",
                  currentStep === step.id ? "opacity-100" : "opacity-40 hover:opacity-100"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-lg flex items-center justify-center text-micro font-semibold shadow-sm transition-all group-hover:shadow-md",
                  currentStep === step.id ? "bg-primary text-white ring-2 ring-primary/20 ring-offset-2" : "bg-muted text-muted-foreground group-hover:bg-muted/50"
                )}>
                  {currentStep > step.id ? "✓" : step.id}
                </div>
                <span className={cn(
                  "text-nav font-semibold whitespace-nowrap transition-colors",
                  currentStep === step.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {step.title}
                </span>
                {step.id < 4 && <div className="w-6 h-[1.5px] bg-muted ml-2" />}
              </button>
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
                {renderWorkforceStep()}
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
                ghost
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


