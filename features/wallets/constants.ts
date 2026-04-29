import { WalletStatus, WalletFilters } from "./types";
import { DEFAULT_ADVANCED_FILTERS } from "@/components/shared/advanced-filter-sheet";

export const WALLET_STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Suspended", value: "suspended" },
  { label: "Closed", value: "closed" },
] as const;

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
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
  ...DEFAULT_ADVANCED_FILTERS,
};
