"use client"

import { PolicyDatapointContract } from "@/components/host/policies/policy-datapoint-contract"
import type { BenefitPolicy, BenefitGroup, Benefit } from "@/types/policy"

interface PolicyReviewCardsProps {
  policy: Partial<BenefitPolicy>
  groups: BenefitGroup[]
  benefits: Benefit[]
}

export function PolicyReviewCards({
  policy,
  groups,
  benefits,
}: PolicyReviewCardsProps) {
  return (
    <PolicyDatapointContract
      policy={policy}
      groups={groups}
      benefits={benefits}
    />
  )
}
