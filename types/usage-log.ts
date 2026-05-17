/**
 * Usage log tables — aggregated snapshots for reporting and dashboards.
 *
 * Two scopes:
 *   EmployeeUsageLog  — tracks benefit pool consumption per employee
 *   WalletUsageLog    — tracks wallet (Account) balance movements
 *
 * Two granularities:
 *   "daily"   → one row per (entity × day),   periodKey = "YYYY-MM-DD"
 *   "monthly" → one row per (entity × month), periodKey = "YYYY-MM"
 *
 * Rows are written by a cron job at the end of each day/month,
 * or incrementally updated as claims / top-ups occur.
 *
 * These are NEVER the source of truth — they are read-optimised projections
 * derived from AccountTransaction and BenefitAssignment records.
 */

export type UsagePeriod = "daily" | "monthly"

// ── Employee Usage Log ────────────────────────────────────────────────────────

/**
 * One row per employee × benefit group × period.
 * Tracks how much of an employee's benefit pool was consumed.
 */
export interface EmployeeUsageLog {
  id: string

  /** FK → Employee */
  employeeId: string
  /** FK → BenefitAssignment — the specific pool being tracked */
  benefitAssignmentId: string
  /** FK → BenefitPolicy — denormalised for filtering */
  policyId: string
  /** FK → BenefitGroup — denormalised for filtering */
  benefitGroupId: string

  period: UsagePeriod
  /**
   * "YYYY-MM-DD" for daily, "YYYY-MM" for monthly.
   * Use as a sort key or filter key.
   */
  periodKey: string

  // ── Activity in this period ───────────────────────────────────────────────
  /** Total RM claimed (pre-auth + confirmed) in this period */
  amountClaimed: number
  /** Total RM reversed / cancelled in this period */
  amountReversed: number
  /** amountClaimed - amountReversed */
  netAmount: number
  /** Number of claims created in this period */
  claimCount: number

  // ── Pool snapshot at END of period ───────────────────────────────────────
  poolAllocated: number
  poolUsed: number
  /** poolAllocated - poolUsed */
  poolAvailable: number
  /** 0–100 */
  poolUtilisationPct: number

  // ── Standard timestamps ───────────────────────────────────────────────────
  createdAt: string
  updatedAt: string
}

// ── Wallet Usage Log ──────────────────────────────────────────────────────────

/**
 * One row per Account × period.
 * Tracks wallet balance movements — deductions, top-ups, reversals.
 */
export interface WalletUsageLog {
  id: string

  /** FK → Account */
  accountId: string
  /** Denormalised for display */
  orgId: string
  /** Denormalised for display */
  branchId: string

  period: UsagePeriod
  /**
   * "YYYY-MM-DD" for daily, "YYYY-MM" for monthly.
   */
  periodKey: string

  // ── Movements in this period ──────────────────────────────────────────────
  /** Total RM deducted (claims settled) */
  totalDeducted: number
  /** Total RM topped up */
  totalTopUp: number
  /** Total RM reversed / refunded */
  totalReversals: number
  /** totalTopUp - totalDeducted + totalReversals */
  netMovement: number

  // ── Balance snapshots ─────────────────────────────────────────────────────
  /** balance at the START of this period */
  openingBalance: number
  /** balance at the END of this period */
  closingBalance: number

  // ── Counters ──────────────────────────────────────────────────────────────
  claimCount: number
  topUpCount: number
  reversalCount: number

  // ── Standard timestamps ───────────────────────────────────────────────────
  createdAt: string
  updatedAt: string
}

// ── Query helpers ─────────────────────────────────────────────────────────────

/** Format a Date to a daily periodKey "YYYY-MM-DD" */
export function toDailyKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10)
}

/** Format a Date to a monthly periodKey "YYYY-MM" */
export function toMonthlyKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 7)
}
