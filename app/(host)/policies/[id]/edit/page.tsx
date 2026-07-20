"use client"

import { useMemo, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  CaretLeft,
  NavigationArrow,
  CaretDown,
  IdentificationCard,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { FloatingAnchorNav } from "@/components/shared/floating-anchor-nav"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import {
  PolicyWizardContent,
  PolicyReviewCards,
} from "@/components/host/policies/policy-wizard-content"
import { MOCK_POLICIES, MOCK_POLICY_DATA_MAP } from "@/lib/mock-data"
import { BenefitPolicy, BenefitGroup, Benefit } from "@/types/policy"

const ANCHOR_ITEMS = [
  { id: "policy-details", label: "Policy Details" },
  { id: "pool-cycle", label: "Pool & Cycle" },
  { id: "refresh-start", label: "Refresh Start" },
]

export default function EditPolicyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const source = searchParams.get("source") ?? "global"
  const orgId = searchParams.get("orgId")
  const backHref =
    source === "org" && orgId
      ? `/organizations/${orgId}?tab=policies`
      : "/policies"
  const draftKey = `policy-draft-edit-${id}`

  const initialData = useMemo<
    | {
        policy: Partial<BenefitPolicy>
        groups: BenefitGroup[]
        benefits: Benefit[]
      }
    | undefined
  >(() => {
    // An in-progress review draft (same session) takes precedence over stored data.
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem(draftKey)
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch {
          /* fall through to policy data */
        }
      }
    }
    const policy = MOCK_POLICIES.find((item) => item.id === id)
    const data = MOCK_POLICY_DATA_MAP[id]
    if (policy && data)
      return { policy, groups: data.groups, benefits: data.benefits }
    return undefined
  }, [draftKey, id])

  const handleReview = (data: {
    policy: Partial<BenefitPolicy>
    groups: BenefitGroup[]
    benefits: Benefit[]
  }) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(draftKey, JSON.stringify(data))
    }
    const nextParams = new URLSearchParams()
    nextParams.set("source", source)
    if (orgId) nextParams.set("orgId", orgId)
    router.push(`/policies/${id}/edit/review?${nextParams.toString()}`)
  }

  return (
    <div className="animate-in pb-24 duration-500 fade-in slide-in-from-bottom-4">
      <div className="mx-auto flex max-w-[1280px] flex-col items-start gap-12 lg:flex-row lg:gap-16">
        {/* Left Column: Navigation */}
        <aside className="sticky top-20 hidden w-52 shrink-0 gap-3 self-start xl:flex xl:flex-col">
          {initialData && (
            <Collapsible defaultOpen={false}>
              <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-muted/20">
                <span className="flex items-center gap-2 text-label font-semibold text-foreground">
                  <IdentificationCard
                    size={14}
                    weight="duotone"
                    className="text-primary"
                  />
                  Policy Summary
                </span>
                <CaretDown
                  size={12}
                  weight="bold"
                  className="shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="space-y-2 rounded-lg border border-border bg-card p-3">
                  <PolicyReviewCards
                    policy={initialData.policy}
                    groups={initialData.groups}
                    benefits={initialData.benefits}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
          <FloatingAnchorNav items={ANCHOR_ITEMS} />
        </aside>

        {/* Right Column: Form Content */}
        <div className="w-full min-w-0 flex-1">
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <button
                onClick={() => router.push(backHref)}
                className="inline-flex w-fit items-center gap-1.5 text-body font-medium text-subtle transition-colors hover:text-foreground"
              >
                <CaretLeft size={16} /> Back
              </button>
              <div>
                <h1 className="text-heading font-semibold text-balance text-foreground">
                  Edit Benefit Policy
                </h1>
                <p className="mt-1 text-body text-subtle">
                  Update eligibility rules, pool strategies, and service groups.
                </p>
              </div>
            </div>

            <PolicyWizardContent
              mode="edit"
              initialData={initialData}
              onReview={handleReview}
              onSubmit={handleReview}
            />

            {/* Sticky Action Bar */}
            <div className="sticky bottom-8 z-50 mx-auto flex w-fit animate-in items-center gap-4 rounded-full border border-border bg-background/80 p-2 px-6 shadow-lg backdrop-blur-2xl duration-700 ease-out slide-in-from-bottom-10">
              <Button
                variant="ghost"
                size="lg"
                className="px-6 text-body font-medium transition-colors"
                onClick={() => router.push(backHref)}
              >
                Cancel
              </Button>
              <div className="h-6 w-px bg-border/40" />
              <Button
                type="submit"
                form="policyWizardForm"
                size="lg"
                className="flex items-center gap-2 px-8 text-body font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Review
                <NavigationArrow
                  size={14}
                  weight="bold"
                  className="rotate-90"
                />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
