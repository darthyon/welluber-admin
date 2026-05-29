"use client"

import { useState } from "react"
import { MOCK_BRANCHES, ID_TYPES_BY_COUNTRY, MOCK_DEPARTMENTS, MOCK_TIERS } from "./employee-form-constants"
import { PersonalDetailsSection } from "./employee-form-sections/personal-details-section"
import { EmploymentDetailsSection } from "./employee-form-sections/employment-details-section"
import { BenefitPolicySection } from "./employee-form-sections/benefit-policy-section"
import { DependentDetailsSection } from "./employee-form-sections/dependent-details-section"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Dependent {
  id: string
  relationship: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

interface AssignedPolicy {
  policyId: string
  policyName: string
  version?: string
}

export interface EmployeeFormData {
  firstName: string
  lastName: string
  name: string
  branchId: string
  dateOfBirth: string
  idType: string
  idNumber: string
  email: string
  phone: string
  joinDate: string
  empCode: string
  probationEndDate: string
  employmentType: string
  endDate: string
  department: string
  role: string
  gender: "male" | "female"
  tier: string
  isProbation: boolean
  dependents: Dependent[]
  assignedPolicies: AssignedPolicy[]
}

interface EmployeeFormContentProps {
  mode: "create" | "edit"
  onSubmit: (data: EmployeeFormData) => void
  isSubmitting: boolean
  departments?: { id: string; name: string }[]
  tiers?: { id: string; name: string }[]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EmployeeFormContent({
  mode,
  onSubmit,
  isSubmitting,
  departments,
  tiers,
}: EmployeeFormContentProps) {
  void mode
  void isSubmitting

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
  })

  const [dependents, setDependents] = useState<Dependent[]>([])
  const [assignedPolicies, setAssignedPolicies] = useState<AssignedPolicy[]>([])

  // Derived
  const selectedBranch = MOCK_BRANCHES.find((b) => b.id === formData.branchId)
  const idTypes = selectedBranch
    ? (ID_TYPES_BY_COUNTRY[selectedBranch.country] ?? ID_TYPES_BY_COUNTRY["Malaysia"]!)
    : ID_TYPES_BY_COUNTRY["Malaysia"]!
  const resolvedDepts = departments && departments.length > 0 ? departments : MOCK_DEPARTMENTS
  const resolvedTiers = tiers && tiers.length > 0 ? tiers : MOCK_TIERS
  const isContractType = ["part-time", "contract", "internship"].includes(formData.employmentType)

  const generateEmpCode = () => {
    const random = Math.floor(1000 + Math.random() * 9000)
    setFormData((prev) => ({ ...prev, empCode: `ACM-${random}` }))
  }

  const patch = (fields: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...fields }))
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      dependents,
      assignedPolicies,
    })
  }

  return (
    <form id="employeeForm" onSubmit={handleFormSubmit} className="space-y-6">
      <PersonalDetailsSection formData={formData} setFormData={patch} idTypes={idTypes} />
      <EmploymentDetailsSection
        formData={formData}
        setFormData={patch}
        idTypes={idTypes}
        resolvedDepts={resolvedDepts}
        resolvedTiers={resolvedTiers}
        isContractType={isContractType}
        generateEmpCode={generateEmpCode}
      />
      <BenefitPolicySection
        assignedPolicies={assignedPolicies}
        setAssignedPolicies={setAssignedPolicies}
      />
      <DependentDetailsSection
        dependents={dependents}
        setDependents={setDependents}
      />
    </form>
  )
}
