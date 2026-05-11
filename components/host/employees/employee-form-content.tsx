"use client";

import { useState } from "react";
import {
  User,
  Users,
  Envelope,
  CalendarBlank,
  DiceFive,
  Briefcase,
  Shield,
  Plus,
  Trash,
  Globe,
  CreditCard,
  Hourglass,
  Clock
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ChoiceCard } from "@/components/shared/choice-card";
import { DatePickerField } from "@/components/shared/date-picker-field";
import { PhoneInput } from "@/components/shared/phone-input";
import { IdentificationInput } from "@/components/shared/identification-input";
import { cn } from "@/lib/utils";
import { MOCK_FORM_POLICIES } from "@/lib/mock-data";

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
  version?: string;
  benefitGroupId: string;
  benefitGroupName: string;
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

interface EmployeeFormContentProps {
  mode: "create" | "edit";
  onSubmit: (data: unknown) => void;
  isSubmitting: boolean;
}

export function EmployeeFormContent({ mode, onSubmit, isSubmitting }: EmployeeFormContentProps) {
  void mode;
  void isSubmitting;
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
    hasDependents: false,
    probationMode: "3m" as "3m" | "6m" | "date",
    department: "",
    role: "",
    gender: "male" as "male" | "female" | "other",
    tier: "",
    residencyStatus: "local" as "local" | "foreigner",
    isTaxable: true,
    status: "active" as "active" | "inactive",
    isProbation: false,
  });

  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [assignedPolicies, setAssignedPolicies] = useState<AssignedPolicy[]>([]);

  const generateEmpCode = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, empCode: `ACM-${random}` }));
  };

  const addDependent = () => {
    setDependents([...dependents, { id: Math.random().toString(36).substr(2, 9), relationship: "Spouse", name: "", email: "", phone: "" }]);
  };

  const removeDependent = (id: string) => {
    setDependents(dependents.filter((d) => d.id !== id));
  };

  const updateDependent = (id: string, field: keyof Dependent, value: string) => {
    setDependents(dependents.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  };

  const addPolicy = () => {
    setAssignedPolicies([
      ...assignedPolicies,
      {
        policyId: MOCK_FORM_POLICIES[0].id,
        policyName: MOCK_FORM_POLICIES[0].name,
        benefitGroupId: MOCK_FORM_POLICIES[0].groups[0].id,
        benefitGroupName: MOCK_FORM_POLICIES[0].groups[0].name,
      },
    ]);
  };

  const removePolicy = (index: number) => {
    setAssignedPolicies(assignedPolicies.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, dependents, assignedPolicies });
  };

  return (
    <form id="employeeForm" onSubmit={handleFormSubmit} className="space-y-6">
      {/* Section: Personal Identity */}
      <div id="personal-identity" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-24">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2 pb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <User size={16} weight="fill" />
            </div>
            <h3 className="text-lead font-semibold text-foreground">Personal Identity</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-label font-medium text-subtle">
                Employee Full Name <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
                <input
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5 flex flex-col">
              <label className="text-label font-medium text-subtle">
                Date of Birth <span className="text-destructive">*</span>
              </label>
              <DatePickerField
                value={formData.dateOfBirth}
                onChange={(v) => setFormData({ ...formData, dateOfBirth: v })}
                placeholder="Select date of birth"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-label font-medium text-subtle">
                Identification (IC / Passport) <span className="text-destructive">*</span>
              </label>
              <IdentificationInput
                type={formData.idType}
                number={formData.idNumber}
                onTypeChange={(v) => setFormData({ ...formData, idType: v })}
                onNumberChange={(v) => setFormData({ ...formData, idNumber: v })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-label font-medium text-subtle">
                Gender <span className="text-destructive">*</span>
              </label>
              <select
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as "male" | "female" | "other" })}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5 col-span-2">
              <label className="text-label font-medium text-subtle">Residency & Taxable Status</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20">
                  <Globe size={18} className="text-faint" />
                  <div className="flex-1">
                    <p className="text-body font-medium text-foreground">Residency</p>
                  </div>
                  <select
                    className="bg-background px-2 py-1 rounded text-label font-medium outline-none border border-border"
                    value={formData.residencyStatus}
                    onChange={(e) => setFormData({ ...formData, residencyStatus: e.target.value as "local" | "foreigner" })}
                  >
                    <option value="local">Local</option>
                    <option value="foreigner">Foreigner</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20">
                  <CreditCard size={18} className="text-faint" />
                  <div className="flex-1">
                    <p className="text-body font-medium text-foreground">Taxable</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isTaxable: !formData.isTaxable })}
                    className={cn(
                      "relative h-5 w-10 rounded-full transition-all duration-300",
                      formData.isTaxable ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <div className={cn(
                      "absolute top-0.5 h-4 w-4 rounded-full bg-background shadow-sm transition-all duration-300",
                      formData.isTaxable ? "left-[22px]" : "left-0.5"
                    )} />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-label font-medium text-subtle">Corporate Email</label>
              <div className="relative">
                <Envelope size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
                <input
                  type="email"
                  placeholder="sarah.j@acme.com"
                  className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-label font-medium text-subtle">
                Mobile Phone Number <span className="text-destructive">*</span>
              </label>
              <PhoneInput
                value={formData.phone}
                onChange={(v) => setFormData({ ...formData, phone: v })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section: Employment Configuration */}
      <div id="employment-configuration" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2 pb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Briefcase size={16} weight="fill" />
            </div>
            <h3 className="text-lead font-semibold text-foreground">Employment Configuration</h3>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-label font-medium text-subtle">
                  Join Date <span className="text-destructive">*</span>
                </label>
                <DatePickerField
                  value={formData.joinDate}
                  onChange={(v) => setFormData({ ...formData, joinDate: v })}
                  placeholder="Select join date"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-label font-medium text-subtle">Employee Code</label>
                <div className="relative flex items-center h-[38px] bg-background border border-border rounded-lg px-2 focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary/30 transition-all">
                  <input
                    placeholder="ACM-XXXX"
                    className="flex-1 bg-transparent border-none outline-none text-body px-1 font-mono tracking-tight"
                    value={formData.empCode}
                    onChange={(e) => setFormData({ ...formData, empCode: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={generateEmpCode}
                    className="w-7 h-7 rounded bg-muted flex items-center justify-center text-faint hover:bg-primary/10 hover:text-primary transition-all ml-1"
                    title="Auto-generate"
                  >
                    <DiceFive size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-label font-medium text-subtle">Department</label>
                <input
                  placeholder="e.g. Engineering"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-label font-medium text-subtle">Role / Designation</label>
                <input
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-label font-medium text-subtle">Position Level (Tier)</label>
                <select
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all"
                  value={formData.tier}
                  onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                >
                  <option value="">Select Tier</option>
                  <option value="T1">Tier 1 - Director / C-Level</option>
                  <option value="T2">Tier 2 - Management</option>
                  <option value="T3">Tier 3 - Executive</option>
                  <option value="T4">Tier 4 - Support / Staff</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-label font-medium text-subtle">Status</label>
                <select
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-label font-medium text-subtle">Is Probation</label>
                <div className="flex items-center gap-4 p-3 rounded-lg border border-border bg-muted/20">
                  <span className="text-body font-medium text-foreground flex-1">{formData.isProbation ? "Yes" : "No"}</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isProbation: !formData.isProbation })}
                    className={cn(
                      "relative h-5 w-10 rounded-full transition-all duration-300",
                      formData.isProbation ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <div className={cn(
                      "absolute top-0.5 h-4 w-4 rounded-full bg-background shadow-sm transition-all duration-300",
                      formData.isProbation ? "left-[22px]" : "left-0.5"
                    )} />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-label font-medium text-subtle">Employment Type</label>
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

            {formData.isProbation && (
              <div className="p-5 rounded-lg border border-border bg-muted/10 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-body font-medium text-foreground tracking-tight">Probation Details</h5>
                    <p className="text-label text-subtle mt-0.5 font-normal">Choose how the probation period is defined</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-2">
                  {([
                    { id: "3m", label: "3 Months", desc: "Standard probation", icon: <Hourglass size={14} /> },
                    { id: "6m", label: "6 Months", desc: "Extended probation", icon: <Clock size={14} /> },
                    { id: "date", label: "Specific Date", desc: "Pick exact end date", icon: <CalendarBlank size={14} /> },
                  ] as const).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, probationMode: opt.id })}
                      className={cn(
                        "flex flex-col items-start px-3 py-2.5 rounded-lg border text-left transition-all",
                        formData.probationMode === opt.id
                          ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                          : "border-border bg-background hover:border-primary/20"
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "text-body font-medium",
                          formData.probationMode === opt.id ? "text-primary" : "text-foreground"
                        )}>{opt.icon} {opt.label}</span>
                      </div>
                      <span className="text-label text-faint mt-0.5">{opt.desc}</span>
                    </button>
                  ))}
                </div>

                {formData.probationMode === "date" && (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="text-label font-medium text-subtle">Probation end date</label>
                    <DatePickerField
                      value={formData.probationEndDate}
                      onChange={(v) => setFormData({ ...formData, probationEndDate: v })}
                      placeholder="Select end date"
                    />
                  </div>
                )}

                {(formData.probationMode === "3m" || formData.probationMode === "6m") && formData.joinDate && (
                  <div className="flex items-center gap-2 text-label text-muted-foreground bg-background border border-border rounded-lg px-4 py-3 animate-in fade-in duration-500">
                    <CalendarBlank size={16} weight="bold" className="text-primary shrink-0" />
                    <span className="font-medium">Probation ends on <strong className="text-foreground font-semibold underline underline-offset-4 decoration-primary/30">
                      {(() => {
                        const d = new Date(formData.joinDate + "T00:00:00");
                        d.setMonth(d.getMonth() + (formData.probationMode === "3m" ? 3 : 6));
                        return d.toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });
                      })()}
                    </strong></span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section: Benefit Policy Assignment */}
      <div id="benefit-policy-assignment" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2 pb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Shield size={16} weight="fill" />
            </div>
            <h3 className="text-lead font-semibold text-foreground">Benefit Policy Assignment</h3>
          </div>

          <div className="space-y-4">
            {assignedPolicies.map((assigned, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-border bg-background shadow-sm flex items-start justify-between gap-4">
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-label font-medium text-subtle">Select benefit policy</label>
                      {assigned.version && (
                        <span className="text-label font-mono text-muted-foreground">{assigned.version}</span>
                      )}
                    </div>
                    <select
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                      value={assigned.policyId}
                      onChange={(e) => {
                        const pol = MOCK_FORM_POLICIES.find((p) => p.id === e.target.value);
                        if (pol) {
                          const updated = [...assignedPolicies];
                          updated[idx] = { ...assigned, policyId: pol.id, policyName: pol.name, version: pol.version };
                          setAssignedPolicies(updated);
                        }
                      }}
                    >
                      {MOCK_FORM_POLICIES.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}{p.version ? ` · ${p.version}` : ""}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-label font-medium text-subtle">Select benefit group</label>
                    <select
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                      value={assigned.benefitGroupId}
                      onChange={(e) => {
                        const updated = [...assignedPolicies];
                        updated[idx].benefitGroupId = e.target.value;
                        setAssignedPolicies(updated);
                      }}
                    >
                      {MOCK_FORM_POLICIES.find((p) => p.id === assigned.policyId)?.groups.map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removePolicy(idx)}
                  className="mt-6 p-1.5 text-faint hover:text-destructive transition-colors"
                >
                  <Trash size={18} />
                </button>
              </div>
            ))}

            <Button
              variant="outline"
              className="w-full border-dashed border-border h-12 text-faint hover:text-primary hover:border-primary/40 hover:bg-muted/30 transition-all"
              onClick={addPolicy}
              type="button"
            >
              <Plus size={16} weight="bold" className="mr-2" /> Add Another Benefit Policy
            </Button>
          </div>
        </div>
      </div>

      {/* Section: Dependent Links */}
      <div id="dependent-links" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2 pb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Users size={16} weight="fill" />
            </div>
            <h3 className="text-lead font-semibold text-foreground">Dependent Links</h3>
          </div>

          <div className="space-y-5">
            {dependents.map((dep) => (
              <div key={dep.id} className="p-5 rounded-lg border border-border bg-muted/5 space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-label font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full tracking-wider uppercase">Dependent unit</span>
                  <button
                    type="button"
                    onClick={() => removeDependent(dep.id)}
                    className="text-faint hover:text-destructive transition-colors"
                  >
                    <Trash size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <label className="text-label font-medium text-subtle">Relationship</label>
                    <select
                      value={dep.relationship}
                      onChange={(e) => updateDependent(dep.id, "relationship", e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                    >
                      {RELATIONSHIPS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <label className="text-label font-medium text-subtle">Full name</label>
                    <input
                      value={dep.name}
                      onChange={(e) => updateDependent(dep.id, "name", e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                      placeholder="Full Name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-label font-medium text-subtle">Email address</label>
                    <input
                      value={dep.email}
                      onChange={(e) => updateDependent(dep.id, "email", e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                      placeholder="Email"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-label font-medium text-subtle">Phone number</label>
                    <PhoneInput
                      value={dep.phone}
                      onChange={(v) => updateDependent(dep.id, "phone", v)}
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              className="w-full border-dashed border-border h-14 text-faint hover:text-primary hover:border-primary/40 hover:bg-muted/30 transition-all"
              onClick={addDependent}
              type="button"
            >
              <Plus size={18} weight="bold" className="mr-2" /> Register New Dependent
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
