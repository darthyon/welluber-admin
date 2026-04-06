import { ISODate } from "../organizations/types";

export type WalletStatus = "active" | "suspended" | "closed";
export type WalletModel = "cash_balance" | "credit_limit";

export interface Wallet {
  id: string;
  orgId: string;
  orgName: string;
  branchId: string;
  branchName: string;
  model: WalletModel;
  balance: number;
  creditLimit?: number;
  pendingDeductions: number;
  status: WalletStatus;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export type TransactionType = 
  | "topup" 
  | "deduction" 
  | "adjustment" 
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
  description: string;
  performedBy: string; // Host Admin name/ID
  createdAt: ISODate;
}

export interface WalletSummary {
  totalCashBalance: number;
  totalCreditLimit: number;
  totalCreditUtilized: number;
  activeCount: number;
  suspendedCount: number;
}

import { AdvancedFilters } from "@/components/shared/advanced-filter-sheet";

export interface WalletFilters extends AdvancedFilters {
  search: string;
  orgIds: string[];
  branchIds: string[];
  status: WalletStatus | "all";
  model: WalletModel | "all";
}
