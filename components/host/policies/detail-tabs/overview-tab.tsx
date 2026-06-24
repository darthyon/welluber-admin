"use client"

import { PolicyDatapointContract } from "@/components/host/policies/policy-datapoint-contract"
import type { BenefitPolicy, BenefitGroup, Benefit } from "@/types/policy"

interface OverviewTabProps {
  policy: BenefitPolicy
  groups: BenefitGroup[]
  benefits: Benefit[]
  onEdit: () => void
}

export function OverviewTab({ policy, groups, benefits }: OverviewTabProps) {
  return (
    <PolicyDatapointContract
      policy={policy}
      groups={groups}
      benefits={benefits}
    />
  )
}
