"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { CaretDown, IdentificationCard } from "@phosphor-icons/react"
import { FormActionBar } from "@/components/shared/form-step-wizard"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { PolicyWizardContent, PolicyReviewCards } from "@/components/host/policies/policy-wizard-content"
import { MOCK_POLICIES, MOCK_POLICY_DATA_MAP } from "@/lib/mock-data"
import type { BenefitPolicy, BenefitGroup, Benefit } from "@/types/policy"

interface PolicyEditFlowProps {
  policyId: string
  organizationId?: string
}

export function PolicyEditFlow({ policyId, organizationId }: PolicyEditFlowProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const backHref = organizationId
    ? `/organizations/${encodeURIComponent(organizationId)}?tab=policies`
    : "/policies"
  const reviewHref = organizationId
    ? `/organizations/${encodeURIComponent(organizationId)}/policies/${encodeURIComponent(policyId)}/edit/review`
    : `/policies/${encodeURIComponent(policyId)}/edit/review`
  const draftKey = `policy-draft-edit-${policyId}`

  const initialData = useMemo<
    | {
        policy: Partial<BenefitPolicy>
        groups: BenefitGroup[]
        benefits: Benefit[]
      }
    | undefined
  >(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem(draftKey)
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch {
          // Fall through to the seeded policy data.
        }
      }
    }
    const policy = MOCK_POLICIES.find((item) => item.id === policyId)
    const data = MOCK_POLICY_DATA_MAP[policyId]
    if (policy && data) return { policy, groups: data.groups, benefits: data.benefits }
    return undefined
  }, [draftKey, policyId])

  const handleReview = (data: {
    policy: Partial<BenefitPolicy>
    groups: BenefitGroup[]
    benefits: Benefit[]
  }) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(draftKey, JSON.stringify(data))
    }
    router.push(reviewHref)
  }

  return (
    <div className="animate-in pb-24 duration-500 fade-in slide-in-from-bottom-4">
      <div className="mx-auto flex max-w-[1280px] flex-col items-start gap-12 lg:flex-row lg:gap-16">
        <aside className="sticky top-20 hidden w-52 shrink-0 gap-3 self-start xl:flex xl:flex-col">
          {initialData && (
            <Collapsible defaultOpen={false}>
              <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-muted/20">
                <span className="flex items-center gap-2 text-label font-semibold text-foreground">
                  <IdentificationCard size={14} weight="duotone" className="text-primary" />
                  Policy Summary
                </span>
                <CaretDown size={12} weight="bold" className="shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="space-y-2 rounded-lg border border-border bg-card p-3">
                  <PolicyReviewCards policy={initialData.policy} groups={initialData.groups} benefits={initialData.benefits} />
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </aside>

        <div className="w-full min-w-0 flex-1">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-heading font-semibold text-balance text-foreground">Edit Benefit Policy</h1>
              <p className="mt-1 text-body text-subtle">Update eligibility rules, pool strategies, and service groups.</p>
            </div>

            <PolicyWizardContent
              mode="edit"
              initialData={initialData}
              onReview={handleReview}
              onSubmit={handleReview}
              currentStep={currentStep}
              onStepChange={setCurrentStep}
              allowStepJumping
              reviewOnSubmit
            />

            <FormActionBar
              currentStep={currentStep}
              totalSteps={3}
              mode="edit"
              onCancel={() => router.push(backHref)}
              onBack={() => setCurrentStep((step) => Math.max(1, step - 1) as 1 | 2 | 3)}
              onNext={() => setCurrentStep((step) => Math.min(3, step + 1) as 1 | 2 | 3)}
              primaryLabel="Review Changes"
              primaryIcon="arrow-right"
              formId="policyWizardForm"
              contentClassName="max-w-[1280px]"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
