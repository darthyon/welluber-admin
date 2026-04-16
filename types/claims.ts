export interface Claim {
  id: string;
  voucherCode: string;
  service: string;
  provider: string;
  location: string;
  date: string;
  amount: number;
  status: "Approved" | "Pending" | "Rejected";
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
