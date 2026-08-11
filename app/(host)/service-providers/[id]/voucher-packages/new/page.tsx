"use client"

import { useParams, useRouter } from "next/navigation"
import { SpVoucherForm } from "@/components/host/service-providers/sp-voucher-form"
import { MOCK_SPS } from "@/lib/mock-data"

export default function NewVoucherPackagePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const sp = MOCK_SPS.find((provider) => provider.id === params.id) ?? MOCK_SPS[0]
  const branches = sp.branches.map((branch) => ({
    id: branch.id,
    name: branch.name,
    currency: "RM",
    booking: branch.booking,
  }))

  const returnToProvider = () => router.push(`/service-providers/${sp.id}?tab=vouchers`)

  return (
    <div className="pb-24">
      <SpVoucherForm
        spId={sp.id}
        providerName={sp.name}
        spServiceCategories={sp.serviceCategories}
        spBranches={branches}
        onSuccess={returnToProvider}
        onCancel={returnToProvider}
      />
    </div>
  )
}
