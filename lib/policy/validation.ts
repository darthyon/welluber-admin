import type { Benefit, BenefitGroup } from "@/types/policy"

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
  const dup = existing.find((b) => b.groupId === groupId && b.serviceId === serviceId)
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
    (g) => g.policyId === policyId && g.id !== ignoreId && g.name.trim().toLowerCase() === target
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
  amount: number,
  coPayment: Benefit["coPayment"]
): ValidationIssue | null {
  if (!coPayment.required) return null
  if (coPayment.value < 0) {
    return { field: "coPayment.value", message: "Co-payment cannot be negative" }
  }
  if (coPayment.type === "Percentage") {
    if (coPayment.value > 100) {
      return {
        field: "coPayment.value",
        message: "Percentage co-payment cannot exceed 100%",
      }
    }
  } else if (coPayment.type === "Fixed") {
    if (coPayment.value > amount) {
      return {
        field: "coPayment.value",
        message: `Fixed co-payment (RM ${coPayment.value}) cannot exceed benefit amount (RM ${amount})`,
      }
    }
  }
  return null
}

/**
 * Validate a complete Benefit row before persistence.
 * Returns all issues found (not short-circuit) so the UI can render every problem at once.
 */
export function validateBenefit(b: Benefit, existing: Benefit[]): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  if (b.amount <= 0) issues.push({ field: "amount", message: "Amount must be greater than 0" })
  const dup = validateBenefitInsert(b.groupId, b.serviceId, existing.filter((e) => e.id !== b.id))
  if (dup) issues.push(dup)
  const copay = validateCoPayment(b.amount, b.coPayment)
  if (copay) issues.push(copay)
  return issues
}
