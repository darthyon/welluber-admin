export type TopupStatus = "pending" | "completed" | "failed" | "rejected";
export type TopupMethod = "bank_transfer" | "cheque" | "cash" | "credit_card";

export interface TopupTransaction {
  id: string;
  orgId: string;
  branchId: string;
  walletId: string;
  amount: number;
  method: TopupMethod;
  paidDate: string; // ISO 8601
  status: TopupStatus;
  remarks?: string;
  attachmentUrl?: string; // URL to the uploaded proof
  referenceNo?: string;
  createdAt: string;
}
