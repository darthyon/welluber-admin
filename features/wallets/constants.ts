import { WalletModel, WalletStatus, TransactionType, WalletFilters } from "./types";
import { DEFAULT_ADVANCED_FILTERS } from "@/components/shared/advanced-filter-sheet";

export const WALLET_MODEL_OPTIONS = [
  { label: "Cash Balance", value: "cash_balance" },
  { label: "Credit Limit", value: "credit_limit" },
] as const;

export const WALLET_STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Suspended", value: "suspended" },
  { label: "Closed", value: "closed" },
] as const;

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  topup: "Top-Up",
  deduction: "Deduction",
  adjustment: "Adjustment",
  reversal: "Reversal",
  settlement: "Settlement",
};

export const WALLET_FILTERS_DEFAULT: WalletFilters = {
  search: "",
  orgIds: [],
  branchIds: [],
  status: "all",
  model: "all",
  ...DEFAULT_ADVANCED_FILTERS,
};
