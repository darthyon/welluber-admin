"use client"

import type { BenefitPolicy, BenefitGroup, Benefit } from "@/types/policy"
import { usePolicyWizardContent } from "@/hooks/use-policy-wizard-content"
import { PolicyDetailsSection } from "./wizard-sections/policy-details-section"
import { PoolSection } from "./wizard-sections/pool-section"
import { GroupsSection } from "./wizard-sections/groups-section"

// Re-export for consumers that import from this file
export { PolicyReviewCards } from "./policy-review-cards"

// ─── Props ────────────────────────────────────────────────────────────────────

interface PolicyWizardContentProps {
  mode?: "create" | "edit"
  groupsOnly?: boolean
  initialData?: {
    policy: Partial<BenefitPolicy>
    groups: BenefitGroup[]
    benefits: Benefit[]
  }
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
  lockedOrganizationId?: string
  onValidationChange?: (sectionErrorCounts: Record<string, number>) => void
  onDirtyChange?: (dirty: boolean) => void
  onTargetingChange?: (targeting: {
    organizationId?: string
    employmentTypes: string[]
    tierIds: string[]
    departmentIds: string[]
  }) => void
  onIssuesChange?: (
    entries: Array<{ key: string; label: string; target: string }>
  ) => void
  onSaveStatusChange?: (state: {
    status: "idle" | "saving" | "saved"
    savedAt?: string
  }) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PolicyWizardContent({
  mode = "create",
  groupsOnly = false,
  initialData,
  onSubmit,
  onReview,
  lockedOrganizationId,
  onValidationChange,
  onDirtyChange,
  onTargetingChange,
  onIssuesChange,
  onSaveStatusChange,
}: PolicyWizardContentProps) {
  const { ctx, handleSubmit } = usePolicyWizardContent({
    mode,
    groupsOnly,
    initialData,
    onSubmit,
    onReview,
    lockedOrganizationId,
    onValidationChange,
    onDirtyChange,
    onTargetingChange,
    onIssuesChange,
    onSaveStatusChange,
  })

  return (
    <form
      id="policyWizardForm"
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit()
      }}
      className="space-y-8"
    >
      {!groupsOnly && (
        <section id="policy-details" className="scroll-mt-32">
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="p-6 md:p-8">
              <PolicyDetailsSection ctx={ctx} />
            </div>
          </div>
        </section>
      )}

      {!groupsOnly && (
        <section id="pool-cycle" className="scroll-mt-32">
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="p-6 md:p-8">
              <PoolSection ctx={ctx} />
            </div>
          </div>
        </section>
      )}

      {groupsOnly && (
        <section id="groups-services" className="scroll-mt-32">
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="p-6 md:p-8">
              <GroupsSection ctx={ctx} />
            </div>
          </div>
        </section>
      )}
    </form>
  )
}
