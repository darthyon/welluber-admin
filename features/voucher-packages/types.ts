export type GeneratedVoucherStatus = "active" | "redeemed" | "expired" | "cancelled";

export interface GeneratedVoucher {
  id: string;
  voucherPackageId: string;
  voucherPackageName: string;
  code: string;
  employeeName: string;
  employeeId: string;
  amount: number;
  status: GeneratedVoucherStatus;
  generatedAt: string;
  redeemedAt?: string;
  expiresAt?: string;
}
