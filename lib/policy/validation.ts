import type { Benefit, BenefitGroup, BenefitPolicy } from "@/types/policy"

export interface ValidationIssue {
  field: string
  message: string
}

/**
 * Reject a Benefit insert if a benefit with the same serviceId already exists in the same group.
 * Returns null when safe to insert, or a ValidationIssue describing the conflict.
 */
export function validateBenefitInsert(
  groupId: string,
  serviceId: Benefit["serviceId"],
  existing: Benefit[]
): ValidationIssue | null {
  const dup = existing.find(
    (b) => b.groupId === groupId && b.serviceId === serviceId
  )
  if (dup) {
    return {
      field: "serviceId",
      message: `Benefit already exists in this group (id: ${dup.id})`,
    }
  }
  return null
}

/**
 * Reject a BenefitGroup insert if another group in the same policy already has the same name (case-insensitive).
 */
export function validateGroupInsert(
  policyId: string,
  name: string,
  existing: BenefitGroup[],
  ignoreId?: string
): ValidationIssue | null {
  const target = name.trim().toLowerCase()
  if (!target) {
    return { field: "name", message: "Group name is required" }
  }
  const dup = existing.find(
    (g) =>
      g.policyId === policyId &&
      g.id !== ignoreId &&
      g.name.trim().toLowerCase() === target
  )
  if (dup) {
    return {
      field: "name",
      message: `A group named "${dup.name}" already exists in this policy`,
    }
  }
  return null
}

/**
 * Validate co-payment rules:
 * - Percentage: 0-100
 * - Fixed: must not exceed benefit amount
 */
export function validateCoPayment(
  amount: number | undefined,
  coPayment: Benefit["coPayment"] | BenefitGroup["coPayment"] | undefined
): ValidationIssue | null {
  if (!coPayment || !coPayment.required) return null
  if (coPayment.value < 0) {
    return {
      field: "coPayment.value",
      message: "Co-payment cannot be negative",
    }
  }
  if (coPayment.type === "Percentage") {
    if (coPayment.value > 100) {
      return {
        field: "coPayment.value",
        message: "Percentage co-payment cannot exceed 100%",
      }
    }
  } else if (coPayment.type === "Fixed") {
    if (typeof amount === "number" && coPayment.value > amount) {
      return {
        field: "coPayment.value",
        message: `Fixed co-payment (RM ${coPayment.value}) cannot exceed benefit amount (RM ${amount})`,
      }
    }
  }
  return null
}

/**
 * Validate refresh start reference — requires a month (1–12) to be selected.
 */
export function validateRefreshStart(
  policy: Pick<BenefitPolicy, "refreshStartReference" | "refreshStartMonth">
): ValidationIssue | null {
  if (
    !policy.refreshStartMonth ||
    policy.refreshStartMonth < 1 ||
    policy.refreshStartMonth > 12
  ) {
    return { field: "refreshStartMonth", message: "Select a start month" }
  }
  return null
}

/**
 * Validate a complete Benefit row before persistence.
 * Returns all issues found (not short-circuit) so the UI can render every problem at once.
 */
export function validateBenefit(
  b: Benefit,
  existing: Benefit[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  if (b.amount <= 0)
    issues.push({ field: "amount", message: "Amount must be greater than 0" })
  const dup = validateBenefitInsert(
    b.groupId,
    b.serviceId,
    existing.filter((e) => e.id !== b.id)
  )
  if (dup) issues.push(dup)

  const employeeAmount =
    typeof b.employeeAmount === "number" ? b.employeeAmount : b.amount
  const dependentAmount =
    typeof b.dependantAmount === "number" ? b.dependantAmount : b.amount

  const employeeCopay = validateCoPayment(employeeAmount, b.coPayment)
  if (employeeCopay) issues.push(employeeCopay)

  if (b.dependentCoPayment) {
    const dependentCopay = validateCoPayment(
      dependentAmount,
      b.dependentCoPayment
    )
    if (dependentCopay)
      issues.push({ ...dependentCopay, field: "dependentCoPayment.value" })
  }
  return issues
}
