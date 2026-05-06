import type { ClaimStatus } from "@/types/claims"

export interface EmployeeDirectoryItem {
  id: string
  orgId?: string
  name: string
  email: string
  organization: string
  branch: string
  joinDate: string
  lastActive: string
  status: string
  empCode: string
  department?: string
  tier?: string
  employmentType?: string
  benefitPolicies: {
    policyName: string
    benefitGroups: string[]
    utilisation: number
  }[]
}

export interface AssignablePolicy {
  id: string
  name: string
  description: string
  benefitGroups: string[]
  totalAllocated: number
  eligibility: {
    employeeTypes: string[]
    roles: string[]
  }
}

export interface FormPolicy {
  id: string
  name: string
  groups: { id: string; name: string }[]
}

export interface VoucherRedemption {
  id: string
  voucherCode: string
  voucherName: string
  category: string
  benefitType: string
  date: string
  redeemedBy: string
  redeemedByType: "Employee" | "Dependent"
  amount: number
  provider: string
  branch: string
  city: string
  status: ClaimStatus
}
