import { AccountStatus, AccountFilters } from "./types";
import { DEFAULT_ADVANCED_FILTERS } from "@/components/shared/advanced-filter-sheet";

export const ACCOUNT_STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Suspended", value: "suspended" },
  { label: "Closed", value: "closed" },
] as const;

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  topup: "Top-Up",
  deduction: "Deduction",
  "pre-auth": "Pre-Authorised",
  cancelled: "Cancelled",
  reversal: "Reversal",
  settlement: "Settlement",
};

export const ACCOUNT_FILTERS_DEFAULT: AccountFilters = {
  search: "",
  orgIds: [],
  branchIds: [],
  status: "all",
  ...DEFAULT_ADVANCED_FILTERS,
};
