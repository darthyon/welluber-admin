"use client"

import { useParams } from "next/navigation"
import { OrganizationClaimsTable } from "@/components/shared/organization-claims-table"
import { MOCK_EMPLOYEE_UTILISATION } from "@/lib/mock-data"

// Filter utilisation rows to this org's branches
const ROWS_BY_SLUG: Record<string, string[]> = {
  "acme-corporation": ["ACME HQ", "ACME Subang Jaya"],
}

export default function OrgClaimsPage() {
  const params = useParams()
  const orgSlug = params.orgSlug as string

  const orgBranches = ROWS_BY_SLUG[orgSlug] ?? ["ACME HQ", "ACME Subang Jaya"]
  const data = MOCK_EMPLOYEE_UTILISATION.filter((r) =>
    orgBranches.some((b) => r.branch.includes(b.split(" ")[0]!))
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Claims</h1>
        <p className="text-muted-foreground mt-0.5 text-body">
          {data.flatMap((r) => r.claims).length} claims across {data.length} employees
        </p>
      </div>

      <OrganizationClaimsTable data={data} />
    </div>
  )
}
