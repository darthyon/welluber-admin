"use client"

import { useParams } from "next/navigation"
import { Users, Shield, SealCheck, Wallet } from "@phosphor-icons/react"
import { BentoGrid, BentoCard } from "@/components/shared/bento-grid"
import { Progress } from "@/components/ui/progress"
import { OrgTaskCentre, type OrgTask } from "@/components/org/org-task-centre"
import { MOCK_ORGS, MOCK_EMPLOYEE_UTILISATION } from "@/lib/mock-data"
import { routes } from "@/lib/navigation"

const ORG_BY_SLUG: Record<string, string> = {
  "acme-corporation": "ORG-20260115-0001",
}

// Derive actionable tasks from live org + claims data
function deriveOrgTasks(
  org: (typeof MOCK_ORGS)[number],
  orgSlug: string,
  claimsData: typeof MOCK_EMPLOYEE_UTILISATION
): OrgTask[] {
  const tasks: OrgTask[] = []
  const allClaims = claimsData.flatMap((r) => r.claims)

  // 1. Employees without policy
  const unassigned = org.employeesWithoutPolicy ?? 0
  if (unassigned > 0) {
    tasks.push({
      id: "employees-no-policy",
      category: "employees",
      priority: "high",
      title: "Employees without benefit policy",
      description: `${unassigned} employee${unassigned > 1 ? "s" : ""} enrolled but not assigned to any benefit policy.`,
      count: unassigned,
      cta: { label: "View employees", href: routes.org.employees(orgSlug) },
    })
  }

  // 2. Manual claims pending review
  const pendingReview = allClaims.filter((c) => c.status === "pending_review")
  if (pendingReview.length > 0) {
    tasks.push({
      id: "claims-pending-review",
      category: "claims",
      priority: "high",
      title: "Claims awaiting manual review",
      description: "Reimbursement claims submitted by employees that require your approval before processing.",
      count: pendingReview.length,
      cta: { label: "Review claims", href: routes.org.claims(orgSlug) },
    })
  }

  // 3. Flagged / suspicious claims
  const flagged = allClaims.filter((c) => c.status === "flagged")
  if (flagged.length > 0) {
    tasks.push({
      id: "claims-flagged",
      category: "claims",
      priority: "critical",
      title: "Flagged claims require investigation",
      description: `${flagged.length} claim${flagged.length > 1 ? "s" : ""} flagged for unusual amount or pattern. Review before they are processed.`,
      count: flagged.length,
      cta: { label: "Investigate", href: routes.org.claims(orgSlug) },
    })
  }

  // 4. Stale pre-auth (older than 14 days — simplified: any pre-auth in data)
  const preAuth = allClaims.filter((c) => c.status === "pre-auth")
  if (preAuth.length > 0) {
    tasks.push({
      id: "claims-stale-preauth",
      category: "claims",
      priority: "medium",
      title: "Pre-authorised claims pending confirmation",
      description: `${preAuth.length} claim${preAuth.length > 1 ? "s" : ""} in pre-auth status. Confirm or cancel to keep records accurate.`,
      count: preAuth.length,
      cta: { label: "View claims", href: routes.org.claims(orgSlug) },
    })
  }

  // 5. Budget low (< 20% remaining)
  const budgetPct = org.accountLimit > 0
    ? Math.round((org.totalAccountBalance / org.accountLimit) * 100)
    : 100
  if (org.totalAccountBalance <= 0) {
    tasks.push({
      id: "budget-depleted",
      category: "budget",
      priority: "critical",
      title: "Account balance depleted",
      description: "Your prepaid balance has run out. New claims will be blocked until the account is topped up.",
    })
  } else if (budgetPct < 20) {
    tasks.push({
      id: "budget-low",
      category: "budget",
      priority: "high",
      title: "Budget running low",
      description: `Only ${budgetPct}% of your account limit remains (RM ${org.totalAccountBalance.toLocaleString()}). Request a top-up to avoid claim disruption.`,
    })
  }

  // 6. Pending admin invites (mock: assume 1 pending invite from settings data)
  tasks.push({
    id: "admin-pending-invite",
    category: "admin",
    priority: "low",
    title: "Admin invite not yet accepted",
    description: "Khairul Anwar was invited 15 days ago and hasn't activated their account yet.",
    cta: { label: "Manage admins", href: routes.org.settings(orgSlug) },
  })

  return tasks
}

export default function OrgDashboardPage() {
  const params = useParams()
  const orgSlug = params.orgSlug as string

  const orgId = ORG_BY_SLUG[orgSlug]
  const org = MOCK_ORGS.find((o) => o.id === orgId) ?? MOCK_ORGS[0]!

  // Enrolled employees
  const totalEmployees = org.employeeCount
  const linkedEmployees = Math.round(totalEmployees * 0.78)
  const enrolledPct = Math.round((linkedEmployees / totalEmployees) * 100)

  // Budget
  const budgetUsed = org.accountLimit - org.totalAccountBalance
  const budgetPct = Math.round((budgetUsed / org.accountLimit) * 100)
  const budgetColor =
    budgetPct >= 85 ? "text-destructive" : budgetPct >= 65 ? "text-amber-500" : "text-emerald-500"

  // Claims
  const orgUtilRows = MOCK_EMPLOYEE_UTILISATION.filter((r) => r.branch.includes("ACME"))
  const claimsThisMonth = orgUtilRows.flatMap((r) => r.claims).length
  const confirmedClaims = orgUtilRows
    .flatMap((r) => r.claims)
    .filter((c) => c.status === "confirmed").length

  // Tasks
  const tasks = deriveOrgTasks(org, orgSlug, orgUtilRows)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{org.name}</h1>
        <p className="text-muted-foreground mt-0.5 text-body">
          Organisation overview — {new Date().toLocaleDateString("en-MY", { month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Metrics */}
      <BentoGrid>
        <BentoCard
          title="Enrolled Employees"
          value={`${linkedEmployees.toLocaleString()}`}
          icon={Users}
          span={1}
        >
          <div className="w-full space-y-1.5">
            <div className="flex items-center justify-between text-label font-medium text-subtle">
              <span>{enrolledPct}% enrolled</span>
              <span className="text-faint">{totalEmployees.toLocaleString()} total</span>
            </div>
            <Progress value={enrolledPct} className="h-1.5" />
          </div>
        </BentoCard>

        <BentoCard
          title="Benefit Utilisation Rate"
          value={`${org.utilizationRate}%`}
          icon={Shield}
          trend={{ value: "+4%", label: "vs last month", isPositive: true }}
          span={1}
        />

        <BentoCard
          title="Claims This Month"
          value={claimsThisMonth}
          icon={SealCheck}
          description={`${confirmedClaims} confirmed`}
          span={1}
        />

        <BentoCard
          title="Budget Remaining"
          value={`RM ${org.totalAccountBalance.toLocaleString()}`}
          icon={Wallet}
          span={1}
        >
          <div className="w-full space-y-1.5">
            <div className="flex items-center justify-between text-label font-medium text-subtle">
              <span className={budgetColor}>{100 - budgetPct}% remaining</span>
              <span className="text-faint">of RM {org.accountLimit.toLocaleString()}</span>
            </div>
            <Progress value={100 - budgetPct} className="h-1.5" />
          </div>
        </BentoCard>
      </BentoGrid>

      {/* Task Centre */}
      <OrgTaskCentre tasks={tasks} />
    </div>
  )
}
