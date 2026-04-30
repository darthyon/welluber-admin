"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PencilSimpleLine, User, Briefcase, Shield, Users, Gift, Receipt, Ticket, Globe, CreditCard, ClockCounterClockwise, CalendarBlank, Buildings, IdentificationBadge, IdentificationCard, Calendar, DeviceMobile, EnvelopeSimple } from "@phosphor-icons/react";

import { FloatingAnchorNav } from "@/components/shared/floating-anchor-nav";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { DetailSection } from "@/components/shared/detail-section";
import { DetailField } from "@/components/shared/detail-field";
import { EmployeeEntitlementsTab } from "@/components/host/employees/employee-entitlements-tab";
import { EmployeePolicyTab } from "@/components/host/employees/employee-policy-tab";
import { EmployeeClaimsTab } from "@/components/host/employees/employee-claims-tab";
import { EmployeeVouchersTab } from "@/components/host/employees/employee-vouchers-tab";
import { Badge } from "@/components/ui/badge";

// Mock data - will be replaced with API calls
const mockEmployee = {
  id: "emp_1",
  name: "Robert Fox",
  email: "robert.fox@acme.com",
  status: "Linked",
  designation: "Senior Software Engineer",
  department: "Engineering",
  empCode: "ACM-1002",
  dateOfBirth: "12 May 1990",
  idType: "IC",
  idNumber: "900512-14-5231",
  mobile: "+60 12-345 6789",
  branch: "ACME HQ (Kuala Lumpur)",
  joinDate: "12 Oct 2023",
  employmentType: "Full-time",
  nationality: "Malaysian",
  tier: "Tier 3 - Executive",
  employeeStatus: "active",
  isProbation: false,
  gender: "Male",
  residencyStatus: "Local",
  isTaxable: true,
  role: "Senior Software Engineer",
  probationMode: "3m" as const,
  probationEndDate: "12 Jan 2024",
  assignedPolicies: [
    { policyId: "pol_1", policyName: "Wellness Allocation 2026", benefitGroupId: "g1", benefitGroupName: "Gym Membership" },
    { policyId: "pol_2", policyName: "Lifestyle Pocket 2026", benefitGroupId: "g3", benefitGroupName: "Travel" },
  ],
  dependents: [
    { id: "dep_1", relationship: "Spouse", name: "Jane Fox", email: "jane.fox@email.com", phone: "+60 12-345 6790" },
    { id: "dep_2", relationship: "Child", name: "Tom Fox", email: "", phone: "+60 12-345 6791" },
  ],
};

const ANCHOR_ITEMS = [
  { id: "personal-identity", label: "Personal Identity" },
  { id: "employment-configuration", label: "Employment Configuration" },
  { id: "benefit-policy-assignment", label: "Benefit Policy Assignment" },
  { id: "dependent-links", label: "Dependent Links" },
  { id: "entitlements", label: "Entitlements" },
  { id: "claims", label: "Claims" },
  { id: "vouchers", label: "Vouchers" },
];

export default function EmployeePage() {
  const params = useParams();
  const employeeId = params.id as string;
  const employee = mockEmployee;

  return (
    <div className="pb-12">
      <div className="p-6 lg:p-8">
        {/* Breadcrumb/Back Navigation */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-body font-medium text-subtle hover:text-primary"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={16} />
            Back
          </Button>
        </div>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <span className="font-medium text-heading">
                {(() => {
                  const parts = employee.name.trim().split(/\s+/).filter(Boolean)
                  return parts.length >= 2
                    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
                    : parts[0]?.substring(0, 2).toUpperCase() || "?"
                })()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-heading font-semibold text-foreground text-balance">{employee.name}</h2>
                <StatusBadge status={employee.status} variant="emerald" />
              </div>
              <p className="text-body text-subtle mt-0.5">
                {employee.designation} • {employee.department}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="text-body font-medium rounded-full transition-all"
            >
              <Link href={`/employees/${employeeId}/edit`}>
                <PencilSimpleLine size={16} weight="bold" className="mr-1.5" />
                Edit Employee
              </Link>
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          {/* Floating Anchor Nav Sidebar */}
          <aside className="hidden xl:block w-52 shrink-0 sticky top-20 self-start">
            <FloatingAnchorNav items={ANCHOR_ITEMS} />
          </aside>

          {/* Content Area */}
          <div className="flex-1 min-w-0 space-y-16">
            {/* Personal Identity */}
            <section id="personal-identity" className="scroll-mt-24">
              <DetailSection
                title="Personal Identity"
                icon={<User size={18} weight="bold" className="text-primary" />}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                  <DetailField label="Full Name" value={employee.name} icon={<User size={16} />} />
                  <DetailField label="Email Address" value={employee.email} icon={<EnvelopeSimple size={16} />} />
                  <DetailField label="Employee ID (System)" value={employee.id} icon={<Shield size={16} />} />
                  <DetailField label="Employee Code" value={employee.empCode} icon={<IdentificationBadge size={16} />} />
                  <DetailField label="Date of Birth" value={employee.dateOfBirth} icon={<Calendar size={16} />} />
                  <DetailField label={`Identification (${employee.idType})`} value={employee.idNumber} icon={<IdentificationCard size={16} />} />
                  <DetailField label="Mobile Number" value={employee.mobile} icon={<DeviceMobile size={16} />} />
                  <DetailField label="Gender" value={employee.gender} icon={<User size={16} />} />
                  <DetailField label="Residency Status" value={employee.residencyStatus} icon={<Globe size={16} />} />
                  <DetailField label="Taxable" value={employee.isTaxable ? "Yes" : "No"} icon={<CreditCard size={16} />} />
                </div>
              </DetailSection>
            </section>

            {/* Employment Configuration */}
            <section id="employment-configuration" className="scroll-mt-24">
              <DetailSection
                title="Employment Configuration"
                icon={<Briefcase size={18} weight="bold" className="text-primary" />}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                  <DetailField label="Branch / Workplace" value={employee.branch} icon={<Buildings size={16} />} />
                  <DetailField label="Join Date" value={employee.joinDate} icon={<CalendarBlank size={16} />} />
                  <DetailField label="Employment Type" value={employee.employmentType} icon={<ClockCounterClockwise size={16} />} />
                  <DetailField label="Department" value={employee.department} icon={<Buildings size={16} />} />
                  <DetailField label="Role / Designation" value={employee.role} icon={<User size={16} />} />
                  <DetailField label="Tier / Level" value={employee.tier || "—"} icon={<Buildings size={16} />} />
                  <DetailField label="Nationality" value={employee.nationality} icon={<Globe size={16} />} />
                  <DetailField label="Status" value={employee.employeeStatus} icon={<Shield size={16} />} />
                  <DetailField label="Is Probation" value={employee.isProbation ? "Yes" : "No"} icon={<ClockCounterClockwise size={16} />} />
                  {employee.isProbation && (
                    <DetailField label="Probation End Date" value={employee.probationEndDate} icon={<CalendarBlank size={16} />} />
                  )}
                </div>
              </DetailSection>
            </section>

            {/* Benefit Policy Assignment */}
            <section id="benefit-policy-assignment" className="scroll-mt-24">
              <DetailSection
                title="Benefit Policy Assignment"
                icon={<Shield size={18} weight="bold" className="text-primary" />}
              >
                {employee.assignedPolicies.length === 0 ? (
                  <p className="text-body text-subtle italic">No benefit policies assigned.</p>
                ) : (
                  <div className="space-y-4">
                    {employee.assignedPolicies.map((policy, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-muted/20 border border-border rounded-lg">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <Shield size={18} weight="duotone" />
                        </div>
                        <div className="flex-1">
                          <p className="text-body font-medium text-foreground">{policy.policyName}</p>
                          <p className="text-label text-subtle">{policy.benefitGroupName}</p>
                        </div>
                        <Badge variant="secondary" className="text-label">Active</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </DetailSection>
            </section>

            {/* Dependent Links */}
            <section id="dependent-links" className="scroll-mt-24">
              <DetailSection
                title="Dependent Links"
                icon={<Users size={18} weight="bold" className="text-primary" />}
              >
                {employee.dependents.length === 0 ? (
                  <p className="text-body text-subtle italic">No dependents registered.</p>
                ) : (
                  <div className="space-y-4">
                    {employee.dependents.map((dep) => (
                      <div key={dep.id} className="p-4 bg-muted/20 border border-border rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className="text-label uppercase tracking-wider">{dep.relationship}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                          <DetailField label="Full Name" value={dep.name} />
                          <DetailField label="Email" value={dep.email || "—"} />
                          <DetailField label="Phone" value={dep.phone} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </DetailSection>
            </section>

            {/* Entitlements */}
            <section id="entitlements" className="scroll-mt-24">
              <EmployeeEntitlementsTab employeeId={employeeId} />
            </section>

            {/* Claims */}
            <section id="claims" className="scroll-mt-24">
              <EmployeeClaimsTab employeeId={employeeId} />
            </section>

            {/* Vouchers */}
            <section id="vouchers" className="scroll-mt-24">
              <EmployeeVouchersTab employeeId={employeeId} />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
