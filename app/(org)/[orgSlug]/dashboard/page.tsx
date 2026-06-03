"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DashboardKpiRow } from "@/components/org/dashboard-kpi-row"
import { DashboardClaimsChart } from "@/components/org/dashboard-claims-chart"
import { DashboardBenefitChart } from "@/components/org/dashboard-benefit-chart"
import { DashboardTopPolicies } from "@/components/org/dashboard-top-policies"
import { DashboardTopCentres } from "@/components/org/dashboard-top-centres"
import { DashboardActionCentre } from "@/components/org/dashboard-action-centre"
import { type OrgTask } from "@/components/org/org-task-centre"
import {
  MOCK_ORGS,
  MOCK_EMPLOYEE_UTILISATION,
  MOCK_CLAIMS_TIMESERIES,
  MOCK_BENEFIT_GROUP_USAGE,
  MOCK_TOP_PROVIDERS,
  MOCK_BRANCH_ACCOUNTS,
  MOCK_POLICY_UTILISATION,
  MOCK_COVERAGE_FUNNEL,
  MOCK_EMPLOYEE_GROUP_UTILISATION,
  MOCK_VOUCHER_COUNTS,
} from "@/lib/mock-data"
import { routes } from "@/lib/navigation"

const ORG_BY_SLUG: Record<string, string> = {
  "acme-corporation": "ORG-20260115-0001",
}

function deriveOrgTasks(
  org: (typeof MOCK_ORGS)[number],
  orgSlug: string,
  claimsData: typeof MOCK_EMPLOYEE_UTILISATION
): OrgTask[] {
  const tasks: OrgTask[] = []
  const allClaims = claimsData.flatMap((r) => r.claims)

  const flagged = allClaims.filter((c) => c.status === "flagged")
  if (flagged.length > 0) {
    tasks.push({
      id: "claims-flagged",
      category: "claims",
      priority: "critical",
      title: "Flagged Claims",
      description: `${flagged.length} claim${flagged.length > 1 ? "s" : ""} flagged for unusual pattern. Requires investigation.`,
      count: flagged.length,
      cta: { label: "Investigate", href: routes.org.claims(orgSlug) },
    })
  }

  const preAuth = allClaims.filter((c) => c.status === "pre-auth")
  if (preAuth.length > 0) {
    tasks.push({
      id: "claims-stale-preauth",
      category: "claims",
      priority: "high",
      title: "Pre-Authorised Claims",
      description: `${preAuth.length} claim${preAuth.length > 1 ? "s" : ""} awaiting confirmation.`,
      count: preAuth.length,
      cta: { label: "Confirm", href: routes.org.claims(orgSlug) },
    })
  }

  tasks.push({
    id: "admin-pending-invite",
    category: "admin",
    priority: "medium",
    title: "Admin Invite Pending",
    description: "Khairul Anwar was invited 15 days ago and hasn't activated their account yet.",
    count: 1,
    cta: { label: "Manage Admins", href: routes.org.settings(orgSlug) },
  })

  const budgetPct =
    org.accountLimit > 0
      ? Math.round((org.totalAccountBalance / org.accountLimit) * 100)
      : 100
  if (org.totalAccountBalance <= 0) {
    tasks.push({
      id: "budget-depleted",
      category: "budget",
      priority: "critical",
      title: "Low Account Warning",
      description: "Account balance is depleted. New claims will be blocked until topped up.",
    })
  } else if (budgetPct < 20) {
    tasks.push({
      id: "budget-low",
      category: "budget",
      priority: "high",
      title: "Low Account Warning",
      description: `Only ${budgetPct}% remains. Request a top-up to avoid disruption.`,
    })
  } else {
    tasks.push({
      id: "budget-ok",
      category: "budget",
      priority: "low",
      title: "Low Account Warning",
      description: "Account balance is healthy.",
    })
  }

  return tasks
}

export default function OrgDashboardPage() {
  const params = useParams()
  const orgSlug = params.orgSlug as string

  const orgId = ORG_BY_SLUG[orgSlug]
  const org = MOCK_ORGS.find((o) => o.id === orgId) ?? MOCK_ORGS[0]!

  const [selectedBranch, setSelectedBranch] = useState<string>("all")

  const orgUtilRows = MOCK_EMPLOYEE_UTILISATION.filter((r) => r.branch.includes("ACME"))
  const filteredUtilRows =
    selectedBranch === "all"
      ? orgUtilRows
      : orgUtilRows.filter((r) => {
          const account = MOCK_BRANCH_ACCOUNTS.find((a) => a.branchId === selectedBranch)
          return account
            ? r.branch.toLowerCase().includes(account.branchName.split(" ")[1]?.toLowerCase() ?? "")
            : true
        })

  const allFilteredClaims = filteredUtilRows.flatMap((r) => r.claims)
  const claimsThisMonth = allFilteredClaims.length
  const confirmedClaims = allFilteredClaims.filter((c) => c.status === "confirmed")
  const pendingClaims = allFilteredClaims.filter(
    (c) => c.status === "pending_review" || c.status === "pre-auth"
  )
  const confirmedClaimsCount = confirmedClaims.length
  const pendingClaimsCount = pendingClaims.length

  const tasks = deriveOrgTasks(org, orgSlug, orgUtilRows)

  return (
    <div className="space-y-8 pb-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{org.name}</h1>
          <p className="text-label text-muted-foreground mt-0.5">Organisation Dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-full sm:w-48 h-8 text-body">
              <SelectValue placeholder="All Branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {MOCK_BRANCH_ACCOUNTS.map((a) => (
                <SelectItem key={a.branchId} value={a.branchId}>
                  {a.branchName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── KPI Row ─────────────────────────────────────────────────────────── */}
      <DashboardKpiRow
        accounts={MOCK_BRANCH_ACCOUNTS}
        funnel={MOCK_COVERAGE_FUNNEL}
        voucherCounts={MOCK_VOUCHER_COUNTS}
        claimsThisMonth={claimsThisMonth}
        confirmedClaimsCount={confirmedClaimsCount}
        pendingClaimsCount={pendingClaimsCount}
        selectedBranch={selectedBranch}
      />

      {/* ── Claims Trend ─────────────────────────────────────────────────────── */}
      <DashboardClaimsChart
        data={MOCK_CLAIMS_TIMESERIES}
        selectedBranch={selectedBranch}
        accounts={MOCK_BRANCH_ACCOUNTS}
      />

      {/* ── Benefit Utilisation By Category ──────────────────────────────────── */}
      <DashboardBenefitChart
        data={MOCK_BENEFIT_GROUP_USAGE}
        selectedBranch={selectedBranch}
      />

      {/* ── Policy Performance + Top Wellness Centres ────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardTopPolicies
          policies={MOCK_POLICY_UTILISATION}
          employeeGroups={MOCK_EMPLOYEE_GROUP_UTILISATION}
          selectedBranch={selectedBranch}
        />
        <DashboardTopCentres
          providers={MOCK_TOP_PROVIDERS}
          selectedBranch={selectedBranch}
        />
      </div>

      {/* ── Action Centre ─────────────────────────────────────────────────────── */}
      <DashboardActionCentre tasks={tasks} orgSlug={orgSlug} />

    </div>
  )
}
