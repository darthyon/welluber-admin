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
  "KL HQ Account", "PJ Branch Account", "SG HQ Account", "Nexus Ops Account",
  "Acme Shared Account", "Meridian Main Account", "Solaris HQ Account",
  "Pinnacle Medical Account", "Horizon Retail Account", "Apex Construction Account",
]

export function createAccount(index: number): Account {
  const n = index + 1
  const org = ORG_MAP[index]!
  const dateStr = index === 0 ? "20260115" : index === 1 ? "20260301" : index <= 4 ? "20260310" : "20260401"
  const statuses: Account["status"][] = ["active", "active", "active", "suspended", "active", "active", "active", "active", "active", "suspended"]
  const balances = [45200, 12500, 27500, 4800, 30000, 22000, 18500, 55000, 41200, 9800]
  const pending = [1200, 500, 0, 4500, 800, 300, 0, 1100, 600, 0]

  return {
    id: `ACC-${dateStr}-${String(n).padStart(4, "0")}`,
    name: ACC_NAMES[index] ?? `Account ${n}`,
    orgId: org.orgId,
    orgName: org.orgName,
    branchId: org.branchId,
    branchName: org.branchName,
    type: index === 4 ? "existing" : "new",
    balance: balances[index] ?? 10000 + index * 2500,
    pendingDeductions: pending[index] ?? 0,
    status: statuses[index]!,
    createdAt: index < 5 ? `2026-${String(index + 1).padStart(2, "0")}-01T10:00:00Z` : "2026-04-01T10:00:00Z",
    updatedAt: "2026-04-15T10:00:00Z",
  }
}

export function createAccountTransactions(accountId: string): AccountTransaction[] {
  return [
    { id: `${accountId}-TRX-001`, accountId: accountId, type: "topup", amount: 5000, balanceBefore: 40200, balanceAfter: 45200, referenceId: "PAY-993", description: "Monthly top-up — Apr 2026", performedBy: "System (Auto)", createdAt: "2026-04-01T09:00:00Z" },
    { id: `${accountId}-TRX-002`, accountId: accountId, type: "deduction", amount: 150.5, balanceBefore: 45200, balanceAfter: 45049.5, voucherName: "Wellness Allocation Voucher", claimId: "CLM-2026-0001", description: "Claim settlement — Ahmad Faizal", performedBy: "Member App", createdAt: "2026-04-02T14:30:00Z" },
    { id: `${accountId}-TRX-003`, accountId: accountId, type: "deduction", amount: 200, balanceBefore: 45049.5, balanceAfter: 44849.5, voucherName: "Lifestyle Pocket Voucher", claimId: "CLM-2026-0003", description: "Claim settlement — Sarah Lim", performedBy: "Member App", createdAt: "2026-04-04T10:15:00Z" },
    { id: `${accountId}-TRX-004`, accountId: accountId, type: "pre-auth", amount: 480, balanceBefore: 44849.5, balanceAfter: 44849.5, voucherName: "Physio Therapy Voucher", claimId: "CLM-2026-0005", description: "Pre-auth locked — Physio session (pending claim)", performedBy: "Member App", createdAt: "2026-04-07T11:20:00Z" },
    { id: `${accountId}-TRX-005`, accountId: accountId, type: "pre-auth", amount: 250, balanceBefore: 44849.5, balanceAfter: 44849.5, voucherName: "Dental Care Voucher", claimId: "CLM-2026-0006", description: "Pre-auth locked — Dental checkup", performedBy: "Member App", createdAt: "2026-04-09T09:45:00Z" },
    { id: `${accountId}-TRX-006`, accountId: accountId, type: "cancelled", amount: 250, balanceBefore: 44849.5, balanceAfter: 44849.5, voucherName: "Dental Care Voucher", claimId: "CLM-2026-0006", description: "Pre-auth cancelled — member cancelled appointment", performedBy: "System", createdAt: "2026-04-10T14:00:00Z" },
    { id: `${accountId}-TRX-007`, accountId: accountId, type: "topup", amount: 10000, balanceBefore: 35200, balanceAfter: 45200, referenceId: "PAY-1045", description: "Manual top-up — finance approval", performedBy: "Yon Yusuf", createdAt: "2026-03-15T15:00:00Z" },
    { id: `${accountId}-TRX-008`, accountId: accountId, type: "reversal", amount: 150.5, balanceBefore: 44849.5, balanceAfter: 45000, voucherName: "Wellness Allocation Voucher", claimId: "CLM-2026-0001", description: "Reversal — claim disputed by SP", performedBy: "System", createdAt: "2026-04-12T09:00:00Z" },
  ]
}
