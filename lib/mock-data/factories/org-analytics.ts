import { subDays, subMonths, format, eachDayOfInterval, eachMonthOfInterval, startOfMonth, endOfMonth } from "date-fns"

// ─── Claim timeseries ─────────────────────────────────────────────────────────

export interface ClaimsDataPoint {
  date: string
  count: number
  amount: number
  confirmedCount: number
  pendingCount: number
  uniqueClaimants: number
}

// ─── Benefit breakdown ────────────────────────────────────────────────────────

export interface BenefitCategoryBreakdown {
  category: string
  color: string
  count: number
  amount: number
}

// ─── Providers ────────────────────────────────────────────────────────────────

export interface TopProvider {
  rank: number
  name: string
  category: string
  visits: number
  amount: number
}

// ─── Branch Account ───────────────────────────────────────────────────────────

export interface BranchAccount {
  branchId: string
  branchName: string
  branchType: "hq" | "branch"
  accountName: string
  accountId: string
  cashBalance: number
  creditBalance: number
  creditLimit: number
  availableBalance: number
  reservedBalance: number
  runwayDays: number
}

// ─── Coverage ─────────────────────────────────────────────────────────────────

export interface OrgCoverageFunnel {
  totalHeadcount: number
  coveredCount: number
  coveragePct: number
  employeeCovered: number
  dependentCovered: number
  claimantCount: number
  claimantPct: number
  employeeClaimants: number
  dependentClaimants: number
  confirmedCount: number
  confirmedPct: number
  reimbursementCount: number
  unassigned: number
}

// ─── Benefit group usage ──────────────────────────────────────────────────────

export interface BenefitGroupUsage {
  groupName: string
  color: string
  allocatedAmount: number
  usedAmount: number
  utilisationPct: number
  claimsCount: number
  beneficiaryCount: number
}

// ─── Policy utilisation ───────────────────────────────────────────────────────

export interface PolicyUtilisation {
  policyId: string
  policyName: string
  utilisationPct: number
  claimsCount: number
  amountSpent: number
}

// ─── Employee group utilisation ───────────────────────────────────────────────

export interface EmployeeGroupUtilisation {
  groupId: string
  groupName: string
  employeeCount: number
  claimsCount: number
  amountSpent: number
  utilisationPct: number
}

// ─── Voucher counts ───────────────────────────────────────────────────────────

export interface VoucherCounts {
  activeCount: number
  redeemedCount: number
  expiringSoon: number
  totalIssued: number
}

// ─── Activity feed ────────────────────────────────────────────────────────────

export type ActivityEventType =
  | "claim_confirmed"
  | "claim_flagged"
  | "claim_pending"
  | "voucher_redeemed"
  | "voucher_expired"
  | "account_topup"
  | "admin_invite"

export interface ActivityFeedItem {
  id: string
  eventType: ActivityEventType
  title: string
  referenceId: string
  actor: string
  timestamp: string
  amount?: number
  status?: string
}

// ─── Colors ───────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  "Mental Health":    "oklch(0.46 0.215 277)",
  "Gym & Fitness":    "oklch(0.57 0.18 258)",
  "Spa & Bodywork":   "oklch(0.62 0.14 235)",
  "Nutrition & Diet": "oklch(0.65 0.13 210)",
  "Optical":          "oklch(0.60 0.15 195)",
  "Group Fitness":    "oklch(0.68 0.10 180)",
  "Dental":           "oklch(0.72 0.08 175)",
}

// ─── Seeded pseudo-random ─────────────────────────────────────────────────────

function seededRand(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// ─── Factories ────────────────────────────────────────────────────────────────

export function createClaimsTimeSeries(orgId: string): ClaimsDataPoint[] {
  void orgId
  const today = new Date(2026, 4, 29)
  const start = subDays(today, 179)

  return eachDayOfInterval({ start, end: today }).map((day, i) => {
    const r = seededRand(i + 42)
    const isWeekend = day.getDay() === 0 || day.getDay() === 6
    const base = isWeekend ? 1 : 4
    const count = Math.max(0, Math.round(base + r * 6))
    const amount = count * Math.round(150 + seededRand(i + 99) * 350)
    const confirmedCount = Math.round(count * (0.5 + seededRand(i + 200) * 0.4))
    const pendingCount = count - confirmedCount
    const uniqueClaimants = Math.min(count, Math.max(1, Math.round(seededRand(i + 300) * 5)))
    return { date: format(day, "yyyy-MM-dd"), count, amount, confirmedCount, pendingCount, uniqueClaimants }
  })
}

export function createBenefitBreakdown(orgId: string): BenefitCategoryBreakdown[] {
  void orgId
  return [
    { category: "Gym & Fitness",    color: CATEGORY_COLORS["Gym & Fitness"],    count: 148, amount: 22400 },
    { category: "Mental Health",    color: CATEGORY_COLORS["Mental Health"],    count: 97,  amount: 31200 },
    { category: "Nutrition & Diet", color: CATEGORY_COLORS["Nutrition & Diet"], count: 72,  amount: 14800 },
    { category: "Spa & Bodywork",   color: CATEGORY_COLORS["Spa & Bodywork"],   count: 64,  amount: 19600 },
    { category: "Optical",          color: CATEGORY_COLORS["Optical"],          count: 51,  amount: 12300 },
    { category: "Group Fitness",    color: CATEGORY_COLORS["Group Fitness"],    count: 43,  amount: 6900  },
    { category: "Dental",           color: CATEGORY_COLORS["Dental"],           count: 38,  amount: 9500  },
  ]
}

export function createTopProviders(orgId: string): TopProvider[] {
  void orgId
  return [
    { rank: 1,  name: "Celebrity Fitness KLCC",   category: "Gym & Fitness",    visits: 84, amount: 15120 },
    { rank: 2,  name: "Mind & Soul Clinic",        category: "Mental Health",    visits: 61, amount: 19520 },
    { rank: 3,  name: "Fitness First Subang",      category: "Gym & Fitness",    visits: 58, amount: 10440 },
    { rank: 4,  name: "Ritual Yoga Studio",        category: "Group Fitness",    visits: 43, amount: 6890  },
    { rank: 5,  name: "NutriCare Clinic",          category: "Nutrition & Diet", visits: 40, amount: 9200  },
    { rank: 6,  name: "Hammam Spa & Wellness",     category: "Spa & Bodywork",   visits: 35, amount: 12250 },
    { rank: 7,  name: "Barry's Bootcamp",          category: "Group Fitness",    visits: 31, amount: 4960  },
    { rank: 8,  name: "Calm Studio KL",            category: "Mental Health",    visits: 28, amount: 5040  },
    { rank: 9,  name: "Specsavers Subang",         category: "Optical",          visits: 24, amount: 7680  },
    { rank: 10, name: "SmileCare Dental",          category: "Dental",           visits: 21, amount: 5250  },
  ]
}

export function createBranchAccounts(orgId: string): BranchAccount[] {
  void orgId
  return [
    {
      branchId: "br_1",
      branchName: "ACME HQ (Kuala Lumpur)",
      branchType: "hq",
      accountName: "KL HQ Account",
      accountId: "ACC-20260115-0001",
      cashBalance: 45000,
      creditBalance: 10000,
      creditLimit: 15000,
      availableBalance: 30000,
      reservedBalance: 15000,
      runwayDays: 42,
    },
    {
      branchId: "br_2",
      branchName: "ACME Subang Jaya",
      branchType: "branch",
      accountName: "Subang Shared Pool",
      accountId: "ACC-20260115-0002",
      cashBalance: 12500,
      creditBalance: 5000,
      creditLimit: 10000,
      availableBalance: 8500,
      reservedBalance: 4000,
      runwayDays: 28,
    },
  ]
}

export function createOrgCoverageFunnel(orgId: string): OrgCoverageFunnel {
  void orgId
  return {
    totalHeadcount: 450,
    coveredCount: 412,
    coveragePct: 92,
    employeeCovered: 320,
    dependentCovered: 92,
    claimantCount: 237,
    claimantPct: 58,
    employeeClaimants: 193,
    dependentClaimants: 44,
    confirmedCount: 384,
    confirmedPct: 82,
    reimbursementCount: 61,
    unassigned: 28,
  }
}

export function createBenefitGroupUsage(orgId: string): BenefitGroupUsage[] {
  void orgId
  return [
    { groupName: "Mental Health",    color: CATEGORY_COLORS["Mental Health"],    allocatedAmount: 42000, usedAmount: 31200, utilisationPct: 74, claimsCount: 97,  beneficiaryCount: 84  },
    { groupName: "Gym & Fitness",    color: CATEGORY_COLORS["Gym & Fitness"],    allocatedAmount: 28000, usedAmount: 22400, utilisationPct: 80, claimsCount: 148, beneficiaryCount: 112 },
    { groupName: "Spa & Bodywork",   color: CATEGORY_COLORS["Spa & Bodywork"],   allocatedAmount: 24000, usedAmount: 19600, utilisationPct: 82, claimsCount: 64,  beneficiaryCount: 52  },
    { groupName: "Nutrition & Diet", color: CATEGORY_COLORS["Nutrition & Diet"], allocatedAmount: 22000, usedAmount: 14800, utilisationPct: 67, claimsCount: 72,  beneficiaryCount: 60  },
    { groupName: "Optical",          color: CATEGORY_COLORS["Optical"],          allocatedAmount: 18000, usedAmount: 12300, utilisationPct: 68, claimsCount: 51,  beneficiaryCount: 48  },
    { groupName: "Dental",           color: CATEGORY_COLORS["Dental"],           allocatedAmount: 14000, usedAmount: 9500,  utilisationPct: 68, claimsCount: 38,  beneficiaryCount: 36  },
    { groupName: "Group Fitness",    color: CATEGORY_COLORS["Group Fitness"],    allocatedAmount: 10000, usedAmount: 6900,  utilisationPct: 69, claimsCount: 43,  beneficiaryCount: 38  },
  ]
}

export function createPolicyUtilisation(orgId: string): PolicyUtilisation[] {
  void orgId
  return [
    { policyId: "POL-20260115-0001", policyName: "Acme Employee Wellness Policy FY2026",   utilisationPct: 72, claimsCount: 184, amountSpent: 38400 },
    { policyId: "POL-20260115-0002", policyName: "Acme Leadership Benefits Policy FY2026",  utilisationPct: 45, claimsCount: 61,  amountSpent: 19800 },
    { policyId: "POL-20260115-0003", policyName: "Global Tech Core Benefits Policy FY2026", utilisationPct: 31, claimsCount: 28,  amountSpent: 8700  },
    { policyId: "POL-20260115-0004", policyName: "Basic Health Support",                    utilisationPct: 18, claimsCount: 14,  amountSpent: 3200  },
  ]
}

export function createEmployeeGroupUtilisation(orgId: string): EmployeeGroupUtilisation[] {
  void orgId
  return [
    { groupId: "TC-001", groupName: "Executive",       employeeCount: 18,  claimsCount: 54,  amountSpent: 18200, utilisationPct: 84 },
    { groupId: "TC-002", groupName: "Senior Manager",  employeeCount: 42,  claimsCount: 98,  amountSpent: 22400, utilisationPct: 76 },
    { groupId: "TC-003", groupName: "Manager",         employeeCount: 86,  claimsCount: 141, amountSpent: 28900, utilisationPct: 68 },
    { groupId: "TC-004", groupName: "Associate",       employeeCount: 174, claimsCount: 187, amountSpent: 31200, utilisationPct: 52 },
    { groupId: "TC-005", groupName: "Intern / Contract", employeeCount: 92, claimsCount: 47, amountSpent: 6900,  utilisationPct: 31 },
  ]
}

export function createVoucherCounts(orgId: string): VoucherCounts {
  void orgId
  return {
    activeCount: 68,
    redeemedCount: 41,
    expiringSoon: 9,
    totalIssued: 118,
  }
}

export function createRecentActivity(orgId: string): ActivityFeedItem[] {
  void orgId
  return [
    {
      id: "act-001",
      eventType: "claim_confirmed",
      title: "Claim Confirmed",
      referenceId: "CLM-2026-0302",
      actor: "System",
      timestamp: "2026-05-29T09:14:00Z",
      amount: 380,
      status: "confirmed",
    },
    {
      id: "act-002",
      eventType: "claim_flagged",
      title: "Claim Flagged",
      referenceId: "CLM-2026-0298",
      actor: "System",
      timestamp: "2026-05-29T08:51:00Z",
      amount: 1200,
      status: "flagged",
    },
    {
      id: "act-003",
      eventType: "voucher_redeemed",
      title: "Voucher Redeemed",
      referenceId: "VCH-2026-0341",
      actor: "Jenny Wilson",
      timestamp: "2026-05-28T17:30:00Z",
      amount: 480,
      status: "confirmed",
    },
    {
      id: "act-004",
      eventType: "claim_pending",
      title: "Claim Submitted",
      referenceId: "CLM-2026-0295",
      actor: "Ahmad Faizal",
      timestamp: "2026-05-28T14:22:00Z",
      amount: 250,
      status: "pending_review",
    },
    {
      id: "act-005",
      eventType: "account_topup",
      title: "Account Top-Up",
      referenceId: "TPU-20260528-0001",
      actor: "Priya Menon",
      timestamp: "2026-05-28T11:00:00Z",
      amount: 15000,
      status: "completed",
    },
    {
      id: "act-006",
      eventType: "voucher_redeemed",
      title: "Voucher Redeemed",
      referenceId: "VCH-2026-0318",
      actor: "Jenny Wilson",
      timestamp: "2026-05-27T16:10:00Z",
      amount: 650,
      status: "pending_review",
    },
    {
      id: "act-007",
      eventType: "admin_invite",
      title: "Admin Invite Sent",
      referenceId: "khairul.a@acme.com",
      actor: "Priya Menon",
      timestamp: "2026-05-14T09:00:00Z",
      status: "pending",
    },
    {
      id: "act-008",
      eventType: "claim_confirmed",
      title: "Claim Confirmed",
      referenceId: "CLM-2026-0271",
      actor: "System",
      timestamp: "2026-05-27T10:45:00Z",
      amount: 145,
      status: "confirmed",
    },
  ]
}

// ─── Bucket daily timeseries into monthly aggregates ─────────────────────────

export function bucketByYear(series: ClaimsDataPoint[], year: string): ClaimsDataPoint[] {
  const y = parseInt(year)
  const months = eachMonthOfInterval({
    start: new Date(y, 0, 1),
    end: new Date(y, 11, 31),
  })
  return months.map((m) => {
    const start = startOfMonth(m)
    const end = endOfMonth(m)
    const inRange = series.filter((d) => {
      const date = new Date(d.date)
      return date >= start && date <= end
    })
    return {
      date: format(m, "MMM yyyy"),
      count: inRange.reduce((s, d) => s + d.count, 0),
      amount: inRange.reduce((s, d) => s + d.amount, 0),
      confirmedCount: inRange.reduce((s, d) => s + d.confirmedCount, 0),
      pendingCount: inRange.reduce((s, d) => s + d.pendingCount, 0),
      uniqueClaimants: inRange.reduce((s, d) => s + d.uniqueClaimants, 0),
    }
  })
}

export function bucketByMonth(series: ClaimsDataPoint[]): ClaimsDataPoint[] {
  const today = new Date(2026, 4, 29)
  const months = eachMonthOfInterval({ start: subMonths(today, 5), end: today })

  return months.map((m) => {
    const start = startOfMonth(m)
    const end = endOfMonth(m)
    const inRange = series.filter((d) => {
      const date = new Date(d.date)
      return date >= start && date <= end
    })
    return {
      date: format(m, "MMM yyyy"),
      count: inRange.reduce((s, d) => s + d.count, 0),
      amount: inRange.reduce((s, d) => s + d.amount, 0),
      confirmedCount: inRange.reduce((s, d) => s + d.confirmedCount, 0),
      pendingCount: inRange.reduce((s, d) => s + d.pendingCount, 0),
      uniqueClaimants: inRange.reduce((s, d) => s + d.uniqueClaimants, 0),
    }
  })
}
