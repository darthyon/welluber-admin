import { ISODate } from "../organizations/types";

export type WalletStatus = "active" | "suspended" | "closed";
export type WalletType = "new" | "existing";

export interface Wallet {
  id: string;
  name: string;
  orgId: string;
  orgName: string;
  branchId: string;
  branchName: string;
  type: WalletType;
  balance: number;
  pendingDeductions: number;
  status: WalletStatus;
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

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceId?: string;
  voucherName?: string;
  claimId?: string;
  description: string;
  performedBy: string; // Host Admin name/ID
  createdAt: ISODate;
}

export interface WalletSummary {
  totalBalance: number;
  activeCount: number;
  suspendedCount: number;
  totalWallets: number;
}

import { AdvancedFilters } from "@/components/shared/advanced-filter-sheet";

export interface WalletFilters extends AdvancedFilters {
  search: string;
  orgIds: string[];
  branchIds: string[];
  status: WalletStatus | "all";
}
