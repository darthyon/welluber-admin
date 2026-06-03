import type { BenefitGroupCoverageScope, BenefitPolicy, BenefitGroup, Benefit } from "@/types/policy"
import type { MainServiceId } from "@/lib/mock-data/service-catalog"
import type { GroupFieldValue } from "@/components/host/policies/wizard-types"

export interface BenefitPolicyWizardOptions {
  mode: "create" | "edit" | "view"
  orgId?: string
  initialData?: {
    policy: Partial<BenefitPolicy>
    groups: BenefitGroup[]
    benefits: Benefit[]
  }
  onSuccess: (data: {
    policy: Partial<BenefitPolicy>
    groups: BenefitGroup[]
    benefits: Benefit[]
    assignedEmployeeIds?: string[]
  }) => void
  onSaveDraft?: (data: {
    policy: Partial<BenefitPolicy>
    groups: BenefitGroup[]
    benefits: Benefit[]
  }) => void
}

export interface BenefitPolicyWizardState {
  currentStep: number
  isSubmitting: boolean
  isSuccess: boolean
  showPostCreateModal: boolean
  showLaunchConfirmModal: boolean
  policyData: Partial<BenefitPolicy>
  setPolicyData: React.Dispatch<React.SetStateAction<Partial<BenefitPolicy>>>
  groups: BenefitGroup[]
  benefits: Benefit[]
  validationErrors: Record<string, string>
  depModalGroupId: string | null
  setDepModalGroupId: React.Dispatch<React.SetStateAction<string | null>>
  assignedEmployeeIds: string[]
  setAssignedEmployeeIds: React.Dispatch<React.SetStateAction<string[]>>
  assignmentOrgId: string
  setAssignmentOrgId: React.Dispatch<React.SetStateAction<string>>
  showCustomizeAssignment: boolean
  setShowCustomizeAssignment: React.Dispatch<React.SetStateAction<boolean>>
  groupIdRef: React.RefObject<number>
  benefitIdRef: React.RefObject<number>
  hasDraft: boolean
  draftSavedAt: string | undefined
  draftRestored: boolean
  nextStep: () => Promise<void>
  prevStep: () => void
  goToStep: (stepId: number) => void
  handleSubmit: () => Promise<void>
  handleSaveDraft: () => void
  handleActivateFromModal: () => Promise<void>
  handleLaunchClick: () => void
  handleRestoreDraft: () => void
  handleViewFromModal: () => void
  clearDraft: () => void
  setShowLaunchConfirmModal: React.Dispatch<React.SetStateAction<boolean>>
  toggleEmploymentType: (id: string) => void
  addGroup: () => void
  removeGroup: (groupId: string) => void
  updateGroup: (groupId: string, field: keyof BenefitGroup, value: GroupFieldValue) => void
  updateGroupCoPayment: (
    groupId: string,
    field: "required" | "type" | "value",
    value: boolean | string | number
  ) => void
  updateDependentCoPayment: (
    groupId: string,
    field: "required" | "type" | "value",
    value: boolean | string | number
  ) => void
  toggleService: (groupId: string, serviceId: MainServiceId) => void
  updateBenefit: (benefitId: string, field: string, value: string | number | boolean | string[]) => void
  setGroupCoverageScope: (groupId: string, scope: BenefitGroupCoverageScope) => void
}
