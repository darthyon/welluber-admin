import { isMainServiceId } from "@/lib/mock-data/service-catalog"
import { MOCK_POLICY_BUNDLES } from "@/lib/mock-data"

export interface IntegrityIssue {
  policyId: string
  kind: "missing-group" | "missing-policy" | "unknown-service" | "duplicate-benefit" | "duplicate-group"
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

  for (const bundle of MOCK_POLICY_BUNDLES) {
    const policyId = bundle.policy.id
    const groups = bundle.data.groups
    const benefits = bundle.data.benefits

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

  return issues
}
