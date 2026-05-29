"use client"

import { OrganizationClaimsTable } from "@/components/shared/organization-claims-table"
import { useOrgUtilisation } from "@/hooks/use-org-utilisation"
import type { FlatClaimRow } from "@/types/claims"

interface ClaimsTabProps {
  orgId: string
  onViewVoucher: (claim: FlatClaimRow) => void
}

export function ClaimsTab({ orgId, onViewVoucher }: ClaimsTabProps) {
  const { utilisationData } = useOrgUtilisation(orgId)

  return (
    <div className="animate-in space-y-6 fade-in">
      <div>
        <h2 className="text-heading font-semibold text-foreground">Claims</h2>
        <p className="text-body text-subtle">
          Claim history across all employees in this organisation
        </p>
      </div>
      <OrganizationClaimsTable
        data={utilisationData}
        onViewVoucher={onViewVoucher}
        onViewDetails={onViewVoucher}
      />
    </div>
  )
}
