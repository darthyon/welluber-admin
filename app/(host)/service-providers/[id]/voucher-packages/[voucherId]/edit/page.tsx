"use client"

import { useParams, useRouter } from "next/navigation"
import { SpVoucherForm } from "@/components/host/service-providers/sp-voucher-form"
import { MOCK_SPS } from "@/lib/mock-data"

export default function EditVoucherPackagePage() {
  const params = useParams<{ id: string; voucherId: string }>()
  const router = useRouter()
  const sp = MOCK_SPS.find((provider) => provider.id === params.id)
  const voucher = sp?.vouchers.find((item) => item.id === params.voucherId)

  if (!sp || !voucher) {
    return (
      <div className="mx-auto max-w-3xl rounded-lg border border-border bg-card p-8 text-center">
        <h1 className="text-heading font-semibold text-foreground">
          Voucher Package Not Found
        </h1>
        <p className="mt-2 text-body text-muted-foreground">
          The voucher package could not be loaded.
        </p>
      </div>
    )
  }

  const branches = sp.branches.map((branch) => ({
    id: branch.id,
    name: branch.name,
    currency: "RM",
    booking: branch.booking,
  }))

  const returnToProvider = () =>
    router.push(`/service-providers/${sp.id}?tab=vouchers`)

  return (
    <div className="pb-24">
      <SpVoucherForm
        spId={sp.id}
        providerName={sp.name}
        spServiceCategories={sp.serviceCategories}
        spBranches={branches}
        voucher={voucher}
        onSuccess={returnToProvider}
        onCancel={returnToProvider}
      />
    </div>
  )
}
