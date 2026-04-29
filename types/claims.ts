export type ClaimStatus = "pre-auth" | "confirmed" | "cancelled";
export type TransactionType = "redemption" | "reimbursement" | "refund";

export interface Claim {
  id: string;
  voucherCode: string;
  voucherName?: string;
  transactionType: TransactionType;
  service: string;
  provider: string;
  location: string;
  date: string;
  amount: number;
  status: ClaimStatus;
}

export interface EmployeeClaim extends Claim {
  benefitGroup: string;
}

export interface EmployeeUtilisationRow {
  id: string;
  name: string;
  empCode: string;
  branch: string;
  allocated: number;
  used: number;
  claims: Claim[];
}

export interface FlatClaimRow extends Claim {
  employeeId: string;
  employeeName: string;
  empCode: string;
  branch: string;
}

export interface VoucherRedemption {
  id: string;
  voucherCode: string;
  voucherName: string;
  date: string;
  employeeId: string;
  employeeName: string;
  empCode: string;
  redeemedBy: "employee" | "dependent";
  redeemedByName: string;
  amount: number;
  provider: string;
  branch: string;
  city: string;
}
