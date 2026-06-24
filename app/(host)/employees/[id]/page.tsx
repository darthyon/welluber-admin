"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { EmployeeDetail } from "@/components/host/employees/employee-detail";
import type { EmployeeDetailRecord } from "@/features/employees/types";

// Mock data - will be replaced with API calls
const mockEmployee: EmployeeDetailRecord = {
  id: "EMP-20260115-0001",
  orgId: "ORG-20260115-0001",
  name: "Robert Fox",
  email: "robert.fox@acme.com",
  organization: "ACME Corporation",
  branch: "ACME HQ (Kuala Lumpur)",
  joinDate: "12 Oct 2023",
  lastActive: "09 Apr 2026, 17:15",
  status: "Linked",
  empCode: "ACM-1002",
  department: "Engineering",
  tier: "Tier 3 - Executive",
  employmentType: "Full-time",
  designation: "Senior Software Engineer",
  dateOfBirth: "12 May 1990",
  idType: "IC",
  idNumber: "900512-14-5231",
  mobile: "+60 12-345 6789",
  nationality: "Malaysian",
  gender: "Male",
  residencyStatus: "Local",
  isProbation: false,
  probationEndDate: "12 Jan 2024",
  benefitPolicies: [
    {
      policyId: "POL-20260115-0001",
      policyName: "Wellness Allocation 2026",
      assignedGroupIds: ["g1"],
      benefitGroups: ["Gym Membership"],
      utilisation: 48,
    },
    {
      policyId: "POL-20260115-0002",
      policyName: "Lifestyle Pocket 2026",
      assignedGroupIds: ["g3"],
      benefitGroups: ["Travel"],
      utilisation: 85,
    },
  ],
  dependents: [
    { id: "dep_1", relationship: "Spouse", name: "Jane Fox", email: "jane.fox@email.com", phone: "+60 12-345 6790" },
    { id: "dep_2", relationship: "Child", name: "Tom Fox", email: "", phone: "+60 12-345 6791" },
  ],
};

export default function EmployeePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeId = params.id as string;

  // When opened from an org's Employees tab, return there instead of the global directory.
  const fromOrgId = searchParams.get("from");
  const backLabel = fromOrgId ? "Back to Employees" : "Back to Employee Directory";
  const backHref = fromOrgId ? `/organizations/${fromOrgId}?tab=employees` : "/employees";

  return (
    <div className="p-6 pb-12 lg:p-8">
      <EmployeeDetail
        employee={mockEmployee}
        backLabel={backLabel}
        onBack={() => router.push(backHref)}
        onEdit={() => router.push(`/employees/${employeeId}/edit`)}
      />
    </div>
  );
}
