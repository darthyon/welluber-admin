import type { BenefitPolicy, BenefitGroup, Benefit } from "@/types/policy"

export interface PolicyListItem extends BenefitPolicy {
  groupCount: number
  orgName?: string
  assignedOrgNames?: string[]
  createdAt: string
}

export interface PolicyData {
  groups: BenefitGroup[]
  benefits: Benefit[]
}
