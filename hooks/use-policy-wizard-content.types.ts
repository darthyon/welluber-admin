import type { Benefit, BenefitGroup, BenefitPolicy } from "@/types/policy"
import type { PolicyWizardCtx } from "@/components/host/policies/wizard-section-types"

export interface PolicyWizardContentOptions {
  mode?: "create" | "edit"
  groupsOnly?: boolean
  initialData?: {
    policy: Partial<BenefitPolicy>
    groups: BenefitGroup[]
    benefits: Benefit[]
  }
  lockedOrganizationId?: string
  onSubmit: (data: {
    policy: Partial<BenefitPolicy>
    groups: BenefitGroup[]
    benefits: Benefit[]
  }) => void
  onReview?: (data: {
    policy: Partial<BenefitPolicy>
    groups: BenefitGroup[]
    benefits: Benefit[]
  }) => void
  onValidationChange?: (sectionErrorCounts: Record<string, number>) => void
  onDirtyChange?: (dirty: boolean) => void
  onTargetingChange?: (targeting: {
    organizationId?: string
    employmentTypes: string[]
    tierIds: string[]
    departmentIds: string[]
  }) => void
  onIssuesChange?: (entries: Array<{ key: string; label: string; target: string }>) => void
  onSaveStatusChange?: (state: { status: "idle" | "saving" | "saved"; savedAt?: string }) => void
}

export interface PolicyWizardContentState {
  ctx: PolicyWizardCtx
  handleSubmit: () => void
}
