"use client"

import type {
  Benefit,
  BenefitGroup,
  BenefitPolicy,
} from "@/types/policy"
import { validateBenefit, validateCoPayment, validateGroupInsert } from "@/lib/policy/validation"
import { getAvailableRefreshCycles } from "@/components/host/policies/wizard-constants"

const SECTION_FOR_KEY: Array<{ test: (key: string) => boolean; section: string }> = [
  {
    test: (key) => ["name", "organizationId", "eligibleEmploymentTypes"].includes(key),
    section: "policy-details",
  },
  {
    test: (key) =>
      ["prorateUnit", "dependentsPoolType", "refreshCycle", "refreshStartMonth"].includes(key),
    section: "pool-cycle",
  },
  { test: (key) => key.startsWith("dependent_cap_"), section: "pool-cycle" },
  {
    test: (key) =>
      key === "groups" ||
      key.startsWith("group_") ||
      key.startsWith("group_copay_") ||
      key.startsWith("group_name_") ||
      key.startsWith("group_cap_") ||
      key.startsWith("benefit_") ||
      key.startsWith("copay_"),
    section: "groups-services",
  },
]

export function sectionForKey(key: string): string {
  for (const rule of SECTION_FOR_KEY) {
    if (rule.test(key)) return rule.section
  }
  return "policy-details"
}

export function targetIdForKey(key: string): string {
  if (key.startsWith("group_name_") || key.startsWith("group_cap_")) {
    return `group-${key.replace(/^group_(name|cap)_/, "")}`
  }
  if (key.startsWith("group_copay_")) return `group-${key.replace(/^group_copay_/, "")}`
  if (key.startsWith("dependent_cap_")) return "pool-cycle"
  if (key.startsWith("benefit_") || key.startsWith("copay_") || key.startsWith("dep_copay_")) {
    const parts = key.split("_")
    return parts.length >= 2 ? `group-${parts[1]}` : sectionForKey(key)
  }
  if (key.startsWith("group_")) return "groups-services"
  return sectionForKey(key)
}

interface ValidatePolicyWizardInput {
  benefits: Benefit[]
  groups: BenefitGroup[]
  groupsOnly: boolean
  mode: "create" | "edit"
  policyData: Partial<BenefitPolicy>
}

export function validatePolicyWizard({
  benefits,
  groups,
  groupsOnly,
  mode,
  policyData,
}: ValidatePolicyWizardInput): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!groupsOnly) {
    if (!policyData.name?.trim()) errors.name = "Policy name is required"
    else if (policyData.name.length > 100) errors.name = "Max 100 characters"

    if (!policyData.organizationId) errors.organizationId = "Select an organisation"

    if (!policyData.eligibleEmploymentTypes || policyData.eligibleEmploymentTypes.length === 0) {
      errors.eligibleEmploymentTypes = "Select at least one employment type"
    }

    if (policyData.utilisationMode === "Prorated" && !policyData.prorateUnit) {
      errors.prorateUnit = "Pick a prorate unit (Monthly is most common)"
    }

    const hasDependents = (policyData.dependentCoverages?.length ?? 0) > 0

    if (hasDependents && !policyData.dependentsPoolType) {
      errors.dependentsPoolType = "Select a pool type for dependents"
    }

    if (
      hasDependents &&
      policyData.dependentsPoolType &&
      policyData.dependentsPoolType !== "SharedWithEmployee"
    ) {
      ;(policyData.dependentCoverages ?? []).forEach((coverage) => {
        if (!coverage.capAmount || coverage.capAmount <= 0) {
          errors[`dependent_cap_${coverage.type}`] = "Enter an amount greater than 0"
        }
      })
    }

    if (
      policyData.refreshStartReference === "calendar_year" &&
      (!policyData.refreshStartMonth ||
        policyData.refreshStartMonth < 1 ||
        policyData.refreshStartMonth > 12)
    ) {
      errors.refreshStartMonth = "Select a start month"
    }

    if (policyData.utilisationMode === "Prorated" && policyData.prorateUnit) {
      const available = getAvailableRefreshCycles("Prorated", policyData.prorateUnit)
      if (policyData.refreshCycle && !available.includes(policyData.refreshCycle)) {
        errors.refreshCycle = `${policyData.refreshCycle} is not valid for ${policyData.prorateUnit} prorate. Valid: ${available.join(", ")}`
      }
    }
  }

  if (mode !== "create" || groupsOnly) {
    if (groups.length === 0) errors.groups = "Add at least one benefit group"

    groups.forEach((group, index) => {
      const groupIssue = validateGroupInsert(policyData.id || "temp", group.name, groups, group.id)
      if (groupIssue) errors[`group_name_${group.id}`] = groupIssue.message

      if (group.distributionType === "SharedAmount") {
        const coversEmployee = group.coverageScope !== "Dependent"
        const coversDependent = group.coverageScope !== "Employee"
        const dependentsConfigured = (policyData.dependentCoverages?.length ?? 0) > 0

        if (coversEmployee && (!group.maxUsagePerCycle || group.maxUsagePerCycle <= 0)) {
          errors[`group_cap_${group.id}`] = "Shared pools need a cap (e.g. 1000)"
        }

        if (
          coversDependent &&
          dependentsConfigured &&
          (!group.dependentGroupCap || group.dependentGroupCap <= 0)
        ) {
          errors[`group_dep_cap_${group.id}`] = "Shared pools need a dependent cap (e.g. 1000)"
        }

        const coPayIssue = validateCoPayment(undefined, group.coPayment)
        if (coPayIssue) errors[`group_copay_${group.id}`] = coPayIssue.message

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
          if (issue.field === "coPayment.value" && group.distributionType !== "SharedAmount") {
            errors[`copay_${group.id}_${benefit.serviceId}`] = issue.message
          }
          if (issue.field === "dependentCoPayment.value" && group.distributionType !== "SharedAmount") {
            errors[`dep_copay_${group.id}_${benefit.serviceId}`] = issue.message
          }
          if (issue.field === "serviceId") errors[`group_${index}`] = issue.message
        })
      })
    })
  }

  return errors
}

export function clearResolvedValidationErrors({
  benefits,
  groups,
  policyData,
  validationErrors,
}: {
  benefits: Benefit[]
  groups: BenefitGroup[]
  policyData: Partial<BenefitPolicy>
  validationErrors: Record<string, string>
}): Record<string, string> {
  let changed = false
  const next = { ...validationErrors }

  benefits.forEach((benefit) => {
    const amountKey = `benefit_${benefit.groupId}_${benefit.serviceId}`
    if (next[amountKey] && benefit.amount > 0) {
      delete next[amountKey]
      changed = true
    }

    const employeeCopayKey = `copay_${benefit.groupId}_${benefit.serviceId}`
    if (next[employeeCopayKey]) {
      const value = benefit.coPayment.value || 0
      const valid =
        !benefit.coPayment.required ||
        (benefit.coPayment.type === "Percentage" && value >= 0 && value <= 100) ||
        (benefit.coPayment.type === "Fixed" && value <= benefit.amount)
      if (valid) {
        delete next[employeeCopayKey]
        changed = true
      }
    }

    const dependentCopayKey = `dep_copay_${benefit.groupId}_${benefit.serviceId}`
    if (next[dependentCopayKey]) {
      const copay = benefit.dependentCoPayment
      const value = copay?.value ?? 0
      const valid =
        !copay?.required ||
        (copay.type === "Percentage" && value >= 0 && value <= 100) ||
        (copay.type === "Fixed" && value <= benefit.amount)
      if (valid) {
        delete next[dependentCopayKey]
        changed = true
      }
    }
  })

  groups.forEach((group) => {
    const capKey = `group_cap_${group.id}`
    if (next[capKey] && group.distributionType === "SharedAmount" && (group.maxUsagePerCycle ?? 0) > 0) {
      delete next[capKey]
      changed = true
    }
    if (next[capKey] && group.distributionType !== "SharedAmount") {
      delete next[capKey]
      changed = true
    }

    const dependentCapKey = `group_dep_cap_${group.id}`
    if (
      next[dependentCapKey] &&
      group.distributionType === "SharedAmount" &&
      (group.dependentGroupCap ?? 0) > 0
    ) {
      delete next[dependentCapKey]
      changed = true
    }
    if (next[dependentCapKey] && group.distributionType !== "SharedAmount") {
      delete next[dependentCapKey]
      changed = true
    }

    const nameKey = `group_name_${group.id}`
    if (next[nameKey] && group.name?.trim()) {
      delete next[nameKey]
      changed = true
    }

    const groupCopayKey = `group_copay_${group.id}`
    if (next[groupCopayKey]) {
      const copay = group.coPayment
      const value = copay?.value ?? 0
      const valid =
        !copay?.required ||
        (copay.type === "Percentage" && value >= 0 && value <= 100) ||
        copay.type === "Fixed"
      if (valid) {
        delete next[groupCopayKey]
        changed = true
      }
    }

    const groupDependentCopayKey = `group_dep_copay_${group.id}`
    if (next[groupDependentCopayKey]) {
      const copay = group.dependentCoPayment
      const value = copay?.value ?? 0
      const valid =
        !copay?.required ||
        (copay.type === "Percentage" && value >= 0 && value <= 100) ||
        copay.type === "Fixed"
      if (valid) {
        delete next[groupDependentCopayKey]
        changed = true
      }
    }
  })

  ;(policyData.dependentCoverages ?? []).forEach((coverage) => {
    const key = `dependent_cap_${coverage.type}`
    if (next[key] && (coverage.capAmount ?? 0) > 0) {
      delete next[key]
      changed = true
    }
  })

  return changed ? next : validationErrors
}

export function buildSectionErrorCounts(validationErrors: Record<string, string>) {
  const counts: Record<string, number> = {
    "policy-details": 0,
    "pool-cycle": 0,
    "groups-services": 0,
  }

  Object.keys(validationErrors).forEach((key) => {
    const section = sectionForKey(key)
    counts[section] = (counts[section] ?? 0) + 1
  })

  return counts
}

export function buildPolicyWizardErrorEntries({
  groups,
  validationErrors,
}: {
  groups: BenefitGroup[]
  validationErrors: Record<string, string>
}) {
  return Object.entries(validationErrors).map(([key, message]) => {
    let label = message

    if (key.startsWith("benefit_") || key.startsWith("copay_") || key.startsWith("dep_copay_")) {
      const [, groupId, serviceId] = key.split("_")
      const group = groups.find((item) => item.id === groupId)
      const groupLabel = group?.name || "Group"
      const fieldLabel = key.startsWith("copay_")
        ? "Co-payment"
        : key.startsWith("dep_copay_")
          ? "Dependent Co-payment"
          : "Amount"
      label = `${groupLabel} → ${serviceId} → ${fieldLabel}: ${message}`
    } else if (key.startsWith("group_name_")) {
      const groupId = key.replace("group_name_", "")
      const group = groups.find((item) => item.id === groupId)
      label = `${group?.name || "Group"} → Name: ${message}`
    } else if (key.startsWith("group_cap_")) {
      const groupId = key.replace("group_cap_", "")
      const group = groups.find((item) => item.id === groupId)
      label = `${group?.name || "Group"} → Cap: ${message}`
    } else if (key.startsWith("group_dep_cap_")) {
      const groupId = key.replace("group_dep_cap_", "")
      const group = groups.find((item) => item.id === groupId)
      label = `${group?.name || "Group"} → Dependent Cap: ${message}`
    } else if (key.startsWith("group_")) {
      label = `Groups: ${message}`
    }

    return { key, label, message, target: targetIdForKey(key) }
  })
}
