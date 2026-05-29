"use client"

import { UtilisationClaimsTable } from "@/components/shared/utilisation-claims-table"
import { useOrgUtilisation } from "@/hooks/use-org-utilisation"

interface ClaimsSubTabProps {
  orgId: string
}

export function ClaimsSubTab({ orgId }: ClaimsSubTabProps) {
  const { utilisationData } = useOrgUtilisation(orgId)

  return (
    <div className="animate-in space-y-6 transition-all duration-300 fade-in">
      <div>
        <h2 className="text-heading font-semibold text-foreground">Claims</h2>
        <p className="text-body text-subtle">
          Complete claim history and reimbursement status for the workforce
        </p>
      </div>
      <UtilisationClaimsTable data={utilisationData} />
    </div>
  )
}
