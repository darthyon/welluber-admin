import type { ClaimStatus, TransactionType, ClaimSourceType } from "@/types/claims"

export interface GlobalClaimRow {
  id: string
  /** FK → Employee (always the employee who holds the policy) */
  employeeId: string
  /** FK → BenefitAssignment — which pool is consumed */
  benefitAssignmentId: string
  /** FK → BenefitPolicy — denormalized for quick filtering */
  policyId: string
  /** Who received the benefit */
  sourceType: ClaimSourceType
  /** employeeId or dependentId */
  sourceId: string
  /** FK → Account — which org wallet is debited */
  accountId: string
  spId?: string
  spBranchId?: string
  voucherCode: string
  voucherName?: string
  transactionType: TransactionType
  service: string
  provider: string
  location: string
  date: string
  amount: number
  status: ClaimStatus
  // ── display helpers (denormalized) ──
  employeeName: string
  empCode: string
  organisation: string
}

const ROWS: Omit<GlobalClaimRow, "id">[] = [
  { employeeId: "EMP-20260115-0001", benefitAssignmentId: "BA-20260115-0001", policyId: "POL-20260115-0001", sourceType: "employee", sourceId: "EMP-20260115-0001", accountId: "ACC-20260115-0001", voucherCode: "VCH-2024-0081", voucherName: "Wellness Allocation Voucher", transactionType: "redemption", service: "Yoga Class", provider: "Zenith Yoga Studio", location: "Kuala Lumpur", date: "09 Apr 2026", amount: 120, status: "confirmed", employeeName: "Ahmad Faizal", empCode: "EMP-001", organisation: "Acme Corporation Sdn Bhd" },
  { employeeId: "EMP-20260115-0002", benefitAssignmentId: "BA-20260115-0003", policyId: "POL-20260115-0002", sourceType: "employee", sourceId: "EMP-20260115-0002", accountId: "ACC-20260115-0001", voucherCode: "VCH-2024-0114", voucherName: "Wellness Allocation Voucher", transactionType: "redemption", service: "Individual Therapy", provider: "AgileMind Therapy Centre", location: "Petaling Jaya", date: "08 Apr 2026", amount: 200, status: "confirmed", employeeName: "Sarah Lim", empCode: "EMP-002", organisation: "Acme Corporation Sdn Bhd" },
  { employeeId: "EMP-20260115-0003", benefitAssignmentId: "BA-20260115-0004", policyId: "POL-20260115-0001", sourceType: "employee", sourceId: "EMP-20260115-0003", accountId: "ACC-20260115-0001", voucherCode: "VCH-2024-0198", voucherName: "Lifestyle Pocket Voucher", transactionType: "redemption", service: "Swedish Massage", provider: "Serenity Spa & Aesthetics", location: "Kuala Lumpur", date: "07 Apr 2026", amount: 180, status: "pre-auth", employeeName: "Michael Tan", empCode: "EMP-003", organisation: "Acme Corporation Sdn Bhd" },
  { employeeId: "EMP-20260115-0004", benefitAssignmentId: "BA-20260115-0005", policyId: "POL-20260115-0001", sourceType: "employee", sourceId: "EMP-20260115-0004", accountId: "ACC-20260115-0001", voucherCode: "VCH-2024-0211", voucherName: "Wellness Allocation Voucher", transactionType: "reimbursement", service: "Physiotherapy", provider: "CoreFit Rehabilitation", location: "Petaling Jaya", date: "06 Apr 2026", amount: 150, status: "confirmed", employeeName: "Nurul Huda", empCode: "EMP-004", organisation: "Acme Corporation Sdn Bhd" },
  { employeeId: "EMP-20260115-0005", benefitAssignmentId: "BA-20260115-0006", policyId: "POL-20260115-0004", sourceType: "employee", sourceId: "EMP-20260115-0005", accountId: "ACC-20260115-0001", voucherCode: "VCH-2024-0225", voucherName: "Lifestyle Pocket Voucher", transactionType: "redemption", service: "Gym Session", provider: "PrimeFit Gym & Studio", location: "Kuala Lumpur", date: "05 Apr 2026", amount: 80, status: "confirmed", employeeName: "Kevin Tan", empCode: "EMP-005", organisation: "Acme Corporation Sdn Bhd" },
  { employeeId: "EMP-20260115-0006", benefitAssignmentId: "BA-20260115-0007", policyId: "POL-20260115-0001", sourceType: "employee", sourceId: "EMP-20260115-0006", accountId: "ACC-20260115-0001", voucherCode: "VCH-2024-0240", voucherName: "Wellness Allocation Voucher", transactionType: "redemption", service: "Dietary Consultation", provider: "Luminary Nutrition Hub", location: "Shah Alam", date: "04 Apr 2026", amount: 120, status: "cancelled", employeeName: "Priya Raj", empCode: "EMP-006", organisation: "Acme Corporation Sdn Bhd" },
  { employeeId: "EMP-20260115-0007", benefitAssignmentId: "BA-20260115-0008", policyId: "POL-20260115-0001", sourceType: "employee", sourceId: "EMP-20260115-0007", accountId: "ACC-20260115-0001", voucherCode: "VCH-2024-0255", voucherName: "Mental Wellness Voucher", transactionType: "redemption", service: "Meditation Class", provider: "Nova Mindfulness Studio", location: "Mont Kiara", date: "03 Apr 2026", amount: 95, status: "confirmed", employeeName: "Robert Fox", empCode: "EMP-007", organisation: "Acme Corporation Sdn Bhd" },
  { employeeId: "EMP-20260115-0001", benefitAssignmentId: "BA-20260115-0002", policyId: "POL-20260115-0001", sourceType: "dependent", sourceId: "DEP-20260115-0001", accountId: "ACC-20260115-0001", voucherCode: "VCH-2024-0268", voucherName: "Wellness Allocation Voucher", transactionType: "reimbursement", service: "Health Screening", provider: "Apex Occupational Health", location: "Bangsar", date: "02 Apr 2026", amount: 200, status: "pre-auth", employeeName: "Ahmad Faizal", empCode: "EMP-001", organisation: "Acme Corporation Sdn Bhd" },
  { employeeId: "EMP-20260115-0009", benefitAssignmentId: "BA-20260115-0009", policyId: "POL-20260115-0003", sourceType: "employee", sourceId: "EMP-20260115-0009", accountId: "ACC-20260115-0003", voucherCode: "VCH-2024-0280", voucherName: "Lifestyle Pocket Voucher", transactionType: "redemption", service: "Yoga Class", provider: "Zenith Yoga Studio", location: "Mont Kiara", date: "01 Apr 2026", amount: 120, status: "confirmed", employeeName: "Ahmad Razif", empCode: "EMP-009", organisation: "Global Tech Solutions" },
  { employeeId: "EMP-20260115-0010", benefitAssignmentId: "BA-20260115-0009", policyId: "POL-20260115-0003", sourceType: "employee", sourceId: "EMP-20260115-0010", accountId: "ACC-20260115-0003", voucherCode: "VCH-2024-0295", voucherName: "Mental Wellness Voucher", transactionType: "redemption", service: "Therapy Session", provider: "AgileMind Therapy Centre", location: "Petaling Jaya", date: "30 Mar 2026", amount: 200, status: "confirmed", employeeName: "Jenny Wilson", empCode: "EMP-010", organisation: "Global Tech Solutions" },
]

export function createClaim(index: number): GlobalClaimRow {
  const n = index + 1
  return { id: `CLM-2026-${String(n).padStart(4, "0")}`, ...ROWS[index % ROWS.length]! }
}
