import type { Dispatch, SetStateAction, RefObject } from "react"
import type {
  BenefitPolicy,
  BenefitGroup,
  Benefit,
  DistributionType,
  UtilisationMode,
  ProrateUnit,
  RefreshCycle,
  BenefitGroupCoverageScope,
} from "@/types/policy"
import type { MainServiceId } from "@/lib/mock-data/service-catalog"

export type GroupFieldValue =
  | string
  | number
  | boolean
  | DistributionType
  | UtilisationMode
  | ProrateUnit
  | RefreshCycle
  | BenefitGroupCoverageScope
  | undefined

/**
 * All shared mutable state and callbacks passed to BenefitPolicyWizard step
 * components. Steps destructure only what they need.
 */
export interface BenefitPolicyWizardCtx {
  // Policy form state
  policyData: Partial<BenefitPolicy>
  setPolicyData: Dispatch<SetStateAction<Partial<BenefitPolicy>>>
  // Groups & benefits state
  groups: BenefitGroup[]
  benefits: Benefit[]
  // Validation
  validationErrors: Record<string, string>
  // Modal state
  depModalGroupId: string | null
  setDepModalGroupId: Dispatch<SetStateAction<string | null>>
  // Employee assignment state
  assignedEmployeeIds: string[]
  setAssignedEmployeeIds: Dispatch<SetStateAction<string[]>>
  assignmentOrgId: string
  setAssignmentOrgId: Dispatch<SetStateAction<string>>
  showCustomizeAssignment: boolean
  setShowCustomizeAssignment: Dispatch<SetStateAction<boolean>>
  // ID counters
  groupIdRef: RefObject<number>
  benefitIdRef: RefObject<number>
  // Derived / config
  isViewMode: boolean
  orgId?: string
  // Group & benefit mutation callbacks
  toggleEmploymentType: (id: string) => void
  addGroup: () => void
  removeGroup: (groupId: string) => void
  updateGroup: (groupId: string, field: keyof BenefitGroup, value: GroupFieldValue) => void
  updateGroupCoPayment: (groupId: string, field: "required" | "type" | "value", value: boolean | string | number) => void
  updateDependentCoPayment: (groupId: string, field: "required" | "type" | "value", value: boolean | string | number) => void
  toggleService: (groupId: string, serviceId: MainServiceId) => void
  updateBenefit: (benefitId: string, field: string, value: string | number | boolean | string[]) => void
  setGroupCoverageScope: (groupId: string, scope: BenefitGroupCoverageScope) => void
  // Navigation — needed by AssignStep for "Assign All / Later" shortcuts
  nextStep: () => void
}
