"use client"

import { VouchersTable } from "@/components/shared/vouchers-table"
import { useOrgUtilisation } from "@/hooks/use-org-utilisation"

interface VouchersTabProps {
  orgId: string
}

export function VouchersTab({ orgId }: VouchersTabProps) {
  const { utilisationData } = useOrgUtilisation(orgId)

  return (
    <div className="animate-in space-y-6 fade-in">
      <div>
        <h2 className="text-heading font-semibold text-foreground">Vouchers</h2>
        <p className="text-body text-subtle">
          Voucher redemption records across all employees in this organisation
        </p>
      </div>
      <VouchersTable
        data={utilisationData}
        onViewVoucher={() => {}}
      />
    </div>
  )
}
