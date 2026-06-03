import { getAvailableRefreshCycles } from "@/components/host/policies/wizard-constants"
import { validateBenefit, validateCoPayment, validateGroupInsert } from "@/lib/policy/validation"
import type { Benefit, BenefitGroup, BenefitGroupCoverageScope, BenefitPolicy } from "@/types/policy"

export function createInitialPolicyData(initialPolicy?: Partial<BenefitPolicy>) {
  return (
    initialPolicy || {
      name: "",
      description: "",
      eligibleEmploymentTypes: ["full-time", "part-time", "contract", "internship"],
      dependentCoverages: [],
      benefitPoolType: "Individual",
      utilisationMode: "Fixed",
      refreshCycle: "Yearly",
      refreshStartReference: "financial_year",
      refreshStartMonth: 1,
      status: "draft",
    }
  )
}

export function hydrateInitialGroups(initialGroups?: BenefitGroup[]) {
  return (initialGroups || []).map((group) => ({
    ...group,
    coverageScope: group.coverageScope ?? ("Employee" as BenefitGroupCoverageScope),
  }))
}

interface ValidateWizardStepArgs {
  benefits: Benefit[]
  currentStep: number
  groups: BenefitGroup[]
  policyData: Partial<BenefitPolicy>
}

export function validateWizardStep({
  benefits,
  currentStep,
  groups,
  policyData,
}: ValidateWizardStepArgs) {
  const errors: Record<string, string> = {}

  if (currentStep === 1) {
    if (!policyData.name?.trim()) errors.name = "Policy name is required"
    else if (policyData.name.length > 100) errors.name = "Max 100 characters"
    if (!policyData.eligibleEmploymentTypes || policyData.eligibleEmploymentTypes.length === 0) {
      errors.eligibleEmploymentTypes = "Select at least one employment type"
    }
  }

  if (currentStep === 2) {
    if (policyData.utilisationMode === "Prorated" && !policyData.prorateUnit) {
      errors.prorateUnit = "Pick a prorate unit (Monthly is most common)"
    }
    const hasDependents = (policyData.dependentCoverages?.length ?? 0) > 0
    if (hasDependents && !policyData.dependentsPoolType) {
      errors.dependentsPoolType = "Select a pool type for dependents"
    }
    if (
      policyData.refreshStartReference === "calendar_year" &&
      (!policyData.refreshStartMonth || policyData.refreshStartMonth < 1 || policyData.refreshStartMonth > 12)
    ) {
      errors.refreshStartMonth = "Select a start month"
    }
    if (policyData.utilisationMode === "Prorated" && policyData.prorateUnit) {
      const availableCycles = getAvailableRefreshCycles("Prorated", policyData.prorateUnit)
      if (policyData.refreshCycle && !availableCycles.includes(policyData.refreshCycle)) {
        errors.refreshCycle = `${policyData.refreshCycle} is not valid for ${policyData.prorateUnit} prorate. Valid: ${availableCycles.join(", ")}`
      }
    }
  }

  if (currentStep === 3) {
    if (groups.length === 0) errors.groups = "Add at least one benefit group"
    groups.forEach((group, index) => {
      const groupIssue = validateGroupInsert(policyData.id || "temp", group.name, groups, group.id)
      if (groupIssue) errors[`group_name_${group.id}`] = groupIssue.message

      if (group.distributionType === "SharedAmount") {
        const coversEmployee = group.coverageScope !== "Dependent"
        const coversDependent = group.coverageScope !== "Employee"
        const dependentsConfigured = (policyData.dependentCoverages?.length ?? 0) > 0

        if (coversEmployee && (!group.maxUsagePerCycle || group.maxUsagePerCycle <= 0)) {
          errors[`group_cap_${group.id}`] = "Shared pools need a cap (e.g. RM 1000)"
        }
        if (coversDependent && dependentsConfigured && (!group.dependentGroupCap || group.dependentGroupCap <= 0)) {
          errors[`group_dep_cap_${group.id}`] = "Shared pools need a dependent cap (e.g. RM 1000)"
        }

        const copayIssue = validateCoPayment(undefined, group.coPayment)
        if (copayIssue) errors[`group_copay_${group.id}`] = copayIssue.message

        const dependentCopayIssue = validateCoPayment(undefined, group.dependentCoPayment)
        if (dependentCopayIssue) errors[`group_dep_copay_${group.id}`] = dependentCopayIssue.message
      }

      const groupBenefits = benefits.filter((benefit) => benefit.groupId === group.id)
      if (groupBenefits.length === 0) {
        errors[`group_${index}`] = `Select at least one benefit for ${group.name || "this group"}`
      }
      groupBenefits.forEach((benefit) => {
        const issues = validateBenefit(benefit, benefits)
        issues.forEach((issue) => {
          if (issue.field === "amount") errors[`benefit_${group.id}_${benefit.serviceId}`] = issue.message
          if (issue.field === "coPayment.value") errors[`copay_${group.id}_${benefit.serviceId}`] = issue.message
          if (issue.field === "dependentCoPayment.value") {
            errors[`dep_copay_${group.id}_${benefit.serviceId}`] = issue.message
          }
          if (issue.field === "serviceId") errors[`group_${index}`] = issue.message
        })
      })
    })
  }

  return errors
}
