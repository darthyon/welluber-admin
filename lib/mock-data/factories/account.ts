import type { Account, AccountTransaction } from "@/features/accounts/types"

const ORG_MAP: Record<number, { orgId: string; orgName: string; branchId: string; branchName: string }> = {
  0: { orgId: "ORG-20260115-0001", orgName: "Acme Corporation Sdn Bhd", branchId: "BR-20260115-0001", branchName: "Kuala Lumpur HQ" },
  1: { orgId: "ORG-20260301-0002", orgName: "Global Tech Solutions", branchId: "BR-20260301-0001", branchName: "Petaling Jaya Branch" },
  2: { orgId: "ORG-20260310-0003", orgName: "Nexus Innovations", branchId: "BR-20260310-0001", branchName: "Singapore HQ" },
  3: { orgId: "ORG-20260310-0003", orgName: "Nexus Innovations", branchId: "BR-20260310-0002", branchName: "KL Office" },
  4: { orgId: "ORG-20260115-0001", orgName: "Acme Corporation Sdn Bhd", branchId: "BR-20260115-0002", branchName: "Subang Jaya" },
  5: { orgId: "ORG-20260401-0006", orgName: "Meridian Logistics Group", branchId: "BR-20260401-0006", branchName: "Main Office" },
  6: { orgId: "ORG-20260401-0007", orgName: "Solaris Energy Ventures", branchId: "BR-20260401-0007", branchName: "HQ" },
  7: { orgId: "ORG-20260401-0008", orgName: "Pinnacle Medical Group", branchId: "BR-20260401-0008", branchName: "Main Campus" },
  8: { orgId: "ORG-20260401-0009", orgName: "Horizon Retail Holdings", branchId: "BR-20260401-0009", branchName: "Central HQ" },
  9: { orgId: "ORG-20260401-0010", orgName: "Apex Construction Sdn Bhd", branchId: "BR-20260401-0010", branchName: "Site Office" },
}

const ACC_NAMES = [
  "Acme HQ Wallet",        // index 0
  "Global Tech Wallet",    // index 1
  "Nexus SG Wallet",       // index 2
  "Nexus KL Wallet",       // index 3
  "Acme Subang Wallet",    // index 4
  "Meridian Wallet",       // index 5
  "Solaris Wallet",        // index 6
  "Pinnacle Wallet",       // index 7
  "Horizon Wallet",        // index 8
  "Apex Wallet",           // index 9
]

// Cash balances — some go negative (credit in use)
const BALANCES      = [45200, 12500, 27500, -1200, 30000, 22000, 18500, 55000, 41200, 9800]
const CREDIT_LIMITS = [ 5000,  3000,  5000,  5000,  5000,  3000,  3000,  8000,  5000,  2000]
const IS_ACTIVE     = [true, true, true, false, true, true, true, true, true, false]

export function createAccount(index: number): Account {
  const n = index + 1
  const org = ORG_MAP[index]!
  const dateStr = index === 0 ? "20260115" : index === 1 ? "20260301" : index <= 4 ? "20260310" : "20260401"

  return {
    id: `ACC-${dateStr}-${String(n).padStart(4, "0")}`,
    name: ACC_NAMES[index] ?? `Wallet ${n}`,
    orgId: org.orgId,
    orgName: org.orgName,
    branchId: org.branchId,
    branchName: org.branchName,
    balance: BALANCES[index] ?? 10000 + index * 2500,
    creditLimit: CREDIT_LIMITS[index] ?? 3000,
    isActive: IS_ACTIVE[index] ?? true,
    status: (IS_ACTIVE[index] ?? true) ? "active" : "suspended",
    createdAt: index < 5 ? `2026-${String(index + 1).padStart(2, "0")}-01T10:00:00Z` : "2026-04-01T10:00:00Z",
    updatedAt: "2026-04-15T10:00:00Z",
  }
}

export function createAccountTransactions(accountId: string): AccountTransaction[] {
  return [
    { id: `${accountId}-TRX-001`, accountId, source: "Topup", sourceId: "TUP-2026-0001", type: "topup",     amount:  5000,   balanceBefore: 40200,   balanceAfter: 45200,   description: "Monthly top-up — Apr 2026",                             createdAt: "2026-04-01T09:00:00Z" },
    { id: `${accountId}-TRX-002`, accountId, source: "Claim", sourceId: "CLM-2026-0001", type: "deduction",  amount:  150.5,  balanceBefore: 45200,   balanceAfter: 45049.5, description: "Claim — Ahmad Faizal / Yoga Class",                      createdAt: "2026-04-02T14:30:00Z" },
    { id: `${accountId}-TRX-003`, accountId, source: "Claim", sourceId: "CLM-2026-0002", type: "deduction",  amount:  200,    balanceBefore: 45049.5, balanceAfter: 44849.5, description: "Claim — Sarah Lim / Individual Therapy",                  createdAt: "2026-04-04T10:15:00Z" },
    { id: `${accountId}-TRX-004`, accountId, source: "Claim", sourceId: "CLM-2026-0003", type: "deduction",  amount:  180,    balanceBefore: 44849.5, balanceAfter: 44669.5, description: "Claim (pre-auth) — Michael Tan / Swedish Massage",       createdAt: "2026-04-07T11:20:00Z" },
    { id: `${accountId}-TRX-005`, accountId, source: "Claim", sourceId: "CLM-2026-0008", type: "deduction",  amount:  200,    balanceBefore: 44669.5, balanceAfter: 44469.5, description: "Claim (pre-auth) — Ahmad Faizal / Health Screening (dep)", createdAt: "2026-04-09T09:45:00Z" },
    { id: `${accountId}-TRX-006`, accountId, source: "Claim", sourceId: "CLM-2026-0006", type: "reversal",   amount:  120,    balanceBefore: 44469.5, balanceAfter: 44589.5, description: "Reversal — Priya Raj / Dietary Consultation (cancelled)", createdAt: "2026-04-10T14:00:00Z" },
    { id: `${accountId}-TRX-007`, accountId, source: "Topup", sourceId: "TUP-2026-0007", type: "topup",      amount: 10000,   balanceBefore: 35200,   balanceAfter: 45200,   description: "Manual top-up — finance approval",                       createdAt: "2026-03-15T15:00:00Z" },
    { id: `${accountId}-TRX-008`, accountId, source: "Claim", sourceId: "CLM-2026-0001", type: "reversal",   amount:  150.5,  balanceBefore: 44589.5, balanceAfter: 44740,   description: "Reversal — Ahmad Faizal / Yoga Class (claim disputed)",  createdAt: "2026-04-12T09:00:00Z" },
  ]
}
