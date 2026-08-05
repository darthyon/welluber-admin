/**
 * Canonical employee identity — the single source of truth for who an employee is.
 *
 * Every mock dataset that names an employee (directory, utilisation, claims,
 * vouchers, org analytics, entitlements) MUST read from here rather than
 * repeating names inline. `tests/unit/mock-identity.test.ts` enforces it.
 *
 * This module deliberately has no imports from `seed.ts` or the factories:
 * `seedAll()` runs before `MOCK_EMPLOYEES` is declared, so identity has to sit
 * upstream of both to stay cycle-free.
 */

export interface EmployeeIdentity {
  id: string
  name: string
  email: string
  empCode: string
  orgId: string
  branchId: string
  /**
   * Denormalised org/branch names, for the presentation-join datasets
   * (`EmployeeDirectoryItem`, utilisation rows, claim rows) that display them
   * without a lookup. Present only for the curated employees the UI references
   * by name; generated filler employees carry ids only, so there is no second
   * copy of the org name table to drift against `factories/organization.ts`.
   */
  organization?: string
  branch?: string
}

const ACME_ORG_ID = "ORG-20260115-0001"
const ACME_ORG_NAME = "Acme Corporation Sdn Bhd"
const ACME_HQ_ID = "BR-20260115-0001"
const ACME_HQ = "ACME HQ"
const ACME_SUBANG_ID = "BR-20260115-0002"
const ACME_SUBANG = "ACME Subang Jaya"

const GLOBAL_ORG_ID = "ORG-20260301-0002"
const GLOBAL_ORG_NAME = "Global Tech Solutions"
const GLOBAL_HQ_ID = "BR-20260301-0001"
const GLOBAL_HQ = "Global Tech HQ"

/** Curated employees 0001–0012 — the ones the UI and docs actually reference. */
const CURATED: EmployeeIdentity[] = [
  { id: "EMP-20260115-0001", name: "Robert Fox", email: "robert.f@acme.com", empCode: "ACM-001", orgId: ACME_ORG_ID, organization: ACME_ORG_NAME, branchId: ACME_HQ_ID, branch: ACME_HQ },
  { id: "EMP-20260115-0002", name: "Jenny Wilson", email: "jenny.w@acme.com", empCode: "ACM-042", orgId: ACME_ORG_ID, organization: ACME_ORG_NAME, branchId: ACME_SUBANG_ID, branch: ACME_SUBANG },
  { id: "EMP-20260115-0003", name: "Michael Tan", email: "michael.t@acme.com", empCode: "ACM-156", orgId: ACME_ORG_ID, organization: ACME_ORG_NAME, branchId: ACME_HQ_ID, branch: ACME_HQ },
  { id: "EMP-20260115-0004", name: "Marvin McKinney", email: "marvin.m@acme.com", empCode: "ACM-089", orgId: ACME_ORG_ID, organization: ACME_ORG_NAME, branchId: ACME_HQ_ID, branch: ACME_HQ },
  { id: "EMP-20260115-0005", name: "Jason Teh", email: "jason.t@acme.com", empCode: "ACM-212", orgId: ACME_ORG_ID, organization: ACME_ORG_NAME, branchId: ACME_HQ_ID, branch: ACME_HQ },
  { id: "EMP-20260115-0006", name: "Ahmad Faizal", email: "ahmad.f@acme.com", empCode: "ACM-301", orgId: ACME_ORG_ID, organization: ACME_ORG_NAME, branchId: ACME_SUBANG_ID, branch: ACME_SUBANG },
  { id: "EMP-20260115-0007", name: "Nurul Huda", email: "nurul.h@acme.com", empCode: "ACM-015", orgId: ACME_ORG_ID, organization: ACME_ORG_NAME, branchId: ACME_HQ_ID, branch: ACME_HQ },
  { id: "EMP-20260115-0008", name: "Kevin Tan", email: "kevin.t@acme.com", empCode: "ACM-016", orgId: ACME_ORG_ID, organization: ACME_ORG_NAME, branchId: ACME_HQ_ID, branch: ACME_HQ },
  { id: "EMP-20260115-0009", name: "Priya Raj", email: "priya.r@globaltech.com", empCode: "GTS-201", orgId: GLOBAL_ORG_ID, organization: GLOBAL_ORG_NAME, branchId: GLOBAL_HQ_ID, branch: GLOBAL_HQ },
  { id: "EMP-20260115-0010", name: "David Lee", email: "david.l@acme.com", empCode: "ACM-009", orgId: ACME_ORG_ID, organization: ACME_ORG_NAME, branchId: ACME_HQ_ID, branch: ACME_HQ },
  { id: "EMP-20260115-0011", name: "Lisa Wong", email: "lisa.w@acme.com", empCode: "ACM-055", orgId: ACME_ORG_ID, organization: ACME_ORG_NAME, branchId: ACME_SUBANG_ID, branch: ACME_SUBANG },
  { id: "EMP-20260115-0012", name: "Siti Aminah", email: "siti.a@acme.com", empCode: "ACM-077", orgId: ACME_ORG_ID, organization: ACME_ORG_NAME, branchId: ACME_HQ_ID, branch: ACME_HQ },
]

/** Filler names for 0013–0050. None may collide with a curated name. */
const FILLER_NAMES = [
  "Sarah Lim", "Aisha Karim", "Chen Wei", "Amir Hassan",
  "Rajesh Kumar", "Emily Chen", "Faisal Ibrahim", "Jason Ong",
  "Mei Ling", "Ravi Shankar", "Hannah Park", "Imran Shah",
  "Yasmin Abdullah", "Daniel Lim", "Natasha Singh", "Omar Hassan",
  "Chloe Tan", "Vikram Patel", "Sofia Reyes", "Arif Rahman",
  "Zara Malik", "Benjamin Cho", "Farah Nazri", "Kumar Selvaraj",
  "Isabella Goh", "Hafizuddin", "Lina Kow", "Ramesh Nair",
  "Nadia Aziz", "Tariq Jamil", "Grace Ho", "Syed Abbas",
  "Maya Krishnan", "Fong Wai", "Diana Lee", "Anwar Mokhtar",
  "Jasmine Teoh", "Sanjay Menon",
]

// Only the orgs `seedAll()` actually creates: 3 hand-crafted + 4 generated.
// The old list in `factories/employee.ts` ran to ORG-20260401-0010, pointing
// filler employees at orgs that do not exist.
const ORG_IDS = [
  "ORG-20260115-0001", "ORG-20260301-0002", "ORG-20260310-0003",
  "ORG-20260401-0004", "ORG-20260401-0005", "ORG-20260401-0006",
  "ORG-20260401-0007",
]

const BRANCH_IDS = [
  "BR-20260115-0001", "BR-20260301-0001", "BR-20260310-0001",
  "BR-20260401-0004", "BR-20260401-0005", "BR-20260401-0006",
  "BR-20260401-0007",
]

const TOTAL_EMPLOYEES = 50

function buildFiller(index: number): EmployeeIdentity {
  const n = index + 1
  const orgIdx = index % ORG_IDS.length
  const orgId = ORG_IDS[orgIdx]!
  const name = FILLER_NAMES[index - CURATED.length] ?? `Employee ${n}`
  return {
    id: `EMP-20260115-${String(n).padStart(4, "0")}`,
    name,
    email: `${name.toLowerCase().replace(/\s+/g, ".")}@company.com`,
    empCode: `EMP-${String(n).padStart(3, "0")}`,
    orgId,
    branchId: BRANCH_IDS[orgIdx]!,
  }
}

/** All 50 identities, index 0 => EMP-20260115-0001. */
export const EMPLOYEE_IDENTITIES: EmployeeIdentity[] = [
  ...CURATED,
  ...Array.from({ length: TOTAL_EMPLOYEES - CURATED.length }, (_, i) =>
    buildFiller(i + CURATED.length)
  ),
]

const BY_ID = new Map(EMPLOYEE_IDENTITIES.map((identity) => [identity.id, identity]))

/** Identity by employee id. Returns `undefined` for unknown ids — never guesses. */
export function getEmployeeIdentity(id: string): EmployeeIdentity | undefined {
  return BY_ID.get(id)
}

/**
 * Identity by employee id, throwing when absent. Use inside mock definitions so
 * a typo fails at import time rather than rendering the wrong person's name.
 */
export function requireEmployeeIdentity(id: string): EmployeeIdentity {
  const identity = BY_ID.get(id)
  if (!identity) throw new Error(`Unknown employee identity: ${id}`)
  return identity
}

/** Identity by zero-based index — for factories that generate by position. */
export function getEmployeeIdentityByIndex(index: number): EmployeeIdentity {
  return EMPLOYEE_IDENTITIES[index] ?? buildFiller(index)
}
