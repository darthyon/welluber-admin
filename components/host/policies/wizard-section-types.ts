import type { Dispatch, SetStateAction, RefObject } from "react"
import type {
  BenefitPolicy,
  BenefitGroup,
  Benefit,
  BenefitGroupCoverageScope,
} from "@/types/policy"
import type { MainServiceId } from "@/lib/mock-data/service-catalog"

/**
 * All shared mutable state and callbacks passed to PolicyWizardContent section
 * components. Sections destructure only what they need.
 */
export interface PolicyWizardCtx {
  // Policy form state
  policyData: Partial<BenefitPolicy>
  setPolicyData: Dispatch<SetStateAction<Partial<BenefitPolicy>>>
  // Groups & benefits
  groups: BenefitGroup[]
  benefits: Benefit[]
  // Validation
  validationErrors: Record<string, string>
  // Config
  lockedOrganizationId?: string
  groupsOnly?: boolean
  // Derived options (from org selection)
  tierOptions: { value: string; label: string }[]
  departmentOptions: { value: string; label: string }[]
  // Modal state
  depModalGroupId: string | null
  setDepModalGroupId: Dispatch<SetStateAction<string | null>>
  // Refs
  nameInputRef: RefObject<HTMLInputElement | null>
  // Group & benefit mutations
  toggleEmploymentType: (id: string) => void
  addGroup: () => void
  removeGroup: (groupId: string) => void
  updateGroup: (groupId: string, field: keyof BenefitGroup, value: string | number | boolean | undefined) => void
  updateGroupCoPayment: (groupId: string, field: "required" | "type" | "value", value: boolean | string | number) => void
  updateDependentCoPayment: (groupId: string, field: "required" | "type" | "value", value: boolean | string | number) => void
  toggleService: (groupId: string, serviceId: MainServiceId) => void
  updateBenefit: (benefitId: string, field: string, value: string | number | boolean | string[]) => void
  setGroupCoverageScope: (groupId: string, scope: BenefitGroupCoverageScope) => void
  // Blur validators
  blurName: () => void
  blurBenefitAmount: (groupId: string, serviceId: string, amount: number) => void
  blurCopayValue: (groupId: string, serviceId: string, type: "Percentage" | "Fixed", value: number, benefitAmount: number) => void
  blurGroupCopayValue: (groupId: string, type: "Percentage" | "Fixed", value: number) => void
}
