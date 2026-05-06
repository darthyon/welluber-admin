import type { ClaimStatus, TransactionType } from "@/types/claims"

export interface GlobalClaimRow {
  id: string
  voucherCode: string
  voucherName?: string
  transactionType: TransactionType
  service: string
  provider: string
  location: string
  date: string
  amount: number
  status: ClaimStatus
  employeeId: string
  employeeName: string
  empCode: string
  organisation: string
}

const ROWS: Omit<GlobalClaimRow, "id">[] = [
  { voucherCode: "VCH-2024-0081", voucherName: "Wellness Allocation Voucher", transactionType: "redemption", service: "Yoga Class", provider: "Zenith Yoga Studio", location: "Kuala Lumpur", date: "09 Apr 2026", amount: 120, status: "confirmed", employeeId: "EMP-20260115-0001", employeeName: "Ahmad Faizal", empCode: "EMP-001", organisation: "Acme Corporation Sdn Bhd" },
  { voucherCode: "VCH-2024-0114", voucherName: "Wellness Allocation Voucher", transactionType: "redemption", service: "Individual Therapy", provider: "AgileMind Therapy Centre", location: "Petaling Jaya", date: "08 Apr 2026", amount: 200, status: "confirmed", employeeId: "EMP-20260115-0002", employeeName: "Sarah Lim", empCode: "EMP-002", organisation: "Acme Corporation Sdn Bhd" },
  { voucherCode: "VCH-2024-0198", voucherName: "Lifestyle Pocket Voucher", transactionType: "redemption", service: "Swedish Massage", provider: "Serenity Spa & Aesthetics", location: "Kuala Lumpur", date: "07 Apr 2026", amount: 180, status: "pre-auth", employeeId: "EMP-20260115-0003", employeeName: "Michael Tan", empCode: "EMP-003", organisation: "Acme Corporation Sdn Bhd" },
  { voucherCode: "VCH-2024-0211", voucherName: "Wellness Allocation Voucher", transactionType: "reimbursement", service: "Physiotherapy", provider: "CoreFit Rehabilitation", location: "Petaling Jaya", date: "06 Apr 2026", amount: 150, status: "confirmed", employeeId: "EMP-20260115-0004", employeeName: "Nurul Huda", empCode: "EMP-004", organisation: "Acme Corporation Sdn Bhd" },
  { voucherCode: "VCH-2024-0225", voucherName: "Lifestyle Pocket Voucher", transactionType: "redemption", service: "Gym Session", provider: "PrimeFit Gym & Studio", location: "Kuala Lumpur", date: "05 Apr 2026", amount: 80, status: "confirmed", employeeId: "EMP-20260115-0005", employeeName: "Kevin Tan", empCode: "EMP-005", organisation: "Acme Corporation Sdn Bhd" },
  { voucherCode: "VCH-2024-0240", voucherName: "Wellness Allocation Voucher", transactionType: "redemption", service: "Dietary Consultation", provider: "Luminary Nutrition Hub", location: "Shah Alam", date: "04 Apr 2026", amount: 120, status: "cancelled", employeeId: "EMP-20260115-0006", employeeName: "Priya Raj", empCode: "EMP-006", organisation: "Acme Corporation Sdn Bhd" },
  { voucherCode: "VCH-2024-0255", voucherName: "Mental Wellness Voucher", transactionType: "redemption", service: "Meditation Class", provider: "Nova Mindfulness Studio", location: "Mont Kiara", date: "03 Apr 2026", amount: 95, status: "confirmed", employeeId: "EMP-20260115-0007", employeeName: "Robert Fox", empCode: "EMP-007", organisation: "Acme Corporation Sdn Bhd" },
  { voucherCode: "VCH-2024-0268", voucherName: "Wellness Allocation Voucher", transactionType: "reimbursement", service: "Health Screening", provider: "Apex Occupational Health", location: "Bangsar", date: "02 Apr 2026", amount: 200, status: "pre-auth", employeeId: "EMP-20260115-0008", employeeName: "Jenny Wilson", empCode: "EMP-008", organisation: "Acme Corporation Sdn Bhd" },
  { voucherCode: "VCH-2024-0280", voucherName: "Lifestyle Pocket Voucher", transactionType: "redemption", service: "Yoga Class", provider: "Zenith Yoga Studio", location: "Mont Kiara", date: "01 Apr 2026", amount: 120, status: "confirmed", employeeId: "EMP-20260115-0009", employeeName: "Ahmad Razif", empCode: "EMP-009", organisation: "Global Tech Solutions" },
  { voucherCode: "VCH-2024-0295", voucherName: "Mental Wellness Voucher", transactionType: "redemption", service: "Therapy Session", provider: "AgileMind Therapy Centre", location: "Petaling Jaya", date: "30 Mar 2026", amount: 200, status: "confirmed", employeeId: "EMP-20260115-0010", employeeName: "Jenny Wilson", empCode: "EMP-010", organisation: "Global Tech Solutions" },
]

export function createClaim(index: number): GlobalClaimRow {
  const n = index + 1
  return { id: `CLM-2026-${String(n).padStart(4, "0")}`, ...ROWS[index % ROWS.length]! }
}
