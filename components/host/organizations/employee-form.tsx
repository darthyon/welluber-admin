"use client";

import { useState, useEffect } from "react";
import { 
  User, 
  IdentificationCard, 
  Envelope, 
  Phone, 
  CalendarBlank, 
  DiceFive, 
  Briefcase, 
  Shield, 
  Plus, 
  Trash,
  CheckCircle,
  CaretLeft,
  Users
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ChoiceCard } from "@/components/shared/choice-card";
import { DetailSection } from "@/components/shared/detail-section";
import { DetailField } from "@/components/shared/detail-field";
import { SuccessCelebration } from "@/components/shared/success-celebration";
import { DatePickerField } from "@/components/shared/date-picker-field";
import { PhoneInput } from "@/components/shared/phone-input";
import { IdentificationInput } from "@/components/shared/identification-input";
import { cn } from "@/lib/utils";

interface Dependent {
  id: string;
  relationship: string;
  name: string;
  email: string;
  phone: string;
}

interface AssignedPolicy {
  policyId: string;
  policyName: string;
  benefitGroupId: string;
  benefitGroupName: string;
}

interface EmployeeFormProps {
  employeeId?: string | null;
  onCancel: () => void;
  onSuccess: (data: any) => void;
}

const EMPLOYMENT_TYPES = [
  { id: "full-time", title: "Full-time", description: "Standard permanent role with full benefits & probation.", icon: Briefcase },
  { id: "part-time", title: "Part-time", description: "Reduced hours role with prorated benefits.", icon: Briefcase },
  { id: "contract", title: "Contract", description: "Fixed-term engagement based on contract duration.", icon: Briefcase },
  { id: "internship", title: "Internship", description: "Temporary learning-focused role with limited benefits.", icon: User },
];

const RELATIONSHIPS = [
  "Spouse", "Child", "Mother", "Father", "Brother", "Sister", "Mother-in-law", "Father-in-law"
];

const MOCK_POLICIES = [
  { id: "pol_1", name: "Wellness Allocation 2026", groups: [{ id: "g1", name: "Gym Membership" }, { id: "g2", name: "Mental Health" }] },
  { id: "pol_2", name: "Lifestyle Pocket 2026", groups: [{ id: "g3", name: "Travel" }, { id: "g4", name: "Food & Dining" }] },
  { id: "pol_3", name: "Rejuvenation Fund 2026", groups: [{ id: "g5", name: "Spa Sessions" }, { id: "g6", name: "Massages" }] },
];

export function EmployeeForm({ employeeId, onCancel, onSuccess }: EmployeeFormProps) {
  const isEditing = !!employeeId;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    idType: "IC",
    idNumber: "",
    email: "",
    phone: "+60 ",
    joinDate: "",
    empCode: "",
    probationMonths: "3",
    probationEndDate: "",
    employmentType: "full-time",
    startTerminationDate: "",
    hasDependents: false,
    probationMode: "3m" as "3m" | "6m" | "date",
  });

  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [assignedPolicies, setAssignedPolicies] = useState<AssignedPolicy[]>([]);

  // Generate random Emp. Code
  const generateEmpCode = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    setFormData(prev => ({ ...prev, empCode: `ACM-${random}` }));
  };

  // Helper to get probation end date
  const getProbationEndDate = (joinDate: string, months: string) => {
    if (!joinDate || !months) return "";
    const date = new Date(joinDate + "T00:00:00");
    date.setMonth(date.getMonth() + parseInt(months));
    return date.toISOString().split('T')[0];
  };

  const addDependent = () => {
    setDependents([...dependents, { id: Math.random().toString(36).substr(2, 9), relationship: "Spouse", name: "", email: "", phone: "" }]);
  };

  const removeDependent = (id: string) => {
    setDependents(dependents.filter(d => d.id !== id));
  };

  const updateDependent = (id: string, field: keyof Dependent, value: string) => {
    setDependents(dependents.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const addPolicy = () => {
    setAssignedPolicies([...assignedPolicies, { 
      policyId: MOCK_POLICIES[0].id, 
      policyName: MOCK_POLICIES[0].name, 
      benefitGroupId: MOCK_POLICIES[0].groups[0].id,
      benefitGroupName: MOCK_POLICIES[0].groups[0].name 
    }]);
  };

  const removePolicy = (index: number) => {
    setAssignedPolicies(assignedPolicies.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
    setTimeout(() => onSuccess({ ...formData, dependents, assignedPolicies }), 1500);
  };

  if (isSuccess) {
    return (
      <div className="py-12">
        <SuccessCelebration 
          title={isEditing ? "Profile Updated!" : "Employee Registered!"}
          message={isEditing 
            ? "Member records have been synchronized with the master database." 
            : "Welcome on board! The new profile is now active and benefits pinned."
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
      {/* Header — same pattern as BranchForm */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200/60">
        <div className="flex items-center gap-4">
          <button
            onClick={onCancel}
            className="w-10 h-10 rounded-xl border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-colors bg-white shadow-sm"
          >
            <CaretLeft size={20} weight="bold" />
          </button>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900">
              {isEditing ? "Edit Employee" : "Add New Employee"}
            </h2>
            <p className="text-[13px] text-zinc-500 mt-1">
              {isEditing
                ? "Update identity, employment details, and benefit policy assignments."
                : "Register a new employee and assign them to a branch and benefit policy."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            disabled={isSubmitting || isSuccess}
            className="text-zinc-500 font-medium text-[14px] px-4 py-2 rounded-full hover:bg-zinc-100 transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            disabled={isSubmitting || isSuccess || !formData.name || !formData.joinDate || !formData.dateOfBirth || !formData.idNumber}
            onClick={handleSubmit}
            className="bg-primary text-white hover:bg-primary/90 font-semibold text-[14px] px-6 py-2 rounded-full shadow-sm shadow-primary/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed min-w-[160px] flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{isEditing ? "Saving..." : "Registering..."}</span>
              </>
            ) : (
              isEditing ? "Save Changes" : "Create Employee"
            )}
          </button>
        </div>
      </div>

      <div className="space-y-8 pb-10">
      <DetailSection 
        title="Personal Identity" 
        icon={<User size={18} weight="duotone" />}
        description="Legal name and primary identification numbers"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-1">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground/70 flex items-center gap-1.5">
              Employee Full Name
              <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                placeholder="e.g. Sarah Jenkins"
                className="w-full pl-10 pr-3 py-2 bg-white border border-zinc-200 rounded-lg text-[14px] outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all font-medium text-zinc-700"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5 flex flex-col">
            <label className="text-[11px] font-semibold text-muted-foreground/70 flex items-center gap-1.5">
              Date of Birth
              <span className="text-rose-500">*</span>
            </label>
            <DatePickerField
              value={formData.dateOfBirth}
              onChange={(v) => setFormData({ ...formData, dateOfBirth: v })}
              placeholder="Select date of birth"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground/70 flex items-center gap-1.5">
              Identification (IC / Passport)
              <span className="text-rose-500">*</span>
            </label>
            <IdentificationInput 
              type={formData.idType}
              number={formData.idNumber}
              onTypeChange={(v) => setFormData({ ...formData, idType: v })}
              onNumberChange={(v) => setFormData({ ...formData, idNumber: v })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground/70 flex items-center gap-1.5">
              Corporate Email
            </label>
            <div className="relative">
              <Envelope size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="email"
                placeholder="sarah.j@acme.com"
                className="w-full pl-10 pr-3 py-2 bg-white border border-zinc-200 rounded-lg text-[14px] outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all font-medium text-zinc-700 font-mono"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground/70 flex items-center gap-1.5">
              Mobile Phone Number
              <span className="text-rose-500">*</span>
            </label>
            <PhoneInput 
              value={formData.phone}
              onChange={(v) => setFormData({ ...formData, phone: v })}
            />
          </div>
        </div>
      </DetailSection>

      <DetailSection 
        title="Employment Configuration" 
        icon={<Briefcase size={18} weight="duotone" />}
        description="Set joining dates, internal identifiers and contract terms"
      >
        <div className="space-y-6 p-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground/70 flex items-center gap-1.5">
                Join Date
                <span className="text-rose-500">*</span>
              </label>
              <DatePickerField
                value={formData.joinDate}
                onChange={(v) => setFormData({ ...formData, joinDate: v })}
                placeholder="Select join date"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground/70 flex items-center gap-1.5">
                Employee Code (Emp. Code)
              </label>
              <div className="relative flex items-center h-[38px] bg-white border border-zinc-200 rounded-lg px-2 group focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary/30 transition-all">
                <input 
                  placeholder="ACM-XXXX"
                  className="flex-1 bg-transparent border-none outline-none text-[14px] font-medium text-zinc-700 px-1 font-mono tracking-tight"
                  value={formData.empCode}
                  onChange={(e) => setFormData({ ...formData, empCode: e.target.value })}
                />
                <button 
                  onClick={generateEmpCode}
                  className="w-7 h-7 rounded bg-zinc-50 flex items-center justify-center text-zinc-400 hover:bg-primary/10 hover:text-primary transition-all ml-1 tooltip"
                  title="Auto-generate"
                >
                  <DiceFive size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground/70">Employment type</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EMPLOYMENT_TYPES.map((type) => (
                <ChoiceCard 
                  key={type.id}
                  title={type.title}
                  description={type.description}
                  icon={type.icon}
                  selected={formData.employmentType === type.id}
                  onSelect={() => setFormData({ ...formData, employmentType: type.id })}
                />
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-zinc-100 bg-zinc-50/50 space-y-4">
             <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-[13px] font-bold text-zinc-900">Probation Details</h5>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Choose how the probation period is defined</p>
                </div>
             </div>

             {/* 3-choice segmented control */}
             <div className="grid grid-cols-3 gap-2">
               {([
                 { id: "3m", label: "3 Months", desc: "Standard probation" },
                 { id: "6m", label: "6 Months", desc: "Extended probation" },
                 { id: "date", label: "Specific Date", desc: "Pick exact end date" },
               ] as const).map((opt) => (
                 <button
                   key={opt.id}
                   onClick={() => setFormData({ ...formData, probationMode: opt.id })}
                   className={cn(
                     "flex flex-col items-start px-3 py-2.5 rounded-lg border text-left transition-all",
                     formData.probationMode === opt.id
                       ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                       : "border-zinc-200 bg-white hover:border-zinc-300"
                   )}
                 >
                   <span className={cn(
                     "text-[13px] font-semibold",
                     formData.probationMode === opt.id ? "text-primary" : "text-zinc-700"
                   )}>{opt.label}</span>
                   <span className="text-[10px] text-zinc-400 mt-0.5">{opt.desc}</span>
                 </button>
               ))}
             </div>

             {/* Specific date picker — only shown when mode = date */}
             {formData.probationMode === "date" && (
               <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                 <label className="text-[11px] font-semibold text-muted-foreground/70">Probation end date</label>
                 <DatePickerField
                   value={formData.probationEndDate}
                   onChange={(v) => setFormData({ ...formData, probationEndDate: v })}
                   placeholder="Select end date"
                 />
               </div>
             )}

             {/* Computed preview for period modes */}
             {(formData.probationMode === "3m" || formData.probationMode === "6m") && formData.joinDate && (
               <div className="flex items-center gap-2 text-[12px] text-zinc-500 bg-white border border-zinc-100 rounded-lg px-3 py-2 animate-in fade-in duration-200">
                 <CalendarBlank size={14} className="text-primary shrink-0" />
                 <span>Probation ends on <strong className="text-zinc-700">
                   {(() => {
                     const d = new Date(formData.joinDate + "T00:00:00");
                     d.setMonth(d.getMonth() + (formData.probationMode === "3m" ? 3 : 6));
                     return d.toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });
                   })()
                   }
                 </strong></span>
               </div>
             )}
          </div>
        </div>
      </DetailSection>

      <DetailSection 
        title="Benefit Policy Assignment" 
        icon={<Shield size={18} weight="duotone" />}
        description="Assign this employee to specific benefit pools and benefit groups"
      >
        <div className="space-y-4 p-1">
          {assignedPolicies.map((assigned, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-zinc-200 bg-white shadow-sm flex items-start justify-between gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex-1 grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-muted-foreground/70">Select benefit policy</label>
                    <select 
                      className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] font-medium text-zinc-700 outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                      value={assigned.policyId}
                      onChange={(e) => {
                        const pol = MOCK_POLICIES.find(p => p.id === e.target.value);
                        if (pol) {
                          const updated = [...assignedPolicies];
                          updated[idx] = { ...assigned, policyId: pol.id, policyName: pol.name };
                          setAssignedPolicies(updated);
                        }
                      }}
                    >
                      {MOCK_POLICIES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-muted-foreground/70">Select benefit group</label>
                    <select 
                      className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] font-medium text-zinc-700 outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                      value={assigned.benefitGroupId}
                      onChange={(e) => {
                         const updated = [...assignedPolicies];
                         updated[idx].benefitGroupId = e.target.value;
                         setAssignedPolicies(updated);
                      }}
                    >
                      {MOCK_POLICIES.find(p => p.id === assigned.policyId)?.groups.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                 </div>
              </div>
              <button 
                onClick={() => removePolicy(idx)}
                className="mt-6 p-1.5 text-zinc-300 hover:text-rose-500 transition-colors"
              >
                <Trash size={18} />
              </button>
            </div>
          ))}

          <Button 
            variant="outline" 
            className="w-full border-dashed border-zinc-200 h-10 text-zinc-500 hover:text-primary hover:border-primary/30 transition-all"
            onClick={addPolicy}
          >
            <Plus size={14} className="mr-2" /> Add Another Benefit Policy
          </Button>
        </div>
      </DetailSection>

      <DetailSection 
        title="Dependent Links" 
        icon={<Users size={18} weight="duotone" />}
        description="Register family members covered under the employee's policies"
      >
        <div className="space-y-5 p-1">
          {dependents.map((dep) => (
             <div key={dep.id} className="p-4 rounded-xl border border-zinc-100 bg-zinc-50/30 space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between">
                   <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">Dependent unit</span>
                   <button onClick={() => removeDependent(dep.id)} className="text-zinc-300 hover:text-rose-500 transition-colors">
                     <Trash size={16} />
                   </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <label className="text-[11px] font-semibold text-muted-foreground/70">Relationship</label>
                    <select 
                      value={dep.relationship}
                      onChange={(e) => updateDependent(dep.id, 'relationship', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] font-medium text-zinc-700 outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                    >
                      {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <label className="text-[11px] font-semibold text-muted-foreground/70">Full name</label>
                    <input 
                      value={dep.name}
                      onChange={(e) => updateDependent(dep.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] font-medium text-zinc-700 outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                      placeholder="Full Name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground/70">Email address</label>
                    <input 
                      value={dep.email}
                      onChange={(e) => updateDependent(dep.id, 'email', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] font-medium text-zinc-700 outline-none focus:ring-2 focus:ring-primary/10 transition-all font-mono"
                      placeholder="Email"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-muted-foreground/70">Phone number</label>
                    <input 
                      value={dep.phone}
                      onChange={(e) => updateDependent(dep.id, 'phone', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-[13px] font-medium text-zinc-700 outline-none focus:ring-2 focus:ring-primary/10 transition-all font-mono"
                      placeholder="Phone"
                    />
                  </div>
                </div>
             </div>
          ))}

          <Button 
            variant="outline" 
            className="w-full border-dashed border-zinc-200 h-12 text-zinc-500 hover:text-primary hover:border-primary/30 transition-all"
            onClick={addDependent}
          >
            <Plus size={16} className="mr-2" /> Register New Dependent
          </Button>
        </div>
      </DetailSection>

      </div>
    </div>
  );
}
