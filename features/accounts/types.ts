import { ISODate } from "../organizations/types";

export type AccountStatus = "active" | "suspended" | "closed";
export type AccountType = "new" | "existing";

export interface Account {
  id: string;
  name: string;
  orgId: string;
  orgName: string;
  branchId: string;
  branchName: string;
  type: AccountType;
  balance: number;
  pendingDeductions: number;
  status: AccountStatus;
  attachmentUrl?: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export type TransactionType =
  | "topup"
  | "deduction"
  | "pre-auth"
  | "cancelled"
  | "reversal"
  | "settlement";

export interface AccountTransaction {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceId?: string;
  voucherName?: string;
  claimId?: string;
  description: string;
  performedBy: string;
  createdAt: ISODate;
}

export interface AccountSummary {
  totalBalance: number;
  activeCount: number;
  suspendedCount: number;
  totalAccounts: number;
}

import { AdvancedFilters } from "@/components/shared/advanced-filter-sheet";

export interface AccountFilters extends AdvancedFilters {
  search: string;
  orgIds: string[];
  branchIds: string[];
  status: AccountStatus | "all";
}
