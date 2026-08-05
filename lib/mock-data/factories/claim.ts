import type { ClaimStatus, TransactionType } from "@/types/claims"
import { requireEmployeeIdentity } from "../employee-identity"

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

/** Claim facts only — who the employee is comes from `employee-identity.ts`. */
type ClaimRow = Omit<
  GlobalClaimRow,
  "id" | "employeeName" | "empCode" | "organisation"
>

const ROWS: ClaimRow[] = [
  { voucherCode: "VCH-2024-0081", voucherName: "Wellness Allocation Voucher", transactionType: "redemption", service: "Yoga Class", provider: "Zenith Yoga Studio", location: "Kuala Lumpur", date: "09 Apr 2026", amount: 120, status: "confirmed", employeeId: "EMP-20260115-0001" },
  { voucherCode: "VCH-2024-0114", voucherName: "Wellness Allocation Voucher", transactionType: "redemption", service: "Individual Therapy", provider: "AgileMind Therapy Centre", location: "Petaling Jaya", date: "08 Apr 2026", amount: 200, status: "confirmed", employeeId: "EMP-20260115-0002" },
  { voucherCode: "VCH-2024-0198", voucherName: "Lifestyle Pocket Voucher", transactionType: "redemption", service: "Swedish Massage", provider: "Serenity Spa & Aesthetics", location: "Kuala Lumpur", date: "07 Apr 2026", amount: 180, status: "pre-auth", employeeId: "EMP-20260115-0003" },
  { voucherCode: "VCH-2024-0211", voucherName: "Wellness Allocation Voucher", transactionType: "reimbursement", service: "Physiotherapy", provider: "CoreFit Rehabilitation", location: "Petaling Jaya", date: "06 Apr 2026", amount: 150, status: "confirmed", employeeId: "EMP-20260115-0004" },
  { voucherCode: "VCH-2024-0225", voucherName: "Lifestyle Pocket Voucher", transactionType: "redemption", service: "Gym Session", provider: "PrimeFit Gym & Studio", location: "Kuala Lumpur", date: "05 Apr 2026", amount: 80, status: "confirmed", employeeId: "EMP-20260115-0005" },
  { voucherCode: "VCH-2024-0240", voucherName: "Wellness Allocation Voucher", transactionType: "redemption", service: "Dietary Consultation", provider: "Luminary Nutrition Hub", location: "Shah Alam", date: "04 Apr 2026", amount: 120, status: "cancelled", employeeId: "EMP-20260115-0006" },
  { voucherCode: "VCH-2024-0255", voucherName: "Mental Wellness Voucher", transactionType: "redemption", service: "Meditation Class", provider: "Nova Mindfulness Studio", location: "Mont Kiara", date: "03 Apr 2026", amount: 95, status: "confirmed", employeeId: "EMP-20260115-0007" },
  { voucherCode: "VCH-2024-0268", voucherName: "Wellness Allocation Voucher", transactionType: "reimbursement", service: "Health Screening", provider: "Apex Occupational Health", location: "Bangsar", date: "02 Apr 2026", amount: 200, status: "pre-auth", employeeId: "EMP-20260115-0008" },
  { voucherCode: "VCH-2024-0280", voucherName: "Lifestyle Pocket Voucher", transactionType: "redemption", service: "Yoga Class", provider: "Zenith Yoga Studio", location: "Mont Kiara", date: "01 Apr 2026", amount: 120, status: "confirmed", employeeId: "EMP-20260115-0009" },
  { voucherCode: "VCH-2024-0295", voucherName: "Mental Wellness Voucher", transactionType: "redemption", service: "Therapy Session", provider: "AgileMind Therapy Centre", location: "Petaling Jaya", date: "30 Mar 2026", amount: 200, status: "confirmed", employeeId: "EMP-20260115-0010" },
]

export function createClaim(index: number): GlobalClaimRow {
  const n = index + 1
  const row = ROWS[index % ROWS.length]!
  const identity = requireEmployeeIdentity(row.employeeId)
  return {
    id: `CLM-2026-${String(n).padStart(4, "0")}`,
    ...row,
    employeeName: identity.name,
    empCode: identity.empCode,
    organisation: identity.organization ?? identity.orgId,
  }
}
