"use client";

import { Wallet, WalletTransaction, WalletFilters, WalletSummary } from "./types";
import { WALLET_FILTERS_DEFAULT } from "./constants";
import { useState, useMemo } from "react";

// Mock data
export const MOCK_WALLETS: Wallet[] = [
  {
    id: "WAL-20260115-0001",
    orgId: "ORG-20260115-0001",
    orgName: "Acme Corporation Sdn Bhd",
    branchId: "BR-HQ",
    branchName: "Kuala Lumpur HQ",
    model: "cash_balance",
    balance: 45200,
    creditLimit: 50000,
    pendingDeductions: 1200,
    status: "active",
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-03-20T10:00:00Z",
  },
  {
    id: "WAL-20260301-0002",
    orgId: "ORG-20260301-0002",
    orgName: "Global Tech Solutions",
    branchId: "BR-PJ",
    branchName: "Petaling Jaya Branch",
    model: "credit_limit",
    balance: 12500,
    creditLimit: 85000,
    pendingDeductions: 500,
    status: "active",
    createdAt: "2026-03-01T10:00:00Z",
    updatedAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "WAL-20260310-0003",
    orgId: "ORG-20260310-0003",
    orgName: "Critical Wallet Case",
    branchId: "BR-SG",
    branchName: "Singapore HQ",
    model: "credit_limit",
    balance: 27500,
    creditLimit: 27500,
    pendingDeductions: 0,
    status: "active",
    createdAt: "2026-02-10T10:00:00Z",
    updatedAt: "2026-03-15T10:00:00Z",
  },
  {
    id: "WAL-20260310-0004",
    orgId: "ORG-20260310-0004",
    orgName: "Nexus Innovations",
    branchId: "BR-SG",
    branchName: "Singapore HQ",
    model: "cash_balance",
    balance: 4800,
    creditLimit: 5000,
    pendingDeductions: 4500,
    status: "suspended",
    createdAt: "2026-02-10T10:00:00Z",
    updatedAt: "2026-03-15T10:00:00Z",
  },
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `WAL-AUTO-${1000 + i}`,
    orgId: `ORG-AUTO-${1000 + i}`,
    orgName: `Enterprise Partner ${i + 1} Sdn Bhd`,
    branchId: `BR-AUTO-${1000 + i}`,
    branchName: `Branch ${i + 1}`,
    model: i % 3 === 0 ? "credit_limit" as const : "cash_balance" as const,
    balance: 10000 + (i * 2500),
    creditLimit: 50000 + (i * 10000),
    pendingDeductions: 0,
    status: "active" as const,
    createdAt: "2026-04-01T10:00:00Z",
    updatedAt: "2026-04-01T10:00:00Z",
  } as Wallet))
];

export function useWallets() {
  const [filters, setFilters] = useState<WalletFilters>(WALLET_FILTERS_DEFAULT);

  const filteredWallets = useMemo(() => {
    return MOCK_WALLETS.filter((wallet) => {
      // Search
      const searchStr = filters.search.toLowerCase();
      const matchesSearch = 
        wallet.id.toLowerCase().includes(searchStr) ||
        wallet.orgName.toLowerCase().includes(searchStr) ||
        wallet.branchName.toLowerCase().includes(searchStr);
      
      // Status
      const matchesStatus = filters.status === "all" || wallet.status === filters.status;
      
      // Model (Listing page simple filter)
      const matchesModel = filters.model === "all" || wallet.model === filters.model;

      // Advanced Filters
      const matchesOrg = filters.orgIds.length === 0 || filters.orgIds.includes(wallet.orgId);
      const matchesBranch = filters.branchIds.length === 0 || filters.branchIds.includes(wallet.branchId);

      // Advanced Wallet Model Filter
      const matchesAdvancedModel = 
        filters.walletModel === "all" || 
        (filters.walletModel === "Cash Balance" && wallet.model === "cash_balance") ||
        (filters.walletModel === "Credit Limit" && wallet.model === "credit_limit");

      // Utilization Filter
      const utilizationPercent = wallet.creditLimit 
        ? (wallet.balance / wallet.creditLimit) * 100 
        : 100; // Cash balance considered 100% "allocated/utilised" for safety or 0 if preferred
      
      const [minUtil, maxUtil] = filters.utilization;
      const matchesUtilization = utilizationPercent >= minUtil && utilizationPercent <= maxUtil;

      return matchesSearch && matchesStatus && matchesModel && matchesOrg && matchesBranch && matchesAdvancedModel && matchesUtilization;
    });
  }, [filters]);

  const summary: WalletSummary = useMemo(() => {
    let cash = 0;
    let limit = 0;
    let utilized = 0;
    let active = 0;
    let suspended = 0;

    MOCK_WALLETS.forEach(w => {
      if (w.model === "cash_balance") cash += w.balance;
      else {
        limit += w.creditLimit || 0;
        utilized += w.balance; // Using balance to represent current credit utilization
      }
      if (w.status === "active") active++;
      else if (w.status === "suspended") suspended++;
    });

    return {
      totalCashBalance: cash,
      totalCreditLimit: limit,
      totalCreditUtilized: utilized,
      activeCount: active,
      suspendedCount: suspended,
    };
  }, []);

  return {
    wallets: filteredWallets,
    summary,
    filters,
    setFilters,
  };
}

export function useWalletTransactions(walletId: string) {
  const transactions: WalletTransaction[] = useMemo(() => {
    return [
      {
        id: "TRX-001",
        walletId,
        type: "topup",
        amount: 5000,
        balanceBefore: 40200,
        balanceAfter: 45200,
        referenceId: "PAY-993",
        description: "Monthly top-up - Apr 2026",
        performedBy: "System (Auto)",
        createdAt: "2026-04-01T09:00:00Z",
      },
      {
        id: "TRX-002",
        walletId,
        type: "deduction",
        amount: 150.50,
        balanceBefore: 45200,
        balanceAfter: 45049.50,
        referenceId: "VOU-X920",
        description: "Voucher purchase - GP Clinic",
        performedBy: "Member App",
        createdAt: "2026-04-02T14:30:00Z",
      }
    ];
  }, [walletId]);

  return { transactions };
}
