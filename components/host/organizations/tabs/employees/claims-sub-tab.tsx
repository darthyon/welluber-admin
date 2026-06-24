"use client"

import { useMemo } from "react"
import { useQueryState } from "@/hooks/use-tab-persistence"
import { DataFilterBar } from "@/components/shared/data-filter-bar"
import { UtilisationClaimsTable } from "@/components/shared/utilisation-claims-table"
import { useOrgUtilisation } from "@/hooks/use-org-utilisation"

interface ClaimsSubTabProps {
  orgId: string
}

export function ClaimsSubTab({ orgId }: ClaimsSubTabProps) {
  const { utilisationData } = useOrgUtilisation(orgId)
  const [search, setSearch] = useQueryState("claimsSearch", "")

  const filtered = useMemo(() => {
    if (!search) return utilisationData
    const q = search.toLowerCase()
    return utilisationData.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.empCode.toLowerCase().includes(q) ||
        row.branch.toLowerCase().includes(q)
    )
  }, [utilisationData, search])

  return (
    <div className="animate-in space-y-6 transition-all duration-300 fade-in">
      <div>
        <h2 className="text-heading font-semibold text-foreground">Claims</h2>
        <p className="text-body text-subtle">
          Complete claim history and reimbursement status for the workforce
        </p>
      </div>

      <DataFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by employee, code, or branch..."
      />

      <UtilisationClaimsTable data={filtered} />
    </div>
  )
}
