"use client"

import { useParams } from "next/navigation"
import { VouchersTable } from "@/components/shared/vouchers-table"
import { MOCK_EMPLOYEE_UTILISATION } from "@/lib/mock-data"

const ACME_BRANCH_KEYWORDS = ["ACME", "Acme"]

export default function OrgVouchersPage() {
  const params = useParams()
  const orgSlug = params.orgSlug as string

  const data = MOCK_EMPLOYEE_UTILISATION.filter((r) =>
    ACME_BRANCH_KEYWORDS.some((kw) => r.branch.includes(kw))
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Vouchers</h1>
        <p className="text-muted-foreground mt-0.5 text-body">Voucher redemptions across your organisation</p>
      </div>
      <VouchersTable data={data} />
    </div>
  )
}
