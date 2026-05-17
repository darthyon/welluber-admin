"use server"

import type { ClaimStatus, ClaimSourceType } from "@/types/claims"
import { accountStore, claimStore, benefitAssignmentStore } from "@/lib/mock-data/store"
import { getAvailableBalance } from "@/features/accounts/types"
import { getAvailableAmount as getPoolAvailable } from "@/types/benefit-assignment"
import type { GlobalClaimRow } from "@/lib/mock-data/factories/claim"

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
}

function now() {
  return new Date().toISOString()
}

// ── createClaim ───────────────────────────────────────────────────────────────

export interface CreateClaimInput {
  employeeId: string
  employeeName: string
  empCode: string
  organisation: string
  benefitAssignmentId: string
  policyId: string
  sourceType: ClaimSourceType
  sourceId: string
  accountId: string
  spId?: string
  spBranchId?: string
  voucherCode: string
  voucherName?: string
  transactionType: "redemption" | "reimbursement" | "refund"
  service: string
  provider: string
  location: string
  date: string
  amount: number
  status: "pre-auth" | "confirmed"
}

export interface CreateClaimResult {
  success: boolean
  error?: string
  claimId?: string
}

export async function createClaim(input: CreateClaimInput): Promise<CreateClaimResult> {
  await new Promise(r => setTimeout(r, 400)) // simulate network

  const accounts   = accountStore.get()
  const assignments = benefitAssignmentStore.get()

  const account    = accounts.find(a => a.id === input.accountId)
  const assignment = assignments.find(a => a.id === input.benefitAssignmentId)

  // ── Validation ─────────────────────────────────────────────────────────────

  if (!account) {
    return { success: false, error: "Account not found." }
  }
  if (!account.isActive) {
    return { success: false, error: "Account is inactive. Contact your host admin." }
  }
  if (!assignment) {
    return { success: false, error: "Benefit assignment not found." }
  }
  if (assignment.status === "expired") {
    return { success: false, error: "Benefit pool has expired for this cycle." }
  }

  // Check 1: Employee benefit pool
  const poolAvailable = getPoolAvailable(assignment)
  if (poolAvailable < input.amount) {
    return {
      success: false,
      error: `Insufficient benefit pool. Available: RM ${poolAvailable.toFixed(2)}, required: RM ${input.amount.toFixed(2)}.`,
    }
  }

  // Check 2: Company wallet (balance + credit limit)
  const walletAvailable = getAvailableBalance(account)
  if (walletAvailable < input.amount) {
    return {
      success: false,
      error: `Insufficient company wallet. Available: RM ${walletAvailable.toFixed(2)}, required: RM ${input.amount.toFixed(2)}.`,
    }
  }

  // ── Commit ─────────────────────────────────────────────────────────────────

  const claimId = makeId("CLM")
  const timestamp = now()

  // 1. Create claim record
  const claim: GlobalClaimRow = {
    id: claimId,
    employeeId: input.employeeId,
    benefitAssignmentId: input.benefitAssignmentId,
    policyId: input.policyId,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    accountId: input.accountId,
    spId: input.spId,
    spBranchId: input.spBranchId,
    voucherCode: input.voucherCode,
    voucherName: input.voucherName,
    transactionType: input.transactionType,
    service: input.service,
    provider: input.provider,
    location: input.location,
    date: input.date,
    amount: input.amount,
    status: input.status,
    employeeName: input.employeeName,
    empCode: input.empCode,
    organisation: input.organisation,
  }
  claimStore.add(claim)

  // 2. Deduct from company wallet (balance first; goes negative into creditLimit)
  const balanceBefore = account.balance
  const balanceAfter  = account.balance - input.amount
  accountStore.update(input.accountId, { balance: balanceAfter })

  // 3. Deduct from employee benefit pool
  const newUsed = assignment.usedAmount + input.amount
  const newStatus = newUsed >= assignment.allocatedAmount ? "exhausted" : assignment.status
  benefitAssignmentStore.update(input.benefitAssignmentId, {
    usedAmount: newUsed,
    status: newStatus as "active" | "exhausted" | "expired",
    updatedAt: timestamp,
  })

  return { success: true, claimId }
}

// ── cancelClaim ───────────────────────────────────────────────────────────────

export interface CancelClaimResult {
  success: boolean
  error?: string
}

export async function cancelClaim(claimId: string): Promise<CancelClaimResult> {
  await new Promise(r => setTimeout(r, 300))

  const claims      = claimStore.get()
  const accounts    = accountStore.get()
  const assignments = benefitAssignmentStore.get()

  const claim      = claims.find(c => c.id === claimId)

  if (!claim) return { success: false, error: "Claim not found." }
  if (claim.status === "cancelled") return { success: false, error: "Claim is already cancelled." }

  const account    = accounts.find(a => a.id === claim.accountId)
  const assignment = assignments.find(a => a.id === claim.benefitAssignmentId)

  const timestamp = now()

  // 1. Cancel the claim
  claimStore.update(claimId, { status: "cancelled" as ClaimStatus })

  // 2. Restore wallet balance
  if (account) {
    accountStore.update(account.id, { balance: account.balance + claim.amount })
  }

  // 3. Restore benefit pool
  if (assignment) {
    const restoredUsed = Math.max(0, assignment.usedAmount - claim.amount)
    const restoredStatus = assignment.status === "exhausted" && restoredUsed < assignment.allocatedAmount
      ? "active"
      : assignment.status
    benefitAssignmentStore.update(assignment.id, {
      usedAmount: restoredUsed,
      status: restoredStatus,
      updatedAt: timestamp,
    })
  }

  return { success: true }
}
