"use client";

import { Wallet, WalletTransaction, WalletFilters, WalletSummary } from "./types";
import { WALLET_FILTERS_DEFAULT } from "./constants";
import { useState, useMemo } from "react";

// Mock data
export const MOCK_WALLETS: Wallet[] = [
  {
    id: "WAL-20260115-0001",
    name: "KL HQ Wallet",
    orgId: "ORG-20260115-0001",
    orgName: "Acme Corporation Sdn Bhd",
    branchId: "BR-HQ",
    branchName: "Kuala Lumpur HQ",
    type: "new",
    balance: 45200,
    pendingDeductions: 1200,
    status: "active",
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-03-20T10:00:00Z",
  },
  {
    id: "WAL-20260301-0002",
    name: "PJ Branch Wallet",
    orgId: "ORG-20260301-0002",
    orgName: "Global Tech Solutions",
    branchId: "BR-PJ",
    branchName: "Petaling Jaya Branch",
    type: "new",
    balance: 12500,
    pendingDeductions: 500,
    status: "active",
    createdAt: "2026-03-01T10:00:00Z",
    updatedAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "WAL-20260310-0003",
    name: "SG HQ Wallet",
    orgId: "ORG-20260310-0003",
    orgName: "Critical Wallet Case",
    branchId: "BR-SG",
    branchName: "Singapore HQ",
    type: "new",
    balance: 27500,
    pendingDeductions: 0,
    status: "active",
    createdAt: "2026-02-10T10:00:00Z",
    updatedAt: "2026-03-15T10:00:00Z",
  },
  {
    id: "WAL-20260310-0004",
    name: "Nexus Ops Wallet",
    orgId: "ORG-20260310-0004",
    orgName: "Nexus Innovations",
    branchId: "BR-SG",
    branchName: "Singapore HQ",
    type: "new",
    balance: 4800,
    pendingDeductions: 4500,
    status: "suspended",
    createdAt: "2026-02-10T10:00:00Z",
    updatedAt: "2026-03-15T10:00:00Z",
  },
  {
    id: "WAL-20260310-0005",
    name: "Acme Shared Wallet",
    orgId: "ORG-20260115-0001",
    orgName: "Acme Corporation Sdn Bhd",
    branchId: "BR-SJ",
    branchName: "Subang Jaya Branch",
    type: "existing",
    balance: 30000,
    pendingDeductions: 800,
    status: "active",
    createdAt: "2026-02-10T10:00:00Z",
    updatedAt: "2026-03-15T10:00:00Z",
  },
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `WAL-AUTO-${1000 + i}`,
    name: `Auto Wallet ${i + 1}`,
    orgId: `ORG-AUTO-${1000 + i}`,
    orgName: `Enterprise Partner ${i + 1} Sdn Bhd`,
    branchId: `BR-AUTO-${1000 + i}`,
    branchName: `Branch ${i + 1}`,
    type: i % 3 === 0 ? "existing" as const : "new" as const,
    balance: 10000 + (i * 2500),
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
        wallet.name.toLowerCase().includes(searchStr) ||
        wallet.id.toLowerCase().includes(searchStr) ||
        wallet.orgName.toLowerCase().includes(searchStr) ||
        wallet.branchName.toLowerCase().includes(searchStr);

      // Status
      const matchesStatus = filters.status === "all" || wallet.status === filters.status;

      // Advanced Filters
      const matchesOrg = filters.orgIds.length === 0 || filters.orgIds.includes(wallet.orgId);
      const matchesBranch = filters.branchIds.length === 0 || filters.branchIds.includes(wallet.branchId);

      return matchesSearch && matchesStatus && matchesOrg && matchesBranch;
    });
  }, [filters]);

  const summary: WalletSummary = useMemo(() => {
    let totalBalance = 0;
    let active = 0;
    let suspended = 0;

    MOCK_WALLETS.forEach(w => {
      totalBalance += w.balance;
      if (w.status === "active") active++;
      else if (w.status === "suspended") suspended++;
    });

    return {
      totalBalance,
      activeCount: active,
      suspendedCount: suspended,
      totalWallets: MOCK_WALLETS.length,
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
        description: "Monthly top-up — Apr 2026",
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
        voucherName: "Wellness Allocation Voucher",
        claimId: "CLM-2026-0042",
        description: "Claim settlement — Ahmad Faizal",
        performedBy: "Member App",
        createdAt: "2026-04-02T14:30:00Z",
      },
      {
        id: "TRX-003",
        walletId,
        type: "deduction",
        amount: 200,
        balanceBefore: 45049.50,
        balanceAfter: 44849.50,
        voucherName: "Lifestyle Pocket Voucher",
        claimId: "CLM-2026-0045",
        description: "Claim settlement — Sarah Lim",
        performedBy: "Member App",
        createdAt: "2026-04-04T10:15:00Z",
      },
      {
        id: "TRX-004",
        walletId,
        type: "deduction",
        amount: 350,
        balanceBefore: 44849.50,
        balanceAfter: 44499.50,
        voucherName: "Rejuvenation Fund Voucher",
        claimId: "CLM-2026-0051",
        description: "Claim settlement — John Doe",
        performedBy: "Member App",
        createdAt: "2026-04-05T16:45:00Z",
      },
      {
        id: "TRX-005",
        walletId,
        type: "adjustment",
        amount: 500,
        balanceBefore: 44499.50,
        balanceAfter: 44999.50,
        description: "Balance adjustment — correction",
        performedBy: "Host Admin",
        createdAt: "2026-04-08T09:00:00Z",
      },
    ];
  }, [walletId]);

  return { transactions };
}
