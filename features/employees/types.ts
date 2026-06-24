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
  departmentId?: string
  department?: string
  tierId?: string
  tier?: string
  employmentType?: string
  benefitPolicies: {
    /** FK — canonical reference to BenefitPolicy.id */
    policyId: string
    /** Denormalized for table display only. Truth = policyId. */
    policyName: string
    /** FK list — canonical references to BenefitGroup.id */
    assignedGroupIds: string[]
    /** Denormalized group names for table display. Truth = assignedGroupIds. */
    benefitGroups: string[]
    utilisation: number
  }[]
}

export interface EmployeeDependent {
  id: string
  relationship: string
  name: string
  email: string
  phone: string
}

/** Full employee record for the detail view — extends the directory row with
 *  personal, employment, and household fields the list does not carry. */
export interface EmployeeDetailRecord extends EmployeeDirectoryItem {
  dateOfBirth: string
  idType: string
  idNumber: string
  mobile: string
  nationality: string
  designation: string
  gender?: string
  residencyStatus?: string
  isProbation?: boolean
  probationEndDate?: string
  dependents: EmployeeDependent[]
}

export interface AssignablePolicy {
  id: string
  name: string
  description: string
  /** Denormalized group names for assign modal display. Source of truth lives in BenefitGroup rows. */
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
  version?: string
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
