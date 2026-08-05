export type ClaimStatus = "pre-auth" | "confirmed" | "cancelled" | "pending_review" | "flagged";
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
  /** Whose entitlement this draws from. Required — without it the employee
   *  Claims tab cannot filter, and every employee shows the same rows. */
  employeeId: string;
  /** The employee id, or one of their dependents' (`DEP-…`). */
  beneficiaryId: string;
  /** FK -> Benefit.id. Ties the claim to the pool it consumes. */
  benefitId: string;
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
