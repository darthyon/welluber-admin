export type ClaimStatus = "pre-auth" | "confirmed" | "cancelled";
export type TransactionType = "redemption" | "reimbursement" | "refund";
export type ClaimSourceType = "employee" | "dependent";

export interface Claim {
  id: string;
  /** FK → Employee — always the employee who holds the policy */
  employeeId: string;
  /** FK → BenefitAssignment — which pool is being consumed */
  benefitAssignmentId: string;
  /** FK → BenefitPolicy — denormalized for quick filtering */
  policyId: string;
  /** Who received the benefit */
  sourceType: ClaimSourceType;
  /** employeeId or dependentId depending on sourceType */
  sourceId: string;
  /** FK → Account — which org wallet is debited */
  accountId: string;
  /** FK → ServiceProvider (optional) */
  spId?: string;
  /** FK → SpBranch (optional) */
  spBranchId?: string;
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
