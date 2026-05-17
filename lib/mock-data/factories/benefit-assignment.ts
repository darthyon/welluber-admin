import type { BenefitAssignment } from "@/types/benefit-assignment"

const NOW = new Date()
const CYCLE_START = new Date(NOW.getFullYear(), 0, 1).toISOString().split("T")[0]! // 1 Jan this year
const CYCLE_END   = new Date(NOW.getFullYear(), 11, 31).toISOString().split("T")[0]! // 31 Dec this year
const CREATED = new Date(NOW.getFullYear(), 0, 15).toISOString()

/**
 * Mock BenefitAssignment rows.
 *
 * Each row represents one beneficiary's pool for one benefit group.
 * Links to real IDs from the policy and employee factories.
 *
 * Pool type coverage:
 *   Rows 0-7  → sourceType "employee"  (individual pools)
 *   Row  8    → sourceType "dependent" (Siti Rahmah, Ahmad's spouse)
 *   Row  9    → sourceType "shared"    (shared team pool for Global Tech Policy)
 */
const ROWS: Omit<BenefitAssignment, "id" | "createdAt" | "updatedAt">[] = [
  // ── Acme Employee Wellness Policy — Physical Wellbeing ──────────────────────
  {
    policyId:       "POL-20260115-0001",
    benefitGroupId: "POL-20260115-0001-G1",
    employeeId:     "EMP-20260115-0001",
    sourceType:     "employee",
    sourceId:       "EMP-20260115-0001",
    allocatedAmount: 350,
    usedAmount:      270,
    cycleStartDate:  CYCLE_START,
    cycleEndDate:    CYCLE_END,
    status:          "active",
  },
  // ── Acme Employee Wellness Policy — Mental Fitness (dependent row) ──────────
  {
    policyId:       "POL-20260115-0001",
    benefitGroupId: "POL-20260115-0001-G2",
    employeeId:     "EMP-20260115-0001",  // Ahmad Faizal
    sourceType:     "dependent",
    sourceId:       "DEP-20260115-0001",  // Siti Rahmah (spouse)
    allocatedAmount: 300,
    usedAmount:      200,
    cycleStartDate:  CYCLE_START,
    cycleEndDate:    CYCLE_END,
    status:          "active",
  },
  // ── Acme Leadership Benefits Policy — Premium Wellness ─────────────────────
  {
    policyId:       "POL-20260115-0002",
    benefitGroupId: "POL-20260115-0002-G1",
    employeeId:     "EMP-20260115-0002",  // Sarah Lim
    sourceType:     "employee",
    sourceId:       "EMP-20260115-0002",
    allocatedAmount: 500,
    usedAmount:      180,
    cycleStartDate:  CYCLE_START,
    cycleEndDate:    CYCLE_END,
    status:          "active",
  },
  // ── Acme Employee Wellness Policy — Physical Wellbeing (Michael Tan) ────────
  {
    policyId:       "POL-20260115-0001",
    benefitGroupId: "POL-20260115-0001-G1",
    employeeId:     "EMP-20260115-0003",  // Michael Tan
    sourceType:     "employee",
    sourceId:       "EMP-20260115-0003",
    allocatedAmount: 350,
    usedAmount:      0,
    cycleStartDate:  CYCLE_START,
    cycleEndDate:    CYCLE_END,
    status:          "active",
  },
  // ── Acme Employee Wellness Policy — Nutritional Support (Nurul Huda) — exhausted
  {
    policyId:       "POL-20260115-0001",
    benefitGroupId: "POL-20260115-0001-G3",
    employeeId:     "EMP-20260115-0004",  // Nurul Huda
    sourceType:     "employee",
    sourceId:       "EMP-20260115-0004",
    allocatedAmount: 100,
    usedAmount:      100,
    cycleStartDate:  CYCLE_START,
    cycleEndDate:    CYCLE_END,
    status:          "exhausted",
  },
  // ── Acme Engineering Wellness Supplement — Physical Wellbeing (Kevin Tan) ───
  {
    policyId:       "POL-20260115-0004",
    benefitGroupId: "POL-20260115-0004-G1",
    employeeId:     "EMP-20260115-0005",  // Kevin Tan
    sourceType:     "employee",
    sourceId:       "EMP-20260115-0005",
    allocatedAmount: 500,
    usedAmount:      80,
    cycleStartDate:  CYCLE_START,
    cycleEndDate:    CYCLE_END,
    status:          "active",
  },
  // ── Acme Employee Wellness Policy — Mental Fitness (Priya Raj) ─────────────
  {
    policyId:       "POL-20260115-0001",
    benefitGroupId: "POL-20260115-0001-G2",
    employeeId:     "EMP-20260115-0006",  // Priya Raj
    sourceType:     "employee",
    sourceId:       "EMP-20260115-0006",
    allocatedAmount: 300,
    usedAmount:      0,
    cycleStartDate:  CYCLE_START,
    cycleEndDate:    CYCLE_END,
    status:          "active",
  },
  // ── Acme Employee Wellness Policy — Physical Wellbeing (Robert Fox) ─────────
  {
    policyId:       "POL-20260115-0001",
    benefitGroupId: "POL-20260115-0001-G1",
    employeeId:     "EMP-20260115-0007",  // Robert Fox
    sourceType:     "employee",
    sourceId:       "EMP-20260115-0007",
    allocatedAmount: 350,
    usedAmount:      95,
    cycleStartDate:  CYCLE_START,
    cycleEndDate:    CYCLE_END,
    status:          "active",
  },
  // ── Global Tech Shared Pool — Lite Benefits ─────────────────────────────────
  // sourceType = "shared": all Global Tech employees draw from this one pool
  {
    policyId:       "POL-20260115-0003",
    benefitGroupId: "POL-20260115-0003-G1",
    employeeId:     "EMP-20260115-0009",  // primary owner in mock
    sourceType:     "shared",
    sourceId:       "POL-20260115-0003-G1", // pool keyed by groupId
    allocatedAmount: 1200,
    usedAmount:      560,
    cycleStartDate:  CYCLE_START,
    cycleEndDate:    CYCLE_END,
    status:          "active",
  },
]

export function createBenefitAssignment(index: number): BenefitAssignment {
  const n = index + 1
  const row = ROWS[index % ROWS.length]!
  return {
    id: `BA-20260115-${String(n).padStart(4, "0")}`,
    ...row,
    createdAt: CREATED,
    updatedAt: CREATED,
  }
}
