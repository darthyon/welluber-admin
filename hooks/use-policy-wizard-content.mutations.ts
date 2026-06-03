"use client"

import type {
  Benefit,
  BenefitGroup,
  BenefitGroupCoverageScope,
  BenefitPolicy,
} from "@/types/policy"
import type { MainServiceId } from "@/lib/mock-data/service-catalog"

export function toggleEmploymentTypeSelection(
  policyData: Partial<BenefitPolicy>,
  employmentTypeId: string,
) {
  const current = policyData.eligibleEmploymentTypes || []
  return {
    ...policyData,
    eligibleEmploymentTypes: current.includes(employmentTypeId)
      ? current.filter((item) => item !== employmentTypeId)
      : [...current, employmentTypeId],
  }
}

export function createBenefitGroup(policyId?: string): BenefitGroup {
  return {
    id: `grp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    policyId: policyId || "temp",
    name: "New Benefit Group",
    coverageScope: "Employee",
    distributionType: "IndividualBenefitAmount",
    coPayment: { required: false, type: "Percentage", value: 0 },
  }
}

export function removeBenefitGroup(groups: BenefitGroup[], groupId: string) {
  return groups.filter((group) => group.id !== groupId)
}

export function removeBenefitsForGroup(benefits: Benefit[], groupId: string) {
  return benefits.filter((benefit) => benefit.groupId !== groupId)
}

export function updateBenefitGroupField(
  groups: BenefitGroup[],
  groupId: string,
  field: keyof BenefitGroup,
  value: string | number | boolean | undefined,
) {
  return groups.map((group) => (group.id === groupId ? { ...group, [field]: value } : group))
}

function updateGroupCopay(
  groups: BenefitGroup[],
  groupId: string,
  field: "required" | "type" | "value",
  value: boolean | string | number,
  target: "coPayment" | "dependentCoPayment",
) {
  return groups.map((group) => {
    if (group.id !== groupId) return group
    const current = group[target] ?? { required: false, type: "Percentage" as const, value: 0 }
    return { ...group, [target]: { ...current, [field]: value } }
  })
}

export function updateBenefitGroupCopayment(
  groups: BenefitGroup[],
  groupId: string,
  field: "required" | "type" | "value",
  value: boolean | string | number,
) {
  return updateGroupCopay(groups, groupId, field, value, "coPayment")
}

export function updateBenefitGroupDependentCopayment(
  groups: BenefitGroup[],
  groupId: string,
  field: "required" | "type" | "value",
  value: boolean | string | number,
) {
  return updateGroupCopay(groups, groupId, field, value, "dependentCoPayment")
}

export function toggleBenefitService(
  benefits: Benefit[],
  groupId: string,
  serviceId: MainServiceId,
) {
  const existing = benefits.find((benefit) => benefit.groupId === groupId && benefit.serviceId === serviceId)
  if (existing) {
    return benefits.filter((benefit) => !(benefit.groupId === groupId && benefit.serviceId === serviceId))
  }

  return [
    ...benefits,
    {
      id: `ben-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      groupId,
      serviceId,
      amount: 0,
      coPayment: { required: false, type: "Percentage" as const, value: 0 },
    },
  ]
}

export function updateBenefitField(
  benefits: Benefit[],
  benefitId: string,
  field: string,
  value: string | number | boolean | string[],
) {
  return benefits.map((benefit) => {
    if (benefit.id !== benefitId) return benefit
    if (!field.includes(".")) return { ...benefit, [field]: value }

    const [parent, child] = field.split(".")
    if (parent === "coPayment") {
      return { ...benefit, coPayment: { ...benefit.coPayment, [child]: value } }
    }
    if (parent === "dependentCoPayment") {
      const dependentCoPayment = benefit.dependentCoPayment ?? {
        required: false,
        type: "Percentage" as const,
        value: 0,
      }
      return { ...benefit, dependentCoPayment: { ...dependentCoPayment, [child]: value } }
    }

    return benefit
  })
}

export function applyGroupCoverageScope(
  benefits: Benefit[],
  groupId: string,
  scope: BenefitGroupCoverageScope,
) {
  return benefits.map((benefit) => {
    if (benefit.groupId !== groupId) return benefit

    if (scope === "Both") {
      const employeeAmount = typeof benefit.employeeAmount === "number" ? benefit.employeeAmount : 0
      const dependantAmount = typeof benefit.dependantAmount === "number" ? benefit.dependantAmount : 0
      return {
        ...benefit,
        employeeAmount,
        dependantAmount,
        amount: employeeAmount + dependantAmount,
        dependentCoPayment:
          benefit.dependentCoPayment ?? { required: false, type: "Percentage", value: 0 },
      }
    }

    if (scope === "Employee") {
      const nextAmount =
        typeof benefit.employeeAmount === "number" ? benefit.employeeAmount : benefit.amount
      return {
        ...benefit,
        amount: nextAmount,
        employeeAmount: undefined,
        dependantAmount: undefined,
        dependantTypes: undefined,
        dependentCoPayment: undefined,
      }
    }

    const nextAmount =
      typeof benefit.dependantAmount === "number" ? benefit.dependantAmount : benefit.amount
    return {
      ...benefit,
      amount: nextAmount,
      dependantAmount: nextAmount,
      employeeAmount: undefined,
      dependantTypes: undefined,
      dependentCoPayment:
        benefit.dependentCoPayment ?? { required: false, type: "Percentage", value: 0 },
    }
  })
}
