/**
 * BenefitAssignment
 *
 * Created when a BenefitPolicy is assigned to an employee.
 * One row per beneficiary × benefit group.
 * Tracks pool balance (allocatedAmount / usedAmount) and the beneficiary
 * polymorphically via sourceType + sourceId.
 *
 * Pool types → how rows are created:
 *
 *   benefitPoolType = "Individual"
 *     → 1 row per employee per group  (sourceType = "employee")
 *
 *   benefitPoolType = "Shared"
 *     → 1 shared row per group  (sourceType = "shared", sourceId = benefitGroupId)
 *       all employees under the policy draw from this single row
 *
 *   coversDependents + dependentsPoolType = "Individual"
 *     → 1 additional row per dependent per group  (sourceType = "dependent")
 *
 *   coversDependents + dependentsPoolType = "Shared"
 *     → 1 shared row for all dependents  (sourceType = "shared", sourceId = "dep-{benefitGroupId}")
 *
 *   coversDependents + dependentsPoolType = "SharedWithEmployee"
 *     → employee's own row covers dependents too — no separate row;
 *       dependent claims reference the employee's BenefitAssignment
 *
 * Computed (never stored):
 *   availableAmount = allocatedAmount - usedAmount
 *   utilisationPct  = usedAmount / allocatedAmount * 100
 */

export type BenefitAssignmentSourceType = "employee" | "dependent" | "shared"
export type BenefitAssignmentStatus = "active" | "exhausted" | "expired"

export interface BenefitAssignment {
  id: string
  /** FK → BenefitPolicy */
  policyId: string
  /** FK → BenefitGroup */
  benefitGroupId: string
  /**
   * FK → Employee — always the employee who holds the policy,
   * even for dependent or shared rows.
   */
  employeeId: string
  /**
   * Who the pool belongs to:
   *   "employee"  → this employee's individual pool
   *   "dependent" → a specific dependent's individual pool
   *   "shared"    → pool shared across multiple employees / dependents
   */
  sourceType: BenefitAssignmentSourceType
  /**
   * The ID of the source:
   *   sourceType = "employee"  → employeeId
   *   sourceType = "dependent" → dependentId
   *   sourceType = "shared"    → benefitGroupId (or "dep-{benefitGroupId}" for shared dependents)
   */
  sourceId: string

  /** RM — set from policy group amounts at assignment time; recalculated on refresh */
  allocatedAmount: number
  /** RM — incremented on claim pre-auth or confirm; decremented on cancel */
  usedAmount: number

  /** When this cycle started */
  cycleStartDate: string // ISO date
  /** When this cycle ends (null = open until next refresh) */
  cycleEndDate?: string // ISO date

  status: BenefitAssignmentStatus

  createdAt: string
  updatedAt: string
}

// ── Computed helpers ──────────────────────────────────────────────────────────

export function getAvailableAmount(a: BenefitAssignment): number {
  return Math.max(0, a.allocatedAmount - a.usedAmount)
}

export function getUtilisationPct(a: BenefitAssignment): number {
  if (a.allocatedAmount === 0) return 0
  return Math.round((a.usedAmount / a.allocatedAmount) * 100)
}

// ── Employee pool summary (aggregated across all assignments) ─────────────────

export interface EmployeePoolSummary {
  employeeId: string
  totalAllocated: number
  totalUsed: number
  totalAvailable: number
  utilisationPct: number
  /** Grouped by benefitGroupId, one entry per group (merges shared + individual) */
  byGroup: EmployeePoolGroup[]
}

export interface EmployeePoolGroup {
  benefitGroupId: string
  benefitGroupName: string // denormalized for display
  policyId: string
  policyName: string // denormalized for display
  assignment: BenefitAssignment
  availableAmount: number
  utilisationPct: number
  /** For shared pools: each beneficiary's individual spend within the shared pool */
  breakdown?: PoolBreakdownEntry[]
}

export interface PoolBreakdownEntry {
  sourceId: string
  label: string  // e.g. "You", "Ahmad (Spouse)", "Sara (Child)"
  usedAmount: number
}
