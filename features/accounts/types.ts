import { ISODate } from "../organizations/types";

export interface Account {
  id: string;
  /** Human-readable wallet name e.g. "Acme HQ Wallet" */
  name: string;
  orgId: string;
  /** Denormalized for query efficiency */
  orgName: string;
  branchId: string;
  /** Denormalized for query efficiency */
  branchName: string;
  /** Funded cash balance (RM). Increased by approved TopupTransactions. Can go negative when credit is in use. */
  balance: number;
  /** Host-granted overdraft allowance (RM). 0 = no credit. */
  creditLimit: number;
  /** When false, all purchases and top-ups are blocked. */
  isActive: boolean;
  /**
   * Display-only derived field: "active" when isActive=true, "suspended" when false.
   * Source of truth is `isActive`. This field exists for backwards-compat with UI components.
   */
  status: "active" | "suspended";
  createdAt: ISODate;
  updatedAt: ISODate;
}

// ── Computed helpers (never stored) ──────────────────────────────────────────

export function getAvailableBalance(account: Account): number {
  return account.balance + account.creditLimit
}

export function getCreditUsed(account: Account): number {
  // balance < 0 means the overdraft is being used
  return Math.max(0, -account.balance)
}

// ── AccountTransaction ────────────────────────────────────────────────────────

export type AccountTransactionType =
  | "topup"
  | "deduction"
  | "pre-auth"
  | "cancelled"
  | "reversal"
  | "settlement";

export interface AccountTransaction {
  id: string;
  accountId: string;
  /**
   * What originated this transaction.
   * e.g. "Claim", "Topup", "Settlement", "ManualAdjustment"
   */
  source: string;
  /** FK → the source record (claimId, topupId, etc.) */
  sourceId: string;
  type: AccountTransactionType;
  amount: number;
  /** Immutable snapshot — balance before this transaction */
  balanceBefore: number;
  /** Immutable snapshot — balance after this transaction (can be negative = credit in use) */
  balanceAfter: number;
  description: string;
  /** 7-year retention for tax compliance */
  createdAt: ISODate;
}

export interface AccountSummary {
  /** Sum of (balance + creditLimit) across all accounts */
  totalAvailable: number;
  /** @deprecated use totalAvailable */
  totalBalance: number;
  activeCount: number;
  inactiveCount: number;
  totalAccounts: number;
}

import { AdvancedFilters } from "@/components/shared/advanced-filter-sheet";

export interface AccountFilters extends AdvancedFilters {
  search: string;
  orgIds: string[];
  branchIds: string[];
  /** "all" | "active" | "inactive" */
  status: "all" | "active" | "inactive";
}
