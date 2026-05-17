import type { EmployeeUsageLog, WalletUsageLog } from "@/types/usage-log"

// ── EmployeeUsageLog mock rows ─────────────────────────────────────────────────
// One row per employee × benefit group × period
// Covers the last 6 months + daily for the last 7 days

type EmpRow = Omit<EmployeeUsageLog, "id" | "createdAt" | "updatedAt">

const EMP_ROWS: EmpRow[] = [
  // Ahmad Faizal — Physical Wellbeing — monthly
  { employeeId: "EMP-20260115-0001", benefitAssignmentId: "BA-20260115-0001", policyId: "POL-20260115-0001", benefitGroupId: "POL-20260115-0001-G1", period: "monthly", periodKey: "2026-01", amountClaimed: 80,  amountReversed: 0,  netAmount: 80,  claimCount: 1, poolAllocated: 350, poolUsed: 80,  poolAvailable: 270, poolUtilisationPct: 23 },
  { employeeId: "EMP-20260115-0001", benefitAssignmentId: "BA-20260115-0001", policyId: "POL-20260115-0001", benefitGroupId: "POL-20260115-0001-G1", period: "monthly", periodKey: "2026-02", amountClaimed: 100, amountReversed: 0,  netAmount: 100, claimCount: 1, poolAllocated: 350, poolUsed: 180, poolAvailable: 170, poolUtilisationPct: 51 },
  { employeeId: "EMP-20260115-0001", benefitAssignmentId: "BA-20260115-0001", policyId: "POL-20260115-0001", benefitGroupId: "POL-20260115-0001-G1", period: "monthly", periodKey: "2026-03", amountClaimed: 90,  amountReversed: 0,  netAmount: 90,  claimCount: 1, poolAllocated: 350, poolUsed: 270, poolAvailable: 80,  poolUtilisationPct: 77 },
  { employeeId: "EMP-20260115-0001", benefitAssignmentId: "BA-20260115-0001", policyId: "POL-20260115-0001", benefitGroupId: "POL-20260115-0001-G1", period: "monthly", periodKey: "2026-04", amountClaimed: 0,   amountReversed: 0,  netAmount: 0,   claimCount: 0, poolAllocated: 350, poolUsed: 270, poolAvailable: 80,  poolUtilisationPct: 77 },
  { employeeId: "EMP-20260115-0001", benefitAssignmentId: "BA-20260115-0001", policyId: "POL-20260115-0001", benefitGroupId: "POL-20260115-0001-G1", period: "monthly", periodKey: "2026-05", amountClaimed: 0,   amountReversed: 0,  netAmount: 0,   claimCount: 0, poolAllocated: 350, poolUsed: 270, poolAvailable: 80,  poolUtilisationPct: 77 },
  // Ahmad Faizal — Physical Wellbeing — daily (last 7 days)
  { employeeId: "EMP-20260115-0001", benefitAssignmentId: "BA-20260115-0001", policyId: "POL-20260115-0001", benefitGroupId: "POL-20260115-0001-G1", period: "daily", periodKey: "2026-04-07", amountClaimed: 0,  amountReversed: 0, netAmount: 0,  claimCount: 0, poolAllocated: 350, poolUsed: 270, poolAvailable: 80, poolUtilisationPct: 77 },
  { employeeId: "EMP-20260115-0001", benefitAssignmentId: "BA-20260115-0001", policyId: "POL-20260115-0001", benefitGroupId: "POL-20260115-0001-G1", period: "daily", periodKey: "2026-04-08", amountClaimed: 0,  amountReversed: 0, netAmount: 0,  claimCount: 0, poolAllocated: 350, poolUsed: 270, poolAvailable: 80, poolUtilisationPct: 77 },
  { employeeId: "EMP-20260115-0001", benefitAssignmentId: "BA-20260115-0001", policyId: "POL-20260115-0001", benefitGroupId: "POL-20260115-0001-G1", period: "daily", periodKey: "2026-04-09", amountClaimed: 120, amountReversed: 0, netAmount: 120, claimCount: 1, poolAllocated: 350, poolUsed: 270, poolAvailable: 80, poolUtilisationPct: 77 },
  // Sarah Lim — Premium Wellness — monthly
  { employeeId: "EMP-20260115-0002", benefitAssignmentId: "BA-20260115-0003", policyId: "POL-20260115-0002", benefitGroupId: "POL-20260115-0002-G1", period: "monthly", periodKey: "2026-02", amountClaimed: 80,  amountReversed: 0,  netAmount: 80,  claimCount: 1, poolAllocated: 500, poolUsed: 80,  poolAvailable: 420, poolUtilisationPct: 16 },
  { employeeId: "EMP-20260115-0002", benefitAssignmentId: "BA-20260115-0003", policyId: "POL-20260115-0002", benefitGroupId: "POL-20260115-0002-G1", period: "monthly", periodKey: "2026-03", amountClaimed: 100, amountReversed: 0,  netAmount: 100, claimCount: 1, poolAllocated: 500, poolUsed: 180, poolAvailable: 320, poolUtilisationPct: 36 },
  { employeeId: "EMP-20260115-0002", benefitAssignmentId: "BA-20260115-0003", policyId: "POL-20260115-0002", benefitGroupId: "POL-20260115-0002-G1", period: "monthly", periodKey: "2026-04", amountClaimed: 200, amountReversed: 0,  netAmount: 200, claimCount: 2, poolAllocated: 500, poolUsed: 380, poolAvailable: 120, poolUtilisationPct: 76 },
  // Kevin Tan — Engineering Wellness — monthly
  { employeeId: "EMP-20260115-0005", benefitAssignmentId: "BA-20260115-0006", policyId: "POL-20260115-0004", benefitGroupId: "POL-20260115-0004-G1", period: "monthly", periodKey: "2026-03", amountClaimed: 80,  amountReversed: 0, netAmount: 80,  claimCount: 1, poolAllocated: 500, poolUsed: 80,  poolAvailable: 420, poolUtilisationPct: 16 },
  { employeeId: "EMP-20260115-0005", benefitAssignmentId: "BA-20260115-0006", policyId: "POL-20260115-0004", benefitGroupId: "POL-20260115-0004-G1", period: "monthly", periodKey: "2026-04", amountClaimed: 0,   amountReversed: 0, netAmount: 0,   claimCount: 0, poolAllocated: 500, poolUsed: 80,  poolAvailable: 420, poolUtilisationPct: 16 },
  // Global Tech shared pool — monthly
  { employeeId: "EMP-20260115-0009", benefitAssignmentId: "BA-20260115-0009", policyId: "POL-20260115-0003", benefitGroupId: "POL-20260115-0003-G1", period: "monthly", periodKey: "2026-03", amountClaimed: 320, amountReversed: 0,  netAmount: 320, claimCount: 4, poolAllocated: 1200, poolUsed: 320, poolAvailable: 880, poolUtilisationPct: 27 },
  { employeeId: "EMP-20260115-0009", benefitAssignmentId: "BA-20260115-0009", policyId: "POL-20260115-0003", benefitGroupId: "POL-20260115-0003-G1", period: "monthly", periodKey: "2026-04", amountClaimed: 240, amountReversed: 0,  netAmount: 240, claimCount: 3, poolAllocated: 1200, poolUsed: 560, poolAvailable: 640, poolUtilisationPct: 47 },
]

export function createEmployeeUsageLog(index: number): EmployeeUsageLog {
  const n = index + 1
  const row = EMP_ROWS[index % EMP_ROWS.length]!
  const ts = new Date().toISOString()
  return {
    id: `EUL-20260115-${String(n).padStart(4, "0")}`,
    ...row,
    createdAt: ts,
    updatedAt: ts,
  }
}

// ── WalletUsageLog mock rows ───────────────────────────────────────────────────
// One row per account × period

type WalRow = Omit<WalletUsageLog, "id" | "createdAt" | "updatedAt">

const WAL_ROWS: WalRow[] = [
  // Acme HQ Wallet — monthly
  { accountId: "ACC-20260115-0001", orgId: "ORG-20260115-0001", branchId: "BR-20260115-0001", period: "monthly", periodKey: "2026-01", totalDeducted: 1200, totalTopUp: 10000, totalReversals: 0,   netMovement: 8800,  openingBalance: 36400, closingBalance: 45200, claimCount: 10, topUpCount: 1, reversalCount: 0 },
  { accountId: "ACC-20260115-0001", orgId: "ORG-20260115-0001", branchId: "BR-20260115-0001", period: "monthly", periodKey: "2026-02", totalDeducted: 1800, totalTopUp: 5000,  totalReversals: 0,   netMovement: 3200,  openingBalance: 45200, closingBalance: 48400, claimCount: 14, topUpCount: 1, reversalCount: 0 },
  { accountId: "ACC-20260115-0001", orgId: "ORG-20260115-0001", branchId: "BR-20260115-0001", period: "monthly", periodKey: "2026-03", totalDeducted: 2100, totalTopUp: 5000,  totalReversals: 150, netMovement: 3050,  openingBalance: 48400, closingBalance: 51450, claimCount: 16, topUpCount: 1, reversalCount: 1 },
  { accountId: "ACC-20260115-0001", orgId: "ORG-20260115-0001", branchId: "BR-20260115-0001", period: "monthly", periodKey: "2026-04", totalDeducted: 870,  totalTopUp: 0,     totalReversals: 120, netMovement: -750,  openingBalance: 51450, closingBalance: 50700, claimCount: 6,  topUpCount: 0, reversalCount: 1 },
  // Acme HQ Wallet — daily (last 7 days)
  { accountId: "ACC-20260115-0001", orgId: "ORG-20260115-0001", branchId: "BR-20260115-0001", period: "daily", periodKey: "2026-04-07", totalDeducted: 180, totalTopUp: 0,    totalReversals: 0,   netMovement: -180,  openingBalance: 44950, closingBalance: 44770, claimCount: 1, topUpCount: 0, reversalCount: 0 },
  { accountId: "ACC-20260115-0001", orgId: "ORG-20260115-0001", branchId: "BR-20260115-0001", period: "daily", periodKey: "2026-04-08", totalDeducted: 0,   totalTopUp: 5000, totalReversals: 0,   netMovement: 5000,  openingBalance: 44770, closingBalance: 49770, claimCount: 0, topUpCount: 1, reversalCount: 0 },
  { accountId: "ACC-20260115-0001", orgId: "ORG-20260115-0001", branchId: "BR-20260115-0001", period: "daily", periodKey: "2026-04-09", totalDeducted: 200, totalTopUp: 0,    totalReversals: 0,   netMovement: -200,  openingBalance: 49770, closingBalance: 49570, claimCount: 1, topUpCount: 0, reversalCount: 0 },
  { accountId: "ACC-20260115-0001", orgId: "ORG-20260115-0001", branchId: "BR-20260115-0001", period: "daily", periodKey: "2026-04-10", totalDeducted: 120, totalTopUp: 0,    totalReversals: 120, netMovement: 0,     openingBalance: 49570, closingBalance: 49570, claimCount: 1, topUpCount: 0, reversalCount: 1 },
  { accountId: "ACC-20260115-0001", orgId: "ORG-20260115-0001", branchId: "BR-20260115-0001", period: "daily", periodKey: "2026-04-11", totalDeducted: 0,   totalTopUp: 0,    totalReversals: 0,   netMovement: 0,     openingBalance: 49570, closingBalance: 49570, claimCount: 0, topUpCount: 0, reversalCount: 0 },
  { accountId: "ACC-20260115-0001", orgId: "ORG-20260115-0001", branchId: "BR-20260115-0001", period: "daily", periodKey: "2026-04-12", totalDeducted: 150, totalTopUp: 0,    totalReversals: 150, netMovement: 0,     openingBalance: 49570, closingBalance: 49570, claimCount: 1, topUpCount: 0, reversalCount: 1 },
  { accountId: "ACC-20260115-0001", orgId: "ORG-20260115-0001", branchId: "BR-20260115-0001", period: "daily", periodKey: "2026-04-13", totalDeducted: 0,   totalTopUp: 0,    totalReversals: 0,   netMovement: 0,     openingBalance: 49570, closingBalance: 49570, claimCount: 0, topUpCount: 0, reversalCount: 0 },
  // Global Tech Wallet — monthly
  { accountId: "ACC-20260301-0002", orgId: "ORG-20260301-0002", branchId: "BR-20260301-0001", period: "monthly", periodKey: "2026-03", totalDeducted: 320,  totalTopUp: 5000, totalReversals: 0,  netMovement: 4680,  openingBalance: 7820,  closingBalance: 12500, claimCount: 4, topUpCount: 1, reversalCount: 0 },
  { accountId: "ACC-20260301-0002", orgId: "ORG-20260301-0002", branchId: "BR-20260301-0001", period: "monthly", periodKey: "2026-04", totalDeducted: 320,  totalTopUp: 0,    totalReversals: 0,  netMovement: -320,  openingBalance: 12500, closingBalance: 12180, claimCount: 3, topUpCount: 0, reversalCount: 0 },
]

export function createWalletUsageLog(index: number): WalletUsageLog {
  const n = index + 1
  const row = WAL_ROWS[index % WAL_ROWS.length]!
  const ts = new Date().toISOString()
  return {
    id: `WUL-20260115-${String(n).padStart(4, "0")}`,
    ...row,
    createdAt: ts,
    updatedAt: ts,
  }
}
