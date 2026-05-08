import { isMainServiceId } from "@/lib/mock-data/service-catalog"
import { MOCK_POLICY_BUNDLES } from "@/lib/mock-data"
import { MOCK_EMPLOYEES } from "@/lib/mock-data/seed"

export interface IntegrityIssue {
  policyId: string
  kind:
    | "missing-group"
    | "missing-policy"
    | "unknown-service"
    | "duplicate-benefit"
    | "duplicate-group"
    | "missing-employee-policy"
    | "missing-employee-group"
  detail: string
}

/**
 * Walk every seeded BenefitPolicy and assert:
 *   - Every BenefitGroup.policyId resolves to its parent policy.
 *   - Every Benefit.groupId resolves to a real Group.
 *   - Every Benefit.serviceId is a known MainServiceId.
 *   - No duplicate (groupId, serviceId) pairs.
 *   - No duplicate (policyId, group name lowercase) pairs.
 *
 * Returns all issues found. Empty array = healthy.
 */
export function verifyPolicyIntegrity(): IntegrityIssue[] {
  const issues: IntegrityIssue[] = []
  const policyGroupIds = new Map<string, Set<string>>()
  const validPolicyIds = new Set<string>()

  for (const bundle of MOCK_POLICY_BUNDLES) {
    const policyId = bundle.policy.id
    validPolicyIds.add(policyId)
    const groups = bundle.data.groups
    const benefits = bundle.data.benefits
    policyGroupIds.set(policyId, new Set(groups.map((g) => g.id)))

    // Group → policy linkage
    for (const g of groups) {
      if (g.policyId !== policyId) {
        issues.push({
          policyId,
          kind: "missing-policy",
          detail: `Group ${g.id} has policyId ${g.policyId}, expected ${policyId}`,
        })
      }
    }

    // Group name uniqueness within policy
    const groupNameSeen = new Map<string, string>()
    for (const g of groups) {
      const key = g.name.trim().toLowerCase()
      const prior = groupNameSeen.get(key)
      if (prior) {
        issues.push({
          policyId,
          kind: "duplicate-group",
          detail: `Duplicate group name "${g.name}" (ids: ${prior}, ${g.id})`,
        })
      }
      groupNameSeen.set(key, g.id)
    }

    // Benefit → group linkage + serviceId validity + uniqueness within group
    const benefitKeySeen = new Set<string>()
    const groupIds = new Set(groups.map((g) => g.id))
    for (const b of benefits) {
      if (!groupIds.has(b.groupId)) {
        issues.push({
          policyId,
          kind: "missing-group",
          detail: `Benefit ${b.id} references missing group ${b.groupId}`,
        })
      }
      if (!isMainServiceId(b.serviceId)) {
        issues.push({
          policyId,
          kind: "unknown-service",
          detail: `Benefit ${b.id} has unknown serviceId ${b.serviceId}`,
        })
      }
      const key = `${b.groupId}::${b.serviceId}`
      if (benefitKeySeen.has(key)) {
        issues.push({
          policyId,
          kind: "duplicate-benefit",
          detail: `Duplicate (group, service) pair (${b.groupId}, ${b.serviceId})`,
        })
      }
      benefitKeySeen.add(key)
    }
  }

  // Employee policy refs -> policy + group FK integrity
  for (const employee of MOCK_EMPLOYEES) {
    for (const employeePolicy of employee.benefitPolicies) {
      if (!validPolicyIds.has(employeePolicy.policyId)) {
        issues.push({
          policyId: employeePolicy.policyId,
          kind: "missing-employee-policy",
          detail: `Employee ${employee.id} references unknown policyId ${employeePolicy.policyId}`,
        })
        continue
      }

      const groupIds = policyGroupIds.get(employeePolicy.policyId)
      if (!groupIds) continue

      for (const groupId of employeePolicy.assignedGroupIds) {
        if (!groupIds.has(groupId)) {
          issues.push({
            policyId: employeePolicy.policyId,
            kind: "missing-employee-group",
            detail: `Employee ${employee.id} has assignedGroupId ${groupId} outside policy ${employeePolicy.policyId}`,
          })
        }
      }
    }
  }

  return issues
}
