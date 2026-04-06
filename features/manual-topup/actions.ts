"use server";

import { TopupTransaction } from "./types";

// Mock history data for initial implementation
const MOCK_TOPUP_HISTORY: TopupTransaction[] = [
  {
    id: "txn_001",
    orgId: "org_001",
    branchId: "branch_001",
    walletId: "wallet_001",
    amount: 1000.00,
    method: "bank_transfer",
    paidDate: "2026-03-25T00:00:00Z",
    status: "completed",
    remarks: "Quarterly top-up",
    attachmentUrl: "https://example.com/proof1.pdf",
    referenceNo: "REF-12345",
    createdAt: "2026-03-25T10:00:00Z",
  },
  {
    id: "txn_002",
    orgId: "org_001",
    branchId: "branch_001",
    walletId: "wallet_001",
    amount: 2500.00,
    method: "cheque",
    paidDate: "2026-04-01T00:00:00Z",
    status: "pending",
    remarks: "Manual replenishment",
    attachmentUrl: "https://example.com/proof2.png",
    referenceNo: "CHQ-889012",
    createdAt: "2026-04-01T14:30:00Z",
  }
];

export async function submitManualTopup(formData: FormData) {
  // Simulate submission delay
  await new Promise(r => setTimeout(r, 1500));
  
  // Log the data for debugging (in real app, we would process the file and save to DB)
  console.log("Submit manual topup data:", formData);
  
  return { success: true, message: "Top-up request submitted successfully." };
}

export async function getTopupHistory(branchId: string): Promise<TopupTransaction[]> {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 500));
  
  // Filter for the specific branch
  const history = MOCK_TOPUP_HISTORY.filter(t => t.branchId === branchId);
  return history;
}
