import type { GeneratedVoucher } from "@/features/voucher-packages/types"
import type { TopupTransaction } from "@/features/manual-topup/types"
import { requireEmployeeIdentity } from "../employee-identity"

/** Voucher facts only — `employeeName` is resolved from `employee-identity.ts`. */
const GV_ROWS: Omit<GeneratedVoucher, "id" | "employeeName">[] = [
  { voucherPackageId: "VCH-20260201-0001", voucherPackageName: "Monthly Yoga Pass", code: "PACSP000010001-A1B2", employeeId: "EMP-20260115-0001", amount: 250, status: "active", generatedAt: "2026-03-01T10:00:00Z", expiresAt: "2026-04-01T10:00:00Z" },
  { voucherPackageId: "VCH-20260201-0001", voucherPackageName: "Monthly Yoga Pass", code: "PACSP000010001-C3D4", employeeId: "EMP-20260115-0002", amount: 250, status: "redeemed", generatedAt: "2026-03-05T09:30:00Z", redeemedAt: "2026-03-15T14:00:00Z", expiresAt: "2026-04-05T09:30:00Z" },
  { voucherPackageId: "VCH-20260201-0001", voucherPackageName: "Monthly Yoga Pass", code: "PACSP000010001-E5F6", employeeId: "EMP-20260115-0003", amount: 250, status: "expired", generatedAt: "2026-02-01T10:00:00Z", expiresAt: "2026-03-01T10:00:00Z" },
  { voucherPackageId: "VCH-20260201-0001", voucherPackageName: "Monthly Yoga Pass", code: "PACSP000010001-G7H8", employeeId: "EMP-20260115-0004", amount: 250, status: "cancelled", generatedAt: "2026-03-10T08:00:00Z", expiresAt: "2026-04-10T08:00:00Z" },
  { voucherPackageId: "VCH-20260201-0002", voucherPackageName: "Individual Therapy Session", code: "PACSP000020001-I9J0", employeeId: "EMP-20260115-0001", amount: 200, status: "active", generatedAt: "2026-03-12T11:00:00Z", expiresAt: "2026-06-12T11:00:00Z" },
  { voucherPackageId: "VCH-20260201-0002", voucherPackageName: "Individual Therapy Session", code: "PACSP000020001-K1L2", employeeId: "EMP-20260115-0005", amount: 200, status: "redeemed", generatedAt: "2026-02-20T14:00:00Z", redeemedAt: "2026-03-10T10:00:00Z", expiresAt: "2026-05-20T14:00:00Z" },
  { voucherPackageId: "VCH-20260201-0002", voucherPackageName: "Individual Therapy Session", code: "PACSP000020001-M3N4", employeeId: "EMP-20260115-0006", amount: 200, status: "active", generatedAt: "2026-04-01T09:00:00Z", expiresAt: "2026-07-01T09:00:00Z" },
  { voucherPackageId: "VCH-20260201-0001", voucherPackageName: "Monthly Yoga Pass", code: "PACSP000010001-O5P6", employeeId: "EMP-20260115-0007", amount: 250, status: "active", generatedAt: "2026-04-05T08:00:00Z", expiresAt: "2026-05-05T08:00:00Z" },
  { voucherPackageId: "VCH-20260201-0002", voucherPackageName: "Individual Therapy Session", code: "PACSP000020001-Q7R8", employeeId: "EMP-20260115-0008", amount: 200, status: "expired", generatedAt: "2026-01-10T10:00:00Z", expiresAt: "2026-04-10T10:00:00Z" },
  { voucherPackageId: "VCH-20260201-0001", voucherPackageName: "Monthly Yoga Pass", code: "PACSP000010001-S9T0", employeeId: "EMP-20260115-0009", amount: 250, status: "redeemed", generatedAt: "2026-03-20T11:00:00Z", redeemedAt: "2026-04-01T09:00:00Z", expiresAt: "2026-04-20T11:00:00Z" },
]

export function createGeneratedVoucher(index: number): GeneratedVoucher {
  const n = index + 1
  const row = GV_ROWS[index]!
  return {
    id: `GV-20260301-${String(n).padStart(4, "0")}`,
    ...row,
    employeeName: requireEmployeeIdentity(row.employeeId).name,
  }
}

const ACC_IDS = [
  "ACC-20260115-0001", "ACC-20260301-0002", "ACC-20260310-0003",
  "ACC-20260310-0004", "ACC-20260310-0005",
]
const TOPUP_METHODS: TopupTransaction["method"][] = ["bank_transfer", "cheque", "bank_transfer", "credit_card", "bank_transfer", "bank_transfer", "cheque", "bank_transfer", "credit_card", "bank_transfer"]
const TOPUP_STATUSES: TopupTransaction["status"][] = ["completed", "completed", "pending", "completed", "completed", "rejected", "completed", "completed", "completed", "pending"]
const TOPUP_AMOUNTS = [5000, 10000, 8000, 20000, 15000, 5000, 12000, 25000, 6000, 10000]

export function createTopupTransaction(index: number): TopupTransaction {
  const n = index + 1
  const accIdx = index % ACC_IDS.length
  return {
    id: `TPU-20260401-${String(n).padStart(4, "0")}`,
    orgId: ["ORG-20260115-0001", "ORG-20260301-0002", "ORG-20260310-0003", "ORG-20260310-0003", "ORG-20260115-0001"][accIdx]!,
    branchId: ["BR-20260115-0001", "BR-20260301-0001", "BR-20260310-0001", "BR-20260310-0002", "BR-20260115-0002"][accIdx]!,
    accountId: ACC_IDS[accIdx]!,
    amount: TOPUP_AMOUNTS[index]!,
    method: TOPUP_METHODS[index]!,
    paidDate: `2026-0${(index % 4) + 1}-${String(15 - (index % 10)).padStart(2, "0")}T00:00:00Z`,
    status: TOPUP_STATUSES[index]!,
    remarks: index % 4 === 2 ? "Pending bank confirmation" : index % 4 === 5 ? "Rejected — incorrect reference number" : undefined,
    referenceNo: `REF-${10000 + index * 337}`,
    createdAt: `2026-0${(index % 4) + 1}-${String(14 - (index % 10)).padStart(2, "0")}T09:00:00Z`,
  }
}
