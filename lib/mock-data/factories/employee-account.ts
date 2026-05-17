import type { EmployeeAccount, DependentAccount, EmployeeAccountLinkageStatus } from "@/types/employee-account"

/**
 * Mock EmployeeAccount rows.
 *
 * Each row bridges an Employee (HR record) with a MemberProfile (personal identity).
 * linkageStatus shows the full lifecycle:
 *   - "active"               → fully linked and using benefits
 *   - "pending_verification" → member entered email+code; awaiting inbox confirmation
 *   - "unlinked"             → HR created the record; member hasn't started linkage
 *   - "deactivated"          → employee left company; history preserved
 */
type EARow = Omit<EmployeeAccount, "id" | "createdAt" | "updatedAt">

const NOW = "2026-01-15T10:00:00Z"

const ROWS: EARow[] = [
  // 0 — Active: fully linked (Ahmad Faizal @ Acme)
  {
    employeeId:       "EMP-20260115-0001",
    orgId:            "ORG-20260115-0001",
    branchId:         "BR-20260115-0001",
    corporateEmail:   "ahmad.faizal@acme.com.my",
    empCode:          "EMP-001",
    memberProfileId:  "MPR-20260115-0001",
    linkageStatus:    "active",
    linkageRequestedAt: "2026-01-15T09:00:00Z",
    linkedAt:           "2026-01-15T09:12:00Z",
  },
  // 1 — Active: fully linked (Sarah Lim @ Acme)
  {
    employeeId:       "EMP-20260115-0002",
    orgId:            "ORG-20260115-0001",
    branchId:         "BR-20260115-0002",
    corporateEmail:   "sarah.lim@acme.com.my",
    empCode:          "EMP-002",
    memberProfileId:  "MPR-20260115-0002",
    linkageStatus:    "active",
    linkageRequestedAt: "2026-01-15T10:00:00Z",
    linkedAt:           "2026-01-15T10:08:00Z",
  },
  // 2 — Active: fully linked (Michael Tan @ Acme)
  {
    employeeId:       "EMP-20260115-0003",
    orgId:            "ORG-20260115-0001",
    branchId:         "BR-20260115-0001",
    corporateEmail:   "michael.tan@acme.com.my",
    empCode:          "EMP-003",
    memberProfileId:  "MPR-20260115-0003",
    linkageStatus:    "active",
    linkageRequestedAt: "2026-01-16T08:30:00Z",
    linkedAt:           "2026-01-16T08:45:00Z",
  },
  // 3 — Pending verification: member entered credentials, hasn't confirmed yet (Nurul Huda)
  {
    employeeId:       "EMP-20260115-0004",
    orgId:            "ORG-20260115-0001",
    branchId:         "BR-20260115-0001",
    corporateEmail:   "nurul.huda@acme.com.my",
    empCode:          "EMP-004",
    memberProfileId:  null,
    linkageStatus:    "pending_verification",
    linkageTokenHash: "sha256:mock-token-hash-0004",
    linkageTokenExpiresAt: "2026-04-15T15:30:00Z",
    linkageRequestedAt:    "2026-04-15T14:30:00Z",
  },
  // 4 — Active: fully linked (Kevin Tan @ Acme)
  {
    employeeId:       "EMP-20260115-0005",
    orgId:            "ORG-20260115-0001",
    branchId:         "BR-20260115-0001",
    corporateEmail:   "kevin.tan@acme.com.my",
    empCode:          "EMP-005",
    memberProfileId:  "MPR-20260115-0005",
    linkageStatus:    "active",
    linkageRequestedAt: "2026-01-17T11:00:00Z",
    linkedAt:           "2026-01-17T11:22:00Z",
  },
  // 5 — Deactivated: Priya Raj left company (MemberProfile preserved)
  {
    employeeId:       "EMP-20260115-0006",
    orgId:            "ORG-20260115-0001",
    branchId:         "BR-20260115-0002",
    corporateEmail:   "priya.raj@acme.com.my",
    empCode:          "EMP-006",
    memberProfileId:  "MPR-20260115-0006",
    linkageStatus:    "deactivated",
    linkageRequestedAt: "2026-01-18T09:00:00Z",
    linkedAt:           "2026-01-18T09:15:00Z",
    deactivatedAt:      "2026-04-01T00:00:00Z",
  },
  // 6 — Active: Robert Fox @ Acme
  {
    employeeId:       "EMP-20260115-0007",
    orgId:            "ORG-20260115-0001",
    branchId:         "BR-20260115-0001",
    corporateEmail:   "robert.fox@acme.com.my",
    empCode:          "EMP-007",
    memberProfileId:  "MPR-20260115-0007",
    linkageStatus:    "active",
    linkageRequestedAt: "2026-01-19T08:00:00Z",
    linkedAt:           "2026-01-19T08:20:00Z",
  },
  // 7 — Unlinked: Jenny Wilson — HR created account, member hasn't linked yet
  {
    employeeId:       "EMP-20260115-0008",
    orgId:            "ORG-20260115-0001",
    branchId:         "BR-20260115-0001",
    corporateEmail:   "jenny.wilson@acme.com.my",
    empCode:          "EMP-008",
    memberProfileId:  null,
    linkageStatus:    "unlinked",
  },
  // 8 — Active: Ahmad Razif @ Global Tech
  {
    employeeId:       "EMP-20260115-0009",
    orgId:            "ORG-20260301-0002",
    branchId:         "BR-20260301-0001",
    corporateEmail:   "razif.ahmad@globaltech.com.my",
    empCode:          "EMP-009",
    memberProfileId:  "MPR-20260115-0009",
    linkageStatus:    "active",
    linkageRequestedAt: "2026-03-01T10:00:00Z",
    linkedAt:           "2026-03-01T10:18:00Z",
  },
  // 9 — Active: Mary Tan @ Global Tech (was linked to MPR-0008 before Priya left)
  {
    employeeId:       "EMP-20260115-0010",
    orgId:            "ORG-20260301-0002",
    branchId:         "BR-20260301-0001",
    corporateEmail:   "mary.tan@globaltech.com.my",
    empCode:          "EMP-010",
    memberProfileId:  "MPR-20260115-0010",
    linkageStatus:    "active",
    linkageRequestedAt: "2026-03-01T11:00:00Z",
    linkedAt:           "2026-03-01T11:14:00Z",
  },
]

export function createEmployeeAccount(index: number): EmployeeAccount {
  const n = index + 1
  const row = ROWS[index % ROWS.length]!
  return {
    id: `EA-20260115-${String(n).padStart(4, "0")}`,
    ...row,
    createdAt: NOW,
    updatedAt: NOW,
  }
}

// ── DependentAccount ──────────────────────────────────────────────────────────

const DEP_ROWS: Omit<DependentAccount, "id" | "createdAt" | "updatedAt">[] = [
  // Siti Rahmah (Ahmad Faizal's spouse) — has her own MemberProfile
  {
    dependentId:       "DEP-20260115-0001",
    employeeAccountId: "EA-20260115-0001",
    memberProfileId:   null,  // spouse doesn't have own app account yet
    status:            "active",
  },
  // Ahmad Jr (Ahmad Faizal's child) — no personal app account
  {
    dependentId:       "DEP-20260115-0002",
    employeeAccountId: "EA-20260115-0001",
    memberProfileId:   null,
    status:            "active",
  },
]

export function createDependentAccount(index: number): DependentAccount {
  const n = index + 1
  const row = DEP_ROWS[index % DEP_ROWS.length]!
  return {
    id: `DA-20260115-${String(n).padStart(4, "0")}`,
    ...row,
    createdAt: NOW,
    updatedAt: NOW,
  }
}
