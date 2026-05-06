"use client";

import { Account, AccountTransaction, AccountFilters, AccountSummary } from "./types";
import { ACCOUNT_FILTERS_DEFAULT } from "./constants";
import { accountStore } from "@/lib/mock-data";
import { useState, useMemo, useSyncExternalStore } from "react";

export function useAccounts() {
  const allAccounts = useSyncExternalStore(accountStore.subscribe, accountStore.get, accountStore.get) as Account[];
  const [filters, setFilters] = useState<AccountFilters>(ACCOUNT_FILTERS_DEFAULT);

  const filteredAccounts = useMemo(() => {
    return allAccounts.filter((account) => {
      const searchStr = filters.search.toLowerCase();
      const matchesSearch =
        account.name.toLowerCase().includes(searchStr) ||
        account.id.toLowerCase().includes(searchStr) ||
        account.orgName.toLowerCase().includes(searchStr) ||
        account.branchName.toLowerCase().includes(searchStr);

      const matchesStatus = filters.status === "all" || account.status === filters.status;
      const matchesOrg = filters.orgIds.length === 0 || filters.orgIds.includes(account.orgId);
      const matchesBranch = filters.branchIds.length === 0 || filters.branchIds.includes(account.branchId);

      return matchesSearch && matchesStatus && matchesOrg && matchesBranch;
    });
  }, [allAccounts, filters]);

  const summary: AccountSummary = useMemo(() => {
    let totalBalance = 0;
    let active = 0;
    let suspended = 0;

    allAccounts.forEach(a => {
      totalBalance += a.balance;
      if (a.status === "active") active++;
      else if (a.status === "suspended") suspended++;
    });

    return {
      totalBalance,
      activeCount: active,
      suspendedCount: suspended,
      totalAccounts: allAccounts.length,
    };
  }, [allAccounts]);

  return {
    accounts: filteredAccounts,
    summary,
    filters,
    setFilters,
  };
}

export function useAccountTransactions(accountId: string) {
  const transactions: AccountTransaction[] = useMemo(() => {
    return [
      { id: "TRX-001", accountId, type: "topup", amount: 5000, balanceBefore: 40200, balanceAfter: 45200, referenceId: "PAY-993", description: "Monthly top-up — Apr 2026", performedBy: "System (Auto)", createdAt: "2026-04-01T09:00:00Z" },
      { id: "TRX-002", accountId, type: "deduction", amount: 150.50, balanceBefore: 45200, balanceAfter: 45049.50, voucherName: "Wellness Allocation Voucher", claimId: "CLM-2026-0001", description: "Claim settlement — Ahmad Faizal", performedBy: "Member App", createdAt: "2026-04-02T14:30:00Z" },
      { id: "TRX-003", accountId, type: "deduction", amount: 200, balanceBefore: 45049.50, balanceAfter: 44849.50, voucherName: "Lifestyle Pocket Voucher", claimId: "CLM-2026-0003", description: "Claim settlement — Sarah Lim", performedBy: "Member App", createdAt: "2026-04-04T10:15:00Z" },
      { id: "TRX-004", accountId, type: "deduction", amount: 350, balanceBefore: 44849.50, balanceAfter: 44499.50, voucherName: "Rejuvenation Fund Voucher", claimId: "CLM-2026-0005", description: "Claim settlement — Michael Tan", performedBy: "Member App", createdAt: "2026-04-05T16:45:00Z" },
      { id: "TRX-005", accountId, type: "pre-auth", amount: 480, balanceBefore: 44499.50, balanceAfter: 44499.50, voucherName: "Physio Therapy Voucher", claimId: "CLM-2026-0006", description: "Pre-auth locked — Physio session (pending claim)", performedBy: "Member App", createdAt: "2026-04-07T11:20:00Z" },
      { id: "TRX-006", accountId, type: "pre-auth", amount: 250, balanceBefore: 44499.50, balanceAfter: 44499.50, voucherName: "Dental Care Voucher", claimId: "CLM-2026-0007", description: "Pre-auth locked — Dental checkup", performedBy: "Member App", createdAt: "2026-04-09T09:45:00Z" },
      { id: "TRX-007", accountId, type: "cancelled", amount: 250, balanceBefore: 44499.50, balanceAfter: 44499.50, voucherName: "Dental Care Voucher", claimId: "CLM-2026-0007", description: "Pre-auth cancelled — member cancelled appointment", performedBy: "System", createdAt: "2026-04-10T14:00:00Z" },
      { id: "TRX-008", accountId, type: "pre-auth", amount: 320, balanceBefore: 44499.50, balanceAfter: 44499.50, voucherName: "Wellness Massage Voucher", claimId: "CLM-2026-0008", description: "Pre-auth locked — Massage therapy session", performedBy: "Member App", createdAt: "2026-04-11T16:30:00Z" },
    ];
  }, [accountId]);

  return { transactions };
}
