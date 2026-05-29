import type { BenefitPolicy, BenefitGroup, Benefit } from "@/types/policy"
import type { EmployeeDirectoryItem } from "@/features/employees/types"

// ─── Domain types ─────────────────────────────────────────────────────────────

export interface BenefitOverride {
  benefitId: string
  amount?: number
  employeeAmount?: number
  dependantAmount?: number
}

export interface VersionResult {
  policy: Partial<BenefitPolicy>
  benefitOverrides: BenefitOverride[]
  targetEmployeeIds: string[]
}

// ─── Component props ──────────────────────────────────────────────────────────

export interface VersionWizardProps {
  parentPolicy: BenefitPolicy
  parentGroups: BenefitGroup[]
  parentBenefits: Benefit[]
  employees: EmployeeDirectoryItem[]
  orgTierConfigs?: { id: string; name: string; code?: string }[]
  orgDepartmentConfigs?: { id: string; name: string; code?: string }[]
  onSuccess: (data: VersionResult) => void
  onCancel: () => void
}

// ─── Shared context passed to all step components ─────────────────────────────

export interface VersionWizardCtx {
  // Props
  parentPolicy: BenefitPolicy
  parentGroups: BenefitGroup[]
  parentBenefits: Benefit[]
  employees: EmployeeDirectoryItem[]
  orgTierConfigs: { id: string; name: string; code?: string }[]

  // Step 1 — overrides
  versionName: string
  setVersionName: (v: string) => void
  capOverride: string
  setCapOverride: (v: string) => void
  overrides: Record<string, BenefitOverride>
  setOverride: (
    benefitId: string,
    field: Exclude<keyof BenefitOverride, "benefitId">,
    value: number | undefined
  ) => void
  clearOverride: (
    benefitId: string,
    field: Exclude<keyof BenefitOverride, "benefitId">
  ) => void

  // Step 2 — targeting
  tierFilter: string[]
  departmentFilter: string[]
  pinnedEmployeeIds: string[]
  empSearch: string
  setEmpSearch: (v: string) => void
  showEmpDropdown: boolean
  setShowEmpDropdown: (v: boolean) => void
  tierOptions: string[]
  departments: string[]
  targetedEmployees: EmployeeDirectoryItem[]
  empSearchResults: EmployeeDirectoryItem[]
  toggleTier: (tier: string) => void
  toggleDept: (dept: string) => void
  pinEmployee: (empId: string) => void
  unpinEmployee: (empId: string) => void

  // Step 3 — review
  confirmedEmployeeIds: string[]
  toggleConfirmed: (empId: string) => void
  toggleAllConfirmed: () => void
}
