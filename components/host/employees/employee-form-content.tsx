"use client";

import { useState } from "react";
import {
  User,
  Users,
  Envelope,
  CalendarBlank,
  DiceFive,
  Briefcase,
  Clock,
  Handshake,
  GraduationCap,
  Shield,
  Plus,
  Trash,
  Info,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ChoiceCard } from "@/components/shared/choice-card";
import { DatePickerField } from "@/components/shared/date-picker-field";
import { PhoneInput } from "@/components/shared/phone-input";
import { IdentificationInput, IdTypeOption } from "@/components/shared/identification-input";
import { FormSelect } from "@/components/shared/form-select";
import { cn } from "@/lib/utils";
import { MOCK_FORM_POLICIES } from "@/lib/mock-data";

interface Dependent {
  id: string;
  relationship: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface AssignedPolicy {
  policyId: string;
  policyName: string;
  version?: string;
}

const EMPLOYMENT_TYPES = [
  { id: "full-time", title: "Full-time", description: "Standard permanent role with full benefits & probation.", icon: Briefcase },
  { id: "part-time", title: "Part-time", description: "Reduced hours role with prorated benefits.", icon: Clock },
  { id: "contract", title: "Contract", description: "Fixed-term engagement based on contract duration.", icon: Handshake },
  { id: "internship", title: "Internship", description: "Temporary learning-focused role with limited benefits.", icon: GraduationCap },
];

const RELATIONSHIPS = [
  "Spouse", "Child", "Mother", "Father", "Brother", "Sister", "Mother-in-law", "Father-in-law"
];

const MOCK_BRANCHES = [
  { id: "br_1", name: "ACME HQ (Kuala Lumpur)", country: "Malaysia" },
  { id: "br_2", name: "ACME Subang Jaya", country: "Malaysia" },
  { id: "br_3", name: "ACME Singapore", country: "Singapore" },
];

const ID_TYPES_BY_COUNTRY: Record<string, IdTypeOption[]> = {
  Malaysia: [
    { id: "IC", label: "IC", description: "National ID Card (MyKad)" },
    { id: "Passport", label: "Passport", description: "International Travel Document" },
  ],
  Singapore: [
    { id: "NRIC", label: "NRIC", description: "Singapore National ID" },
    { id: "Passport", label: "Passport", description: "International Travel Document" },
  ],
  Indonesia: [
    { id: "KTP", label: "KTP", description: "Kartu Tanda Penduduk" },
    { id: "Passport", label: "Passport", description: "International Travel Document" },
  ],
  Thailand: [
    { id: "NID", label: "Thai NID", description: "Thai National ID Card" },
    { id: "Passport", label: "Passport", description: "International Travel Document" },
  ],
};

const MOCK_DEPARTMENTS = [
  { id: "DC-001", name: "HR" },
  { id: "DC-002", name: "Tech" },
  { id: "DC-003", name: "Marketing" },
  { id: "DC-004", name: "Finance" },
  { id: "DC-005", name: "Operations" },
];

const MOCK_TIERS = [
  { id: "TC-001", name: "Executive" },
  { id: "TC-002", name: "Senior Manager" },
  { id: "TC-003", name: "Manager" },
  { id: "TC-004", name: "Associate" },
];

interface EmployeeFormContentProps {
  mode: "create" | "edit";
  onSubmit: (data: unknown) => void;
  isSubmitting: boolean;
  departments?: { id: string; name: string }[];
  tiers?: { id: string; name: string }[];
}

function calcTimeUntil(dateStr: string): { months: number; days: number } | null {
  const target = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return null;
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return { months: Math.floor(totalDays / 30), days: totalDays % 30 };
}

export function EmployeeFormContent({ mode, onSubmit, isSubmitting, departments, tiers }: EmployeeFormContentProps) {
  void mode;
  void isSubmitting;
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    branchId: "",
    dateOfBirth: "",
    idType: "IC",
    idNumber: "",
    email: "",
    phone: "+60 ",
    joinDate: "",
    empCode: "",
    probationEndDate: "",
    employmentType: "full-time",
    endDate: "",
    department: "",
    role: "",
    gender: "male" as "male" | "female",
    tier: "",
    isProbation: false,
  });

  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [assignedPolicies, setAssignedPolicies] = useState<AssignedPolicy[]>([]);

  const selectedBranch = MOCK_BRANCHES.find(b => b.id === formData.branchId);
  const idTypes = selectedBranch
    ? ID_TYPES_BY_COUNTRY[selectedBranch.country] ?? ID_TYPES_BY_COUNTRY["Malaysia"]!
    : ID_TYPES_BY_COUNTRY["Malaysia"]!;

  const resolvedDepts = (departments && departments.length > 0) ? departments : MOCK_DEPARTMENTS;
  const resolvedTiers = (tiers && tiers.length > 0) ? tiers : MOCK_TIERS;

  const isContractType = ["part-time", "contract", "internship"].includes(formData.employmentType);

  const generateEmpCode = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, empCode: `ACM-${random}` }));
  };

  const addDependent = () => {
    setDependents([...dependents, { id: Math.random().toString(36).substr(2, 9), relationship: "Spouse", firstName: "", lastName: "", email: "", phone: "" }]);
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
        version: MOCK_FORM_POLICIES[0].version,
      },
    ]);
  };

  const removePolicy = (index: number) => {
    setAssignedPolicies(assignedPolicies.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      dependents,
      assignedPolicies,
    });
  };

  return (
    <form id="employeeForm" onSubmit={handleFormSubmit} className="space-y-6">
      {/* Section: Personal Details */}
      <div id="personal-identity" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-24">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2 pb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <User size={16} weight="fill" />
            </div>
            <h3 className="text-lead font-semibold text-foreground">Personal Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-label font-medium text-subtle">
                First Name <span className="text-destructive">*</span>
              </label>
              <input
                placeholder="e.g. Sarah"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-label font-medium text-subtle">
                Last Name <span className="text-destructive">*</span>
              </label>
              <input
                placeholder="e.g. Jenkins"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
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
              <label className="text-label font-medium text-subtle">Gender</label>
              <FormSelect
                value={formData.gender}
                onChange={(v) => setFormData({ ...formData, gender: v as "male" | "female" })}
                options={[
                  { label: "Male", value: "male" },
                  { label: "Female", value: "female" },
                ]}
              />
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

      {/* Section: Employment Details */}
      <div id="employment-details" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2 pb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Briefcase size={16} weight="fill" />
            </div>
            <h3 className="text-lead font-semibold text-foreground">Employment Details</h3>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Branch selector (E4) */}
              <div className="space-y-1.5">
                <label className="text-label font-medium text-subtle">
                  Branch <span className="text-destructive">*</span>
                </label>
                <FormSelect
                  value={formData.branchId}
                  onChange={(v) => setFormData({ ...formData, branchId: v })}
                  options={[
                    { label: "Select branch", value: "" },
                    ...MOCK_BRANCHES.map(b => ({ label: b.name, value: b.id })),
                  ]}
                />
              </div>

              {/* Identification (E5) — type options dynamic by branch country */}
              <div className="space-y-1.5">
                <label className="text-label font-medium text-subtle">
                  Identification <span className="text-destructive">*</span>
                </label>
                <IdentificationInput
                  type={formData.idType}
                  number={formData.idNumber}
                  idTypes={idTypes}
                  onTypeChange={(v) => setFormData({ ...formData, idType: v })}
                  onNumberChange={(v) => setFormData({ ...formData, idNumber: v })}
                />
              </div>

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

              {/* Department (E6) — always select, from org departmentConfigs */}
              <div className="space-y-1.5">
                <label className="text-label font-medium text-subtle">Department</label>
                <FormSelect
                  value={formData.department}
                  onChange={(v) => setFormData({ ...formData, department: v })}
                  options={[
                    { label: "Select department", value: "" },
                    ...resolvedDepts.map(d => ({ label: d.name, value: d.name })),
                  ]}
                />
              </div>

              {/* Position (E6) — always select, from org tierConfigs */}
              <div className="space-y-1.5">
                <label className="text-label font-medium text-subtle">Position</label>
                <FormSelect
                  value={formData.role}
                  onChange={(v) => setFormData({ ...formData, role: v })}
                  options={[
                    { label: "Select position", value: "" },
                    ...resolvedTiers.map(t => ({ label: t.name, value: t.name })),
                  ]}
                />
              </div>

              {/* Probation — combined toggle + label + date + callout (E10) */}
              <div className="col-span-full space-y-1.5">
                <label className="text-label font-medium text-subtle">On probation?</label>
                <div className="flex items-center gap-3">
                  {/* Left: toggle + label + inline date picker */}
                  <div className={cn(
                    "flex items-center gap-3 px-3 rounded-lg border border-border bg-muted/20 min-h-[42px] py-1.5 transition-all",
                    formData.isProbation ? "flex-1" : "shrink-0"
                  )}>
                    {/* WCAG toggle — visible ring when off */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={formData.isProbation}
                      onClick={() => setFormData({ ...formData, isProbation: !formData.isProbation, probationEndDate: formData.isProbation ? "" : formData.probationEndDate })}
                      className={cn(
                        "relative h-5 w-10 rounded-full shrink-0 transition-all duration-300 ring-1",
                        formData.isProbation
                          ? "bg-primary ring-primary/30"
                          : "bg-muted-foreground/25 ring-muted-foreground/40"
                      )}
                    >
                      <div className={cn(
                        "absolute top-0.5 h-4 w-4 rounded-full bg-background shadow-sm transition-all duration-300",
                        formData.isProbation ? "left-[22px]" : "left-0.5"
                      )} />
                    </button>
                    <span className="text-body font-medium text-foreground whitespace-nowrap">
                      {formData.isProbation ? "Yes" : "No"}
                    </span>

                    {/* Date picker appears inline when toggled on */}
                    {formData.isProbation && (
                      <div className="flex-1 -my-px animate-in fade-in slide-in-from-left-2 duration-200">
                        <DatePickerField
                          value={formData.probationEndDate}
                          onChange={(v) => setFormData({ ...formData, probationEndDate: v })}
                          placeholder="Select probation end date"
                          className="!border-0 !bg-transparent !rounded-none !ring-0 !shadow-none !px-0 focus:!ring-0 whitespace-nowrap"
                        />
                      </div>
                    )}
                  </div>

                  {/* Right: callout — beside the row when date is set */}
                  {formData.isProbation && formData.probationEndDate && (() => {
                    const until = calcTimeUntil(formData.probationEndDate);
                    const formatted = new Date(formData.probationEndDate + "T00:00:00").toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });
                    return (
                      <div className="flex items-center gap-2 bg-primary/5 rounded-lg px-3 py-2.5 shrink-0 animate-in fade-in slide-in-from-right-2 duration-300">
                        <Info size={14} weight="fill" className="text-primary shrink-0" />
                        <span className="text-label font-medium text-foreground whitespace-nowrap">
                          {until
                            ? <>Ends in <strong>{until.months}m {until.days}d</strong> · <span className="text-muted-foreground">{formatted}</span></>
                            : <>Ended · <span className="text-muted-foreground">{formatted}</span></>
                          }
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Employment Type (E13: endDate shown for non-full-time) */}
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

            {/* End Date for contract/part-time/internship (E13) */}
            {isContractType && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="text-label font-medium text-subtle">
                  Contract End Date <span className="text-destructive">*</span>
                </label>
                <DatePickerField
                  value={formData.endDate}
                  onChange={(v) => setFormData({ ...formData, endDate: v })}
                  placeholder="Select end date"
                />
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
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-label font-medium text-subtle">Select benefit policy</label>
                    {assigned.version && (
                      <span className="text-label font-mono text-muted-foreground">{assigned.version}</span>
                    )}
                  </div>
                  <FormSelect
                    value={assigned.policyId}
                    onChange={(v) => {
                      const pol = MOCK_FORM_POLICIES.find((p) => p.id === v);
                      if (pol) {
                        const updated = [...assignedPolicies];
                        updated[idx] = { policyId: pol.id, policyName: pol.name, version: pol.version };
                        setAssignedPolicies(updated);
                      }
                    }}
                    options={MOCK_FORM_POLICIES.map((p) => ({
                      label: `${p.name}${p.version ? ` · ${p.version}` : ""}`,
                      value: p.id,
                    }))}
                  />
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
              <Plus size={16} weight="bold" className="mr-2" /> Add Benefit Policy
            </Button>
          </div>
        </div>
      </div>

      {/* Section: Dependent Details */}
      <div id="dependent-links" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden scroll-mt-32">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2 pb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Users size={16} weight="fill" />
            </div>
            <h3 className="text-lead font-semibold text-foreground">Dependent Details</h3>
          </div>

          <div className="space-y-5">
            {dependents.map((dep) => (
              <div key={dep.id} className="p-5 rounded-lg border border-border bg-muted/5 space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-label font-semibold text-subtle">Dependent</span>
                  <button
                    type="button"
                    onClick={() => removeDependent(dep.id)}
                    className="text-faint hover:text-destructive transition-colors"
                  >
                    <Trash size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-label font-medium text-subtle">Relationship</label>
                    <FormSelect
                      value={dep.relationship}
                      onChange={(v) => updateDependent(dep.id, "relationship", v)}
                      options={RELATIONSHIPS.map((r) => ({ label: r, value: r }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-label font-medium text-subtle">First Name</label>
                    <input
                      value={dep.firstName}
                      onChange={(e) => updateDependent(dep.id, "firstName", e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                      placeholder="First Name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-label font-medium text-subtle">Last Name</label>
                    <input
                      value={dep.lastName}
                      onChange={(e) => updateDependent(dep.id, "lastName", e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-body outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                      placeholder="Last Name"
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
