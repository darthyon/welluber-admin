import { MOCK_ORGS } from "@/lib/mock-data"
import type {
  Benefit,
  BenefitGroup,
  BenefitGroupCoverageScope,
  BenefitPolicy,
  DependentsPoolType,
} from "@/types/policy"

export type PolicyWithDisplayFields = Partial<BenefitPolicy> & {
  orgName?: string
  groupCount?: number
}

const EMPLOYMENT_LABELS: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
}

export const DEPENDENT_LABELS: Record<string, string> = {
  spouse: "Spouse",
  child: "Child",
  mother: "Mother",
  father: "Father",
  sibling: "Sibling",
  inlaw: "In-law",
}

const REFRESH_START_LABELS: Record<string, string> = {
  financial_year: "Financial Year",
  calendar_year: "Calendar Year",
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const

export function formatRM(amount: number | undefined, fallback = "Not Set") {
  if (typeof amount !== "number") return fallback
  return `RM ${amount.toLocaleString("en-MY", {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatCopay(copay: Benefit["coPayment"] | undefined) {
  if (!copay?.required) return "None"
  return copay.type === "Percentage" ? `${copay.value}%` : formatRM(copay.value)
}

export function titleCaseValue(value: string | undefined) {
  if (!value) return "Not Set"
  return value
    .replace(/[_-]/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function getStatusVariant(status: string | undefined) {
  if (status === "active") return "emerald" as const
  if (status === "draft") return "amber" as const
  if (status === "deactivated") return "rose" as const
  return "zinc" as const
}

function getOrg(policy: PolicyWithDisplayFields) {
  return MOCK_ORGS.find((org) => org.id === policy.organizationId)
}

export function getOrgName(policy: PolicyWithDisplayFields) {
  return (
    policy.orgName ?? getOrg(policy)?.name ?? policy.organizationId ?? "Not Set"
  )
}

export function getTierLabels(policy: PolicyWithDisplayFields) {
  const org = getOrg(policy)
  return (policy.eligibility?.tierIds ?? []).map(
    (id) => org?.tierConfigs?.find((tier) => tier.id === id)?.name ?? id
  )
}

export function getDepartmentLabels(policy: PolicyWithDisplayFields) {
  const org = getOrg(policy)
  return (policy.eligibility?.departmentIds ?? []).map(
    (id) =>
      org?.departmentConfigs?.find((department) => department.id === id)
        ?.name ?? id
  )
}

export function getRefreshStart(policy: PolicyWithDisplayFields) {
  const reference =
    REFRESH_START_LABELS[policy.refreshStartReference ?? ""] ??
    titleCaseValue(policy.refreshStartReference)
  if (
    policy.refreshStartReference === "calendar_year" &&
    policy.refreshStartMonth
  ) {
    return `${reference} · ${MONTHS[policy.refreshStartMonth - 1] ?? "Not Set"}`
  }
  return reference
}

export function getPoolExplanation(
  poolType: BenefitPolicy["benefitPoolType"] | undefined
) {
  if (poolType === "Shared")
    return "Employees draw from a shared organisation-level pool."
  if (poolType === "Individual") return "Each employee has their own pool."
  return "Pool type has not been configured."
}

export function getDependentPoolLabel(
  poolType: DependentsPoolType | undefined
) {
  if (poolType === "SharedWithEmployee") return "Shared With Employee"
  return titleCaseValue(poolType)
}

export function getDependentPoolNote(
  poolType: DependentsPoolType | undefined,
  hasDependents: boolean
) {
  if (!hasDependents) return "Not applicable because no dependents are covered."
  if (poolType === "SharedWithEmployee")
    return "Dependents draw from the employee's own pool."
  if (poolType === "Shared")
    return "Covered dependents share a separate dependent pool."
  if (poolType === "Individual")
    return "Each covered dependent type can have its own cap."
  return "Dependent pool mode has not been configured."
}

export function getDependentCapAmount(policy: PolicyWithDisplayFields) {
  const hasDependents = (policy.dependentCoverages?.length ?? 0) > 0
  if (!hasDependents) {
    return {
      value: "Not Applicable",
      helper: "No dependents are covered by this policy.",
    }
  }
  if (policy.dependentsPoolType === "Shared") {
    return {
      value: formatRM(policy.dependentCapAmount),
      helper: "Shared across all covered dependents per cycle.",
    }
  }
  if (policy.dependentsPoolType === "SharedWithEmployee") {
    return {
      value: "Not Applicable",
      helper: "Dependents use the employee policy pool.",
    }
  }
  return {
    value: "Not Applicable",
    helper: "Use dependent cap per type for individual dependent pools.",
  }
}

export function getDependentCapPerType(policy: PolicyWithDisplayFields) {
  const hasDependents = (policy.dependentCoverages?.length ?? 0) > 0
  if (!hasDependents) return "Not Applicable (No Dependents Covered)"
  if (policy.dependentsPoolType !== "Individual") {
    return `Not Applicable (${getDependentPoolLabel(policy.dependentsPoolType)} Pool)`
  }
  return (
    policy.dependentCoverages
      ?.map(
        (coverage) =>
          `${DEPENDENT_LABELS[coverage.type] ?? coverage.type}: ${formatRM(coverage.capAmount)}`
      )
      .join(" · ") || "Not Set"
  )
}

export function getEmploymentLabels(policy: PolicyWithDisplayFields) {
  return (policy.eligibleEmploymentTypes ?? []).map(
    (type) => EMPLOYMENT_LABELS[type] ?? titleCaseValue(type)
  )
}

export function getExcludedEmploymentLabels(policy: PolicyWithDisplayFields) {
  const selected = new Set(policy.eligibleEmploymentTypes ?? [])
  if (
    selected.size === 0 ||
    selected.size === Object.keys(EMPLOYMENT_LABELS).length
  )
    return []
  return Object.entries(EMPLOYMENT_LABELS)
    .filter(([id]) => !selected.has(id))
    .map(([, label]) => label)
}

export function getAgeRange(policy: PolicyWithDisplayFields) {
  const min = policy.eligibility?.minAge
  const max = policy.eligibility?.maxAge
  if (!min && !max) return "Not Restricted"
  return `${min ?? "Any"} - ${max ?? "Any"}`
}

export function getEffectiveUtilisation(
  policy: PolicyWithDisplayFields,
  group: BenefitGroup
) {
  const mode = group.utilisationMode ?? policy.utilisationMode ?? "Fixed"
  if (mode === "Prorated") {
    return `Prorated Allocation · ${group.prorateUnit ?? policy.prorateUnit ?? "Monthly"}`
  }
  return "Fixed Allocation"
}

export function getEffectiveRefresh(
  policy: PolicyWithDisplayFields,
  group: BenefitGroup
) {
  return group.refreshCycle ?? policy.refreshCycle ?? "Yearly"
}

export function hasEmployeeSide(scope: BenefitGroupCoverageScope) {
  return scope === "Employee" || scope === "Both"
}

export function hasDependentSide(scope: BenefitGroupCoverageScope) {
  return scope === "Dependent" || scope === "Both"
}

export function getGroupCap(
  group: BenefitGroup,
  side: "employee" | "dependent"
) {
  if (group.distributionType !== "SharedAmount") {
    return {
      value: "Per Service Amount",
      helper: "Individual service amounts define this group's limits.",
    }
  }
  return {
    value: formatRM(
      side === "employee" ? group.maxUsagePerCycle : group.dependentGroupCap
    ),
    helper: "Shared group cap per cycle.",
  }
}

export function getBenefitAmount(
  benefit: Benefit,
  side: "employee" | "dependent"
) {
  if (side === "employee") return benefit.employeeAmount ?? benefit.amount
  return benefit.dependantAmount ?? benefit.amount
}

export function getServiceCopay(
  group: BenefitGroup,
  benefit: Benefit,
  side: "employee" | "dependent"
) {
  if (group.distributionType === "SharedAmount") {
    return side === "employee" ? group.coPayment : group.dependentCoPayment
  }
  return side === "employee" ? benefit.coPayment : benefit.dependentCoPayment
}
