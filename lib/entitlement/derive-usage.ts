import type { BeneficiaryUsage } from "@/features/employees/types"
import type { ClaimStatus, EmployeeClaim } from "@/types/claims"

/**
 * What a policy grants a beneficiary for one benefit. Declared in mock data.
 *
 * Deliberately has no `spent` or `balance`: consumption is derived from claims
 * by `deriveUsage()`. Hand-typed spend figures were the reason an employee could
 * show RM 3,370 of claims against RM 300 of recorded entitlement spend.
 */
export interface BeneficiaryAllocation {
  beneficiaryId: string
  beneficiaryName?: string
  relationship?: string
  benefitId: string
  allocated: number
}

/**
 * Claim statuses that consume entitlement.
 *
 * `pre-auth` counts: the funds are reserved against the beneficiary's pool even
 * though the claim has not settled, so excluding it would let someone spend the
 * same ringgit twice. `cancelled`, `pending_review` and `flagged` do not consume.
 */
const CONSUMING_STATUSES: ReadonlySet<ClaimStatus> = new Set<ClaimStatus>([
  "confirmed",
  "pre-auth",
])

export function claimConsumesEntitlement(claim: EmployeeClaim): boolean {
  return CONSUMING_STATUSES.has(claim.status)
}

function key(beneficiaryId: string, benefitId: string) {
  return `${beneficiaryId}::${benefitId}`
}

/**
 * Fold claims into per-(beneficiary, benefit) usage rows.
 *
 * `balance` here is the row's own remainder (`allocated - spent`). Pool-level
 * balance — where dependents share one ceiling, so a row's remainder is not its
 * own allocation minus its own spend — is the job of
 * `buildEntitlementGroupPoolDisplay()`, which recomputes it per pool kind.
 *
 * Claims for a beneficiary/benefit with no allocation still surface, with
 * `allocated: 0`, rather than being dropped: spend against an unallocated
 * benefit is a data problem worth seeing, not one worth hiding.
 */
export function deriveUsage(
  employeeId: string,
  claims: EmployeeClaim[],
  allocations: BeneficiaryAllocation[]
): BeneficiaryUsage[] {
  const spentByKey = new Map<string, number>()
  for (const claim of claims) {
    if (claim.employeeId !== employeeId) continue
    if (!claimConsumesEntitlement(claim)) continue
    const k = key(claim.beneficiaryId, claim.benefitId)
    spentByKey.set(k, (spentByKey.get(k) ?? 0) + claim.amount)
  }

  const rows: BeneficiaryUsage[] = allocations.map((allocation) => {
    const k = key(allocation.beneficiaryId, allocation.benefitId)
    const spent = spentByKey.get(k) ?? 0
    spentByKey.delete(k)
    return {
      beneficiaryId: allocation.beneficiaryId,
      beneficiaryName: allocation.beneficiaryName,
      relationship: allocation.relationship,
      benefitId: allocation.benefitId,
      allocated: allocation.allocated,
      spent,
      balance: Math.max(allocation.allocated - spent, 0),
    }
  })

  // Spend with no matching allocation — surfaced rather than silently dropped.
  for (const [k, spent] of spentByKey) {
    const [beneficiaryId = "", benefitId = ""] = k.split("::")
    rows.push({
      beneficiaryId,
      benefitId,
      allocated: 0,
      spent,
      balance: 0,
    })
  }

  return rows
}
