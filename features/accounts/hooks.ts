"use client";

import { Account, AccountTransaction, AccountFilters, AccountSummary, getAvailableBalance } from "./types";
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

      const matchesStatus = filters.status === "all" || (filters.status === "active" ? account.isActive : !account.isActive);
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
      totalBalance += getAvailableBalance(a);
      if (a.isActive) active++;
      else suspended++;
    });

    return {
      totalAvailable: totalBalance,
      totalBalance,           // backwards compat alias
      activeCount: active,
      inactiveCount: suspended,
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
  const { createAccountTransactions } = require("@/lib/mock-data/factories/account");
  const transactions: AccountTransaction[] = useMemo(
    () => createAccountTransactions(accountId),
    [accountId],
  );
  return { transactions };
}
