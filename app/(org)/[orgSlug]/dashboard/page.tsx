"use client"

import { useMemo, useState } from "react"
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
import { ManualTopUpModal } from "@/components/host/organizations/manual-topup-modal"
import {
  MOCK_EMPLOYEE_UTILISATION,
  MOCK_CLAIMS_TIMESERIES,
  MOCK_BENEFIT_GROUP_USAGE,
  MOCK_TOP_PROVIDERS,
  MOCK_BRANCH_ACCOUNTS,
  MOCK_POLICY_UTILISATION,
  MOCK_COVERAGE_FUNNEL,
  MOCK_EMPLOYEE_TIER_UTILISATION,
  MOCK_VOUCHER_COUNTS,
} from "@/lib/mock-data"
import { getOrganizationBySlug } from "@/lib/org-portal"
import { OrgPortalNotFound } from "@/components/org/org-portal-not-found"
import { WidgetErrorBoundary } from "@/components/shared/widget-error-boundary"

export default function OrgDashboardPage() {
  const params = useParams()
  const orgSlug = params.orgSlug as string
  const [selectedBranch, setSelectedBranch] = useState<string>("all")
  const [topUpAccountId, setTopUpAccountId] = useState<string | null>(null)

  const topUpAccount = useMemo(
    () =>
      MOCK_BRANCH_ACCOUNTS.find(
        (account) => account.accountId === topUpAccountId
      ) ?? null,
    [topUpAccountId]
  )

  const org = getOrganizationBySlug(orgSlug)

  if (!org) return <OrgPortalNotFound />

  const orgUtilRows = MOCK_EMPLOYEE_UTILISATION.filter((r) =>
    r.branch.includes("ACME")
  )
  const filteredUtilRows =
    selectedBranch === "all"
      ? orgUtilRows
      : orgUtilRows.filter((r) => {
          const account = MOCK_BRANCH_ACCOUNTS.find(
            (a) => a.branchId === selectedBranch
          )
          return account
            ? r.branch
                .toLowerCase()
                .includes(account.branchName.split(" ")[1]?.toLowerCase() ?? "")
            : true
        })

  const allFilteredClaims = filteredUtilRows.flatMap((r) => r.claims)
  const claimsThisMonth = allFilteredClaims.length
  const confirmedClaims = allFilteredClaims.filter(
    (c) => c.status === "confirmed"
  )
  const claimsAmount = allFilteredClaims.reduce(
    (sum, claim) => sum + claim.amount,
    0
  )
  const preAuthorisedClaimsCount = allFilteredClaims.filter(
    (claim) => claim.status === "pre-auth"
  ).length
  const confirmedClaimsCount = confirmedClaims.length

  return (
    <div className="space-y-8 pb-8">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{org.name}</h1>
          <p className="mt-0.5 text-label text-muted-foreground">
            Organisation Dashboard
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="h-8 w-full text-body sm:w-48">
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
        claimsAmount={claimsAmount}
        confirmedClaimsCount={confirmedClaimsCount}
        preAuthorisedClaimsCount={preAuthorisedClaimsCount}
        selectedBranch={selectedBranch}
        onTopUp={(account) => setTopUpAccountId(account.accountId)}
      />

      {/* ── Claims Trend ─────────────────────────────────────────────────────── */}
      <WidgetErrorBoundary title="Claims Trend Unavailable">
        <DashboardClaimsChart
          data={MOCK_CLAIMS_TIMESERIES}
          selectedBranch={selectedBranch}
          accounts={MOCK_BRANCH_ACCOUNTS}
        />
      </WidgetErrorBoundary>

      {/* ── Benefit Utilisation By Category ──────────────────────────────────── */}
      <WidgetErrorBoundary title="Benefit Utilisation Unavailable">
        <DashboardBenefitChart
          data={MOCK_BENEFIT_GROUP_USAGE}
          selectedBranch={selectedBranch}
        />
      </WidgetErrorBoundary>

      {/* ── Policy Performance + Top Wellness Centres ────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <DashboardTopPolicies
          policies={MOCK_POLICY_UTILISATION}
          employeeTiers={MOCK_EMPLOYEE_TIER_UTILISATION}
          selectedBranch={selectedBranch}
          mode="policy"
        />
        <DashboardTopPolicies
          policies={MOCK_POLICY_UTILISATION}
          employeeTiers={MOCK_EMPLOYEE_TIER_UTILISATION}
          selectedBranch={selectedBranch}
          mode="tier"
        />
        <DashboardTopCentres
          providers={MOCK_TOP_PROVIDERS}
          selectedBranch={selectedBranch}
        />
      </div>

      <ManualTopUpModal
        isOpen={topUpAccount !== null}
        onClose={() => setTopUpAccountId(null)}
        orgName={org.name}
        branchName={topUpAccount?.branchName ?? "Organisation Account"}
        accountId={topUpAccount?.accountId ?? ""}
      />
    </div>
  )
}
