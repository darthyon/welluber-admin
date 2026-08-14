"use client"

import { useParams, useRouter } from "next/navigation"
import { SpVoucherForm } from "@/components/host/service-providers/sp-voucher-form"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Ticket } from "@phosphor-icons/react"
import { MOCK_SPS } from "@/lib/mock-data"

export default function NewVoucherPackagePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const sp = MOCK_SPS.find((provider) => provider.id === params.id)

  if (!sp) {
    return (
      <EmptyState
        isPageLevel
        icon={<Ticket size={48} weight="duotone" />}
        title="Service Provider Not Found"
        description="The service provider for this voucher package could not be loaded."
        action={
          <Button className="rounded-4xl" onClick={() => router.push("/service-providers")}>
            Back To Service Providers
          </Button>
        }
      />
    )
  }

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
